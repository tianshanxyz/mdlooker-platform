#!/usr/bin/env python3
"""
上传 NMPA 数据到 Supabase
"""

import json
import os
from datetime import datetime
from dotenv import load_dotenv

# 加载环境变量
env_path = os.path.join(os.path.dirname(__file__), '..', '.env.local')
load_dotenv(env_path)

from supabase import create_client


def get_supabase_client():
    """获取 Supabase 客户端"""
    url = os.getenv('SUPABASE_URL')
    key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
    
    if not url or not key:
        raise ValueError("环境变量未设置: SUPABASE_URL 或 SUPABASE_SERVICE_ROLE_KEY")
    
    return create_client(url, key)


def transform_for_nmpa_table(device: dict) -> dict:
    """转换为 nmpa_registrations 表结构"""
    # 处理日期格式
    publish_date = device.get('publish_date', '')
    # 如果日期为空或格式不正确，设为 None
    if not publish_date or publish_date == '':
        approval_date = None
    else:
        # 尝试解析日期格式
        try:
            # NMPA 日期格式通常是 YYYYMMDD 或 YYYY-MM-DD
            if len(publish_date) == 8 and publish_date.isdigit():
                approval_date = f"{publish_date[:4]}-{publish_date[4:6]}-{publish_date[6:]}"
            else:
                approval_date = publish_date
        except:
            approval_date = None
    
    return {
        'registration_number': device.get('registration_number', ''),
        'product_name': device.get('product_name', ''),
        'product_name_zh': device.get('product_name', ''),
        'manufacturer': device.get('manufacturer_name', ''),
        'manufacturer_zh': device.get('manufacturer_name', ''),
        'manufacturer_address': '',
        'registration_holder': device.get('manufacturer_name', ''),
        'registration_holder_zh': device.get('manufacturer_name', ''),
        'registration_holder_address': '',
        'device_classification': device.get('product_type', ''),
        'approval_date': approval_date,
        'expiration_date': None,
        'product_description': device.get('description', ''),
        'scope_of_application': device.get('specification', ''),
        'source_url': 'https://udi.nmpa.gov.cn/',
        'raw_data': device,
    }


def upload_to_supabase(data: list, table_name: str = 'nmpa_registrations'):
    """上传数据到 Supabase"""
    print(f"\n📤 上传数据到 {table_name}...")
    print(f"   数据量: {len(data)}")
    
    supabase = get_supabase_client()
    
    # 转换数据格式
    transformed_data = [transform_for_nmpa_table(d) for d in data]
    
    # 分批上传
    batch_size = 100
    total_uploaded = 0
    failed = 0
    
    for i in range(0, len(transformed_data), batch_size):
        batch = transformed_data[i:i+batch_size]
        
        try:
            result = supabase.table(table_name).insert(batch).execute()
            total_uploaded += len(batch)
            print(f"   ✅ 已上传 {total_uploaded}/{len(transformed_data)}")
        except Exception as e:
            failed += len(batch)
            print(f"   ❌ 批次 {i//batch_size + 1} 失败: {e}")
    
    print(f"\n📊 上传完成:")
    print(f"   成功: {total_uploaded}")
    print(f"   失败: {failed}")
    
    return total_uploaded, failed


def main():
    print("="*60)
    print("NMPA 数据上传到 Supabase")
    print("="*60)
    
    # 查找最新的数据文件
    import glob
    json_files = glob.glob('nmpa_data_*_records.json')
    
    if not json_files:
        print("❌ 未找到数据文件")
        return
    
    # 使用最新的文件
    data_file = sorted(json_files)[-1]
    print(f"\n📂 使用数据文件: {data_file}")
    
    # 加载数据
    with open(data_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    print(f"✅ 加载了 {len(data)} 条数据")
    
    # 上传
    upload_to_supabase(data)
    
    print("\n" + "="*60)
    print("✅ 上传完成！")
    print("="*60)


if __name__ == '__main__':
    main()
