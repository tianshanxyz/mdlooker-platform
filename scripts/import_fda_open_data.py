#!/usr/bin/env python3
"""
导入 FDA 开放数据
从 FDA 的开放数据集直接下载并导入
"""

import json
import requests
from datetime import datetime
from typing import List, Dict
import os

# 尝试导入 supabase
from supabase import create_client

# FDA API 端点
FDA_API_BASE = "https://api.fda.gov/device"

# Supabase 配置（从项目环境变量获取）
SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL', 'https://tiosujipxpvivdjwtfa.supabase.co')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY', '')


def fetch_fda_510k(limit: int = 1000) -> List[Dict]:
    """获取 FDA 510k 数据"""
    print(f"🔍 获取 FDA 510k 数据 (limit={limit})...")
    
    url = f"{FDA_API_BASE}/510k.json?limit={limit}"
    
    try:
        response = requests.get(url, timeout=60)
        response.raise_for_status()
        data = response.json()
        
        results = []
        for item in data.get('results', []):
            results.append({
                'k_number': item.get('k_number', ''),
                'device_name': item.get('device_name', ''),
                'applicant': item.get('applicant', ''),
                'decision_code': item.get('decision_code', ''),
                'decision_date': item.get('decision_date', ''),
                'product_code': item.get('product_code', ''),
                'device_class': item.get('device_class', ''),
                'summary': item.get('summary', ''),
                'source_type': '510k',
                'scraped_at': datetime.now().isoformat(),
            })
        
        print(f"✅ 获取到 {len(results)} 条 510k 数据")
        return results
        
    except Exception as e:
        print(f"❌ 获取 510k 数据失败: {e}")
        return []


def fetch_fda_pma(limit: int = 1000) -> List[Dict]:
    """获取 FDA PMA 数据"""
    print(f"🔍 获取 FDA PMA 数据 (limit={limit})...")
    
    url = f"{FDA_API_BASE}/pma.json?limit={limit}"
    
    try:
        response = requests.get(url, timeout=60)
        response.raise_for_status()
        data = response.json()
        
        results = []
        for item in data.get('results', []):
            results.append({
                'pma_number': item.get('pma_number', ''),
                'device_name': item.get('device_name', ''),
                'applicant': item.get('applicant', ''),
                'approval_order_date': item.get('approval_order_date', ''),
                'product_code': item.get('product_code', ''),
                'device_class': item.get('device_class', ''),
                'summary': item.get('summary', ''),
                'source_type': 'pma',
                'scraped_at': datetime.now().isoformat(),
            })
        
        print(f"✅ 获取到 {len(results)} 条 PMA 数据")
        return results
        
    except Exception as e:
        print(f"❌ 获取 PMA 数据失败: {e}")
        return []


def fetch_fda_registration(limit: int = 1000) -> List[Dict]:
    """获取 FDA 注册企业数据"""
    print(f"🔍 获取 FDA 注册企业数据 (limit={limit})...")
    
    url = f"{FDA_API_BASE}/registrationlisting.json?limit={limit}"
    
    try:
        response = requests.get(url, timeout=60)
        response.raise_for_status()
        data = response.json()
        
        results = []
        for item in data.get('results', []):
            # 提取公司信息
            owner = item.get('owner_operator', {})
            products = item.get('products', [])
            
            for product in products:
                results.append({
                    'registration_number': item.get('registration_number', ''),
                    'fei_number': item.get('fei_number', ''),
                    'owner_operator_number': owner.get('owner_operator_number', ''),
                    'registration_status': item.get('registration_status', ''),
                    'registration_date': item.get('registration_initial_date', ''),
                    'product_code': product.get('product_code', ''),
                    'device_class': product.get('device_class', ''),
                    'device_name': product.get('device_name', ''),
                    'device_description': product.get('device_description', ''),
                    'regulation_number': product.get('regulation_number', ''),
                    'establishment_type': item.get('establishment_type', ''),
                    'address': item.get('address', ''),
                    'city': item.get('city', ''),
                    'state': item.get('state', ''),
                    'zip': item.get('zip_code', ''),
                    'country': item.get('country_code', 'USA'),
                    'source_type': 'registration',
                    'scraped_at': datetime.now().isoformat(),
                })
        
        print(f"✅ 获取到 {len(results)} 条注册数据")
        return results
        
    except Exception as e:
        print(f"❌ 获取注册数据失败: {e}")
        return []


def save_to_supabase(data: List[Dict], table_name: str):
    """保存数据到 Supabase"""
    if not SUPABASE_KEY:
        print(f"⚠️  未设置 SUPABASE_SERVICE_ROLE_KEY，跳过保存到 {table_name}")
        # 保存到本地 JSON
        filename = f"{table_name}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"💾 数据已保存到本地文件: {filename}")
        return False
    
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        
        # 批量插入
        batch_size = 100
        for i in range(0, len(data), batch_size):
            batch = data[i:i+batch_size]
            result = supabase.table(table_name).upsert(batch).execute()
            print(f"  ✓ 已保存 {len(batch)} 条到 {table_name}")
        
        print(f"✅ 所有数据已保存到 Supabase: {table_name}")
        return True
        
    except Exception as e:
        print(f"❌ 保存到 Supabase 失败: {e}")
        # 保存到本地 JSON
        filename = f"{table_name}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"💾 数据已保存到本地文件: {filename}")
        return False


def main():
    """主函数"""
    print("=" * 60)
    print("FDA 开放数据导入工具")
    print("=" * 60)
    
    # 获取 510k 数据
    print("\n📋 步骤 1: 获取 510k 数据")
    fda_510k = fetch_fda_510k(limit=1000)
    if fda_510k:
        save_to_supabase(fda_510k, 'fda_510k')
    
    # 获取 PMA 数据
    print("\n📋 步骤 2: 获取 PMA 数据")
    fda_pma = fetch_fda_pma(limit=1000)
    if fda_pma:
        save_to_supabase(fda_pma, 'fda_pma')
    
    # 获取注册数据
    print("\n📋 步骤 3: 获取注册数据")
    fda_reg = fetch_fda_registration(limit=1000)
    if fda_reg:
        save_to_supabase(fda_reg, 'fda_registrations')
    
    # 统计
    print("\n" + "=" * 60)
    print("📊 导入统计")
    print("=" * 60)
    print(f"510k 数据: {len(fda_510k)} 条")
    print(f"PMA 数据: {len(fda_pma)} 条")
    print(f"注册数据: {len(fda_reg)} 条")
    print(f"总计: {len(fda_510k) + len(fda_pma) + len(fda_reg)} 条")
    print("=" * 60)


if __name__ == '__main__':
    main()
