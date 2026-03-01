#!/usr/bin/env python3
"""
EUDAMED 数据清洗脚本 - 最终版
正确处理分类，汇总所有数据
"""

import json
import csv
import os
from datetime import datetime
from typing import List, Dict, Set
from collections import defaultdict, Counter


def load_json_file(filepath: str) -> List[Dict]:
    """加载 JSON 文件"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
        return data if isinstance(data, list) else [data]
    except Exception as e:
        print(f"⚠️  加载失败 {filepath}: {e}")
        return []


def normalize_item(item: Dict) -> Dict:
    """标准化数据项 - 修正字段映射"""
    normalized = {}
    
    # EUDAMED 数据的实际字段映射
    # name -> SRN (Actor ID)
    # details -> Version
    # country -> Category (Manufacturer, Importer, etc.)
    # srn -> Company Name
    # type -> Additional Info
    
    srn = item.get('name', '').strip()
    category = item.get('country', '').strip()
    company_name = item.get('srn', '').strip()
    
    normalized['srn'] = srn
    normalized['category'] = category
    normalized['company_name'] = company_name
    normalized['version'] = item.get('details', '').strip()
    normalized['additional_info'] = item.get('type', '').strip()
    normalized['scraped_at'] = item.get('scraped_at', datetime.now().isoformat())
    
    # 从公司名称中提取国家代码
    if company_name and '[' in company_name and ']' in company_name:
        start = company_name.rfind('[')
        end = company_name.rfind(']')
        normalized['country_code'] = company_name[start+1:end]
    else:
        normalized['country_code'] = ''
    
    return normalized


def remove_duplicates(data: List[Dict]) -> List[Dict]:
    """去重"""
    print(f"\n🔍 去重...")
    print(f"   原始数据量: {len(data)}")
    
    seen: Set[str] = set()
    unique_data = []
    
    for item in data:
        # 使用 SRN 作为唯一标识
        key = item.get('srn', '').strip().lower()
        
        if key and key not in seen:
            seen.add(key)
            unique_data.append(item)
    
    print(f"✅ 去重完成")
    print(f"   唯一数据: {len(unique_data)} 条")
    print(f"   重复数据: {len(data) - len(unique_data)} 条")
    
    return unique_data


def save_to_csv(data: List[Dict], filepath: str):
    """保存为 CSV"""
    if not data:
        return
    
    fields = ['srn', 'company_name', 'category', 'country_code', 'version', 'additional_info', 'scraped_at']
    
    with open(filepath, 'w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=fields, extrasaction='ignore')
        writer.writeheader()
        writer.writerows(data)
    
    print(f"💾 已保存: {filepath} ({len(data)} 条)")


def save_to_json(data: List[Dict], filepath: str):
    """保存为 JSON"""
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"💾 已保存: {filepath} ({len(data)} 条)")


def main():
    print("="*60)
    print("EUDAMED 数据清洗 - 最终版")
    print("="*60)
    
    # 定义数据文件
    data_files = {
        'manufacturers': 'eudamed_data_backup_page_2000.json',
        'importers': 'eudamed_data_backup_page_200.json',
        'other': 'eudamed_data_complete.json',
    }
    
    all_data = []
    stats = {}
    
    for category, filepath in data_files.items():
        if os.path.exists(filepath):
            data = load_json_file(filepath)
            normalized = [normalize_item(item) for item in data]
            all_data.extend(normalized)
            
            # 统计类别
            cat_counter = Counter(item.get('category', 'Unknown') for item in normalized)
            stats[filepath] = {
                'total': len(data),
                'categories': dict(cat_counter)
            }
            
            print(f"\n📂 {filepath}")
            print(f"   数据量: {len(data)}")
            for cat, count in cat_counter.items():
                print(f"   - {cat}: {count}")
    
    # 去重
    unique_data = remove_duplicates(all_data)
    
    # 按类别分组
    categorized = defaultdict(list)
    for item in unique_data:
        cat = item.get('category', 'Unknown')
        categorized[cat].append(item)
    
    # 打印统计
    print("\n" + "="*60)
    print("📊 最终统计")
    print("="*60)
    
    total_expected = 2743 + 9953 + 29717 + 1447  # 用户预期的数据量
    
    print(f"\n预期数据量: {total_expected}")
    print(f"实际数据量: {len(unique_data)}")
    
    print("\n按类别统计:")
    for cat, items in sorted(categorized.items()):
        print(f"  {cat}: {len(items)} 条")
    
    # 保存文件
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    
    print("\n💾 保存数据...")
    
    # 保存汇总
    save_to_csv(unique_data, f'eudamed_all_data_{timestamp}.csv')
    save_to_json(unique_data, f'eudamed_all_data_{timestamp}.json')
    
    # 按类别保存
    for cat, items in categorized.items():
        cat_name = cat.lower().replace('/', '_').replace(' ', '_')
        save_to_csv(items, f'eudamed_{cat_name}_{timestamp}.csv')
    
    print("\n" + "="*60)
    print("✅ 清洗完成！")
    print("="*60)


if __name__ == '__main__':
    main()
