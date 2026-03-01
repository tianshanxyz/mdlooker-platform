#!/usr/bin/env python3
"""
NMPA 数据爬虫 - API 版本
直接调用 NMPA 的数据接口获取数据
"""

import json
import time
import random
import os
import requests
from datetime import datetime
from typing import List, Dict, Optional
from urllib.parse import urlencode
from dotenv import load_dotenv

# 加载环境变量
env_path = os.path.join(os.path.dirname(__file__), '..', '..', '.env.local')
load_dotenv(env_path)


class NMPAAPIScraper:
    """NMPA API 数据爬虫"""
    
    # NMPA 数据接口
    API_BASE = "https://www.nmpa.gov.cn/datasearch"
    
    # 国产器械 API
    DOMESTIC_API = "https://www.nmpa.gov.cn/datasearch/search-result.html"
    
    # 进口器械 API
    IMPORT_API = "https://www.nmpa.gov.cn/datasearch/search-result.html"
    
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
        })
        
        self.results = []
        self.stats = {
            'total': 0,
            'successful': 0,
            'failed': 0,
        }
        
    def test_connection(self) -> bool:
        """测试连接"""
        print("🔍 测试 NMPA 网站连接...")
        
        try:
            response = self.session.get(
                "https://www.nmpa.gov.cn/",
                timeout=30,
                verify=True
            )
            
            print(f"   状态码: {response.status_code}")
            print(f"   响应时间: {response.elapsed.total_seconds():.2f}s")
            
            return response.status_code == 200
            
        except Exception as e:
            print(f"   ❌ 连接失败: {e}")
            return False
            
    def search_devices(
        self,
        category: str = 'domestic',
        keyword: str = '',
        page: int = 1,
        page_size: int = 20
    ) -> Dict:
        """搜索器械数据"""
        
        # 构建参数
        if category == 'domestic':
            nmpa_param = "aWQ9MTE3NTDmlbDmja7kuIrmtbflkIjkvZzogIXnvZHnqbrplIDllK7lj5bor4HmoYg="
        else:
            nmpa_param = "aWQ9MTE3NTDmlbDmja7kuIrmtbflkIjkvZzogIXnvZHnqbrmkqXlsYXmoYg="
            
        url = f"{self.API_BASE}/search-result.html?nmpa={nmpa_param}"
        
        print(f"\n🔍 搜索 {category} 器械...")
        print(f"   URL: {url}")
        
        try:
            response = self.session.get(url, timeout=60)
            
            print(f"   状态码: {response.status_code}")
            
            if response.status_code == 200:
                # 保存 HTML 用于分析
                with open(f'nmpa_response_{category}.html', 'w', encoding='utf-8') as f:
                    f.write(response.text)
                print(f"   ✅ 响应已保存: nmpa_response_{category}.html")
                
                return {
                    'success': True,
                    'html': response.text,
                    'url': url,
                }
            else:
                return {
                    'success': False,
                    'error': f"HTTP {response.status_code}",
                }
                
        except Exception as e:
            print(f"   ❌ 请求失败: {e}")
            return {
                'success': False,
                'error': str(e),
            }
            
    def parse_html(self, html: str) -> List[Dict]:
        """解析 HTML 提取数据"""
        from bs4 import BeautifulSoup
        
        soup = BeautifulSoup(html, 'html.parser')
        data = []
        
        # 查找表格
        tables = soup.find_all('table')
        print(f"\n   找到 {len(tables)} 个表格")
        
        for table in tables:
            rows = table.find_all('tr')
            print(f"   表格有 {len(rows)} 行")
            
            for row in rows[1:]:  # 跳过表头
                cells = row.find_all(['td', 'th'])
                if cells:
                    item = {
                        'registration_number': cells[0].get_text(strip=True) if len(cells) > 0 else '',
                        'product_name': cells[1].get_text(strip=True) if len(cells) > 1 else '',
                        'company_name': cells[2].get_text(strip=True) if len(cells) > 2 else '',
                        'approval_date': cells[3].get_text(strip=True) if len(cells) > 3 else '',
                        'expiry_date': cells[4].get_text(strip=True) if len(cells) > 4 else '',
                        'scraped_at': datetime.now().isoformat(),
                    }
                    data.append(item)
                    
        return data
        
    def scrape_with_browser(self, category: str = 'domestic') -> List[Dict]:
        """使用浏览器抓取（作为备选方案）"""
        from playwright.sync_api import sync_playwright
        
        print(f"\n🌐 使用浏览器抓取 {category} 器械...")
        
        data = []
        
        try:
            with sync_playwright() as p:
                browser = p.chromium.launch(headless=False)
                page = browser.new_page()
                
                # 设置超时
                page.set_default_timeout(120000)  # 2 分钟
                
                # 构建URL
                if category == 'domestic':
                    url = "https://www.nmpa.gov.cn/datasearch/search-result.html?nmpa=aWQ9MTE3NTDmlbDmja7kuIrmtbflkIjkvZzogIXnvZHnqbrplIDllK7lj5bor4HmoYg="
                else:
                    url = "https://www.nmpa.gov.cn/datasearch/search-result.html?nmpa=aWQ9MTE3NTDmlbDmja7kuIrmtbflkIjkvZzogIXnvZHnqbrmkqXlsYXmoYg="
                    
                print(f"   访问: {url}")
                
                # 访问页面
                page.goto(url, wait_until='domcontentloaded')
                
                # 等待页面加载
                print("   等待页面加载...")
                time.sleep(10)
                
                # 截图
                screenshot_path = f'nmpa_browser_{category}_{datetime.now().strftime("%Y%m%d_%H%M%S")}.png'
                page.screenshot(path=screenshot_path)
                print(f"   截图: {screenshot_path}")
                
                # 获取页面内容
                html = page.content()
                
                # 保存 HTML
                with open(f'nmpa_browser_{category}.html', 'w', encoding='utf-8') as f:
                    f.write(html)
                print(f"   HTML 已保存: nmpa_browser_{category}.html")
                
                # 解析数据
                data = self.parse_html(html)
                
                browser.close()
                
        except Exception as e:
            print(f"   ❌ 浏览器抓取失败: {e}")
            
        return data
        
    def save_to_json(self, data: List[Dict], filename: str):
        """保存到 JSON"""
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"💾 已保存: {filename} ({len(data)} 条)")


def main():
    print("="*60)
    print("NMPA 数据爬虫 - API 版本")
    print("="*60)
    
    scraper = NMPAAPIScraper()
    
    # 测试连接
    if not scraper.test_connection():
        print("\n❌ 无法连接到 NMPA 网站")
        print("请检查网络连接或使用 VPN")
        return
        
    print("\n✅ 连接成功")
    
    # 尝试 API 方式
    print("\n" + "="*60)
    print("方法 1: API 请求")
    print("="*60)
    
    result = scraper.search_devices('domestic')
    
    if result['success']:
        data = scraper.parse_html(result['html'])
        print(f"\n✅ 提取了 {len(data)} 条数据")
        
        if data:
            scraper.save_to_json(data, 'nmpa_domestic_devices.json')
        else:
            print("\n⚠️  API 方式未提取到数据，尝试浏览器方式...")
            
            # 使用浏览器方式
            print("\n" + "="*60)
            print("方法 2: 浏览器抓取")
            print("="*60)
            
            data = scraper.scrape_with_browser('domestic')
            scraper.save_to_json(data, 'nmpa_domestic_devices.json')
    else:
        print(f"\n❌ API 请求失败: {result.get('error')}")
        print("\n尝试浏览器方式...")
        
        data = scraper.scrape_with_browser('domestic')
        scraper.save_to_json(data, 'nmpa_domestic_devices.json')
        
    print("\n" + "="*60)
    print("✅ 完成！")
    print("="*60)


if __name__ == '__main__':
    main()
