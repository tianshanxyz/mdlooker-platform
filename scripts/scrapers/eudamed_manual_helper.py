#!/usr/bin/env python3
"""
EUDAMED 人工辅助爬虫
结合自动化和人工操作，确保能拿到数据！
"""

import json
import time
import random
import os
from datetime import datetime
from typing import List, Dict, Optional
from playwright.sync_api import sync_playwright, Page, Browser

# 加载环境变量
from dotenv import load_dotenv
env_path = os.path.join(os.path.dirname(__file__), '..', '..', '.env.local')
load_dotenv(env_path)


class EudamedManualHelper:
    """EUDAMED 人工辅助爬虫"""
    
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
        self.page.set_default_timeout(120000)  # 2分钟超时
        
        print("✅ 浏览器启动成功")
        
    def stop(self):
        """关闭浏览器"""
        if self.browser:
            print("🛑 关闭浏览器...")
            self.browser.close()
            print("✅ 浏览器已关闭")
    
    def wait_for_user(self, message: str):
        """等待用户操作"""
        print(f"\n{'='*60}")
        print(f"⏸️  {message}")
        print(f"{'='*60}")
        input("👉 完成后请按回车键继续...\n")
    
    def navigate_and_search(self):
        """导航到搜索页面并执行搜索"""
        print("🌐 访问 EUDAMED 网站...")
        self.page.goto(self.HOME_URL, wait_until='networkidle')
        time.sleep(3)
        
        # 截图
        self.page.screenshot(path='eudamed_step1_home.png')
        
        self.wait_for_user(
            "请在浏览器中完成以下操作：\n"
            "1. 点击顶部的 'Actors' 菜单\n"
            "2. 点击 'Economic Operators'\n"
            "3. 等待页面加载完成（看到搜索表单）"
        )
        
        # 截图确认
        self.page.screenshot(path='eudamed_step2_search_page.png')
        print(f"📸 当前页面已保存: eudamed_step2_search_page.png")
        print(f"🔗 当前 URL: {self.page.url}")
        
        # 自动执行搜索
        print("\n🔍 自动执行搜索...")
        self.perform_search()
        
    def perform_search(self):
        """执行搜索操作"""
        try:
            # 查找并点击 Search 按钮
            search_button = self.page.locator('button:has-text("Search"), input[type="submit"], .search-button').first
            
            if search_button.count() > 0 and search_button.is_visible():
                print("✅ 找到 Search 按钮，点击搜索...")
                search_button.click()
                time.sleep(5)  # 等待结果加载
                
                # 等待结果表格出现
                self.page.wait_for_selector('table, .results, [class*="result"]', timeout=30000)
                print("✅ 搜索结果已加载")
                
                # 截图查看结果
                self.page.screenshot(path='eudamed_step3_results.png')
                print("📸 搜索结果已保存: eudamed_step3_results.png")
            else:
                print("⚠️  未找到 Search 按钮，请手动点击")
                self.wait_for_user("请手动点击 Search 按钮，等待结果加载")
                
        except Exception as e:
            print(f"⚠️  自动搜索失败: {e}")
            print("请手动完成搜索操作")
            self.wait_for_user("请手动点击 Search 按钮，等待结果加载")
        
    def extract_all_data(self, max_results: int = 500) -> List[Dict]:
        """提取所有数据"""
        print(f"\n🔍 开始提取数据，目标: {max_results} 条")
        
        all_data = []
        page_num = 1
        no_data_count = 0  # 连续没有数据的计数
        
        while len(all_data) < max_results and no_data_count < 3:
            print(f"\n📄 处理第 {page_num} 页...")
            
            # 截图当前页
            self.page.screenshot(path=f'eudamed_page_{page_num}.png')
            
            # 提取当前页数据
            page_data = self.extract_page_data()
            
            if not page_data:
                print("⚠️  当前页没有数据")
                no_data_count += 1
                
                # 如果连续3页没有数据，可能是真的结束了
                if no_data_count >= 3:
                    print("⚠️  连续3页没有数据，停止抓取")
                    break
                
                # 尝试翻页看下一页是否有数据
                print("  🔄 尝试翻页...")
            else:
                no_data_count = 0  # 重置计数
                all_data.extend(page_data)
                print(f"✅ 第 {page_num} 页提取了 {len(page_data)} 条，总计: {len(all_data)}")
            
            # 检查是否达到目标
            if len(all_data) >= max_results:
                print(f"🎯 已达到目标数量: {max_results}")
                break
            
            # 查找下一页按钮
            has_next = self.click_next_page()
            if not has_next:
                print("✅ 已到最后一页或无法翻页")
                break
            
            page_num += 1
            time.sleep(3)
        
        return all_data[:max_results]
    
    def extract_page_data(self) -> List[Dict]:
        """提取当前页面的数据"""
        data = []
        
        # 尝试多种可能的选择器
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
                    print(f"  ✓ 使用选择器 '{selector}' 找到 {len(rows)} 行")
                    
                    for row in rows:
                        try:
                            # 提取单元格
                            cells = row.locator('td, [role="cell"], .cell').all()
                            
                            if len(cells) >= 2:
                                item = {
                                    'name': cells[0].inner_text().strip(),
                                    'details': cells[1].inner_text().strip() if len(cells) > 1 else '',
                                    'country': cells[2].inner_text().strip() if len(cells) > 2 else '',
                                    'scraped_at': datetime.now().isoformat(),
                                }
                                
                                # 尝试获取更多字段
                                if len(cells) > 3:
                                    item['srn'] = cells[3].inner_text().strip()
                                if len(cells) > 4:
                                    item['type'] = cells[4].inner_text().strip()
                                
                                data.append(item)
                        except Exception as e:
                            continue
                    
                    break  # 找到有效选择器后退出
                    
            except Exception as e:
                continue
        
        return data
    
    def click_next_page(self) -> bool:
        """点击下一页"""
        next_selectors = [
            'button:has-text("Next")',
            'a:has-text("Next")',
            '[aria-label="Next"]',
            '.pagination-next',
            'button[title="Next"]',
            '.eui-pagination__button--next',
            '[class*="pagination"] button:last-child',
            'button >> text=Next',
        ]
        
        for selector in next_selectors:
            try:
                next_btn = self.page.locator(selector).first
                if next_btn.count() > 0:
                    if next_btn.is_visible():
                        # 检查按钮是否可用（不是 disabled）
                        is_disabled = next_btn.is_disabled() if hasattr(next_btn, 'is_disabled') else False
                        if not is_disabled:
                            print(f"  🖱️  点击下一页按钮...")
                            next_btn.click()
                            time.sleep(5)  # 等待页面加载
                            return True
                        else:
                            print("  ⏹️  下一页按钮已禁用（已到最后一页）")
                            return False
            except Exception as e:
                print(f"  ⚠️  选择器 {selector} 失败: {e}")
                continue
        
        # 如果没有找到按钮，尝试查找页码输入框
        try:
            page_input = self.page.locator('input[type="number"], .page-input').first
            if page_input.count() > 0 and page_input.is_visible():
                print("  📝 找到页码输入框，尝试输入下一页...")
                current_page = page_input.input_value()
                next_page_num = int(current_page) + 1 if current_page else 2
                page_input.fill(str(next_page_num))
                page_input.press('Enter')
                time.sleep(5)
                return True
        except:
            pass
        
        print("  ❌ 未找到下一页按钮")
        return False
    
    def save_data(self, data: List[Dict], filename: str):
        """保存数据"""
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"\n💾 数据已保存: {filename} ({len(data)} 条)")
    
    def save_to_supabase(self, data: List[Dict]):
        """保存到 Supabase"""
        try:
            from supabase import create_client
            import os
            
            url = os.getenv('SUPABASE_URL')
            key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
            
            if not url or not key:
                print("⚠️  环境变量未设置，跳过 Supabase 保存")
                return
            
            supabase = create_client(url, key)
            
            # 分批插入
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
    print("EUDAMED 人工辅助爬虫")
    print("一定能拿到数据！")
    print("="*60)
    print()
    
    with EudamedManualHelper(headless=False) as helper:
        # 步骤 1: 导航到搜索页面
        helper.navigate_and_search()
        
        # 步骤 2: 等待用户确认可以开始提取
        helper.wait_for_user(
            "请确认：\n"
            "1. 搜索页面已加载\n"
            "2. 数据列表已显示\n"
            "3. 准备好开始提取数据\n"
            "💡 提示：如果自动翻页失败，可以手动点击下一页"
        )
        
        # 步骤 3: 提取数据
        print("\n🚀 开始自动提取数据...")
        data = helper.extract_all_data(max_results=500)
        
        # 步骤 4: 保存数据
        if data:
            helper.save_data(data, 'eudamed_data_manual.json')
            helper.save_to_supabase(data)
            
            print(f"\n{'='*60}")
            print(f"🎉 成功！共抓取 {len(data)} 条数据")
            print(f"{'='*60}")
        else:
            print("\n❌ 未提取到数据")
    
    print("\n✅ 完成！")


if __name__ == '__main__':
    main()
