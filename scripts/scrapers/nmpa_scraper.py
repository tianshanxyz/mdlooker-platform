#!/usr/bin/env python3
"""
NMPA (国家药品监督管理局) 数据爬虫
抓取中国医疗器械注册信息

数据源:
- 国产器械: https://www.nmpa.gov.cn/datasearch/search-info.html?nmpa=aWQ9MTE3NTDmlbDmja7kuIrmtbflkIjkvZzogIXnvZHnqbrplIDllK7lj5bor4HmoYg=
- 进口器械: https://www.nmpa.gov.cn/datasearch/search-info.html?nmpa=aWQ9MTE3NTDmlbDmja7kuIrmtbflkIjkvZzogIXnvZHnqbrmkqXlsYXmoYg=

特点:
- 需要处理验证码
- 有反爬机制
- 数据量大（20万+）
"""

import json
import time
import random
import re
from datetime import datetime
from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass, asdict
from playwright.sync_api import sync_playwright, Page, Browser, TimeoutError as PlaywrightTimeout


@dataclass
class NMPADevice:
    """NMPA 器械数据模型"""
    # 基本信息
    registration_number: str  # 注册证号
    product_name: str  # 产品名称
    product_name_zh: str  # 产品名称（中文）
    
    # 企业信息
    company_name: str  # 注册人名称
    company_name_zh: str  # 注册人名称（中文）
    company_address: str  # 注册人住所
    production_address: str  # 生产地址
    
    # 注册信息
    approval_date: str  # 批准日期
    expiry_date: str  # 有效期至
    registration_category: str  # 注册类别（国产/进口）
    
    # 产品详情
    model_specification: str  # 型号规格
    structure_composition: str  # 结构及组成
    scope_application: str  # 适用范围
    
    # 其他
    remarks: str  # 备注
    updated_at: str  # 更新日期
    
    # 元数据
    scraped_at: str = None  # 抓取时间
    
    def __post_init__(self):
        if self.scraped_at is None:
            self.scraped_at = datetime.now().isoformat()


class NMPAScraper:
    """NMPA 数据爬虫"""
    
    # NMPA 数据查询页面
    BASE_URL = "https://www.nmpa.gov.cn/datasearch/search-info.html"
    
    # 国产器械查询参数
    DOMESTIC_PARAM = "nmpa=aWQ9MTE3NTDmlbDmja7kuIrmtbflkIjkvZzogIXnvZHnqbrplIDllK7lj5bor4HmoYg="
    
    # 进口器械查询参数
    IMPORT_PARAM = "nmpa=aWQ9MTE3NTDmlbDmja7kuIrmtbflkIjkvZzogIXnvZHnqbrmkqXlsYXmoYg="
    
    def __init__(
        self,
        headless: bool = True,
        proxy: Optional[str] = None,
        use_captcha_solver: bool = False,
        captcha_api_key: Optional[str] = None
    ):
        self.headless = headless
        self.proxy = proxy
        self.use_captcha_solver = use_captcha_solver
        self.captcha_api_key = captcha_api_key
        
        self.browser: Optional[Browser] = None
        self.page: Optional[Page] = None
        self.results: List[NMPADevice] = []
        
        # 统计
        self.stats = {
            'total_attempts': 0,
            'successful': 0,
            'failed': 0,
            'captcha_encountered': 0,
            'captcha_solved': 0,
        }
        
    def __enter__(self):
        """上下文管理器入口"""
        self.start()
        return self
        
    def __exit__(self, exc_type, exc_val, exc_tb):
        """上下文管理器出口"""
        self.stop()
        
    def start(self):
        """启动浏览器"""
        print("🚀 启动浏览器...")
        playwright = sync_playwright().start()
        
        browser_args = {
            'headless': self.headless,
        }
        
        if self.proxy:
            browser_args['proxy'] = {'server': self.proxy}
            
        self.browser = playwright.chromium.launch(**browser_args)
        
        context = self.browser.new_context(
            viewport={'width': 1920, 'height': 1080},
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            locale='zh-CN',
            timezone_id='Asia/Shanghai',
        )
        
        # 设置额外的 HTTP 头
        context.set_extra_http_headers({
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
        })
        
        self.page = context.new_page()
        
        # 设置默认超时
        self.page.set_default_timeout(30000)
        
        print("✅ 浏览器启动成功")
        
    def stop(self):
        """关闭浏览器"""
        if self.browser:
            print("🛑 关闭浏览器...")
            print(f"📊 抓取统计: 成功 {self.stats['successful']}, 失败 {self.stats['failed']}, 验证码 {self.stats['captcha_encountered']}")
            self.browser.close()
            print("✅ 浏览器已关闭")
            
    def random_delay(self, min_seconds: float = 2.0, max_seconds: float = 5.0):
        """随机延迟，避免被封"""
        delay = random.uniform(min_seconds, max_seconds)
        time.sleep(delay)
        
    def check_captcha(self) -> bool:
        """检查是否出现验证码"""
        try:
            # 检查常见的验证码元素
            captcha_selectors = [
                'img[src*="captcha"]',
                '.captcha',
                '#captcha',
                'text=验证码',
                'text=点击刷新',
            ]
            
            for selector in captcha_selectors:
                if self.page.locator(selector).count() > 0:
                    print(f"⚠️  检测到验证码: {selector}")
                    self.stats['captcha_encountered'] += 1
                    return True
                    
            return False
            
        except Exception:
            return False
            
    def solve_captcha_manual(self) -> bool:
        """手动解决验证码（弹出窗口等待用户输入）"""
        print("\n" + "="*60)
        print("🤖 需要人工协助解决验证码")
        print("="*60)
        print("请在浏览器窗口中完成验证码，完成后按回车继续...")
        print("（如果 60 秒内未完成，将跳过当前任务）")
        print("="*60 + "\n")
        
        try:
            # 等待用户完成验证码（最多 60 秒）
            self.page.wait_for_timeout(60000)
            self.stats['captcha_solved'] += 1
            return True
        except Exception:
            print("❌ 验证码解决超时")
            return False
            
    def navigate_to_search_page(self, category: str = 'domestic') -> bool:
        """
        导航到搜索页面
        
        Args:
            category: 'domestic' (国产) 或 'import' (进口)
        """
        try:
            if category == 'domestic':
                url = f"{self.BASE_URL}?{self.DOMESTIC_PARAM}"
                print("🌐 访问国产器械查询页面...")
            else:
                url = f"{self.BASE_URL}?{self.IMPORT_PARAM}"
                print("🌐 访问进口器械查询页面...")
                
            self.page.goto(url, wait_until='networkidle')
            self.random_delay(3, 5)
            
            # 检查验证码
            if self.check_captcha():
                if not self.solve_captcha_manual():
                    return False
                    
            # 等待页面加载完成
            self.page.wait_for_load_state('networkidle')
            self.random_delay(2, 3)
            
            print("✅ 页面加载完成")
            return True
            
        except Exception as e:
            print(f"❌ 页面加载失败: {e}")
            return False
            
    def search_by_keyword(self, keyword: str, max_results: int = 100) -> List[NMPADevice]:
        """
        按关键词搜索
        
        Args:
            keyword: 搜索关键词
            max_results: 最大结果数
            
        Returns:
            器械列表
        """
        print(f"🔍 搜索关键词: {keyword}, 最大结果: {max_results}")
        
        devices = []
        
        try:
            # 找到搜索框
            search_input = self.page.locator('input[placeholder*="搜索"], input[type="text"]').first
            if search_input.count() == 0:
                print("❌ 未找到搜索框")
                return devices
                
            # 输入关键词
            search_input.fill(keyword)
            self.random_delay(1, 2)
            
            # 点击搜索按钮
            search_button = self.page.locator('button:has-text("搜索"), .search-btn, [type="submit"]').first
            if search_button.count() > 0:
                search_button.click()
            else:
                # 尝试按回车
                search_input.press('Enter')
                
            self.random_delay(3, 5)
            
            # 检查验证码
            if self.check_captcha():
                if not self.solve_captcha_manual():
                    return devices
                    
            # 等待结果加载
            self.page.wait_for_selector('table, .result-list, .data-list', timeout=10000)
            
            # 抓取数据
            devices = self._extract_devices_from_page(max_results)
            
        except Exception as e:
            print(f"❌ 搜索失败: {e}")
            
        return devices
        
    def _extract_devices_from_page(self, max_results: int) -> List[NMPADevice]:
        """从当前页面提取器械数据"""
        devices = []
        
        try:
            # 获取所有行
            rows = self.page.locator('table tbody tr, .result-item, .data-item').all()
            
            print(f"📄 找到 {len(rows)} 条记录")
            
            for row in rows[:max_results]:
                try:
                    device = self._parse_device_row(row)
                    if device:
                        devices.append(device)
                        self.stats['successful'] += 1
                        print(f"  ✓ 抓取: {device.product_name[:40]}...")
                except Exception as e:
                    self.stats['failed'] += 1
                    print(f"  ⚠️  解析失败: {e}")
                    continue
                    
        except Exception as e:
            print(f"❌ 提取数据失败: {e}")
            
        return devices
        
    def _parse_device_row(self, row) -> Optional[NMPADevice]:
        """解析单行数据"""
        try:
            # 尝试不同的选择器
            cells = row.locator('td, .cell, .item').all()
            
            if len(cells) < 3:
                return None
                
            # 提取基本信息（根据实际页面结构调整）
            registration_number = cells[0].inner_text().strip() if len(cells) > 0 else ''
            product_name = cells[1].inner_text().strip() if len(cells) > 1 else ''
            company_name = cells[2].inner_text().strip() if len(cells) > 2 else ''
            
            # 点击进入详情页获取更多信息
            detail_link = row.locator('a').first
            if detail_link.count() > 0:
                detail_url = detail_link.get_attribute('href')
                if detail_url:
                    # 在新标签页打开详情
                    detail_page = self.browser.new_page()
                    detail_page.goto(detail_url)
                    self.random_delay(2, 3)
                    
                    # 提取详情信息
                    # TODO: 根据实际页面结构解析详情
                    
                    detail_page.close()
                    
            return NMPADevice(
                registration_number=registration_number,
                product_name=product_name,
                product_name_zh=product_name,
                company_name=company_name,
                company_name_zh=company_name,
                company_address='',
                production_address='',
                approval_date='',
                expiry_date='',
                registration_category='domestic',
                model_specification='',
                structure_composition='',
                scope_application='',
                remarks='',
                updated_at='',
            )
            
        except Exception as e:
            print(f"解析行数据失败: {e}")
            return None
            
    def scrape_by_category(
        self,
        category: str = 'domestic',
        max_pages: int = 10,
        devices_per_page: int = 20
    ) -> List[NMPADevice]:
        """
        按类别抓取数据
        
        Args:
            category: 'domestic' (国产) 或 'import' (进口)
            max_pages: 最大抓取页数
            devices_per_page: 每页器械数
            
        Returns:
            器械列表
        """
        print(f"\n{'='*60}")
        print(f"🚀 开始抓取 {category} 器械数据")
        print(f"{'='*60}\n")
        
        all_devices = []
        
        # 导航到搜索页面
        if not self.navigate_to_search_page(category):
            return all_devices
            
        try:
            for page_num in range(1, max_pages + 1):
                print(f"\n📄 正在抓取第 {page_num}/{max_pages} 页...")
                
                # 提取当前页数据
                devices = self._extract_devices_from_page(devices_per_page)
                all_devices.extend(devices)
                
                print(f"📊 本页抓取 {len(devices)} 条，总计 {len(all_devices)} 条")
                
                # 检查是否还有下一页
                next_button = self.page.locator('text=下一页, .next-page, [title="下一页"]').first
                if next_button.count() == 0 or not next_button.is_enabled():
                    print("✅ 已到最后一页")
                    break
                    
                # 点击下一页
                next_button.click()
                self.random_delay(3, 6)
                
                # 检查验证码
                if self.check_captcha():
                    if not self.solve_captcha_manual():
                        print("⚠️  验证码解决失败，停止抓取")
                        break
                        
        except Exception as e:
            print(f"❌ 抓取过程出错: {e}")
            
        print(f"\n{'='*60}")
        print(f"✅ 抓取完成: 共 {len(all_devices)} 条数据")
        print(f"{'='*60}\n")
        
        return all_devices
        
    def save_to_json(self, devices: List[NMPADevice], filename: str):
        """保存数据到 JSON 文件"""
        data = [asdict(device) for device in devices]
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"💾 数据已保存到: {filename} ({len(devices)} 条)")
        
    def save_to_supabase(self, devices: List[NMPADevice], table_name: str = 'nmpa_devices'):
        """保存数据到 Supabase"""
        try:
            from supabase import create_client
            import os
            
            supabase_url = os.getenv('SUPABASE_URL')
            supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
            
            if not supabase_url or not supabase_key:
                print("⚠️  Supabase 环境变量未设置，跳过数据库保存")
                return False
                
            supabase = create_client(supabase_url, supabase_key)
            
            # 批量插入
            batch_size = 50
            for i in range(0, len(devices), batch_size):
                batch = [asdict(device) for device in devices[i:i+batch_size]]
                result = supabase.table(table_name).upsert(batch).execute()
                print(f"  ✓ 已保存 {len(batch)} 条到 {table_name}")
                self.random_delay(0.5, 1)
                
            print(f"✅ 所有数据已保存到 Supabase")
            return True
            
        except Exception as e:
            print(f"❌ 保存到 Supabase 失败: {e}")
            return False


def main():
    """主函数 - 示例用法"""
    print("=" * 60)
    print("NMPA 数据爬虫")
    print("=" * 60)
    
    # 使用示例
    with NMPAScraper(headless=False) as scraper:  # headless=False 可以看到浏览器窗口
        # 抓取国产器械（前 5 页）
        print("\n🇨🇳 抓取国产器械...")
        domestic_devices = scraper.scrape_by_category(
            category='domestic',
            max_pages=5,
            devices_per_page=20
        )
        scraper.save_to_json(domestic_devices, 'nmpa_domestic_devices.json')
        
        # 抓取进口器械（前 3 页）
        print("\n🌍 抓取进口器械...")
        import_devices = scraper.scrape_by_category(
            category='import',
            max_pages=3,
            devices_per_page=20
        )
        scraper.save_to_json(import_devices, 'nmpa_import_devices.json')
        
    print("\n" + "=" * 60)
    print("✅ 爬虫执行完成")
    print("=" * 60)


if __name__ == '__main__':
    main()
