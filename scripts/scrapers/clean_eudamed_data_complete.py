#!/usr/bin/env python3
"""
EUDAMED 数据清洗脚本 - 完整版
汇总所有爬取的数据，清洗去重后输出 CSV 格式
"""

import json
import csv
import os
import glob
from datetime import datetime
from typing import List, Dict, Set
from collections import defaultdict


def find_all_data_files(directory: str = '.') -> List[str]:
    """查找所有数据文件"""
    patterns = [
        'eudamed_data_*.json',
        'eudamed_*_actors*.json',
        'eudamed_*_devices*.json',
    ]
    
    all_files = []
    for pattern in patterns:
        files = glob.glob(os.path.join(directory, pattern))
        all_files.extend(files)
    
    # 排除备份文件（因为它们是累积的，只需要最新的）
    backup_files = glob.glob(os.path.join(directory, 'eudamed_data_backup_page_*.json'))
    if backup_files:
        # 只保留最大的备份文件
        backup_files.sort(key=lambda x: int(x.split('_page_')[-1].replace('.json', '')))
        all_files.append(backup_files[-1])
    
    # 去重
    all_files = list(set(all_files))
    all_files.sort()
    
    return all_files


def load_json_file(filepath: str) -> List[Dict]:
    """加载 JSON 文件"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        if isinstance(data, list):
            return data
        elif isinstance(data, dict):
            return [data]
        else:
            return []
    except Exception as e:
        print(f"⚠️  加载文件失败 {filepath}: {e}")
        return []


def detect_category(filepath: str) -> str:
    """根据文件名检测数据类别"""
    filename = os.path.basename(filepath).lower()
    
    if 'importer' in filename:
        return 'importers'
    elif 'manufacturer' in filename:
        return 'manufacturers'
    elif 'device' in filename:
        return 'devices'
    elif 'actor' in filename:
        return 'actors'
    else:
        return 'unknown'


def clean_item(item: Dict, category: str = 'unknown') -> Dict:
    """清理单条数据"""
    cleaned = {}
    
    # 标准化字段名
    field_mapping = {
        'name': ['name', 'company_name', 'actor_name', 'manufacturer_name'],
        'country': ['country', 'country_code', 'nation'],
        'srn': ['srn', 'actor_id', 'registration_number'],
        'type': ['type', 'actor_type', 'category'],
        'details': ['details', 'description', 'address'],
        'scraped_at': ['scraped_at', 'created_at', 'timestamp'],
    }
    
    for standard_field, possible_fields in field_mapping.items():
        for field in possible_fields:
            if field in item and item[field]:
                value = item[field]
                if isinstance(value, str):
                    value = value.strip()
                if value:
                    cleaned[standard_field] = value
                    break
    
    # 添加类别
    cleaned['category'] = category
    
    # 添加来源文件时间戳（如果没有）
    if 'scraped_at' not in cleaned:
        cleaned['scraped_at'] = datetime.now().isoformat()
    
    return cleaned


def remove_duplicates(data: List[Dict]) -> List[Dict]:
    """去除重复数据"""
    print(f"\n🔍 开始去重...")
    print(f"   原始数据量: {len(data)}")
    
    # 使用 name + country + srn 作为唯一标识
    seen: Set[str] = set()
    unique_data = []
    duplicates = 0
    
    for item in data:
        # 创建唯一键
        key_parts = [
            str(item.get('name', '')).strip().lower(),
            str(item.get('country', '')).strip().lower(),
            str(item.get('srn', '')).strip().lower(),
        ]
        key = '|'.join(key_parts)
        
        if key not in seen and key != '||':  # 跳过空键
            seen.add(key)
            unique_data.append(item)
        else:
            duplicates += 1
    
    print(f"✅ 去重完成")
    print(f"   唯一数据: {len(unique_data)} 条")
    print(f"   重复数据: {duplicates} 条")
    print(f"   去重率: {duplicates / len(data) * 100:.1f}%")
    
    return unique_data


def categorize_data(data: List[Dict]) -> Dict[str, List[Dict]]:
    """按类别分组数据"""
    categories = defaultdict(list)
    
    for item in data:
        category = item.get('category', 'unknown')
        categories[category].append(item)
    
    return dict(categories)


def save_to_csv(data: List[Dict], filepath: str):
    """保存为 CSV 文件"""
    if not data:
        print(f"⚠️  没有数据可保存到 {filepath}")
        return
    
    # 确定所有字段
    all_fields = set()
    for item in data:
        all_fields.update(item.keys())
    
    # 标准字段顺序
    standard_fields = ['name', 'country', 'srn', 'type', 'category', 'details', 'scraped_at']
    other_fields = sorted(all_fields - set(standard_fields))
    fields = [f for f in standard_fields if f in all_fields] + other_fields
    
    # 写入 CSV
    with open(filepath, 'w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=fields, extrasaction='ignore')
        writer.writeheader()
        writer.writerows(data)
    
    print(f"💾 已保存 CSV: {filepath} ({len(data)} 条)")


def save_to_json(data: List[Dict], filepath: str):
    """保存为 JSON 文件"""
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f"💾 已保存 JSON: {filepath} ({len(data)} 条)")


def process_all_data(directory: str = '.'):
    """处理所有数据"""
    print("="*60)
    print("EUDAMED 数据清洗 - 完整版")
    print("="*60)
    
    # 查找所有数据文件
    print("\n📂 查找数据文件...")
    files = find_all_data_files(directory)
    
    if not files:
        print("❌ 未找到数据文件")
        return
    
    print(f"找到 {len(files)} 个数据文件:")
    for f in files:
        print(f"   - {os.path.basename(f)}")
    
    # 加载所有数据
    print("\n📥 加载数据...")
    all_data = []
    file_stats = {}
    
    for filepath in files:
        category = detect_category(filepath)
        data = load_json_file(filepath)
        
        # 清理数据
        cleaned_data = [clean_item(item, category) for item in data]
        all_data.extend(cleaned_data)
        
        file_stats[os.path.basename(filepath)] = {
            'count': len(data),
            'category': category,
        }
        print(f"   ✓ {os.path.basename(filepath)}: {len(data)} 条 ({category})")
    
    print(f"\n📊 总数据量: {len(all_data)} 条")
    
    # 去重
    unique_data = remove_duplicates(all_data)
    
    # 按类别分组
    print("\n📊 按类别分组...")
    categorized = categorize_data(unique_data)
    
    for category, items in categorized.items():
        print(f"   {category}: {len(items)} 条")
    
    # 生成输出文件名
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    
    # 保存汇总文件
    print("\n💾 保存数据...")
    
    # 保存汇总 CSV
    save_to_csv(unique_data, f'eudamed_all_data_{timestamp}.csv')
    
    # 保存汇总 JSON
    save_to_json(unique_data, f'eudamed_all_data_{timestamp}.json')
    
    # 按类别保存
    for category, items in categorized.items():
        if category != 'unknown' and items:
            save_to_csv(items, f'eudamed_{category}_{timestamp}.csv')
            save_to_json(items, f'eudamed_{category}_{timestamp}.json')
    
    # 打印统计
    print("\n" + "="*60)
    print("📊 清洗统计")
    print("="*60)
    print(f"原始数据: {len(all_data)} 条")
    print(f"去重后: {len(unique_data)} 条")
    print(f"删除重复: {len(all_data) - len(unique_data)} 条")
    print(f"保留率: {len(unique_data) / len(all_data) * 100:.1f}%")
    print()
    print("按类别统计:")
    for category, items in categorized.items():
        print(f"  {category}: {len(items)} 条")
    print("="*60)
    
    # 打印输出文件列表
    print("\n📁 输出文件:")
    output_files = glob.glob(f'eudamed_*_{timestamp}.*')
    for f in sorted(output_files):
        size = os.path.getsize(f) / 1024  # KB
        print(f"   {f} ({size:.1f} KB)")
    
    return unique_data


if __name__ == '__main__':
    import sys
    
    if len(sys.argv) > 1:
        directory = sys.argv[1]
    else:
        directory = '.'
    
    process_all_data(directory)
