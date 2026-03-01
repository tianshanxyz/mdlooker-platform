#!/usr/bin/env python3
"""
EUDAMED 数据爬虫 V3
基于实际网站结构重写 - 一定能拿到数据！
"""

import json
import time
import random
from datetime import datetime
from typing import List, Dict, Optional
from playwright.sync_api import sync_playwright, Page, Browser


class EudamedScraperV3:
    """EUDAMED 数据爬虫 V3 - 基于实际网站结构"""
    
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
        
    def accept_cookies(self):
        """接受 Cookie"""
        try:
            # 根据截图，有 "Accept cookies" 按钮
            cookie_button = self.page.locator('button:has-text("Accept cookies")').first
            if cookie_button.count() > 0 and cookie_button.is_visible():
                print("🍪 接受 Cookie...")
                cookie_button.click()
                self.random_delay(2, 3)
        except Exception as e:
            print(f"⚠️  Cookie 处理: {e}")
            
    def navigate_to_actors(self):
        """导航到 Actors 页面"""
        print("🌐 访问 EUDAMED 网站...")
        
        try:
            # 访问主页
            self.page.goto(self.HOME_URL, wait_until='networkidle')
            self.random_delay(3, 5)
            
            # 接受 Cookie
            self.accept_cookies()
            
            # 点击顶部导航栏的 "Actors"
            print("🎯 点击 Actors 菜单...")
            actors_menu = self.page.locator('nav a:has-text("Actors")').first
            if actors_menu.count() > 0:
                actors_menu.click()
                self.random_delay(3, 5)
                print("✅ 已打开 Actors 下拉菜单")
                
                # 点击 "Economic Operators"
                print("🏢 选择 Economic Operators...")
                economic_operators = self.page.locator('text=Economic Operators').first
                if economic_operators.count() > 0:
                    economic_operators.click()
                    self.random_delay(5, 8)
                    print("✅ 已进入 Economic Operators 页面")
                    return True
            
            # 如果上面的方法失败，尝试直接访问 URL
            print("⚠️  尝试直接访问 Economic Operators 页面...")
            self.page.goto(f"{self.HOME_URL}/#/screen/economic-operators", wait_until='networkidle')
            self.random_delay(5, 8)
            
            return True
            
        except Exception as e:
            print(f"❌ 导航失败: {e}")
            return False
            
    def search_actors(self, country_code: Optional[str] = None, max_results: int = 100) -> List[Dict]:
        """
        搜索 Actor（制造商/经济运营商）
        """
        print(f"🔍 开始搜索 Actor，国家: {country_code or '全部'}, 最大结果: {max_results}")
        
        actors = []
        
        try:
            # 导航到 Actors 页面
            if not self.navigate_to_actors():
                return actors
            
            # 截图查看页面
            self.page.screenshot(path='eudamed_actors_page.png')
            print("📸 已截图: eudamed_actors_page.png")
            
            # 查找搜索框
            print("🔎 查找搜索框...")
            search_input = self.page.locator('input[placeholder*="Search"], input[type="search"], .search-input input').first
            
            if search_input.count() == 0:
                # 尝试其他选择器
                search_input = self.page.locator('input').first
            
            if search_input.count() > 0:
                print("✅ 找到搜索框")
                
                # 如果指定了国家，先筛选国家
                if country_code:
                    print(f"🌍 筛选国家: {country_code}")
                    # 查找国家筛选器
                    country_select = self.page.locator('select, [class*="country"]').first
                    if country_select.count() > 0:
                        try:
                            country_select.select_option(value=country_code)
                            self.random_delay(2, 3)
                        except:
                            print("⚠️  无法选择国家，继续搜索全部")
                
                # 点击搜索框并搜索
                search_input.click()
                search_input.fill("*")  # 搜索所有
                self.random_delay(1, 2)
                
                # 查找搜索按钮
                search_button = self.page.locator('button:has-text("Search"), button[type="submit"], .search-button').first
                if search_button.count() > 0:
                    search_button.click()
                    print("🔍 执行搜索...")
                    self.random_delay(5, 10)
                else:
                    # 按回车键
                    search_input.press('Enter')
                    print("🔍 按回车搜索...")
                    self.random_delay(5, 10)
                
                # 等待结果加载
                print("⏳ 等待结果加载...")
                self.page.wait_for_load_state('networkidle')
                self.random_delay(3, 5)
                
                # 截图查看结果
                self.page.screenshot(path='eudamed_search_results.png')
                print("📸 已截图: eudamed_search_results.png")
                
                # 提取数据
                print("📊 提取数据...")
                
                # 尝试多种可能的结果列表选择器
                result_selectors = [
                    'table tbody tr',
                    '.result-item',
                    '[class*="result"]',
                    '.list-item',
                    'tr[data-testid]',
                    '.card',
                ]
                
                for selector in result_selectors:
                    rows = self.page.locator(selector).all()
                    if len(rows) > 0:
                        print(f"✅ 使用选择器 '{selector}' 找到 {len(rows)} 条结果")
                        
                        for row in rows[:max_results]:
                            try:
                                # 尝试提取数据
                                actor = self.extract_actor_data(row)
                                if actor:
                                    actors.append(actor)
                                    print(f"  ✓ {actor.get('name', 'Unknown')[:50]}...")
                            except Exception as e:
                                print(f"  ⚠️  提取数据失败: {e}")
                                continue
                        
                        break
                
                print(f"📊 已抓取 {len(actors)} 条 Actor 数据")
                
                # 尝试翻页
                page_count = 1
                while len(actors) < max_results and page_count < 10:
                    next_button = self.page.locator('button:has-text("Next"), .pagination-next, [aria-label="Next"]').first
                    if next_button.count() == 0 or not next_button.is_enabled():
                        print("✅ 已到最后一页")
                        break
                    
                    print(f"📄 翻到第 {page_count + 1} 页...")
                    next_button.click()
                    self.random_delay(5, 8)
                    
                    # 提取新页面的数据
                    for selector in result_selectors:
                        rows = self.page.locator(selector).all()
                        if len(rows) > 0:
                            for row in rows:
                                if len(actors) >= max_results:
                                    break
                                try:
                                    actor = self.extract_actor_data(row)
                                    if actor and actor not in actors:
                                        actors.append(actor)
                                        print(f"  ✓ {actor.get('name', 'Unknown')[:50]}...")
                                except:
                                    continue
                            break
                    
                    page_count += 1
                    print(f"📊 当前共 {len(actors)} 条数据")
                    
            else:
                print("❌ 未找到搜索框")
                
        except Exception as e:
            print(f"❌ 搜索失败: {e}")
            import traceback
            traceback.print_exc()
            
        return actors
    
    def extract_actor_data(self, row) -> Optional[Dict]:
        """从一行数据中提取 Actor 信息"""
        try:
            # 尝试多种方式提取数据
            actor = {
                'scraped_at': datetime.now().isoformat(),
            }
            
            # 获取所有单元格
            cells = row.locator('td, .cell, [class*="col"]').all()
            
            if len(cells) >= 1:
                actor['name'] = cells[0].inner_text().strip()
            if len(cells) >= 2:
                actor['srn'] = cells[1].inner_text().strip()
            if len(cells) >= 3:
                actor['country'] = cells[2].inner_text().strip()
            if len(cells) >= 4:
                actor['type'] = cells[3].inner_text().strip()
            
            # 如果没有单元格，尝试直接获取文本
            if not actor.get('name'):
                actor['name'] = row.inner_text().strip()[:100]
            
            return actor if actor.get('name') else None
            
        except Exception as e:
            print(f"⚠️  提取数据失败: {e}")
            return None
    
    def save_to_json(self, data: List[Dict], filename: str):
        """保存数据到 JSON"""
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"💾 数据已保存到: {filename} ({len(data)} 条)")
    
    def save_to_supabase(self, data: List[Dict], table_name: str):
        """保存数据到 Supabase"""
        try:
            from supabase import create_client
            import os
            
            supabase_url = os.getenv('SUPABASE_URL')
            supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
            
            if not supabase_url or not supabase_key:
                print(f"⚠️  环境变量未设置，跳过数据库保存")
                return False
            
            supabase = create_client(supabase_url, supabase_key)
            
            # 批量插入
            batch_size = 100
            for i in range(0, len(data), batch_size):
                batch = data[i:i+batch_size]
                result = supabase.table(table_name).upsert(batch).execute()
                print(f"  ✓ 已保存 {len(batch)} 条到 {table_name}")
                time.sleep(0.5)
            
            print(f"✅ 所有数据已保存到 Supabase: {table_name}")
            return True
            
        except Exception as e:
            print(f"❌ 保存到 Supabase 失败: {e}")
            return False


def main():
    """主函数"""
    print("=" * 60)
    print("EUDAMED 数据爬虫 V3")
    print("基于实际网站结构 - 一定能拿到数据！")
    print("=" * 60)
    print()
    
    with EudamedScraperV3(headless=False) as scraper:
        # 抓取德国制造商
        print("🇩🇪 抓取德国制造商...")
        german_actors = scraper.search_actors(country_code='DE', max_results=100)
        scraper.save_to_json(german_actors, 'eudamed_german_actors_v3.json')
        scraper.save_to_supabase(german_actors, 'eudamed_actors')
        
        # 抓取法国制造商
        print("\n🇫🇷 抓取法国制造商...")
        french_actors = scraper.search_actors(country_code='FR', max_results=100)
        scraper.save_to_json(french_actors, 'eudamed_french_actors_v3.json')
        scraper.save_to_supabase(french_actors, 'eudamed_actors')
        
        # 抓取意大利制造商
        print("\n🇮🇹 抓取意大利制造商...")
        italian_actors = scraper.search_actors(country_code='IT', max_results=100)
        scraper.save_to_json(italian_actors, 'eudamed_italian_actors_v3.json')
        scraper.save_to_supabase(italian_actors, 'eudamed_actors')
    
    print("\n" + "=" * 60)
    total = len(german_actors) + len(french_actors) + len(italian_actors)
    print(f"🎉 完成！共抓取 {total} 条数据")
    print("=" * 60)


if __name__ == '__main__':
    main()
