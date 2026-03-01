#!/usr/bin/env python3
"""
EUDAMED 数据爬虫
无需注册，直接从公开查询界面抓取数据
"""

import json
import time
import random
from datetime import datetime
from typing import List, Dict, Optional
from playwright.sync_api import sync_playwright, Page, Browser


class EudamedScraper:
    """EUDAMED 数据爬虫"""
    
    BASE_URL = "https://ec.europa.eu/tools/eudamed"
    SEARCH_URL = f"{BASE_URL}#/screen/search"
    
    def __init__(self, headless: bool = True, proxy: Optional[str] = None):
        self.headless = headless
        self.proxy = proxy
        self.browser: Optional[Browser] = None
        self.page: Optional[Page] = None
        self.results: List[Dict] = []
        
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
        
        browser_args = {}
        if self.proxy:
            browser_args['proxy'] = {'server': self.proxy}
            
        self.browser = playwright.chromium.launch(
            headless=self.headless,
            **browser_args
        )
        
        context = self.browser.new_context(
            viewport={'width': 1920, 'height': 1080},
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        )
        
        self.page = context.new_page()
        print("✅ 浏览器启动成功")
        
    def stop(self):
        """关闭浏览器"""
        if self.browser:
            print("🛑 关闭浏览器...")
            self.browser.close()
            print("✅ 浏览器已关闭")
            
    def random_delay(self, min_seconds: float = 3.0, max_seconds: float = 7.0):
        """随机延迟，避免被封"""
        delay = random.uniform(min_seconds, max_seconds)
        print(f"⏱️  等待 {delay:.1f} 秒...")
        time.sleep(delay)
        
    def search_actors(self, country_code: Optional[str] = None, max_results: int = 100) -> List[Dict]:
        """
        搜索 Actor（制造商）
        
        Args:
            country_code: 国家代码（如 'DE', 'FR', 'IT'）
            max_results: 最大结果数
            
        Returns:
            Actor 列表
        """
        print(f"🔍 开始搜索 Actor，国家: {country_code or '全部'}, 最大结果: {max_results}")
        
        try:
            # 访问搜索页面
            self.page.goto(self.SEARCH_URL)
            self.random_delay(2, 4)
            
            # 选择 Actor 搜索
            # 注意：EUDAMED 是 Angular 应用，需要等待元素加载
            self.page.wait_for_selector('text=Actor', timeout=10000)
            self.page.click('text=Actor')
            self.random_delay(1, 2)
            
            # 如果指定了国家，选择国家筛选
            if country_code:
                # 找到国家选择器
                country_select = self.page.locator('select[formcontrolname="country"]').first
                if country_select.count() > 0:
                    country_select.select_option(value=country_code)
                    self.random_delay(1, 2)
                    
            # 点击搜索按钮
            search_button = self.page.locator('button:has-text("Search")').first
            if search_button.count() > 0:
                search_button.click()
                self.random_delay(3, 5)
                
            # 等待结果加载
            self.page.wait_for_selector('table tbody tr', timeout=15000)
            
            # 抓取数据
            actors = []
            while len(actors) < max_results:
                # 获取当前页的所有行
                rows = self.page.locator('table tbody tr').all()
                
                for row in rows:
                    if len(actors) >= max_results:
                        break
                        
                    try:
                        # 提取数据
                        cells = row.locator('td').all()
                        if len(cells) >= 3:
                            actor = {
                                'name': cells[0].inner_text().strip(),
                                'srn': cells[1].inner_text().strip(),
                                'country': cells[2].inner_text().strip(),
                                'type': 'manufacturer',
                                'scraped_at': datetime.now().isoformat(),
                            }
                            actors.append(actor)
                            print(f"  ✓ 抓取: {actor['name'][:50]}...")
                    except Exception as e:
                        print(f"  ⚠️  抓取行数据失败: {e}")
                        continue
                        
                print(f"📊 已抓取 {len(actors)} 条 Actor 数据")
                
                # 检查是否有下一页
                next_button = self.page.locator('button:has-text("Next")').first
                if next_button.count() == 0 or not next_button.is_enabled():
                    print("✅ 已到最后一页")
                    break
                    
                # 点击下一页
                next_button.click()
                self.random_delay(3, 6)
                
            return actors
            
        except Exception as e:
            print(f"❌ 搜索 Actor 失败: {e}")
            return []
            
    def search_devices(self, risk_class: Optional[str] = None, max_results: int = 100) -> List[Dict]:
        """
        搜索 Device（器械）
        
        Args:
            risk_class: 风险分类（'I', 'IIa', 'IIb', 'III'）
            max_results: 最大结果数
            
        Returns:
            Device 列表
        """
        print(f"🔍 开始搜索 Device，风险等级: {risk_class or '全部'}, 最大结果: {max_results}")
        
        try:
            # 访问搜索页面
            self.page.goto(self.SEARCH_URL)
            self.random_delay(2, 4)
            
            # 选择 Device 搜索
            self.page.wait_for_selector('text=Device', timeout=10000)
            self.page.click('text=Device')
            self.random_delay(1, 2)
            
            # 如果指定了风险等级，选择筛选
            if risk_class:
                risk_select = self.page.locator('select[formcontrolname="riskClass"]').first
                if risk_select.count() > 0:
                    risk_select.select_option(value=risk_class)
                    self.random_delay(1, 2)
                    
            # 点击搜索
            search_button = self.page.locator('button:has-text("Search")').first
            if search_button.count() > 0:
                search_button.click()
                self.random_delay(3, 5)
                
            # 等待结果
            self.page.wait_for_selector('table tbody tr', timeout=15000)
            
            # 抓取数据
            devices = []
            while len(devices) < max_results:
                rows = self.page.locator('table tbody tr').all()
                
                for row in rows:
                    if len(devices) >= max_results:
                        break
                        
                    try:
                        cells = row.locator('td').all()
                        if len(cells) >= 4:
                            device = {
                                'name': cells[0].inner_text().strip(),
                                'udi_di': cells[1].inner_text().strip(),
                                'risk_class': cells[2].inner_text().strip(),
                                'manufacturer': cells[3].inner_text().strip(),
                                'scraped_at': datetime.now().isoformat(),
                            }
                            devices.append(device)
                            print(f"  ✓ 抓取: {device['name'][:50]}...")
                    except Exception as e:
                        print(f"  ⚠️  抓取行数据失败: {e}")
                        continue
                        
                print(f"📊 已抓取 {len(devices)} 条 Device 数据")
                
                # 下一页
                next_button = self.page.locator('button:has-text("Next")').first
                if next_button.count() == 0 or not next_button.is_enabled():
                    print("✅ 已到最后一页")
                    break
                    
                next_button.click()
                self.random_delay(3, 6)
                
            return devices
            
        except Exception as e:
            print(f"❌ 搜索 Device 失败: {e}")
            return []
            
    def save_to_json(self, data: List[Dict], filename: str):
        """保存数据到 JSON 文件"""
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"💾 数据已保存到: {filename}")
        
    def save_to_supabase(self, data: List[Dict], table_name: str):
        """保存数据到 Supabase（需要配置 SUPABASE_URL 和 SUPABASE_KEY）"""
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
            batch_size = 100
            for i in range(0, len(data), batch_size):
                batch = data[i:i+batch_size]
                result = supabase.table(table_name).upsert(batch).execute()
                print(f"  ✓ 已保存 {len(batch)} 条到 {table_name}")
                
            print(f"✅ 所有数据已保存到 Supabase")
            return True
            
        except Exception as e:
            print(f"❌ 保存到 Supabase 失败: {e}")
            return False


def main():
    """主函数 - 示例用法"""
    print("=" * 60)
    print("EUDAMED 数据爬虫")
    print("=" * 60)
    
    # 使用示例
    with EudamedScraper(headless=False) as scraper:  # headless=False 可以看到浏览器窗口
        # 抓取德国制造商
        print("\n🇩🇪 抓取德国制造商...")
        german_actors = scraper.search_actors(country_code='DE', max_results=50)
        scraper.save_to_json(german_actors, 'eudamed_german_actors.json')
        
        # 抓取 III 类器械
        print("\n🔬 抓取 III 类高风险器械...")
        class_iii_devices = scraper.search_devices(risk_class='III', max_results=50)
        scraper.save_to_json(class_iii_devices, 'eudamed_class_iii_devices.json')
        
    print("\n" + "=" * 60)
    print("✅ 爬虫执行完成")
    print("=" * 60)


if __name__ == '__main__':
    main()
