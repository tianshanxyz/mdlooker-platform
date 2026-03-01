#!/usr/bin/env python3
"""
解析 NMPA UDI XML 数据并提取记录
提取 10 万条数据上传到 Supabase
"""

import xml.etree.ElementTree as ET
import json
import os
from datetime import datetime
from typing import List, Dict
import glob


def parse_device_element(device_elem) -> Dict:
    """解析单个 device 元素"""
    device = {}
    
    # 提取所有子元素
    for child in device_elem:
        tag = child.tag
        text = child.text.strip() if child.text else ''
        device[tag] = text
        
        # 处理 contactList
        if tag == 'contactList':
            contacts = []
            for contact in child.findall('contact'):
                contact_info = {}
                for c in contact:
                    contact_info[c.tag] = c.text.strip() if c.text else ''
                contacts.append(contact_info)
            device['contacts'] = contacts
            
    return device


def parse_xml_file(filepath: str, max_records: int = None) -> List[Dict]:
    """解析单个 XML 文件"""
    print(f"📄 解析: {os.path.basename(filepath)}")
    
    devices = []
    
    try:
        # 使用 iterparse 处理大文件
        context = ET.iterparse(filepath, events=('end',))
        context = iter(context)
        
        for event, elem in context:
            if elem.tag == 'device':
                device = parse_device_element(elem)
                devices.append(device)
                
                # 清理元素释放内存
                elem.clear()
                
                if max_records and len(devices) >= max_records:
                    break
                    
        print(f"   ✅ 提取了 {len(devices)} 条记录")
        
    except Exception as e:
        print(f"   ❌ 解析失败: {e}")
        
    return devices


def transform_for_supabase(device: Dict) -> Dict:
    """转换为 Supabase 表结构"""
    return {
        'udi': device.get('zxxsdycpbs', ''),
        'product_name': device.get('cpmctymc', ''),
        'specification': device.get('ggxh', ''),
        'registration_number': device.get('zczbhhzbapzbh', ''),
        'manufacturer_name': device.get('ylqxzcrbarmc', ''),
        'manufacturer_english': device.get('ylqxzcrbarywmc', ''),
        'category_code': device.get('flbm', ''),
        'product_type': device.get('qxlb', ''),
        'publish_date': device.get('cpbsfbrq', ''),
        'description': device.get('cpms', ''),
        'version': device.get('versionNumber', ''),
        'raw_data': device,
        'source': 'NMPA_UDI',
        'created_at': datetime.now().isoformat(),
    }


def extract_nmpa_data(target_count: int = 100000, data_dir: str = None) -> List[Dict]:
    """提取 NMPA 数据"""
    if data_dir is None:
        data_dir = '/Users/maxiaoha/Desktop/mdlooker-platform/database/NMPA medical device'
        
    print("="*60)
    print(f"NMPA 数据提取 - 目标: {target_count} 条")
    print("="*60)
    
    # 获取所有 XML 文件
    xml_files = sorted(glob.glob(os.path.join(data_dir, 'UDID_FULL_DOWNLOAD_PART*.xml')))
    print(f"\n📁 找到 {len(xml_files)} 个 XML 文件")
    
    all_devices = []
    
    for i, xml_file in enumerate(xml_files, 1):
        print(f"\n{'='*60}")
        print(f"处理文件 {i}/{len(xml_files)}")
        print(f"{'='*60}")
        
        # 计算还需要多少条
        remaining = target_count - len(all_devices)
        if remaining <= 0:
            break
            
        # 解析文件
        devices = parse_xml_file(xml_file, max_records=remaining)
        all_devices.extend(devices)
        
        print(f"📊 当前总计: {len(all_devices)}/{target_count}")
        
        # 每处理 10 个文件保存一次进度
        if i % 10 == 0:
            save_progress(all_devices, i)
            
    # 转换数据格式
    print(f"\n{'='*60}")
    print("转换数据格式...")
    print(f"{'='*60}")
    
    transformed_data = [transform_for_supabase(d) for d in all_devices]
    
    # 保存最终数据
    output_file = f'nmpa_data_{len(transformed_data)}_records.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(transformed_data, f, ensure_ascii=False, indent=2)
        
    print(f"\n✅ 完成！")
    print(f"   提取记录: {len(transformed_data)} 条")
    print(f"   保存文件: {output_file}")
    
    return transformed_data


def save_progress(devices: List[Dict], file_index: int):
    """保存进度"""
    filename = f'nmpa_progress_{file_index}files_{len(devices)}records.json'
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(devices, f, ensure_ascii=False, indent=2)
    print(f"💾 进度已保存: {filename}")


def main():
    print("="*60)
    print("NMPA UDI 数据提取工具")
    print("="*60)
    print()
    
    # 提取 10 万条数据
    data = extract_nmpa_data(target_count=100000)
    
    print("\n" + "="*60)
    print("✅ 数据提取完成！")
    print("="*60)
    print(f"\n下一步: 运行 upload_nmpa_to_supabase.py 上传数据")


if __name__ == '__main__':
    main()
