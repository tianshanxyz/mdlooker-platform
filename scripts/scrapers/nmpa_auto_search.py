#!/usr/bin/env python3
"""
NMPA 数据自动抓取 - 使用常见医疗器械关键词批量搜索
"""

import json
import time
import random
from datetime import datetime
from typing import List, Dict
from playwright.sync_api import sync_playwright, Page, Browser


class NMPAAutoSearcher:
    """NMPA 自动搜索器"""
    
    # 常用医疗器械关键词列表
    KEYWORDS = [
        # 基础耗材
        '口罩', '注射器', '输液器', '导管', '缝合', '纱布', '绷带',
        # 诊断设备
        '超声', '监护', '血压', '体温', '血糖', '心电图', 'X光', 'CT', 'MRI',
        # 手术器械
        '手术刀', '镊子', '剪刀', '钳子', '吸引器', '电刀', '激光',
        # 植入物
        '支架', '假体', '关节', '骨板', '螺钉', '牙科', '眼科',
        # 康复设备
        '轮椅', '拐杖', '假肢', '助听器', '呼吸机', '制氧机',
        # 其他
        '消毒', '灭菌', '检测', '试剂', '试纸', '导管', '引流',
    ]
    
    def __init__(self, headless: bool = False):
        self.headless = headless
        self.browser: Browser = None
        self.page: Page = None
        self.all_results: List[Dict] = []
        
        self.stats = {
            'keywords_searched': 0,
            'total_results': 0,
            'successful': 0,
            'failed': 0,
        }
        
    def start(self):
        """启动浏览器"""
        print("🚀 启动浏览器...")
        playwright = sync_playwright().start()
        
        self.browser = playwright.chromium.launch(
            headless=self.headless,
            args=['--disable-blink-features=AutomationControlled']
        )
        
        context = self.browser.new_context(
            viewport={'width': 1920, 'height': 1080},
            user_agent='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            locale='zh-CN'
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
        time.sleep(delay)
        
http://192.168.3.42:8080/mobile    def navigate_to_medical_device_search(self) -> bool:
        """导航到医疗器械搜索页面"""
        try:
            print("\n🌐 访问 NMPA 数据查询页面...")
            self.page.goto("https://www.nmpa.gov.cn/datasearch/home-index.html", 
                          wait_until='domcontentloaded', timeout=60000)
            self.random_delay(3, 5)
            
            # 点击医疗器械图标
            print("🖱️  点击医疗器械图标...")
            medical_icon = self.page.locator('text=医疗器械').first
            if medical_icon.count() > 0:
                medical_icon.click()
                self.random_delay(3, 5)
                
            # 点击境内医疗器械（注册）
            print("🖱️  点击境内医疗器械（注册）...")
            domestic_link = self.page.locator('text=境内医疗器械（注册）').first
            if domestic_link.count() > 0:
                domestic_link.click()
                self.random_delay(3, 5)
                
            print("✅ 已到达搜索页面")
            return True
            
        except Exception as e:
            print(f"❌ 导航失败: {e}")
            return False
            
    def search_keyword(self, keyword: str, max_pages: int = 3) -> List[Dict]:
        """搜索单个关键词"""
        print(f"\n{'='*60}")
        print(f"🔍 搜索关键词: {keyword}")
        print(f"{'='*60}")
        
        results = []
        
        try:
            # 输入关键词
            search_input = self.page.locator('input[placeholder*="请输入"]').first
            if search_input.count() == 0:
                print("❌ 未找到搜索框")
                return results
                
            # 清空并输入
            search_input.fill('')
            self.random_delay(0.5, 1)
            search_input.fill(keyword)
            self.random_delay(1, 2)
            
            # 点击搜索按钮
            search_button = self.page.locator('button[type="submit"], .search-btn, button:has-text("搜索")').first
            if search_button.count() > 0:
                search_button.click()
            else:
                # 尝试按回车
                search_input.press('Enter')
                
            self.random_delay(3, 5)
            
            # 抓取多页数据
            for page_num in range(1, max_pages + 1):
                print(f"\n📄 第 {page_num} 页")
                
                # 提取当前页数据
                page_results = self.extract_data_from_page()
                results.extend(page_results)
                
                print(f"   本页: {len(page_results)} 条，总计: {len(results)} 条")
                
                # 尝试翻页
                if page_num < max_pages:
                    next_button = self.page.locator('text=下一页, .next, .next-page').first
                    if next_button.count() > 0 and next_button.is_enabled():
                        next_button.click()
                        self.random_delay(3, 5)
                    else:
                        print("   已到最后一页")
                        break
                        
            self.stats['keywords_searched'] += 1
            self.stats['successful'] += len(results)
            
        except Exception as e:
            print(f"❌ 搜索失败: {e}")
            self.stats['failed'] += 1
            
        return results
        
    def extract_data_from_page(self) -> List[Dict]:
        """从当前页面提取数据"""
        data = []
        
        try:
            # 等待表格加载
            self.page.wait_for_selector('table tbody tr', timeout=10000)
            
            # 获取所有行
            rows = self.page.locator('table tbody tr').all()
            
            for row in rows:
                try:
                    cells = row.locator('td').all()
                    if len(cells) >= 4:
                        item = {
                            'registration_number': cells[1].inner_text().strip() if len(cells) > 1 else '',
                            'company_name': cells[2].inner_text().strip() if len(cells) > 2 else '',
                            'product_name': cells[3].inner_text().strip() if len(cells) > 3 else '',
                            'scraped_at': datetime.now().isoformat(),
                        }
                        data.append(item)
                except Exception as e:
                    continue
                    
        except Exception as e:
            print(f"   ⚠️  提取数据失败: {e}")
            
        return data
        
    def run_batch_search(self, keywords: List[str] = None, max_keywords: int = 10):
        """批量搜索"""
        if keywords is None:
            keywords = self.KEYWORDS[:max_keywords]
            
        print(f"\n{'='*60}")
        print(f"🚀 开始批量搜索")
        print(f"关键词数量: {len(keywords)}")
        print(f"{'='*60}\n")
        
        # 导航到搜索页面
        if not self.navigate_to_medical_device_search():
            print("❌ 无法到达搜索页面")
            return
            
        # 逐个搜索关键词
        for i, keyword in enumerate(keywords, 1):
            print(f"\n{'='*60}")
            print(f"进度: {i}/{len(keywords)}")
            print(f"{'='*60}")
            
            results = self.search_keyword(keyword, max_pages=2)
            self.all_results.extend(results)
            
            # 保存中间结果
            if i % 5 == 0:
                self.save_progress()
                
            # 关键词之间等待
            if i < len(keywords):
                wait_time = random.uniform(5, 10)
                print(f"\n⏳ 等待 {wait_time:.1f} 秒后搜索下一个关键词...")
                time.sleep(wait_time)
                
        # 保存最终结果
        self.save_final_results()
        
    def save_progress(self):
        """保存进度"""
        filename = f'nmpa_progress_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json'
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(self.all_results, f, ensure_ascii=False, indent=2)
        print(f"💾 进度已保存: {filename} ({len(self.all_results)} 条)")
        
    def save_final_results(self):
        """保存最终结果"""
        # 去重
        unique_results = []
        seen = set()
        for item in self.all_results:
            key = item.get('registration_number', '')
            if key and key not in seen:
                seen.add(key)
                unique_results.append(item)
                
        filename = f'nmpa_medical_devices_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json'
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(unique_results, f, ensure_ascii=False, indent=2)
            
        print(f"\n{'='*60}")
        print("✅ 批量搜索完成！")
        print(f"{'='*60}")
        print(f"总搜索: {self.stats['keywords_searched']} 个关键词")
        print(f"原始结果: {len(self.all_results)} 条")
        print(f"去重后: {len(unique_results)} 条")
        print(f"保存文件: {filename}")
        print(f"{'='*60}")


def main():
    print("="*60)
    print("NMPA 医疗器械数据自动抓取")
    print("="*60)
    print()
    print("📋 说明:")
    print("- 使用常见医疗器械关键词批量搜索")
    print("- 自动抓取每个关键词的多页数据")
    print("- 自动去重并保存结果")
    print()
    
    searcher = NMPAAutoSearcher(headless=False)
    
    try:
        searcher.start()
        searcher.run_batch_search(max_keywords=20)  # 搜索前20个关键词
    except KeyboardInterrupt:
        print("\n\n⚠️  用户中断，保存当前进度...")
        searcher.save_progress()
    finally:
        searcher.stop()
        
    print("\n" + "="*60)
    print("✅ 完成！")
    print("="*60)


if __name__ == '__main__':
    main()
