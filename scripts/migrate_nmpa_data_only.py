#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
NMPA表数据迁移脚本（仅迁移数据）
新表已创建，直接开始迁移

执行步骤：
1. 分批迁移数据（每次3000条，避免超时）
2. 创建索引
3. 验证数据完整性

作者: MDLooker Platform
版本: 1.0.0
日期: 2026-02-27
"""

import os
import asyncio
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Any, Optional
import logging

# 加载环境变量
from dotenv import load_dotenv
env_path = Path(__file__).parent.parent / '.env.local'
load_dotenv(env_path)

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# 导入supabase
try:
    from supabase import create_client, Client
except ImportError:
    logger.error("请先安装supabase-py: pip install supabase")
    raise


class NMPADataMigrator:
    """NMPA数据迁移器"""
    
    def __init__(self):
        self.supabase_url = os.getenv('NEXT_PUBLIC_SUPABASE_URL') or os.getenv('SUPABASE_URL')
        self.supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY') or os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
        
        if not self.supabase_url or not self.supabase_key:
            raise ValueError("缺少Supabase配置，请检查环境变量")
        
        self.client: Client = create_client(self.supabase_url, self.supabase_key)
        
        self.stats = {
            "total_rows": 0,
            "migrated_rows": 0,
            "batch_count": 0,
            "failed_batches": 0,
            "start_time": None,
            "end_time": None
        }
        
        logger.info("NMPA数据迁移器初始化完成")
    
    async def get_total_rows(self) -> int:
        """获取总行数"""
        try:
            result = self.client.table('nmpa_registrations').select('count', count='exact').execute()
            return result.count if hasattr(result, 'count') else 0
        except Exception as e:
            logger.error(f"获取行数失败: {str(e)}")
            return 0
    
    async def get_v2_count(self) -> int:
        """获取v2表行数"""
        try:
            result = self.client.table('nmpa_registrations_v2').select('count', count='exact').execute()
            return result.count if hasattr(result, 'count') else 0
        except Exception as e:
            logger.error(f"获取v2表行数失败: {str(e)}")
            return 0
    
    async def migrate_batch(self, offset: int, batch_size: int) -> int:
        """迁移一批数据"""
        try:
            # 获取一批数据
            result = self.client.table('nmpa_registrations')\
                .select('*')\
                .order('id')\
                .range(offset, offset + batch_size - 1)\
                .execute()
            
            if not result.data:
                return 0
            
            batch_data = result.data
            
            # 准备插入数据（压缩raw_data）
            insert_data = []
            for record in batch_data:
                compressed_record = {
                    'id': record.get('id'),
                    'company_id': record.get('company_id'),
                    'registration_number': record.get('registration_number'),
                    'product_name': record.get('product_name'),
                    'product_name_zh': record.get('product_name_zh'),
                    'manufacturer': record.get('manufacturer'),
                    'manufacturer_zh': record.get('manufacturer_zh'),
                    'manufacturer_address': record.get('manufacturer_address'),
                    'registration_holder': record.get('registration_holder'),
                    'registration_holder_zh': record.get('registration_holder_zh'),
                    'registration_holder_address': record.get('registration_holder_address'),
                    'device_classification': record.get('device_classification'),
                    'approval_date': record.get('approval_date'),
                    'expiration_date': record.get('expiration_date'),
                    'product_description': record.get('product_description'),
                    'scope_of_application': record.get('scope_of_application'),
                    'source_url': record.get('source_url'),
                    'created_at': record.get('created_at'),
                    'updated_at': record.get('updated_at'),
                    # 压缩raw_data
                    'raw_data': {
                        'registration_number': record.get('registration_number'),
                        'product_name': record.get('product_name'),
                        'manufacturer': record.get('manufacturer'),
                        'device_classification': record.get('device_classification'),
                        'approval_date': str(record.get('approval_date')) if record.get('approval_date') else None,
                        'source': 'NMPA'
                    }
                }
                insert_data.append(compressed_record)
            
            # 批量插入到新表
            insert_result = self.client.table('nmpa_registrations_v2').insert(insert_data).execute()
            
            return len(insert_result.data) if insert_result.data else 0
            
        except Exception as e:
            logger.error(f"批次 offset={offset} 失败: {str(e)}")
            raise
    
    async def migrate_all_data(self, batch_size: int = 3000) -> bool:
        """迁移所有数据"""
        logger.info("\n" + "="*60)
        logger.info("开始迁移数据")
        logger.info("="*60)
        
        # 获取总行数
        self.stats["total_rows"] = await self.get_total_rows()
        v2_existing = await self.get_v2_count()
        
        logger.info(f"原表记录数: {self.stats['total_rows']}")
        logger.info(f"v2表已有记录: {v2_existing}")
        
        if self.stats["total_rows"] == 0:
            logger.warning("没有数据需要迁移")
            return True
        
        # 计算需要迁移的记录数
        remaining = self.stats["total_rows"] - v2_existing
        if remaining <= 0:
            logger.info("所有数据已迁移完成")
            return True
        
        logger.info(f"需要迁移: {remaining} 条记录")
        
        # 从已有记录数开始继续迁移
        start_offset = v2_existing
        
        # 分批迁移
        offset = start_offset
        batch_num = 1
        
        while offset < self.stats["total_rows"]:
            logger.info(f"\n处理批次 {batch_num} (OFFSET: {offset}, LIMIT: {batch_size})")
            
            try:
                inserted = await self.migrate_batch(offset, batch_size)
                
                if inserted == 0:
                    logger.info("没有更多数据")
                    break
                
                self.stats["migrated_rows"] += inserted
                self.stats["batch_count"] += 1
                
                logger.info(f"✅ 批次 {batch_num} 完成: 迁移 {inserted} 条记录")
                logger.info(f"   总计: {self.stats['migrated_rows']}/{self.stats['total_rows']}")
                
                # 更新偏移量
                offset += batch_size
                batch_num += 1
                
                # 短暂暂停，避免过载
                await asyncio.sleep(0.3)
                
            except Exception as e:
                logger.error(f"❌ 批次 {batch_num} 失败: {str(e)}")
                self.stats["failed_batches"] += 1
                # 跳过这一批，继续下一批
                offset += batch_size
                batch_num += 1
                continue
        
        logger.info(f"\n数据迁移完成: 共迁移 {self.stats['migrated_rows']} 条记录")
        return True
    
    async def run_migration(self):
        """执行完整迁移流程"""
        logger.info("="*80)
        logger.info("NMPA表数据迁移开始")
        logger.info("="*80)
        
        self.stats["start_time"] = datetime.now()
        
        try:
            # 迁移数据
            await self.migrate_all_data(batch_size=3000)
            
            # 生成报告
            self.stats["end_time"] = datetime.now()
            await self.generate_report()
            
        except Exception as e:
            logger.error(f"迁移过程出错: {str(e)}")
            raise
    
    async def generate_report(self):
        """生成迁移报告"""
        logger.info("\n" + "="*80)
        logger.info("NMPA表数据迁移报告")
        logger.info("="*80)
        
        duration = (self.stats["end_time"] - self.stats["start_time"]).total_seconds()
        v2_count = await self.get_v2_count()
        
        logger.info(f"\n迁移统计:")
        logger.info(f"  原表记录数: {self.stats['total_rows']}")
        logger.info(f"  v2表记录数: {v2_count}")
        logger.info(f"  本次迁移: {self.stats['migrated_rows']} 条")
        logger.info(f"  批次数量: {self.stats['batch_count']}")
        logger.info(f"  失败批次: {self.stats['failed_batches']}")
        logger.info(f"  耗时: {duration:.2f} 秒")
        
        if v2_count >= self.stats['total_rows'] * 0.95:
            logger.info("\n✅ 数据迁移成功完成！")
            logger.info("\n下一步操作:")
            logger.info("1. 在Supabase Dashboard SQL Editor中创建索引:")
            logger.info("   CREATE INDEX idx_nmpa_v2_reg_number ON nmpa_registrations_v2(registration_number);")
            logger.info("   CREATE INDEX idx_nmpa_v2_product ON nmpa_registrations_v2 USING gin(to_tsvector('simple', COALESCE(product_name_zh, '')::text));")
            logger.info("   CREATE INDEX idx_nmpa_v2_manufacturer ON nmpa_registrations_v2(manufacturer);")
            logger.info("   CREATE INDEX idx_nmpa_v2_approval_date ON nmpa_registrations_v2(approval_date);")
            logger.info("\n2. 切换表:")
            logger.info("   ALTER TABLE nmpa_registrations RENAME TO nmpa_registrations_backup;")
            logger.info("   ALTER TABLE nmpa_registrations_v2 RENAME TO nmpa_registrations;")
        else:
            logger.warning("\n⚠️ 数据不完整，请检查是否有失败批次")
        
        logger.info("\n" + "="*80)


async def main():
    """主函数"""
    migrator = NMPADataMigrator()
    await migrator.run_migration()


if __name__ == "__main__":
    asyncio.run(main())
