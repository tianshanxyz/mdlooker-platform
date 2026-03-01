#!/usr/bin/env python3
"""
数据清洗脚本
去除 EUDAMED 数据中的重复项
"""

import json
from datetime import datetime
from typing import List, Dict
import os


def load_json_file(filepath: str) -> List[Dict]:
    """加载 JSON 文件"""
    print(f"📂 加载文件: {filepath}")
    
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    print(f"✅ 加载了 {len(data)} 条数据")
    return data


def remove_duplicates(data: List[Dict], key_fields: List[str] = None) -> List[Dict]:
    """去除重复数据"""
    print(f"\n🔍 开始去重...")
    print(f"   原始数据量: {len(data)}")
    
    if key_fields is None:
        # 默认使用 name + details + country 作为唯一标识
        key_fields = ['name', 'details', 'country']
    
    seen = set()
    unique_data = []
    duplicates_count = 0
    
    for item in data:
        # 创建唯一键
        key_parts = []
        for field in key_fields:
            value = item.get(field, '')
            if value:
                key_parts.append(str(value).strip().lower())
        
        key = '|'.join(key_parts)
        
        if key not in seen:
            seen.add(key)
            unique_data.append(item)
        else:
            duplicates_count += 1
    
    print(f"✅ 去重完成")
    print(f"   唯一数据: {len(unique_data)} 条")
    print(f"   重复数据: {duplicates_count} 条")
    print(f"   去重率: {duplicates_count / len(data) * 100:.1f}%")
    
    return unique_data


def clean_data(data: List[Dict]) -> List[Dict]:
    """清理数据"""
    print(f"\n🧹 开始清理数据...")
    
    cleaned_data = []
    
    for item in data:
        # 创建清理后的数据项
        cleaned_item = {}
        
        for key, value in item.items():
            # 跳过空值
            if value is None or value == '':
                continue
            
            # 清理字符串
            if isinstance(value, str):
                value = value.strip()
                # 跳过清理后的空字符串
                if not value:
                    continue
            
            cleaned_item[key] = value
        
        # 确保至少有 name 字段
        if cleaned_item.get('name'):
            cleaned_data.append(cleaned_item)
    
    print(f"✅ 清理完成: {len(cleaned_data)} 条有效数据")
    
    return cleaned_data


def save_json_file(data: List[Dict], filepath: str):
    """保存 JSON 文件"""
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f"💾 已保存: {filepath}")


def process_eudamed_data(input_file: str, output_file: str = None):
    """处理 EUDAMED 数据"""
    print("="*60)
    print("EUDAMED 数据清洗")
    print("="*60)
    
    # 加载数据
    data = load_json_file(input_file)
    
    # 清理数据
    cleaned_data = clean_data(data)
    
    # 去重
    unique_data = remove_duplicates(cleaned_data)
    
    # 生成输出文件名
    if output_file is None:
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        output_file = f'eudamed_data_cleaned_{timestamp}.json'
    
    # 保存
    save_json_file(unique_data, output_file)
    
    # 统计
    print("\n" + "="*60)
    print("📊 清洗统计")
    print("="*60)
    print(f"原始数据: {len(data)} 条")
    print(f"清理后: {len(cleaned_data)} 条")
    print(f"去重后: {len(unique_data)} 条")
    print(f"删除数据: {len(data) - len(unique_data)} 条")
    print(f"保留率: {len(unique_data) / len(data) * 100:.1f}%")
    print("="*60)
    
    return unique_data


def process_all_backup_files():
    """处理所有备份文件"""
    import glob
    
    print("="*60)
    print("批量处理所有备份文件")
    print("="*60)
    
    # 查找所有备份文件
    backup_files = glob.glob('eudamed_data_backup_page_*.json')
    backup_files.sort()
    
    if not backup_files:
        print("❌ 未找到备份文件")
        return
    
    print(f"找到 {len(backup_files)} 个备份文件")
    
    # 找到最新的备份文件
    latest_file = backup_files[-1]
    print(f"使用最新的备份文件: {latest_file}")
    
    # 处理
    process_eudamed_data(latest_file)


if __name__ == '__main__':
    import sys
    
    if len(sys.argv) > 1:
        # 处理指定的文件
        input_file = sys.argv[1]
        output_file = sys.argv[2] if len(sys.argv) > 2 else None
        process_eudamed_data(input_file, output_file)
    else:
        # 处理最新的备份文件
        process_all_backup_files()
