#!/usr/bin/env python3
"""
上传瘦身后的 NMPA 数据到 Supabase
分批上传，避免内存溢出
"""

import gzip
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


def truncate_text(text: str, max_length: int = 100) -> str:
    """截断文本到指定长度"""
    if not text:
        return ''
    return text[:max_length] if len(text) > max_length else text


def transform_for_supabase(device: dict) -> dict:
    """转换为 nmpa_registrations 表结构"""
    # 处理日期格式
    publish_date = device.get('publish_date', '')
    if publish_date and len(publish_date) == 10:
        approval_date = publish_date
    else:
        approval_date = None
    
    # 截断超长字段以避免数据库错误
    return {
        'registration_number': truncate_text(device.get('registration_number', ''), 100),
        'product_name': truncate_text(device.get('product_name', ''), 500),
        'product_name_zh': truncate_text(device.get('product_name', ''), 500),
        'manufacturer': truncate_text(device.get('manufacturer_name', ''), 255),
        'manufacturer_zh': truncate_text(device.get('manufacturer_name', ''), 255),
        'manufacturer_address': '',
        'registration_holder': truncate_text(device.get('manufacturer_name', ''), 255),
        'registration_holder_zh': truncate_text(device.get('manufacturer_name', ''), 255),
        'registration_holder_address': '',
        'device_classification': truncate_text(device.get('category_code', ''), 50),
        'approval_date': approval_date,
        'expiration_date': None,
        'product_description': truncate_text(device.get('description', ''), 500),
        'scope_of_application': truncate_text(device.get('specification', ''), 500),
        'source_url': "https://udi.nmpa.gov.cn/",
        'raw_data': device,
    }


def upload_slim_data(
    filepath: str = 'nmpa_500k_slim.json.gz',
    table_name: str = 'nmpa_registrations',
    batch_size: int = 500
):
    """
    分批上传瘦身后的数据
    使用生成器模式避免内存溢出
    """
    print("="*60)
    print("NMPA 瘦身数据上传")
    print("="*60)
    print(f"\n📂 数据文件: {filepath}")
    print(f"📊 批次大小: {batch_size} 条")
    print(f"📤 目标表: {table_name}")
    
    # 获取 Supabase 客户端
    supabase = get_supabase_client()
    print("✅ Supabase 连接成功")
    
    # 统计
    total_uploaded = 0
    failed = 0
    batch = []
    
    # 打开压缩文件并流式处理
    print(f"\n📖 读取数据文件...")
    with gzip.open(filepath, 'rt', encoding='utf-8') as f:
        # 解析 JSON 数组
        data = json.load(f)
        total_records = len(data)
        print(f"✅ 共 {total_records:,} 条记录")
        
        # 分批处理
        print(f"\n📤 开始上传...")
        for i, device in enumerate(data, 1):
            # 转换数据
            transformed = transform_for_supabase(device)
            batch.append(transformed)
            
            # 每 batch_size 条上传一次
            if len(batch) >= batch_size:
                try:
                    result = supabase.table(table_name).insert(batch).execute()
                    total_uploaded += len(batch)
                    print(f"   ✅ 已上传 {total_uploaded:,}/{total_records:,}")
                except Exception as e:
                    failed += len(batch)
                    print(f"   ❌ 批次失败: {e}")
                
                # 清空批次
                batch = []
        
        # 上传剩余数据
        if batch:
            try:
                result = supabase.table(table_name).insert(batch).execute()
                total_uploaded += len(batch)
                print(f"   ✅ 已上传 {total_uploaded:,}/{total_records:,}")
            except Exception as e:
                failed += len(batch)
                print(f"   ❌ 最后批次失败: {e}")
    
    # 显示结果
    print("\n" + "="*60)
    print("📊 上传统计")
    print("="*60)
    print(f"总记录数: {total_records:,}")
    print(f"成功上传: {total_uploaded:,}")
    print(f"失败: {failed:,}")
    print(f"成功率: {(total_uploaded/total_records*100):.1f}%")
    
    return total_uploaded, failed


def main():
    print("="*60)
    print("NMPA 瘦身数据批量上传工具")
    print("="*60)
    print()
    
    # 上传全部 548 万条瘦身数据
    upload_slim_data(
        filepath='nmpa_full_slim.json.gz',
        batch_size=500  # 每批 500 条，避免请求过大
    )
    
    print("\n" + "="*60)
    print("✅ 完成！")
    print("="*60)


if __name__ == '__main__':
    main()
