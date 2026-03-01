#!/usr/bin/env python3
"""
EUDAMED 数据上传到 Supabase
"""

import os
import csv
import json
from datetime import datetime
from dotenv import load_dotenv

# 加载环境变量
env_path = os.path.join(os.path.dirname(__file__), '..', '..', '.env.local')
load_dotenv(env_path)

from supabase import create_client


def get_supabase_client():
    """获取 Supabase 客户端"""
    url = os.getenv('SUPABASE_URL')
    key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
    
    if not url or not key:
        raise ValueError("❌ 环境变量未设置: SUPABASE_URL 或 SUPABASE_SERVICE_ROLE_KEY")
    
    print(f"✅ Supabase URL: {url}")
    print(f"✅ Service Role Key: {key[:20]}...")
    
    return create_client(url, key)


def load_csv_data(filepath: str) -> list:
    """加载 CSV 数据"""
    data = []
    with open(filepath, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            data.append(row)
    return data


def transform_for_supabase(row: dict) -> dict:
    """转换数据格式以匹配 Supabase 表结构"""
    return {
        'srn': row.get('srn', ''),
        'actor_name': row.get('company_name', ''),
        'actor_type': row.get('category', ''),
        'country': row.get('country_code', ''),
        'actor_id': row.get('srn', ''),
        'registration_status': 'Current' if 'Current' in row.get('version', '') else 'Unknown',
        'raw_data': row,
    }


def upload_to_supabase(supabase, data: list, table_name: str = 'eudamed_registrations'):
    """上传数据到 Supabase"""
    print(f"\n📤 上传数据到 {table_name}...")
    print(f"   数据量: {len(data)}")
    
    # 转换数据格式
    transformed = [transform_for_supabase(row) for row in data]
    
    # 分批上传
    batch_size = 100
    total_uploaded = 0
    failed = 0
    
    for i in range(0, len(transformed), batch_size):
        batch = transformed[i:i+batch_size]
        
        try:
            result = supabase.table(table_name).upsert(batch, on_conflict='srn').execute()
            total_uploaded += len(batch)
            print(f"   ✅ 已上传 {total_uploaded}/{len(transformed)}")
        except Exception as e:
            failed += len(batch)
            print(f"   ❌ 批次 {i//batch_size + 1} 失败: {e}")
    
    print(f"\n📊 上传完成:")
    print(f"   成功: {total_uploaded}")
    print(f"   失败: {failed}")
    
    return total_uploaded, failed


def main():
    print("="*60)
    print("EUDAMED 数据上传到 Supabase")
    print("="*60)
    
    # 获取 Supabase 客户端
    try:
        supabase = get_supabase_client()
        print("✅ Supabase 连接成功")
    except Exception as e:
        print(f"❌ Supabase 连接失败: {e}")
        return
    
    # 查找最新的数据文件
    import glob
    csv_files = glob.glob('eudamed_all_data_*.csv')
    
    if not csv_files:
        print("❌ 未找到数据文件")
        return
    
    # 使用最新的文件
    csv_file = sorted(csv_files)[-1]
    print(f"\n📂 使用数据文件: {csv_file}")
    
    # 加载数据
    data = load_csv_data(csv_file)
    print(f"✅ 加载了 {len(data)} 条数据")
    
    # 上传
    upload_to_supabase(supabase, data)
    
    print("\n" + "="*60)
    print("✅ 上传完成！")
    print("="*60)


if __name__ == '__main__':
    main()
