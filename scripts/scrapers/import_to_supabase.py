#!/usr/bin/env python3
"""
将采集的国际医疗器械数据导入Supabase数据库
"""

import json
import os
import sys
from pathlib import Path
from typing import List, Dict
import logging

# 加载环境变量
from dotenv import load_dotenv
env_path = Path(__file__).parent.parent.parent / '.env.local'
load_dotenv(env_path)

from supabase import create_client

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def load_json_data(filepath: str) -> List[Dict]:
    """加载JSON数据文件"""
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)


def import_hsa_data(supabase, data: List[Dict]) -> Dict:
    """导入HSA数据到Supabase"""
    logger.info(f"Importing {len(data)} HSA records...")
    
    inserted = 0
    updated = 0
    failed = 0
    
    for item in data:
        try:
            # 检查是否已存在
            existing = supabase.table('hsa_registrations')\
                .select('id')\
                .eq('registration_number', item['registration_number'])\
                .execute()
            
            # 准备数据
            record = {
                'registration_number': item['registration_number'],
                'device_name': item['device_name'],
                'device_name_zh': item.get('device_name_local'),
                'manufacturer_name': item['manufacturer_name'],
                'manufacturer_name_zh': item.get('manufacturer_name_local'),
                'manufacturer_country': item.get('manufacturer_country'),
                'risk_class': item['device_class'],
                'device_category': item.get('device_category'),
                'gmdn_code': item.get('gmdn_code'),
                'registration_type': item.get('registration_type', 'Full'),
                'registration_status': item['registration_status'],
                'registration_date': item.get('registration_date'),
                'expiry_date': item.get('expiry_date'),
                'intended_use': item.get('intended_use'),
                'data_source': item.get('data_source', 'HSA_MEDICS'),
            }
            
            if existing.data:
                # 更新
                supabase.table('hsa_registrations')\
                    .update(record)\
                    .eq('registration_number', item['registration_number'])\
                    .execute()
                updated += 1
                logger.info(f"  Updated: {item['registration_number']}")
            else:
                # 插入
                supabase.table('hsa_registrations').insert(record).execute()
                inserted += 1
                logger.info(f"  Inserted: {item['registration_number']}")
                
        except Exception as e:
            logger.error(f"  Failed {item['registration_number']}: {e}")
            failed += 1
    
    return {'inserted': inserted, 'updated': updated, 'failed': failed}


def import_pmda_data(supabase, data: List[Dict]) -> Dict:
    """导入PMDA数据到Supabase"""
    logger.info(f"Importing {len(data)} PMDA records...")
    
    inserted = 0
    updated = 0
    failed = 0
    
    for item in data:
        try:
            # 检查是否已存在
            existing = supabase.table('pmda_approvals')\
                .select('id')\
                .eq('approval_number', item['registration_number'])\
                .execute()
            
            # 准备数据
            record = {
                'approval_number': item['registration_number'],
                'device_name': item['device_name'],
                'device_name_jp': item.get('device_name_local'),
                'manufacturer_name': item['manufacturer_name'],
                'manufacturer_name_jp': item.get('manufacturer_name_local'),
                'classification': item['device_class'],
                'approval_date': item.get('registration_date'),
                'approval_status': item['registration_status'],
                'intended_use': item.get('intended_use'),
                'data_source': item.get('data_source', 'PMDA_NINSHO'),
            }
            
            if existing.data:
                # 更新
                supabase.table('pmda_approvals')\
                    .update(record)\
                    .eq('approval_number', item['registration_number'])\
                    .execute()
                updated += 1
                logger.info(f"  Updated: {item['registration_number']}")
            else:
                # 插入
                supabase.table('pmda_approvals').insert(record).execute()
                inserted += 1
                logger.info(f"  Inserted: {item['registration_number']}")
                
        except Exception as e:
            logger.error(f"  Failed {item['registration_number']}: {e}")
            failed += 1
    
    return {'inserted': inserted, 'updated': updated, 'failed': failed}


def import_sfda_data(supabase, data: List[Dict]) -> Dict:
    """导入SFDA数据到Supabase"""
    logger.info(f"Importing {len(data)} SFDA records...")
    
    inserted = 0
    updated = 0
    failed = 0
    
    for item in data:
        try:
            # 检查是否已存在
            existing = supabase.table('sfda_mdma')\
                .select('id')\
                .eq('mdma_number', item['registration_number'])\
                .execute()
            
            # 准备数据
            record = {
                'mdma_number': item['registration_number'],
                'device_name': item['device_name'],
                'device_name_ar': item.get('device_name_local'),
                'manufacturer_name': item['manufacturer_name'],
                'manufacturer_name_ar': item.get('manufacturer_name_local'),
                'risk_class': item['device_class'],
                'issue_date': item.get('registration_date'),
                'expiry_date': item.get('expiry_date'),
                'approval_status': item['registration_status'],
                'intended_use': item.get('intended_use'),
                'data_source': item.get('data_source', 'SFDA_GHAD'),
            }
            
            if existing.data:
                # 更新
                supabase.table('sfda_mdma')\
                    .update(record)\
                    .eq('mdma_number', item['registration_number'])\
                    .execute()
                updated += 1
                logger.info(f"  Updated: {item['registration_number']}")
            else:
                # 插入
                supabase.table('sfda_mdma').insert(record).execute()
                inserted += 1
                logger.info(f"  Inserted: {item['registration_number']}")
                
        except Exception as e:
            logger.error(f"  Failed {item['registration_number']}: {e}")
            failed += 1
    
    return {'inserted': inserted, 'updated': updated, 'failed': failed}


def main():
    """主函数"""
    logger.info("=" * 60)
    logger.info("Import International Data to Supabase")
    logger.info("=" * 60)
    
    # 初始化Supabase客户端
    supabase_url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
    
    if not supabase_url or not supabase_key:
        logger.error("Supabase credentials not found in environment variables")
        return
    
    supabase = create_client(supabase_url, supabase_key)
    
    # 数据文件路径
    data_dir = Path(__file__).parent / 'data'
    
    # 导入HSA数据
    hsa_file = data_dir / 'hsa_registrations.json'
    if hsa_file.exists():
        hsa_data = load_json_data(str(hsa_file))
        hsa_result = import_hsa_data(supabase, hsa_data)
    else:
        logger.warning(f"HSA data file not found: {hsa_file}")
        hsa_result = {'inserted': 0, 'updated': 0, 'failed': 0}
    
    # 导入PMDA数据
    pmda_file = data_dir / 'pmda_approvals.json'
    if pmda_file.exists():
        pmda_data = load_json_data(str(pmda_file))
        pmda_result = import_pmda_data(supabase, pmda_data)
    else:
        logger.warning(f"PMDA data file not found: {pmda_file}")
        pmda_result = {'inserted': 0, 'updated': 0, 'failed': 0}
    
    # 导入SFDA数据
    sfda_file = data_dir / 'sfda_mdma.json'
    if sfda_file.exists():
        sfda_data = load_json_data(str(sfda_file))
        sfda_result = import_sfda_data(supabase, sfda_data)
    else:
        logger.warning(f"SFDA data file not found: {sfda_file}")
        sfda_result = {'inserted': 0, 'updated': 0, 'failed': 0}
    
    # 打印汇总
    logger.info("\n" + "=" * 60)
    logger.info("Import Summary:")
    logger.info("=" * 60)
    logger.info(f"HSA:  {hsa_result['inserted']} inserted, {hsa_result['updated']} updated, {hsa_result['failed']} failed")
    logger.info(f"PMDA: {pmda_result['inserted']} inserted, {pmda_result['updated']} updated, {pmda_result['failed']} failed")
    logger.info(f"SFDA: {sfda_result['inserted']} inserted, {sfda_result['updated']} updated, {sfda_result['failed']} failed")
    logger.info("=" * 60)
    total_inserted = hsa_result['inserted'] + pmda_result['inserted'] + sfda_result['inserted']
    total_updated = hsa_result['updated'] + pmda_result['updated'] + sfda_result['updated']
    total_failed = hsa_result['failed'] + pmda_result['failed'] + sfda_result['failed']
    logger.info(f"Total: {total_inserted} inserted, {total_updated} updated, {total_failed} failed")
    logger.info("=" * 60)


if __name__ == '__main__':
    main()
