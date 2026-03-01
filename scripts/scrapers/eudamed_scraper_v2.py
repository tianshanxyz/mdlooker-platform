#!/usr/bin/env python3
"""
EUDAMED 数据爬虫 V2
修复版 - 适配最新的 EUDAMED 网站结构
"""

import json
import time
import random
from datetime import datetime
from typing import List, Dict, Optional
from playwright.sync_api import sync_playwright, Page, Browser, TimeoutError as PlaywrightTimeout


class EudamedScraperV2:
    """EUDAMED 数据爬虫 V2"""
    
    # EUDAMED 主页
    HOME_URL = "https://ec.europa.eu/tools/eudamed"
    
    def __init__(self, headless: bool = False, proxy: Optional[str] = None):
        self.headless = headless
        self.proxy = proxy
        self.browser: Optional[Browser] = None
        self.page: Optional[Page] = None
        
    def __enter__(self):
        self.start()
        return self
        
    def __exit__(self, exc_type, exc_val, exc_tb):
        self.stop()
        
    def start(self):
        """启动浏览器"""
        print("🚀 启动浏览器...")
        playwright = sync_playwright().start()
        
        browser_args = {}
        if self.proxy:
            browser_args['proxy'] = {'server': self.proxy}
            
        self.browser = playwright.chromium.launch(
            headless=self.headless,
            **browser_args
        )
        
        context = self.browser.new_context(
            viewport={'width': 1920, 'height': 1080},
            user_agent='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            locale='en-US',
        )
        
        self.page = context.new_page()
        
        # 设置更长的默认超时
        self.page.set_default_timeout(60000)
        
        print("✅ 浏览器启动成功")
        
    def stop(self):
        """关闭浏览器"""
        if self.browser:
            print("🛑 关闭浏览器...")
            self.browser.close()
            print("✅ 浏览器已关闭")
            
    def random_delay(self, min_seconds: float = 2.0, max_seconds: float = 5.0):
        """随机延迟"""
        delay = random.uniform(min_seconds, max_seconds)
        print(f"⏱️  等待 {delay:.1f} 秒...")
        time.sleep(delay)
        
    def navigate_to_actors(self):
        """导航到 Actor 搜索页面"""
        print("🌐 访问 EUDAMED 网站...")
        
        try:
            # 访问主页
            self.page.goto(self.HOME_URL, wait_until='networkidle')
            self.random_delay(3, 5)
            
            # 截图查看当前页面状态
            self.page.screenshot(path='eudamed_home.png')
            print("📸 已截图保存为 eudamed_home.png")
            
            # 查找并点击 "Search" 或 "Actors" 链接
            # 尝试多种可能的选择器
            selectors = [
                'text=Search',
                'text=Actors',
                'text=Actor',
                'a[href*="search"]',
                'button:has-text("Search")',
                '[data-testid*="search"]',
            ]
            
            for selector in selectors:
                try:
                    element = self.page.locator(selector).first
                    if element.count() > 0 and element.is_visible():
                        print(f"✅ 找到元素: {selector}")
                        element.click()
                        self.random_delay(3, 5)
                        return True
                except Exception as e:
                    continue
            
            # 如果找不到，尝试直接访问搜索 URL
            print("⚠️  尝试直接访问搜索页面...")
            self.page.goto(f"{self.HOME_URL}/#/screen/search", wait_until='networkidle')
            self.random_delay(3, 5)
            
            return True
            
        except Exception as e:
            print(f"❌ 导航失败: {e}")
            return False
            
    def search_actors_simple(self, max_results: int = 50) -> List[Dict]:
        """
        简化版 Actor 搜索 - 先验证页面结构
        """
        print(f"🔍 开始搜索 Actor，最大结果: {max_results}")
        
        actors = []
        
        try:
            # 导航到搜索页面
            if not self.navigate_to_actors():
                return actors
            
            # 截图查看页面结构
            self.page.screenshot(path='eudamed_search.png')
            print("📸 已截图保存为 eudamed_search.png")
            
            # 打印页面标题和 URL
            print(f"📄 页面标题: {self.page.title()}")
            print(f"🔗 当前 URL: {self.page.url}")
            
            # 获取页面内容的前 1000 字符
            page_content = self.page.content()
            print(f"📄 页面内容前 1000 字符:\n{page_content[:1000]}")
            
            # 尝试查找表格或列表
            table_selectors = [
                'table',
                'table tbody tr',
                '[role="table"]',
                '.table',
                '.list',
                '[class*="result"]',
            ]
            
            for selector in table_selectors:
                try:
                    elements = self.page.locator(selector).all()
                    print(f"🔍 选择器 '{selector}' 找到 {len(elements)} 个元素")
                except Exception as e:
                    print(f"🔍 选择器 '{selector}' 失败: {e}")
            
            print("\n⚠️  请查看截图和页面内容，确认 EUDAMED 网站结构")
            print("如果需要手动操作，请在浏览器窗口中完成搜索")
            print("完成后按回车继续...")
            input()
            
        except Exception as e:
            print(f"❌ 搜索失败: {e}")
            
        return actors
    
    def save_to_json(self, data: List[Dict], filename: str):
        """保存数据到 JSON"""
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"💾 数据已保存到: {filename} ({len(data)} 条)")


def main():
    """主函数 - 用于测试和调试"""
    print("=" * 60)
    print("EUDAMED 爬虫 V2 - 调试模式")
    print("=" * 60)
    print()
    print("此版本用于检查 EUDAMED 网站结构")
    print("请查看生成的截图和页面内容")
    print()
    
    with EudamedScraperV2(headless=False) as scraper:
        # 测试导航和页面结构
        actors = scraper.search_actors_simple(max_results=10)
        
        if actors:
            scraper.save_to_json(actors, 'eudamed_actors_test.json')
        else:
            print("\n⚠️  未抓取到数据，请根据截图和页面内容调整爬虫代码")
    
    print("\n" + "=" * 60)
    print("调试完成")
    print("=" * 60)


if __name__ == '__main__':
    main()
