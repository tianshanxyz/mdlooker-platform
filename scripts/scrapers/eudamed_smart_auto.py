#!/usr/bin/env python3
"""
EUDAMED 智能自动爬虫
自动检测分页组件，实现全自动翻页
"""

import json
import time
import os
from datetime import datetime
from typing import List, Dict, Optional, Tuple
from playwright.sync_api import sync_playwright, Page, Browser

# 加载环境变量
from dotenv import load_dotenv
env_path = os.path.join(os.path.dirname(__file__), '..', '..', '.env.local')
load_dotenv(env_path)


class EudamedSmartScraper:
    """EUDAMED 智能自动爬虫"""
    
    HOME_URL = "https://ec.europa.eu/tools/eudamed"
    
    def __init__(self, headless: bool = False):
        self.headless = headless
        self.browser: Optional[Browser] = None
        self.page: Optional[Page] = None
        self.pagination_info: Dict = {}
        
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
    
    def wait_for_user(self, message: str):
        """等待用户操作"""
        print(f"\n{'='*60}")
        print(f"⏸️  {message}")
        print(f"{'='*60}")
        input("👉 完成后请按回车键继续...\n")
    
    def navigate_to_search(self):
        """导航到搜索页面"""
        print("🌐 访问 EUDAMED 网站...")
        self.page.goto(self.HOME_URL, wait_until='networkidle')
        time.sleep(3)
        
        self.wait_for_user(
            "请在浏览器中：\n"
            "  1. 点击 'Actors' 菜单\n"
            "  2. 点击 'Economic Operators'\n"
            "  3. 点击 'Search' 按钮\n"
            "  4. 等待结果列表显示"
        )
        
        self.page.screenshot(path='eudamed_search_results.png')
        print(f"📸 已保存截图: eudamed_search_results.png")
        print(f"🔗 当前 URL: {self.page.url}")
    
    def detect_pagination(self) -> Dict:
        """检测分页组件"""
        print("\n🔍 检测分页组件...")
        
        pagination = {
            'type': None,
            'next_selector': None,
            'total_pages': 0,
            'current_page': 1,
        }
        
        # 截图分页区域
        try:
            # 滚动到页面底部
            self.page.evaluate('window.scrollTo(0, document.body.scrollHeight)')
            time.sleep(1)
            self.page.screenshot(path='eudamed_pagination_area.png')
            print("📸 已保存分页区域截图: eudamed_pagination_area.png")
        except:
            pass
        
        # 尝试多种分页类型
        
        # 类型 1: 文字按钮 "Next" / "Previous"
        next_selectors = [
            ('button:has-text("Next")', 'text_button'),
            ('a:has-text("Next")', 'text_link'),
            ('button:has-text(">")', 'arrow_button'),
            ('button:has-text("›")', 'arrow_button'),
            ('button:has-text("»")', 'double_arrow'),
            ('.pagination button:last-child', 'pagination_button'),
            ('.eui-pagination button:last-child', 'eui_pagination'),
            ('[class*="pagination"] button:last-child', 'class_pagination'),
            ('button[aria-label*="Next"]', 'aria_next'),
            ('button[aria-label*="next"]', 'aria_next'),
            ('a[aria-label*="Next"]', 'aria_link'),
            ('.page-next', 'class_next'),
            ('.next-page', 'class_next_page'),
            ('li.next a', 'li_next'),
            ('li:last-child a', 'li_last'),
        ]
        
        for selector, ptype in next_selectors:
            try:
                element = self.page.locator(selector).first
                if element.count() > 0 and element.is_visible():
                    pagination['type'] = ptype
                    pagination['next_selector'] = selector
                    print(f"✅ 检测到分页类型: {ptype}")
                    print(f"   选择器: {selector}")
                    return pagination
            except:
                continue
        
        # 类型 2: 页码按钮
        try:
            page_buttons = self.page.locator('button[class*="page"], .page-item, .pagination-item').all()
            if len(page_buttons) > 0:
                pagination['type'] = 'page_numbers'
                pagination['total_pages'] = len(page_buttons)
                print(f"✅ 检测到页码按钮: {len(page_buttons)} 个")
                return pagination
        except:
            pass
        
        # 类型 3: 页码输入框
        try:
            page_input = self.page.locator('input[type="number"], input[class*="page"]').first
            if page_input.count() > 0 and page_input.is_visible():
                pagination['type'] = 'page_input'
                print("✅ 检测到页码输入框")
                return pagination
        except:
            pass
        
        # 类型 4: 检查是否有 "Load More" 按钮
        try:
            load_more = self.page.locator('button:has-text("Load"), button:has-text("More")').first
            if load_more.count() > 0 and load_more.is_visible():
                pagination['type'] = 'load_more'
                pagination['next_selector'] = 'button:has-text("Load"), button:has-text("More")'
                print("✅ 检测到 'Load More' 按钮")
                return pagination
        except:
            pass
        
        print("⚠️  未检测到标准分页组件，将尝试其他方法")
        return pagination
    
    def click_next_page(self) -> bool:
        """点击下一页"""
        if not self.pagination_info.get('next_selector'):
            return False
        
        selector = self.pagination_info['next_selector']
        
        try:
            next_btn = self.page.locator(selector).first
            
            if next_btn.count() == 0:
                return False
            
            # 检查按钮是否可见且可用
            if not next_btn.is_visible():
                return False
            
            # 检查是否禁用
            is_disabled = next_btn.evaluate('el => el.disabled || el.classList.contains("disabled")')
            if is_disabled:
                print("  ⏹️  已到最后一页")
                return False
            
            # 点击下一页
            print(f"  🖱️  点击下一页...")
            next_btn.click()
            time.sleep(5)  # 等待页面加载
            
            # 等待新数据加载
            self.page.wait_for_load_state('networkidle')
            time.sleep(2)
            
            return True
            
        except Exception as e:
            print(f"  ❌ 点击失败: {e}")
            return False
    
    def try_keyboard_navigation(self) -> bool:
        """尝试键盘导航"""
        print("  ⌨️  尝试键盘导航...")
        
        try:
            # 聚焦到页面
            self.page.focus('body')
            time.sleep(0.5)
            
            # 尝试右箭头
            self.page.keyboard.press('ArrowRight')
            time.sleep(3)
            
            # 检查页面是否变化
            self.page.wait_for_load_state('networkidle')
            return True
            
        except:
            return False
    
    def try_js_pagination(self) -> bool:
        """尝试 JavaScript 触发翻页"""
        print("  🔧 尝试 JavaScript 翻页...")
        
        try:
            # 查找所有可能的翻页元素
            js_code = '''
            () => {
                // 查找包含 "Next" 文字的元素
                const allButtons = Array.from(document.querySelectorAll('button, a, [role="button"]'));
                const nextBtn = allButtons.find(el => {
                    const text = el.innerText || el.textContent || '';
                    return text.toLowerCase().includes('next') || 
                           text.includes('>') || 
                           text.includes('›') ||
                           text.includes('»');
                });
                
                if (nextBtn && !nextBtn.disabled && !nextBtn.classList.contains('disabled')) {
                    nextBtn.click();
                    return true;
                }
                
                // 查找分页组件的下一页按钮
                const pagination = document.querySelector('.pagination, [class*="pagination"]');
                if (pagination) {
                    const buttons = pagination.querySelectorAll('button, a');
                    if (buttons.length > 0) {
                        buttons[buttons.length - 1].click();
                        return true;
                    }
                }
                
                return false;
            }
            '''
            
            result = self.page.evaluate(js_code)
            
            if result:
                time.sleep(5)
                self.page.wait_for_load_state('networkidle')
                return True
            
            return False
            
        except Exception as e:
            print(f"  ❌ JS 翻页失败: {e}")
            return False
    
    def extract_page_data(self) -> List[Dict]:
        """提取当前页数据"""
        data = []
        
        selectors = [
            'table tbody tr',
            'tr[class*="row"]',
            '[class*="result"]',
            '.eui-table-row',
        ]
        
        for selector in selectors:
            try:
                rows = self.page.locator(selector).all()
                if len(rows) > 0:
                    for row in rows:
                        try:
                            cells = row.locator('td, [role="cell"], .cell').all()
                            
                            if len(cells) >= 2:
                                item = {
                                    'name': cells[0].inner_text().strip(),
                                    'details': cells[1].inner_text().strip() if len(cells) > 1 else '',
                                    'country': cells[2].inner_text().strip() if len(cells) > 2 else '',
                                    'srn': cells[3].inner_text().strip() if len(cells) > 3 else '',
                                    'type': cells[4].inner_text().strip() if len(cells) > 4 else '',
                                    'scraped_at': datetime.now().isoformat(),
                                }
                                data.append(item)
                        except:
                            continue
                    
                    break
            except:
                continue
        
        return data
    
    def scrape_all_pages(self, max_pages: int = 2000) -> List[Dict]:
        """自动抓取所有页面"""
        print(f"\n🚀 开始自动抓取，最大页数: {max_pages}")
        print(f"💡 提示：如果数据量很大，可以随时输入 'q' 退出")
        print(f"💾 每 10 页自动保存一次数据")
        print(f"📊 预计数据量: 约 {max_pages * 25} 条（每页约 25 条）")
        print(f"🔍 自动检测重复数据，发现重复将停止抓取")
        
        all_data = []
        page_num = 1
        consecutive_failures = 0
        last_page_data_count = 0
        same_data_count = 0
        
        while page_num <= max_pages and consecutive_failures < 3:
            print(f"\n{'='*60}")
            print(f"📄 第 {page_num} 页")
            print(f"{'='*60}")
            
            # 截图
            self.page.screenshot(path=f'eudamed_page_{page_num}.png')
            
            # 提取数据
            page_data = self.extract_page_data()
            
            if page_data:
                # 检查是否与上一页数据重复
                if len(page_data) == last_page_data_count:
                    same_data_count += 1
                    print(f"⚠️  检测到可能重复数据（连续 {same_data_count} 页数据量相同）")
                    
                    if same_data_count >= 3:
                        print("❌ 连续 3 页数据量相同，可能已到最后一页，停止抓取")
                        break
                else:
                    same_data_count = 0
                
                last_page_data_count = len(page_data)
                all_data.extend(page_data)
                print(f"✅ 本页提取: {len(page_data)} 条，总计: {len(all_data)} 条")
                consecutive_failures = 0
            else:
                print("⚠️  本页没有数据")
                consecutive_failures += 1
            
            # 每 10 页保存一次
            if page_num % 10 == 0 and all_data:
                self.save_data(all_data, f'eudamed_data_backup_page_{page_num}.json')
            
            # 尝试翻页
            print(f"\n🔄 尝试翻到第 {page_num + 1} 页...")
            
            # 方法 1: 使用检测到的选择器
            if self.pagination_info.get('next_selector'):
                if self.click_next_page():
                    page_num += 1
                    continue
            
            # 方法 2: JavaScript 翻页
            if self.try_js_pagination():
                page_num += 1
                continue
            
            # 方法 3: 键盘导航
            if self.try_keyboard_navigation():
                page_num += 1
                continue
            
            # 所有方法都失败
            print("❌ 所有自动翻页方法都失败")
            
            # 询问用户是否手动翻页
            print("\n" + "="*60)
            print("⚠️  自动翻页失败，请手动操作")
            print(f"📊 当前进度: 第 {page_num} 页，共 {len(all_data)} 条数据")
            print("="*60)
            
            try:
                user_input = input("请在浏览器中点击 'Next' 按钮，然后按回车继续（输入 'q' 退出）: ").strip().lower()
                
                if user_input == 'q':
                    print("👋 用户选择退出")
                    break
            except:
                print("⚠️  输入检测失败，继续抓取...")
            
            page_num += 1
        
        return all_data
    
    def save_data(self, data: List[Dict], filename: str):
        """保存数据"""
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"\n💾 数据已保存: {filename}")
        print(f"   总计: {len(data)} 条")


def main():
    """主函数"""
    print("="*60)
    print("EUDAMED 智能自动爬虫")
    print("自动检测分页，自动翻页")
    print("="*60)
    print()
    
    with EudamedSmartScraper(headless=False) as scraper:
        # 步骤 1: 导航到搜索页面
        scraper.navigate_to_search()
        
        # 步骤 2: 检测分页组件
        scraper.pagination_info = scraper.detect_pagination()
        
        # 步骤 3: 自动抓取所有页面（最多 2000 页，约 100,000 条数据）
        data = scraper.scrape_all_pages(max_pages=2000)
        
        # 步骤 4: 保存数据（使用时间戳避免覆盖）
        if data:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            output_file = f'eudamed_data_{timestamp}.json'
            scraper.save_data(data, output_file)
            
            print("\n" + "="*60)
            print(f"🎉 完成！共抓取 {len(data)} 条数据")
            print(f"💾 数据已保存到: {output_file}")
            print("="*60)
        else:
            print("\n❌ 未抓取到数据")
    
    print("\n✅ 程序结束")


if __name__ == '__main__':
    main()
