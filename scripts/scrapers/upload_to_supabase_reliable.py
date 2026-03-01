#!/usr/bin/env python3
"""
EUDAMED 数据批量上传到 Supabase - 可靠版本
使用更小的批次和重试机制，确保数据成功上传
"""

import os
import csv
import glob
import time
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
        'actor_name': row.get('actor_name', ''),
        'actor_type': row.get('category', ''),
        'country': row.get('country_code', ''),
        'actor_id': row.get('srn', ''),
        'registration_status': 'Current' if 'Current' in row.get('version', '') else 'Unknown',
        'raw_data': row,
    }


def upload_to_supabase(supabase, data: list, table_name: str = 'eudamed_registrations'):
    """上传数据到 Supabase - 可靠版本"""
    print(f"\n📤 上传数据到 {table_name}...")
    print(f"   数据量: {len(data)}")
    
    # 转换数据格式
    transformed = [transform_for_supabase(row) for row in data]
    
    # 使用更小的批次
    batch_size = 50  # 减小批次大小
    total_uploaded = 0
    failed = 0
    
    for i in range(0, len(transformed), batch_size):
        batch = transformed[i:i+batch_size]
        
        # 重试机制
        max_retries = 3
        for attempt in range(max_retries):
            try:
                # 使用 insert 而不是 upsert
                result = supabase.table(table_name).insert(batch).execute()
                
                total_uploaded += len(batch)
                print(f"   ✅ 批次 {i//batch_size + 1}: 已插入 {total_uploaded}/{len(transformed)}")
                break
            except Exception as e:
                print(f"   ⚠️  批次 {i//batch_size + 1} 尝试 {attempt + 1} 失败: {e}")
                
                if attempt < max_retries - 1:
                    # 等待后重试
                    wait_time = 2 ** (attempt + 1)
                    print(f"   ⏳ 等待 {wait_time} 秒后重试...")
                    time.sleep(wait_time)
                else:
                    failed += len(batch)
                    print(f"   ❌ 批次 {i//batch_size + 1} 最终失败")
                    break
        
        # 每批之间等待
        if i < len(transformed) - 1:
            print(f"   ⏳ 等待 1 秒...")
            time.sleep(1)
    
    print(f"\n📊 上传完成:")
    print(f"   成功: {total_uploaded}")
    print(f"   失败: {failed}")
    
    return total_uploaded, failed


def main():
    print("="*60)
    print("EUDAMED 数据批量上传到 Supabase - 可靠版本")
    print("="*60)
    
    # 获取 Supabase 客户端
    try:
        supabase = get_supabase_client()
        print("✅ Supabase 连接成功")
    except Exception as e:
        print(f"❌ Supabase 连接失败: {e}")
        return
    
    # 查找最新的数据文件
    csv_files = glob.glob('eudamed_for_supabase_*.csv')
    
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
