#!/usr/bin/env python3
"""
EUDAMED 简单爬虫 - 使用直接 API 请求
比浏览器自动化更稳定
"""

import json
import time
import requests
from datetime import datetime
from typing import List, Dict, Optional


class EudamedSimpleScraper:
    """使用 EUDAMED API 直接抓取数据"""
    
    API_BASE = "https://ec.europa.eu/tools/eudamed/api"
    
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json',
            'Accept-Language': 'en-US,en;q=0.9',
        })
        
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
        
        actors = []
        page = 0
        page_size = 25
        
        while len(actors) < max_results:
            try:
                # EUDAMED API 端点
                url = f"{self.API_BASE}/actors"
                
                params = {
                    'page': page,
                    'size': page_size,
                    'sort': 'name,asc',
                }
                
                if country_code:
                    params['countryCode'] = country_code
                
                print(f"  📄 获取第 {page + 1} 页...")
                
                response = self.session.get(url, params=params, timeout=30)
                
                if response.status_code != 200:
                    print(f"  ⚠️  API 错误: {response.status_code}")
                    break
                
                data = response.json()
                
                if not data.get('content') or len(data['content']) == 0:
                    print("  ✅ 没有更多数据")
                    break
                
                for item in data['content']:
                    if len(actors) >= max_results:
                        break
                    
                    actor = {
                        'name': item.get('name', ''),
                        'srn': item.get('srn', ''),
                        'country': item.get('countryCode', ''),
                        'type': item.get('actorType', ''),
                        'address': item.get('address', ''),
                        'city': item.get('city', ''),
                        'postal_code': item.get('postalCode', ''),
                        'scraped_at': datetime.now().isoformat(),
                    }
                    actors.append(actor)
                    print(f"    ✓ {actor['name'][:50]}...")
                
                print(f"  📊 已抓取 {len(actors)} 条")
                
                # 检查是否还有下一页
                if data.get('last', True):
                    break
                
                page += 1
                time.sleep(2)  #  polite delay
                
            except Exception as e:
                print(f"  ❌ 错误: {e}")
                break
        
        return actors
    
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
        
        devices = []
        page = 0
        page_size = 25
        
        while len(devices) < max_results:
            try:
                url = f"{self.API_BASE}/devices"
                
                params = {
                    'page': page,
                    'size': page_size,
                    'sort': 'name,asc',
                }
                
                if risk_class:
                    params['riskClass'] = risk_class
                
                print(f"  📄 获取第 {page + 1} 页...")
                
                response = self.session.get(url, params=params, timeout=30)
                
                if response.status_code != 200:
                    print(f"  ⚠️  API 错误: {response.status_code}")
                    break
                
                data = response.json()
                
                if not data.get('content') or len(data['content']) == 0:
                    print("  ✅ 没有更多数据")
                    break
                
                for item in data['content']:
                    if len(devices) >= max_results:
                        break
                    
                    device = {
                        'name': item.get('name', ''),
                        'udi_di': item.get('udiDi', ''),
                        'risk_class': item.get('riskClass', ''),
                        'manufacturer': item.get('manufacturerName', ''),
                        'model': item.get('model', ''),
                        'scraped_at': datetime.now().isoformat(),
                    }
                    devices.append(device)
                    print(f"    ✓ {device['name'][:50]}...")
                
                print(f"  📊 已抓取 {len(devices)} 条")
                
                if data.get('last', True):
                    break
                
                page += 1
                time.sleep(2)
                
            except Exception as e:
                print(f"  ❌ 错误: {e}")
                break
        
        return devices
    
    def save_to_json(self, data: List[Dict], filename: str):
        """保存数据到 JSON 文件"""
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
                print("⚠️  Supabase 环境变量未设置，跳过数据库保存")
                return False
            
            supabase = create_client(supabase_url, supabase_key)
            
            # 批量插入
            batch_size = 100
            for i in range(0, len(data), batch_size):
                batch = data[i:i+batch_size]
                result = supabase.table(table_name).upsert(batch).execute()
                print(f"  ✓ 已保存 {len(batch)} 条到 {table_name}")
                time.sleep(0.5)
            
            print(f"✅ 所有数据已保存到 Supabase")
            return True
            
        except Exception as e:
            print(f"❌ 保存到 Supabase 失败: {e}")
            return False


def main():
    """主函数"""
    print("=" * 60)
    print("EUDAMED 简单爬虫（API 版本）")
    print("=" * 60)
    
    scraper = EudamedSimpleScraper()
    
    # 抓取德国制造商
    print("\n🇩🇪 抓取德国制造商...")
    german_actors = scraper.search_actors(country_code='DE', max_results=100)
    scraper.save_to_json(german_actors, 'eudamed_german_actors.json')
    scraper.save_to_supabase(german_actors, 'eudamed_actors')
    
    # 抓取 III 类器械
    print("\n🔬 抓取 III 类高风险器械...")
    class3_devices = scraper.search_devices(risk_class='III', max_results=100)
    scraper.save_to_json(class3_devices, 'eudamed_class3_devices.json')
    scraper.save_to_supabase(class3_devices, 'eudamed_devices')
    
    print("\n" + "=" * 60)
    print(f"✅ 完成！共抓取 {len(german_actors)} 个制造商 + {len(class3_devices)} 个器械")
    print("=" * 60)


if __name__ == '__main__':
    main()
