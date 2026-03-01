#!/usr/bin/env python3
"""
EUDAMED 定期同步脚本
定期从 EUDAMED 网站抓取最新数据并更新到 Supabase
"""

import os
import json
import time
from datetime import datetime, timedelta
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


def load_last_sync_time(filepath: str = 'last_eudamed_sync.json') -> str:
    """加载上次同步时间"""
    try:
        with open(filepath, 'r') as f:
            data = json.load(f)
            return data.get('last_sync_time', '')
    except:
        return ''


def save_last_sync_time(filepath: str, sync_time: str):
    """保存同步时间"""
    data = {'last_sync_time': sync_time}
    with open(filepath, 'w') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def check_new_data(supabase, srn_list: list) -> dict:
    """检查哪些是新数据"""
    try:
        # 查询数据库中已存在的 SRN
        result = supabase.table('eudamed_registrations').select('srn').execute()
        
        existing_srns = set()
        for row in result.data:
            if row.get('srn'):
                existing_srns.add(row['srn'])
        
        # 找出新的 SRN
        new_data = []
        for srn in srn_list:
            if srn not in existing_srns:
                new_data.append({'srn': srn})
        
        return {
            'total': len(srn_list),
            'existing': len(existing_srns),
            'new': len(new_data),
            'new_list': new_data
        }
    except Exception as e:
        print(f"⚠️  检查失败: {e}")
        return {
            'total': len(srn_list),
            'existing': 0,
            'new': len(srn_list),
            'new_list': srn_list,
            'error': str(e)
        }


def sync_to_supabase(supabase, data: list) -> dict:
    """同步数据到 Supabase"""
    if not data:
        return {'total': 0, 'inserted': 0, 'updated': 0, 'failed': 0}
    
    batch_size = 50
    inserted = 0
    updated = 0
    failed = 0
    
    for i in range(0, len(data), batch_size):
        batch = data[i:i+batch_size]
        
        try:
            # 使用 insert 而不是 upsert
            result = supabase.table('eudamed_registrations').insert(batch).execute()
            inserted += len(batch)
            print(f"  ✅ 批次 {i//batch_size + 1}: 插入 {len(batch)} 条")
        except Exception as e:
            failed += len(batch)
            print(f"  ❌ 批次 {i//batch_size + 1} 失败: {e}")
    
    return {
        'total': len(data),
        'inserted': inserted,
        'updated': updated,
        'failed': failed
    }


def main():
    print("="*60)
    print("EUDAMED 定期同步")
    print("="*60)
    
    # 加载上次同步时间
    last_sync_file = 'last_eudamed_sync.json'
    last_sync_time = load_last_sync_time(last_sync_file)
    
    if last_sync_time:
        print(f"📅 上次同步时间: {last_sync_time}")
    else:
        print("📅 首次同步")
    
    # 获取 Supabase 客户端
    try:
        supabase = get_supabase_client()
        print("✅ Supabase 连接成功")
    except Exception as e:
        print(f"❌ Supabase 连接失败: {e}")
        return
    
    # 检查是否有新数据文件
    import glob
    data_files = glob.glob('eudamed_for_supabase_*.json')
    
    if data_files:
        latest_file = sorted(data_files)[-1]
        print(f"\n📂 找到数据文件: {latest_file}")
        
        # 加载数据
        with open(latest_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        print(f"✅ 加载了 {len(data)} 条数据")
        
        # 检查新数据
        check_result = check_new_data(supabase, [item['srn'] for item in data])
        
        print(f"\n📊 数据检查结果:")
        print(f"   总数据: {check_result['total']}")
        print(f"   已存在: {check_result['existing']}")
        print(f"   新数据: {check_result['new']}")
        
        if check_result['new'] > 0:
            print(f"\n📤 发现 {check_result['new']} 条新数据，开始同步...")
            
            # 同步数据
            sync_result = sync_to_supabase(supabase, data)
            
            # 保存同步时间
            current_time = datetime.now().isoformat()
            save_last_sync_time(last_sync_file, current_time)
            
            print(f"\n📊 同步结果:")
            print(f"   总数据: {sync_result['total']}")
            print(f"   插入: {sync_result['inserted']}")
            print(f"   更新: {sync_result['updated']}")
            print(f"   失败: {sync_result['failed']}")
        else:
            print("\n⚠️  没有新数据需要同步")
    
    print("\n" + "="*60)
    print("✅ 同步完成！")
    print("="*60)


if __name__ == '__main__':
    main()
