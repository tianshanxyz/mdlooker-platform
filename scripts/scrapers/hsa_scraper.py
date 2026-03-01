#!/usr/bin/env python3
"""
新加坡HSA医疗器械注册数据爬取脚本
数据来源: HSA MEDICS (Medical Device Information & Communication System)
"""

import asyncio
import aiohttp
import json
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Optional
from dataclasses import dataclass
import sys
import os

# 添加项目根目录到路径
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

# 加载环境变量
from dotenv import load_dotenv
env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), '.env.local')
load_dotenv(env_path)

from supabase import create_client, Client

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@dataclass
class HSARegistration:
    """HSA注册数据模型"""
    registration_number: str
    device_name: str
    device_name_zh: Optional[str]
    manufacturer_name: str
    manufacturer_name_zh: Optional[str]
    manufacturer_address: Optional[str]
    local_representative: Optional[str]
    product_owner: Optional[str]
    risk_class: str  # A, B, C, D
    device_category: Optional[str]
    gmdn_code: Optional[str]
    registration_type: str
    registration_status: str
    registration_date: Optional[str]
    expiry_date: Optional[str]
    intended_use: Optional[str]
    indications_for_use: Optional[str]

class HSAScraper:
    """HSA数据爬取器"""
    
    BASE_URL = "https://www.hsa.gov.sg/medical-devices"
    MEDICS_URL = "https://medics.hsa.gov.sg"
    
    def __init__(self, supabase_url: str, supabase_key: str):
        self.supabase: Client = create_client(supabase_url, supabase_key)
        self.session: Optional[aiohttp.ClientSession] = None
        self.rate_limit_delay = 1.0  # 请求间隔(秒)
        
    async def __aenter__(self):
        self.session = aiohttp.ClientSession(
            headers={
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'en-US,en;q=0.9',
            }
        )
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def fetch_registration_list(self, page: int = 1, page_size: int = 100) -> List[Dict]:
        """
        获取注册列表
        注意: HSA MEDICS需要特殊处理，可能需要通过官方API或数据导出
        """
        # 这里使用模拟数据作为示例
        # 实际实现需要根据HSA的实际数据接口调整
        
        mock_data = [
            {
                "registration_number": "DE0001234",
                "device_name": "Cardiac Monitor",
                "device_name_zh": "心脏监护仪",
                "manufacturer_name": "MedTech Solutions Pte Ltd",
                "manufacturer_name_zh": None,
                "manufacturer_address": "123 Tech Park, Singapore 123456",
                "local_representative": "Local Rep Pte Ltd",
                "product_owner": "MedTech Global Inc",
                "risk_class": "B",
                "device_category": "Active Medical Device",
                "gmdn_code": "12345",
                "registration_type": "Full",
                "registration_status": "Active",
                "registration_date": "2024-01-15",
                "expiry_date": "2029-01-14",
                "intended_use": "For continuous monitoring of cardiac activity",
                "indications_for_use": "Adult patients in healthcare facilities"
            },
            {
                "registration_number": "DE0001235",
                "device_name": "Surgical Sutures",
                "device_name_zh": "外科缝合线",
                "manufacturer_name": "SutureTech Manufacturing",
                "manufacturer_name_zh": None,
                "manufacturer_address": "456 Industrial Ave, Singapore 456789",
                "local_representative": "MedSupply Singapore",
                "product_owner": "SutureTech Global",
                "risk_class": "A",
                "device_category": "Non-Active Medical Device",
                "gmdn_code": "23456",
                "registration_type": "Immediate",
                "registration_status": "Active",
                "registration_date": "2024-02-01",
                "expiry_date": "2029-01-31",
                "intended_use": "For wound closure in surgical procedures",
                "indications_for_use": "General surgery applications"
            },
            {
                "registration_number": "DE0001236",
                "device_name": "Insulin Pump",
                "device_name_zh": "胰岛素泵",
                "manufacturer_name": "Diabetes Care Systems",
                "manufacturer_name_zh": None,
                "manufacturer_address": "789 Health Blvd, Singapore 789012",
                "local_representative": "Diabetes Solutions SG",
                "product_owner": "Diabetes Care International",
                "risk_class": "C",
                "device_category": "Active Medical Device",
                "gmdn_code": "34567",
                "registration_type": "Full",
                "registration_status": "Active",
                "registration_date": "2023-12-10",
                "expiry_date": "2028-12-09",
                "intended_use": "For subcutaneous delivery of insulin",
                "indications_for_use": "Diabetes mellitus management"
            },
            {
                "registration_number": "DE0001237",
                "device_name": "Implantable Pacemaker",
                "device_name_zh": "植入式心脏起搏器",
                "manufacturer_name": "Cardiac Devices Inc",
                "manufacturer_name_zh": None,
                "manufacturer_address": "321 Heart Center, Singapore 321654",
                "local_representative": "Cardiac Solutions Pte Ltd",
                "product_owner": "Cardiac Devices Global",
                "risk_class": "D",
                "device_category": "Active Implantable Device",
                "gmdn_code": "45678",
                "registration_type": "Full",
                "registration_status": "Active",
                "registration_date": "2023-11-20",
                "expiry_date": "2028-11-19",
                "intended_use": "For management of cardiac arrhythmias",
                "indications_for_use": "Patients with bradycardia or heart block"
            }
        ]
        
        return mock_data
    
    async def save_to_supabase(self, registrations: List[HSARegistration]) -> Dict:
        """保存数据到Supabase"""
        inserted = 0
        updated = 0
        failed = 0
        
        for reg in registrations:
            try:
                # 检查是否已存在
                existing = self.supabase.table('hsa_registrations')\
                    .select('id')\
                    .eq('registration_number', reg.registration_number)\
                    .execute()
                
                data = {
                    'registration_number': reg.registration_number,
                    'device_name': reg.device_name,
                    'device_name_zh': reg.device_name_zh,
                    'manufacturer_name': reg.manufacturer_name,
                    'manufacturer_name_zh': reg.manufacturer_name_zh,
                    'manufacturer_address': reg.manufacturer_address,
                    'local_representative': reg.local_representative,
                    'product_owner': reg.product_owner,
                    'risk_class': reg.risk_class,
                    'device_category': reg.device_category,
                    'gmdn_code': reg.gmdn_code,
                    'registration_type': reg.registration_type,
                    'registration_status': reg.registration_status,
                    'registration_date': reg.registration_date,
                    'expiry_date': reg.expiry_date,
                    'intended_use': reg.intended_use,
                    'indications_for_use': reg.indications_for_use,
                    'last_sync_at': datetime.now().isoformat()
                }
                
                if existing.data:
                    # 更新
                    self.supabase.table('hsa_registrations')\
                        .update(data)\
                        .eq('registration_number', reg.registration_number)\
                        .execute()
                    updated += 1
                else:
                    # 插入
                    self.supabase.table('hsa_registrations')\
                        .insert(data)\
                        .execute()
                    inserted += 1
                    
            except Exception as e:
                logger.error(f"Failed to save registration {reg.registration_number}: {e}")
                failed += 1
        
        return {
            'inserted': inserted,
            'updated': updated,
            'failed': failed
        }
    
    async def sync_data(self) -> Dict:
        """同步HSA数据"""
        logger.info("Starting HSA data sync...")
        
        # 记录同步日志
        sync_log = self.supabase.table('data_sync_logs').insert({
            'data_source': 'HSA',
            'sync_type': 'Full',
            'status': 'Running'
        }).execute()
        
        sync_id = sync_log.data[0]['id']
        
        try:
            # 获取数据
            raw_data = await self.fetch_registration_list()
            
            # 转换为数据模型
            registrations = []
            for item in raw_data:
                reg = HSARegistration(
                    registration_number=item['registration_number'],
                    device_name=item['device_name'],
                    device_name_zh=item.get('device_name_zh'),
                    manufacturer_name=item['manufacturer_name'],
                    manufacturer_name_zh=item.get('manufacturer_name_zh'),
                    manufacturer_address=item.get('manufacturer_address'),
                    local_representative=item.get('local_representative'),
                    product_owner=item.get('product_owner'),
                    risk_class=item['risk_class'],
                    device_category=item.get('device_category'),
                    gmdn_code=item.get('gmdn_code'),
                    registration_type=item['registration_type'],
                    registration_status=item['registration_status'],
                    registration_date=item.get('registration_date'),
                    expiry_date=item.get('expiry_date'),
                    intended_use=item.get('intended_use'),
                    indications_for_use=item.get('indications_for_use')
                )
                registrations.append(reg)
            
            # 保存到数据库
            result = await self.save_to_supabase(registrations)
            
            # 更新同步日志
            self.supabase.table('data_sync_logs').update({
                'records_processed': len(registrations),
                'records_inserted': result['inserted'],
                'records_updated': result['updated'],
                'records_failed': result['failed'],
                'completed_at': datetime.now().isoformat(),
                'status': 'Completed'
            }).eq('id', sync_id).execute()
            
            logger.info(f"HSA sync completed: {result}")
            return result
            
        except Exception as e:
            # 更新同步日志为失败
            self.supabase.table('data_sync_logs').update({
                'completed_at': datetime.now().isoformat(),
                'status': 'Failed',
                'error_message': str(e)
            }).eq('id', sync_id).execute()
            
            logger.error(f"HSA sync failed: {e}")
            raise

async def main():
    """主函数"""
    # 从环境变量获取配置
    supabase_url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
    
    if not supabase_url or not supabase_key:
        logger.error("Supabase credentials not found in environment variables")
        return
    
    async with HSAScraper(supabase_url, supabase_key) as scraper:
        result = await scraper.sync_data()
        print(f"\nSync Result:")
        print(f"  Inserted: {result['inserted']}")
        print(f"  Updated: {result['updated']}")
        print(f"  Failed: {result['failed']}")

if __name__ == '__main__':
    asyncio.run(main())
