#!/usr/bin/env python3
"""
日本PMDA医疗器械批准数据爬取脚本
数据来源: PMDA NINSHO (医療機器認証制度)
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
class PMDAApproval:
    approval_number: str
    device_name: str
    device_name_jp: Optional[str]
    manufacturer_name: str
    manufacturer_name_jp: Optional[str]
    classification: str
    approval_date: Optional[str]

class PMDAScraper:
    BASE_URL = "https://www.pmda.go.jp"
    
    def __init__(self, supabase_url: str, supabase_key: str):
        self.supabase = create_client(supabase_url, supabase_key)
        
    async def fetch_approvals(self) -> List[Dict]:
        """获取PMDA批准数据"""
        # 模拟数据
        mock_data = [
            {
                "approval_number": "23000BZX00011000",
                "device_name": "MRI System",
                "device_name_jp": "MRI装置",
                "manufacturer_name": "Siemens Healthineers Japan",
                "manufacturer_name_jp": "シーメンスヘルスケア株式会社",
                "classification": "Class III",
                "approval_date": "2024-01-20"
            },
            {
                "approval_number": "23000BZX00022000",
                "device_name": "Digital X-Ray System",
                "device_name_jp": "デジタルX線診断装置",
                "manufacturer_name": "Canon Medical Systems",
                "manufacturer_name_jp": "キヤノンメディカルシステムズ株式会社",
                "classification": "Class II",
                "approval_date": "2024-02-15"
            },
            {
                "approval_number": "23000BZX00033000",
                "device_name": "Dialysis Machine",
                "device_name_jp": "人工透析装置",
                "manufacturer_name": "Fresenius Medical Care Japan",
                "manufacturer_name_jp": "フレゼニウス・メディカル・ケア・ジャパン株式会社",
                "classification": "Class III",
                "approval_date": "2023-12-05"
            }
        ]
        return mock_data
    
    async def sync_data(self) -> Dict:
        """同步PMDA数据"""
        logger.info("Starting PMDA data sync...")
        
        sync_log = self.supabase.table('data_sync_logs').insert({
            'data_source': 'PMDA',
            'sync_type': 'Full',
            'status': 'Running'
        }).execute()
        
        sync_id = sync_log.data[0]['id']
        
        try:
            raw_data = await self.fetch_approvals()
            inserted = updated = failed = 0
            
            for item in raw_data:
                try:
                    existing = self.supabase.table('pmda_approvals')\
                        .select('id')\
                        .eq('approval_number', item['approval_number'])\
                        .execute()
                    
                    data = {
                        'approval_number': item['approval_number'],
                        'device_name': item['device_name'],
                        'device_name_jp': item.get('device_name_jp'),
                        'manufacturer_name': item['manufacturer_name'],
                        'manufacturer_name_jp': item.get('manufacturer_name_jp'),
                        'classification': item['classification'],
                        'approval_date': item.get('approval_date'),
                        'last_sync_at': datetime.now().isoformat()
                    }
                    
                    if existing.data:
                        self.supabase.table('pmda_approvals').update(data)\
                            .eq('approval_number', item['approval_number']).execute()
                        updated += 1
                    else:
                        self.supabase.table('pmda_approvals').insert(data).execute()
                        inserted += 1
                except Exception as e:
                    logger.error(f"Failed to save {item['approval_number']}: {e}")
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
    
    scraper = PMDAScraper(supabase_url, supabase_key)
    result = await scraper.sync_data()
    print(f"\nPMDA Sync Result: {result}")

if __name__ == '__main__':
    asyncio.run(main())
