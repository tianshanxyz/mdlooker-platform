#!/usr/bin/env python3
"""
NMPA (国家药品监督管理局) 数据爬虫 - 更新版
使用更可靠的方法抓取中国医疗器械注册信息
"""

import json
import time
import random
import os
from datetime import datetime
from typing import List, Dict, Optional
from playwright.sync_api import sync_playwright, Page, Browser, TimeoutError as PlaywrightTimeout
from dotenv import load_dotenv

# 加载环境变量
env_path = os.path.join(os.path.dirname(__file__), '..', '..', '.env.local')
load_dotenv(env_path)


class NMPAScraperV2:
    """NMPA 数据爬虫 V2 - 更可靠版本"""
    
    # NMPA 官方网站
    NMPA_HOME = "https://www.nmpa.gov.cn/"
    
    # 数据查询页面（直接访问数据查询中心）
    DATA_SEARCH_URL = "https://www.nmpa.gov.cn/datasearch/home-index.html"
    
    # 国产器械查询（直接搜索页面）
    DOMESTIC_SEARCH_URL = "https://www.nmpa.gov.cn/datasearch/search-result.html?nmpa=aWQ9MTE3NTDmlbDmja7kuIrmtbflkIjkvZzogIXnvZHnqbrplIDllK7lj5bor4HmoYg="
    
    # 进口器械查询
    IMPORT_SEARCH_URL = "https://www.nmpa.gov.cn/datasearch/search-result.html?nmpa=aWQ9MTE3NTDmlbDmja7kuIrmtbflkIjkvZzogIXnvZHnqbrmkqXlsYXmoYg="
    
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
                '--disable-features=IsolateOrigins,site-per-process',
            ]
        )
        
        context = self.browser.new_context(
            viewport={'width': 1920, 'height': 1080},
            user_agent='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            locale='zh-CN',
        )
        
        self.page = context.new_page()
        self.page.set_default_timeout(60000)  # 增加超时到 60 秒
        
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
        
    def navigate_with_retry(self, url: str, max_retries: int = 3) -> bool:
        """带重试的页面导航"""
        for attempt in range(max_retries):
            try:
                print(f"🌐 尝试访问: {url} (尝试 {attempt + 1}/{max_retries})")
                
                # 使用 domcontentloaded 而不是 networkidle
                self.page.goto(url, wait_until='domcontentloaded', timeout=60000)
                
                # 等待页面基本加载
                self.page.wait_for_load_state('domcontentloaded')
                self.random_delay(3, 5)
                
                print("✅ 页面加载成功")
                return True
                
            except Exception as e:
                print(f"⚠️  尝试 {attempt + 1} 失败: {e}")
                if attempt < max_retries - 1:
                    print("   等待 5 秒后重试...")
                    time.sleep(5)
                else:
                    print(f"❌ 所有尝试失败")
                    return False
        return False
        
    def check_page_structure(self) -> Dict:
        """检查页面结构"""
        print("\n🔍 检查页面结构...")
        
        info = {
            'title': self.page.title(),
            'url': self.page.url,
            'has_table': False,
            'has_search': False,
            'has_captcha': False,
        }
        
        # 检查表格
        tables = self.page.locator('table').count()
        info['has_table'] = tables > 0
        print(f"   表格数量: {tables}")
        
        # 检查搜索框
        search_inputs = self.page.locator('input[type="text"], input[placeholder*="搜索"]').count()
        info['has_search'] = search_inputs > 0
        print(f"   搜索框: {search_inputs}")
        
        # 检查验证码
        captcha = self.page.locator('img[src*="captcha"], .captcha, text=验证码').count()
        info['has_captcha'] = captcha > 0
        print(f"   验证码: {captcha}")
        
        # 截图
        screenshot_path = f'nmpa_page_{datetime.now().strftime("%Y%m%d_%H%M%S")}.png'
        self.page.screenshot(path=screenshot_path)
        print(f"   截图已保存: {screenshot_path}")
        
        return info
        
    def try_manual_mode(self):
        """手动模式 - 让用户手动操作"""
        print("\n" + "="*60)
        print("🤖 进入手动模式")
        print("="*60)
        print("请在浏览器窗口中手动操作：")
        print("1. 如果有验证码，请完成验证")
        print("2. 导航到数据查询页面")
        print("3. 点击搜索按钮")
        print("4. 等待数据加载完成")
        print()
        print("完成后，按回车继续抓取...")
        print("="*60)
        
        input("👉 按回车继续...")
        
    def extract_data_from_page(self) -> List[Dict]:
        """从当前页面提取数据"""
        data = []
        
        try:
            # 尝试多种选择器
            selectors = [
                'table tbody tr',
                '.result-list .result-item',
                '.data-list .data-item',
                '.list-item',
                'tr[data-key]',
            ]
            
            rows = []
            for selector in selectors:
                found = self.page.locator(selector).all()
                if found:
                    rows = found
                    print(f"   找到 {len(rows)} 行数据 (选择器: {selector})")
                    break
                    
            if not rows:
                print("   ⚠️  未找到数据行")
                return data
                
            for i, row in enumerate(rows):
                try:
                    # 提取文本
                    text = row.inner_text()
                    cells = text.split('\n')
                    
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
                    
        except Exception as e:
            print(f"   ❌ 提取数据失败: {e}")
            
        return data
        
    def scrape_interactive(self, category: str = 'domestic') -> List[Dict]:
        """交互式抓取"""
        print(f"\n{'='*60}")
        print(f"🚀 开始抓取 {category} 器械数据")
        print(f"{'='*60}\n")
        
        all_data = []
        
        # 选择 URL
        if category == 'domestic':
            url = self.DOMESTIC_SEARCH_URL
        else:
            url = self.IMPORT_SEARCH_URL
            
        # 导航到页面
        if not self.navigate_with_retry(url):
            print("❌ 无法访问页面，进入手动模式...")
            self.try_manual_mode()
            
        # 检查页面结构
        page_info = self.check_page_structure()
        
        # 如果有验证码或页面结构异常，进入手动模式
        if page_info['has_captcha'] or not page_info['has_table']:
            print("\n⚠️  检测到验证码或页面异常，进入手动模式...")
            self.try_manual_mode()
            
        # 提取数据
        print("\n📊 提取数据...")
        data = self.extract_data_from_page()
        all_data.extend(data)
        
        print(f"\n✅ 本页抓取 {len(data)} 条数据")
        
        return all_data
        
    def save_to_json(self, data: List[Dict], filename: str):
        """保存到 JSON"""
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"💾 已保存: {filename} ({len(data)} 条)")


def main():
    print("="*60)
    print("NMPA 数据爬虫 V2")
    print("="*60)
    
    scraper = NMPAScraperV2(headless=False)  # 显示浏览器窗口
    
    try:
        scraper.start()
        
        # 抓取国产器械
        print("\n🇨🇳 抓取国产器械...")
        domestic_data = scraper.scrape_interactive('domestic')
        scraper.save_to_json(domestic_data, 'nmpa_domestic_devices.json')
        
        # 抓取进口器械
        print("\n🌍 抓取进口器械...")
        import_data = scraper.scrape_interactive('import')
        scraper.save_to_json(import_data, 'nmpa_import_devices.json')
        
    finally:
        scraper.stop()
        
    print("\n" + "="*60)
    print("✅ 完成！")
    print("="*60)


if __name__ == '__main__':
    main()
