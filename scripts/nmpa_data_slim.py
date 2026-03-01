#!/usr/bin/env python3
"""
NMPA UDI 数据瘦身脚本
从 548 万条记录中提取核心字段，大幅压缩数据量
"""

import xml.etree.ElementTree as ET
import json
import os
import gzip
import shutil
from datetime import datetime
from typing import List, Dict, Generator
import glob


# 核心字段映射（只保留搜索和展示必需的字段）
CORE_FIELDS = {
    # UDI 标识
    'zxxsdycpbs': 'udi',                    # 最小销售单元产品标识
    
    # 产品信息
    'cpmctymc': 'product_name',             # 产品名称（通用名称）
    'spmc': 'product_name_short',           # 商品名称
    'ggxh': 'specification',                # 规格型号
    'cpms': 'description',                  # 产品描述
    
    # 分类信息
    'flbm': 'category_code',                # 分类编码
    'qxlb': 'product_type',                 # 器械类别
    'cplb': 'product_category',             # 产品类别（耗材/设备等）
    
    # 注册信息
    'zczbhhzbapzbh': 'registration_number', # 注册证编号
    'cpbsfbrq': 'publish_date',             # 产品标识发布日期
    
    # 生产企业信息
    'ylqxzcrbarmc': 'manufacturer_name',    # 医疗器械注册人/备案人名称
    'ylqxzcrbarywmc': 'manufacturer_en',    # 医疗器械注册人/备案人英文名称
    'tyshxydm': 'credit_code',              # 统一社会信用代码
    
    # 其他关键信息
    'sfyzcbayz': 'has_registration',        # 是否有注册/备案凭证
    'versionNumber': 'version',             # 版本号
    'versionTime': 'version_date',          # 版本时间
}


def parse_device_slim(device_elem) -> Dict:
    """解析 device 元素，只提取核心字段"""
    device = {}
    
    for child in device_elem:
        tag = child.tag
        text = child.text.strip() if child.text else ''
        
        # 只保留核心字段
        if tag in CORE_FIELDS and text:
            device[CORE_FIELDS[tag]] = text
    
    return device


def parse_xml_file_slim(filepath: str) -> Generator[Dict, None, None]:
    """解析单个 XML 文件，生成器模式节省内存"""
    try:
        context = ET.iterparse(filepath, events=('end',))
        context = iter(context)
        
        for event, elem in context:
            if elem.tag == 'device':
                device = parse_device_slim(elem)
                if device:  # 只返回非空记录
                    yield device
                
                # 清理元素释放内存
                elem.clear()
                
    except Exception as e:
        print(f"   ⚠️  解析警告: {e}")


def slim_nmpa_data(
    data_dir: str = None,
    output_file: str = 'nmpa_slim.json.gz',
    target_count: int = None  # None 表示处理所有数据
) -> int:
    """
    瘦身 NMPA 数据
    
    Args:
        data_dir: XML 文件目录
        output_file: 输出文件路径（自动压缩）
        target_count: 目标记录数（None 表示全部）
    
    Returns:
        处理的记录数
    """
    if data_dir is None:
        data_dir = '/Users/maxiaoha/Desktop/mdlooker-platform/database/NMPA medical device'
    
    print("="*60)
    print("NMPA 数据瘦身")
    print("="*60)
    print(f"\n📁 数据源: {data_dir}")
    print(f"📦 输出文件: {output_file}")
    if target_count:
        print(f"🎯 目标记录数: {target_count:,}")
    else:
        print(f"🎯 处理所有记录")
    print()
    
    # 获取所有 XML 文件
    xml_files = sorted(glob.glob(os.path.join(data_dir, 'UDID_FULL_DOWNLOAD_PART*.xml')))
    print(f"📄 找到 {len(xml_files)} 个 XML 文件")
    
    total_records = 0
    processed_files = 0
    
    # 使用 gzip 压缩写入
    with gzip.open(output_file, 'wt', encoding='utf-8') as f:
        f.write('[')  # JSON 数组开始
        first = True
        
        for i, xml_file in enumerate(xml_files, 1):
            if target_count and total_records >= target_count:
                print(f"\n✅ 已达到目标记录数: {target_count:,}")
                break
            
            print(f"\n[{i}/{len(xml_files)}] {os.path.basename(xml_file)}")
            
            file_records = 0
            for device in parse_xml_file_slim(xml_file):
                if target_count and total_records >= target_count:
                    break
                
                # 写入 JSON
                if not first:
                    f.write(',\n')
                else:
                    first = False
                
                json.dump(device, f, ensure_ascii=False)
                
                total_records += 1
                file_records += 1
                
                # 每 10000 条显示进度
                if total_records % 10000 == 0:
                    print(f"   进度: {total_records:,} 条", end='\r')
            
            processed_files += 1
            print(f"   ✅ 本文件: {file_records:,} 条, 总计: {total_records:,} 条")
            
            # 每处理 50 个文件显示一次统计
            if processed_files % 50 == 0:
                print(f"\n📊 已处理 {processed_files} 个文件，共 {total_records:,} 条记录")
        
        f.write(']')  # JSON 数组结束
    
    # 显示结果
    print("\n" + "="*60)
    print("✅ 数据瘦身完成")
    print("="*60)
    print(f"处理文件数: {processed_files}")
    print(f"总记录数: {total_records:,}")
    
    # 文件大小统计
    original_size = sum(os.path.getsize(f) for f in xml_files[:processed_files])
    slim_size = os.path.getsize(output_file)
    
    print(f"\n📦 原始数据大小: {original_size / 1024 / 1024 / 1024:.2f} GB")
    print(f"📦 瘦身后大小: {slim_size / 1024 / 1024:.2f} MB")
    print(f"📉 压缩率: {(1 - slim_size / original_size) * 100:.1f}%")
    
    return total_records


def load_slim_data(filepath: str = 'nmpa_slim.json.gz', limit: int = None) -> List[Dict]:
    """加载瘦身后的数据"""
    print(f"\n📂 加载数据: {filepath}")
    
    with gzip.open(filepath, 'rt', encoding='utf-8') as f:
        data = json.load(f)
    
    if limit:
        data = data[:limit]
    
    print(f"✅ 加载了 {len(data):,} 条记录")
    return data


def main():
    print("="*60)
    print("NMPA UDI 数据瘦身工具")
    print("="*60)
    print()
    
    # 处理所有数据（548 万条）
    slim_nmpa_data(output_file='nmpa_full_slim.json.gz')
    
    print("\n" + "="*60)
    print("✅ 完成！")
    print("="*60)


if __name__ == '__main__':
    main()
