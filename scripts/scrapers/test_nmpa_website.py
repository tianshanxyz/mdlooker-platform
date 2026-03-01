#!/usr/bin/env python3
"""
NMPA 数据爬虫 - 简化测试版
用于测试 NMPA 网站的不同访问方式
"""

import time
import random
from datetime import datetime
from playwright.sync_api import sync_playwright, Page, Browser


def test_nmpa_website():
    """测试 NMPA 网站的不同访问方式"""
    print("="*60)
    print("NMPA 网站测试")
    print("="*60)
    
    with sync_playwright() as p:
        # 启动浏览器
        browser = p.chromium.launch(headless=False, args=['--disable-blink-features=AutomationControlled'])
        context = browser.new_context(
            viewport={'width': 1920, 'height': 1080},
            user_agent='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            locale='zh-CN'
        )
        
        page = context.new_page()
        page.set_default_timeout(120000)  # 2 分钟
        
        test_urls = [
            {
                'name': 'NMPA 首页',
                'url': 'https://www.nmpa.gov.cn/',
            },
            {
                'name': '数据查询首页',
                'url': 'https://www.nmpa.gov.cn/datasearch/home-index.html',
            },
            {
                'name': '国产器械（旧链接1）',
                'url': 'https://www.nmpa.gov.cn/datasearch/search-result.html?nmpa=aWQ9MTE3NTDmlbDmja7kuIrmtbflkIjkvZzogIXnvZHnqbrplIDllK7lj5bor4HmoYg=',
            },
            {
                'name': '进口器械（旧链接1）',
                'url': 'https://www.nmpa.gov.cn/datasearch/search-result.html?nmpa=aWQ9MTE3NTDmlbDmja7kuIrmtbflkIjkvZzogIXnvZHnqbrmkqXlsYXmoYg=',
            },
        ]
        
        for i, test in enumerate(test_urls, 1):
            print(f"\n{'='*60}")
            print(f"测试 {i}/{len(test_urls)}: {test['name']}")
            print(f"URL: {test['url']}")
            print(f"{'='*60}")
            
            try:
                print(f"🌐 正在访问...")
                page.goto(test['url'], wait_until='domcontentloaded', timeout=60000)
                
                time.sleep(8)  # 等待8秒
                
                # 截图
                screenshot_path = f'nmpa_test_{i}_{datetime.now().strftime("%H%M%S")}.png'
                page.screenshot(path=screenshot_path)
                print(f"✅ 截图已保存: {screenshot_path}")
                
                # 保存 HTML
                html_path = f'nmpa_test_{i}.html'
                with open(html_path, 'w', encoding='utf-8') as f:
                    f.write(page.content())
                print(f"✅ HTML 已保存: {html_path}")
                
                # 检查页面内容
                title = page.title()
                url = page.url
                print(f"\n📄 页面标题: {title}")
                print(f"📍 最终 URL: {url}")
                
                # 检查表格
                table_count = page.locator('table').count()
                print(f"📊 表格数量: {table_count}")
                
                # 检查链接
                link_count = page.locator('a').count()
                print(f"🔗 链接数量: {link_count}")
                
                # 检查搜索框
                search_count = page.locator('input[type="text"], input[placeholder*="搜索"]').count()
                print(f"🔍 搜索框数量: {search_count}")
                
            except Exception as e:
                print(f"❌ 失败: {e}")
                
            # 等待
            if i < len(test_urls):
                print("\n⏳ 等待 5 秒后继续下一个测试...")
                time.sleep(5)
        
        print("\n" + "="*60)
        print("✅ 所有测试完成！")
        print("="*60)
        print("\n📁 生成的文件:")
        import glob
        for f in sorted(glob.glob('nmpa_test_*')):
            print(f"   {f}")
        
        print("\n💡 请查看截图和 HTML 文件，找出能访问数据的正确方式！")
        
        # 等待用户查看
        input("\n按回车键关闭浏览器...")
        browser.close()


if __name__ == '__main__':
    test_nmpa_website()
