#!/usr/bin/env python3
"""
调整 CSV 字段名以匹配 Supabase 表结构
"""

import csv
import glob
from datetime import datetime


def adjust_csv_for_supabase(input_file: str, output_file: str):
    """调整 CSV 字段名"""
    
    # 字段映射：原字段名 -> Supabase 表字段名
    field_mapping = {
        'srn': 'srn',
        'company_name': 'actor_name',
        'category': 'actor_type',
        'country_code': 'country',
        'version': 'registration_status',
        'additional_info': 'actor_address',
        'scraped_at': 'created_at',
    }
    
    with open(input_file, 'r', encoding='utf-8') as f_in:
        reader = csv.DictReader(f_in)
        rows = list(reader)
        
        # 获取原字段名
        original_fields = reader.fieldnames
        
        # 创建新字段名
        new_fields = [field_mapping.get(f, f) for f in original_fields]
        
        # 写入新 CSV
        with open(output_file, 'w', encoding='utf-8', newline='') as f_out:
            writer = csv.DictWriter(f_out, fieldnames=new_fields)
            writer.writeheader()
            
            for row in rows:
                new_row = {}
                for old_key, value in row.items():
                    new_key = field_mapping.get(old_key, old_key)
                    new_row[new_key] = value
                writer.writerow(new_row)
    
    print(f"✅ 已调整字段名")
    print(f"   输入: {input_file}")
    print(f"   输出: {output_file}")
    print(f"   数据量: {len(rows)}")
    print(f"\n字段映射:")
    for old, new in field_mapping.items():
        print(f"   {old} -> {new}")


def main():
    print("="*60)
    print("调整 CSV 字段名以匹配 Supabase 表结构")
    print("="*60)
    
    # 查找最新的数据文件
    csv_files = glob.glob('eudamed_all_data_*.csv')
    
    if not csv_files:
        print("❌ 未找到数据文件")
        return
    
    # 使用最新的文件
    input_file = sorted(csv_files)[-1]
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    output_file = f'eudamed_for_supabase_{timestamp}.csv'
    
    adjust_csv_for_supabase(input_file, output_file)
    
    print("\n" + "="*60)
    print("✅ 完成！")
    print(f"📁 输出文件: {output_file}")
    print("="*60)


if __name__ == '__main__':
    main()
