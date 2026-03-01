#!/usr/bin/env python3
"""
NMPA 数据爬虫 - 医疗器械专门版
直接定位到医疗器械分类
"""

import time
from datetime import datetime
from playwright.sync_api import sync_playwright


def find_medical_device_data():
    """查找医疗器械数据"""
    print("="*60)
    print("NMPA 医疗器械数据查找")
    print("="*60)
    
    with sync_playwright() as p:
        # 启动浏览器
        browser = p.chromium.launch(
            headless=False,
            args=['--disable-blink-features=AutomationControlled']
        )
        
        context = browser.new_context(
            viewport={'width': 1920, 'height': 1080},
            user_agent='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            locale='zh-CN'
        )
        
        page = context.new_page()
        page.set_default_timeout(120000)
        
        # 步骤 1：访问数据查询首页
        print("\n📍 步骤 1: 访问数据查询首页")
        page.goto("https://www.nmpa.gov.cn/datasearch/home-index.html", wait_until='domcontentloaded')
        time.sleep(5)
        page.screenshot(path='nmpa_step1_home.png')
        print("   ✅ 截图已保存: nmpa_step1_home.png")
        
        # 步骤 2：查找并点击"医疗器械"标签
        print("\n📍 步骤 2: 查找医疗器械标签")
        
        # 尝试多种选择器
        medical_device_selectors = [
            'text=医疗器械',
            'text=Medical Devices',
            '[class*="medical"]',
            '[class*="device"]',
        ]
        
        found = False
        for selector in medical_device_selectors:
            try:
                element = page.locator(selector).first
                if element.count() > 0 and element.is_visible():
                    print(f"   ✅ 找到医疗器械标签: {selector}")
                    element.click()
                    time.sleep(5)
                    page.screenshot(path='nmpa_step2_medical.png')
                    print("   ✅ 截图已保存: nmpa_step2_medical.png")
                    found = True
                    break
            except:
                continue
                
        if not found:
            print("   ⚠️  未找到医疗器械标签，需要手动操作")
            print("\n" + "="*60)
            print("👉 请手动操作:")
            print("1. 点击页面顶部的 '医疗器械' 标签/菜单")
            print("2. 等待页面加载")
            print("3. 按回车继续")
            print("="*60)
            input()
            
            page.screenshot(path='nmpa_step2_manual.png')
            print("   ✅ 截图已保存: nmpa_step2_manual.png")
        
        # 步骤 3：查找"境内医疗器械（注册）"
        print("\n📍 步骤 3: 查找境内医疗器械注册")
        
        domestic_selectors = [
            'text=境内医疗器械（注册）',
            'text=境内医疗器械',
            'text=国产医疗器械',
        ]
        
        found_domestic = False
        for selector in domestic_selectors:
            try:
                element = page.locator(selector).first
                if element.count() > 0 and element.is_visible():
                    print(f"   ✅ 找到境内医疗器械注册: {selector}")
                    element.click()
                    time.sleep(8)
                    page.screenshot(path='nmpa_step3_domestic.png')
                    print("   ✅ 截图已保存: nmpa_step3_domestic.png")
                    found_domestic = True
                    break
            except:
                continue
                
        if not found_domestic:
            print("   ⚠️  未找到境内医疗器械注册，需要手动操作")
            print("\n" + "="*60)
            print("👉 请手动操作:")
            print("1. 找到并点击 '境内医疗器械（注册）' 或类似链接")
            print("2. 等待数据加载")
            print("3. 按回车继续")
            print("="*60)
            input()
            
            page.screenshot(path='nmpa_step3_manual.png')
            print("   ✅ 截图已保存: nmpa_step3_manual.png")
        
        # 步骤 4：检查是否有数据
        print("\n📍 步骤 4: 检查数据")
        
        table_count = page.locator('table').count()
        print(f"   表格数量: {table_count}")
        
        if table_count > 0:
            print("   ✅ 找到数据表格！")
            page.screenshot(path='nmpa_step4_data.png')
            print("   ✅ 截图已保存: nmpa_step4_data.png")
            
            # 保存 HTML
            with open('nmpa_data_page.html', 'w', encoding='utf-8') as f:
                f.write(page.content())
            print("   ✅ HTML 已保存: nmpa_data_page.html")
        else:
            print("   ⚠️  未找到表格，请检查页面")
        
        print("\n" + "="*60)
        print("✅ 测试完成！请查看截图了解当前页面状态")
        print("="*60)
        
        input("\n按回车键关闭浏览器...")
        browser.close()


if __name__ == '__main__':
    find_medical_device_data()
