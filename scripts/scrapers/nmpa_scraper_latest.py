#!/usr/bin/env python3
"""
NMPA (国家药品监督管理局) 数据爬虫 - 最新版
使用正确的 URL 和方法抓取医疗器械注册数据

使用方法:
1. 运行脚本
2. 在浏览器中手动导航到数据查询页面
3. 完成验证码（如果有）
4. 脚本会自动抓取当前页面的数据
"""

import json
import time
import random
import os
from datetime import datetime
from typing import List, Dict, Optional
from playwright.sync_api import sync_playwright, Page, Browser
from dotenv import load_dotenv

# 加载环境变量
env_path = os.path.join(os.path.dirname(__file__), '..', '..', '.env.local')
load_dotenv(env_path)


class NMPAScraperLatest:
    """NMPA 数据爬虫 - 最新版"""
    
    # NMPA 官方网站
    NMPA_HOME = "https://www.nmpa.gov.cn/"
    
    # 数据查询页面
    DATA_QUERY_PAGE = "https://www.nmpa.gov.cn/datasearch/home-index.html"
    
    # 国产器械查询
    DOMESTIC_QUERY = "https://www.nmpa.gov.cn/datasearch/search-result.html?nmpa=aWQ9MTE3NTDmlbDmja7kuIrmtbflkIjkvZzogIXnvZHnqbrplIDllK7lj5bor4HmoYg="
    
    # 进口器械查询
    IMPORT_QUERY = "https://www.nmpa.gov.cn/datasearch/search-result.html?nmpa=aWQ9MTE3NTDmlbDmja7kuIrmtbflkIjkvZzogIXnvZHnqbrmkqXlsYXmoYg="
    
    def __init__(self, headless: bool = False):
        self.headless = headless
        self.browser: Optional[Browser] = None
        self.page: Optional[Page] = None
        self.results: List[Dict] = []
        
        self.stats = {
            'total': 0,
            'successful': 0,
            'failed': 0,
        }
        
    def start(self):
        """启动浏览器"""
        print("🚀 启动浏览器...")
        playwright = sync_playwright().start()
        
        self.browser = playwright.chromium.launch(
            headless=self.headless,
            args=[
                '--disable-blink-features=AutomationControlled',
                '--disable-web-security',
                '--no-sandbox',
                '--disable-setuid-sandbox',
            ]
        )
        
        context = self.browser.new_context(
            viewport={'width': 1920, 'height': 1080},
            user_agent='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            locale='zh-CN',
            timezone_id='Asia/Shanghai',
        )
        
        self.page = context.new_page()
        self.page.set_default_timeout(120000)  # 2 分钟超时
        
        print("✅ 浏览器启动成功")
        
    def stop(self):
        """关闭浏览器"""
        if self.browser:
            print("🛑 关闭浏览器...")
            print(f"📊 统计: 成功 {self.stats['successful']}, 失败 {self.stats['failed']}")
            self.browser.close()
            print("✅ 浏览器已关闭")
            
    def random_delay(self, min_seconds: float = 1.0, max_seconds: float = 3.0):
        """随机延迟"""
        delay = random.uniform(min_seconds, max_seconds)
        time.sleep(delay)
        
    def navigate_to_home(self) -> bool:
        """导航到 NMPA 首页"""
        try:
            print(f"🌐 访问 NMPA 首页: {self.NMPA_HOME}")
            self.page.goto(self.NMPA_HOME, wait_until='domcontentloaded', timeout=60000)
            self.random_delay(3, 5)
            
            # 截图
            self.page.screenshot(path='nmpa_home.png')
            print("✅ 首页加载成功")
            return True
            
        except Exception as e:
            print(f"❌ 首页加载失败: {e}")
            return False
            
    def navigate_to_data_query(self) -> bool:
        """导航到数据查询页面"""
        try:
            print(f"\n🌐 访问数据查询页面: {self.DATA_QUERY_PAGE}")
            self.page.goto(self.DATA_QUERY_PAGE, wait_until='domcontentloaded', timeout=60000)
            self.random_delay(3, 5)
            
            # 截图
            self.page.screenshot(path='nmpa_data_query.png')
            print("✅ 数据查询页面加载成功")
            return True
            
        except Exception as e:
            print(f"❌ 数据查询页面加载失败: {e}")
            return False
            
    def navigate_to_domestic(self) -> bool:
        """导航到国产器械查询页面"""
        try:
            print(f"\n🌐 访问国产器械查询页面...")
            self.page.goto(self.DOMESTIC_QUERY, wait_until='domcontentloaded', timeout=60000)
            self.random_delay(5, 8)
            
            # 截图
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            self.page.screenshot(path=f'nmpa_domestic_{timestamp}.png')
            print("✅ 国产器械查询页面加载成功")
            return True
            
        except Exception as e:
            print(f"❌ 国产器械查询页面加载失败: {e}")
            return False
            
    def navigate_to_import(self) -> bool:
        """导航到进口器械查询页面"""
        try:
            print(f"\n🌐 访问进口器械查询页面...")
            self.page.goto(self.IMPORT_QUERY, wait_until='domcontentloaded', timeout=60000)
            self.random_delay(5, 8)
            
            # 截图
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            self.page.screenshot(path=f'nmpa_import_{timestamp}.png')
            print("✅ 进口器械查询页面加载成功")
            return True
            
        except Exception as e:
            print(f"❌ 进口器械查询页面加载失败: {e}")
            return False
            
    def wait_for_user_action(self, message: str = "请完成操作后按回车继续..."):
        """等待用户操作"""
        print("\n" + "="*60)
        print(f"⚠️  {message}")
        print("="*60)
        input("👉 按回车继续...")
        
    def extract_data_from_current_page(self) -> List[Dict]:
        """从当前页面提取数据"""
        print("\n📊 提取数据...")
        data = []
        
        try:
            # 保存页面 HTML
            html = self.page.content()
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            with open(f'nmpa_page_{timestamp}.html', 'w', encoding='utf-8') as f:
                f.write(html)
            print(f"   HTML 已保存: nmpa_page_{timestamp}.html")
            
            # 尝试多种选择器
            selectors = [
                'table tbody tr',
                '.result-list .result-item',
                '.data-list .data-item',
                '.list-item',
                'tr[data-key]',
                '.el-table__row',
                '.ant-table-row',
            ]
            
            rows = []
            for selector in selectors:
                found = self.page.locator(selector).all()
                if found:
                    rows = found
                    print(f"   找到 {len(rows)} 行数据 (选择器: {selector})")
                    break
                    
            if not rows:
                print("   ⚠️  未找到数据行，尝试手动选择...")
                return self.extract_data_manual()
                
            for i, row in enumerate(rows):
                try:
                    # 提取文本
                    text = row.inner_text()
                    cells = [c.strip() for c in text.split('\n') if c.strip()]
                    
                    if cells and len(cells) >= 2:
                        item = {
                            'registration_number': cells[0] if len(cells) > 0 else '',
                            'product_name': cells[1] if len(cells) > 1 else '',
                            'company_name': cells[2] if len(cells) > 2 else '',
                            'approval_date': cells[3] if len(cells) > 3 else '',
                            'expiry_date': cells[4] if len(cells) > 4 else '',
                            'scraped_at': datetime.now().isoformat(),
                        }
                        data.append(item)
                        self.stats['successful'] += 1
                except Exception as e:
                    self.stats['failed'] += 1
                    print(f"   ⚠️  解析第 {i+1} 行失败: {e}")
                    
        except Exception as e:
            print(f"   ❌ 提取数据失败: {e}")
            
        print(f"   ✅ 提取了 {len(data)} 条数据")
        return data
        
    def extract_data_manual(self) -> List[Dict]:
        """手动提取数据"""
        print("\n" + "="*60)
        print("🔧 手动数据提取模式")
        print("="*60)
        print("请在浏览器中：")
        print("1. 点击搜索按钮")
        print("2. 等待数据加载")
        print("3. 确保数据表格可见")
        print("="*60)
        
        input("👉 完成后按回车继续...")
        
        # 再次尝试提取
        return self.extract_data_from_current_page()
        
    def scrape_all_pages(self, max_pages: int = 10) -> List[Dict]:
        """抓取所有页面"""
        all_data = []
        
        for page_num in range(1, max_pages + 1):
            print(f"\n{'='*60}")
            print(f"📄 第 {page_num} 页")
            print(f"{'='*60}")
            
            # 提取当前页数据
            data = self.extract_data_from_current_page()
            all_data.extend(data)
            
            print(f"📊 本页: {len(data)} 条，总计: {len(all_data)} 条")
            
            # 尝试翻页
            if page_num < max_pages:
                print("\n🔄 尝试翻页...")
                
                # 查找下一页按钮
                next_selectors = [
                    'text=下一页',
                    '.next',
                    '.next-page',
                    '[aria-label="Next"]',
                    '.ant-pagination-next',
                    '.el-pagination__next',
                ]
                
                found_next = False
                for selector in next_selectors:
                    try:
                        next_btn = self.page.locator(selector).first
                        if next_btn.count() > 0 and next_btn.is_enabled():
                            next_btn.click()
                            self.random_delay(3, 5)
                            found_next = True
                            break
                    except:
                        continue
                        
                if not found_next:
                    print("⚠️  未找到下一页按钮，可能已到最后一页")
                    break
                    
                # 检查验证码
                self.wait_for_user_action("如果有验证码请完成，然后按回车继续...")
                
        return all_data
        
    def save_to_json(self, data: List[Dict], filename: str):
        """保存到 JSON"""
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"💾 已保存: {filename} ({len(data)} 条)")


def main():
    print("="*60)
    print("NMPA 数据爬虫 - 最新版")
    print("="*60)
    print()
    print("📋 使用说明:")
    print("1. 脚本会打开浏览器窗口")
    print("2. 如果遇到验证码，请手动完成")
    print("3. 脚本会自动抓取数据")
    print()
    
    scraper = NMPAScraperLatest(headless=False)  # 显示浏览器窗口
    
    try:
        scraper.start()
        
        # 导航到国产器械查询页面
        if scraper.navigate_to_domestic():
            # 等待用户确认
            scraper.wait_for_user_action("请确认页面加载完成，如有验证码请完成")
            
            # 抓取数据
            domestic_data = scraper.scrape_all_pages(max_pages=5)
            scraper.save_to_json(domestic_data, 'nmpa_domestic_devices.json')
            
        # 导航到进口器械查询页面
        if scraper.navigate_to_import():
            # 等待用户确认
            scraper.wait_for_user_action("请确认页面加载完成，如有验证码请完成")
            
            # 抓取数据
            import_data = scraper.scrape_all_pages(max_pages=3)
            scraper.save_to_json(import_data, 'nmpa_import_devices.json')
            
    finally:
        scraper.stop()
        
    print("\n" + "="*60)
    print("✅ 完成！")
    print("="*60)


if __name__ == '__main__':
    main()
