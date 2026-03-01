#!/usr/bin/env python3
"""
EUDAMED 逐页手动爬虫
一页一页抓取，完全由你控制翻页
"""

import json
import time
import os
from datetime import datetime
from typing import List, Dict, Optional
from playwright.sync_api import sync_playwright, Page, Browser

# 加载环境变量
from dotenv import load_dotenv
env_path = os.path.join(os.path.dirname(__file__), '..', '..', '.env.local')
load_dotenv(env_path)


class EudamedPageByPage:
    """EUDAMED 逐页手动爬虫"""
    
    HOME_URL = "https://ec.europa.eu/tools/eudamed"
    
    def __init__(self, headless: bool = False):
        self.headless = headless
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
        
        self.browser = playwright.chromium.launch(
            headless=self.headless,
            args=['--window-size=1920,1080']
        )
        
        context = self.browser.new_context(
            viewport={'width': 1920, 'height': 1080},
            user_agent='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        )
        
        self.page = context.new_page()
        self.page.set_default_timeout(120000)
        
        print("✅ 浏览器启动成功")
        
    def stop(self):
        """关闭浏览器"""
        if self.browser:
            print("🛑 关闭浏览器...")
            self.browser.close()
            print("✅ 浏览器已关闭")
    
    def wait_for_user(self, message: str) -> str:
        """等待用户操作并返回输入"""
        print(f"\n{'='*60}")
        print(f"⏸️  {message}")
        print(f"{'='*60}")
        user_input = input("👉 输入 'n' 继续下一页，输入 'q' 退出，或按回车继续: ").strip().lower()
        return user_input
    
    def navigate_to_search_page(self):
        """导航到搜索页面"""
        print("🌐 访问 EUDAMED 网站...")
        self.page.goto(self.HOME_URL, wait_until='networkidle')
        time.sleep(3)
        
        self.page.screenshot(path='eudamed_step1_home.png')
        
        print("\n" + "="*60)
        print("📋 第一步：导航到 Economic Operators 页面")
        print("="*60)
        print("请在浏览器中：")
        print("  1. 点击顶部的 'Actors' 菜单")
        print("  2. 点击 'Economic Operators'")
        print("  3. 点击蓝色的 'Search' 按钮")
        print("  4. 等待结果列表显示")
        
        user_input = self.wait_for_user("完成后请按回车键继续（输入 q 退出）")
        if user_input == 'q':
            return False
        
        # 截图确认
        self.page.screenshot(path='eudamed_step2_results.png')
        print(f"📸 当前页面已保存: eudamed_step2_results.png")
        print(f"🔗 当前 URL: {self.page.url}")
        
        return True
    
    def extract_current_page(self) -> List[Dict]:
        """提取当前页面的数据"""
        data = []
        
        # 截图
        timestamp = datetime.now().strftime('%H%M%S')
        self.page.screenshot(path=f'eudamed_page_{timestamp}.png')
        
        # 尝试多种选择器
        selectors = [
            'table tbody tr',
            'tr[class*="row"]',
            '[class*="result"]',
            '.eui-table-row',
            'div[role="row"]',
        ]
        
        for selector in selectors:
            try:
                rows = self.page.locator(selector).all()
                if len(rows) > 0:
                    print(f"  ✓ 找到 {len(rows)} 行数据")
                    
                    for i, row in enumerate(rows):
                        try:
                            cells = row.locator('td, [role="cell"], .cell').all()
                            
                            if len(cells) >= 2:
                                item = {
                                    'name': cells[0].inner_text().strip(),
                                    'details': cells[1].inner_text().strip() if len(cells) > 1 else '',
                                    'country': cells[2].inner_text().strip() if len(cells) > 2 else '',
                                    'srn': cells[3].inner_text().strip() if len(cells) > 3 else '',
                                    'type': cells[4].inner_text().strip() if len(cells) > 4 else '',
                                    'page': timestamp,
                                    'scraped_at': datetime.now().isoformat(),
                                }
                                data.append(item)
                                
                                # 打印前3条作为示例
                                if i < 3:
                                    print(f"    {i+1}. {item['name'][:50]}...")
                        except:
                            continue
                    
                    break
                    
            except:
                continue
        
        return data
    
    def scrape_all_pages(self) -> List[Dict]:
        """逐页抓取所有数据"""
        all_data = []
        page_num = 1
        
        print("\n" + "="*60)
        print("📋 第二步：逐页抓取数据")
        print("="*60)
        
        while True:
            print(f"\n📄 第 {page_num} 页")
            print("-" * 40)
            
            # 提取当前页
            page_data = self.extract_current_page()
            
            if page_data:
                all_data.extend(page_data)
                print(f"✅ 本页提取了 {len(page_data)} 条，总计: {len(all_data)}")
            else:
                print("⚠️  本页没有数据")
            
            # 询问用户
            user_input = self.wait_for_user(
                f"第 {page_num} 页完成\n"
                f"当前总计: {len(all_data)} 条\n"
                f"请在浏览器中点击 'Next' 按钮翻到下一页（如果有）"
            )
            
            if user_input == 'q':
                print("👋 用户选择退出")
                break
            
            page_num += 1
            time.sleep(2)
        
        return all_data
    
    def save_data(self, data: List[Dict], filename: str):
        """保存数据"""
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"\n💾 数据已保存: {filename}")
        print(f"   总计: {len(data)} 条")
    
    def save_to_supabase(self, data: List[Dict]):
        """保存到 Supabase"""
        try:
            from supabase import create_client
            import os
            
            url = os.getenv('SUPABASE_URL')
            key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
            
            if not url or not key:
                print("⚠️  环境变量未设置，跳过 Supabase 保存")
                print("   请手动导入 JSON 文件到 Supabase")
                return
            
            supabase = create_client(url, key)
            
            batch_size = 100
            for i in range(0, len(data), batch_size):
                batch = data[i:i+batch_size]
                supabase.table('eudamed_actors').upsert(batch).execute()
                print(f"  ✓ 已保存 {len(batch)} 条到 Supabase")
                time.sleep(0.5)
            
            print("✅ 所有数据已保存到 Supabase")
            
        except Exception as e:
            print(f"❌ 保存到 Supabase 失败: {e}")


def main():
    """主函数"""
    print("="*60)
    print("EUDAMED 逐页手动爬虫")
    print("一页一页抓取，完全由你控制")
    print("="*60)
    print()
    
    with EudamedPageByPage(headless=False) as scraper:
        # 步骤 1: 导航到搜索页面
        if not scraper.navigate_to_search_page():
            print("👋 退出程序")
            return
        
        # 步骤 2: 逐页抓取
        data = scraper.scrape_all_pages()
        
        # 步骤 3: 保存数据
        if data:
            scraper.save_data(data, 'eudamed_data_complete.json')
            scraper.save_to_supabase(data)
            
            print("\n" + "="*60)
            print(f"🎉 完成！共抓取 {len(data)} 条数据")
            print("="*60)
        else:
            print("\n❌ 未抓取到数据")
    
    print("\n✅ 程序结束")


if __name__ == '__main__':
    main()
