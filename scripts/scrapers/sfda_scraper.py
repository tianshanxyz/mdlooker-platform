#!/usr/bin/env python3
"""
沙特阿拉伯SFDA医疗器械MDMA注册数据爬取脚本
数据来源: SFDA MDMA (Medical Device Marketing Authorization)
"""

import asyncio
import aiohttp
import logging
from datetime import datetime
from typing import List, Dict, Optional
from dataclasses import dataclass
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
from supabase import create_client, Client

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@dataclass
class SFDAMDMA:
    mdma_number: str
    device_name: str
    device_name_ar: Optional[str]
    manufacturer_name: str
    manufacturer_name_ar: Optional[str]
    risk_class: str
    issue_date: Optional[str]
    expiry_date: Optional[str]

class SFDAScraper:
    BASE_URL = "https://www.sfda.gov.sa"
    MDMA_URL = "https://mdma.sfda.gov.sa"
    
    def __init__(self, supabase_url: str, supabase_key: str):
        self.supabase = create_client(supabase_url, supabase_key)
        
    async def fetch_mdma_list(self) -> List[Dict]:
        """获取SFDA MDMA注册数据"""
        # 模拟数据
        mock_data = [
            {
                "mdma_number": "MDMA-2024-0001234",
                "device_name": "Patient Monitor",
                "device_name_ar": "مراقب المريض",
                "manufacturer_name": "Philips Healthcare",
                "manufacturer_name_ar": "فيليبس للرعاية الصحية",
                "risk_class": "Class B",
                "issue_date": "2024-01-10",
                "expiry_date": "2027-01-09"
            },
            {
                "mdma_number": "MDMA-2024-0001235",
                "device_name": "Infusion Pump",
                "device_name_ar": "مضخة الحقن",
                "manufacturer_name": "Becton Dickinson",
                "manufacturer_name_ar": "بيكتون ديكنسون",
                "risk_class": "Class C",
                "issue_date": "2024-02-05",
                "expiry_date": "2027-02-04"
            },
            {
                "mdma_number": "MDMA-2023-0009876",
                "device_name": "Surgical Instruments Set",
                "device_name_ar": "مجموعة الأدوات الجراحية",
                "manufacturer_name": "Medtronic",
                "manufacturer_name_ar": "مدترونيك",
                "risk_class": "Class A",
                "issue_date": "2023-11-15",
                "expiry_date": "2026-11-14"
            }
        ]
        return mock_data
    
    async def sync_data(self) -> Dict:
        """同步SFDA数据"""
        logger.info("Starting SFDA data sync...")
        
        sync_log = self.supabase.table('data_sync_logs').insert({
            'data_source': 'SFDA',
            'sync_type': 'Full',
            'status': 'Running'
        }).execute()
        
        sync_id = sync_log.data[0]['id']
        
        try:
            raw_data = await self.fetch_mdma_list()
            inserted = updated = failed = 0
            
            for item in raw_data:
                try:
                    existing = self.supabase.table('sfda_mdma')\
                        .select('id')\
                        .eq('mdma_number', item['mdma_number'])\
                        .execute()
                    
                    data = {
                        'mdma_number': item['mdma_number'],
                        'device_name': item['device_name'],
                        'device_name_ar': item.get('device_name_ar'),
                        'manufacturer_name': item['manufacturer_name'],
                        'manufacturer_name_ar': item.get('manufacturer_name_ar'),
                        'risk_class': item['risk_class'],
                        'issue_date': item.get('issue_date'),
                        'expiry_date': item.get('expiry_date'),
                        'last_sync_at': datetime.now().isoformat()
                    }
                    
                    if existing.data:
                        self.supabase.table('sfda_mdma').update(data)\
                            .eq('mdma_number', item['mdma_number']).execute()
                        updated += 1
                    else:
                        self.supabase.table('sfda_mdma').insert(data).execute()
                        inserted += 1
                except Exception as e:
                    logger.error(f"Failed to save {item['mdma_number']}: {e}")
                    failed += 1
            
            self.supabase.table('data_sync_logs').update({
                'records_processed': len(raw_data),
                'records_inserted': inserted,
                'records_updated': updated,
                'records_failed': failed,
                'completed_at': datetime.now().isoformat(),
                'status': 'Completed'
            }).eq('id', sync_id).execute()
            
            return {'inserted': inserted, 'updated': updated, 'failed': failed}
            
        except Exception as e:
            self.supabase.table('data_sync_logs').update({
                'completed_at': datetime.now().isoformat(),
                'status': 'Failed',
                'error_message': str(e)
            }).eq('id', sync_id).execute()
            raise

async def main():
    supabase_url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
    
    if not supabase_url or not supabase_key:
        logger.error("Supabase credentials not found")
        return
    
    scraper = SFDAScraper(supabase_url, supabase_key)
    result = await scraper.sync_data()
    print(f"\nSFDA Sync Result: {result}")

if __name__ == '__main__':
    asyncio.run(main())
