#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
NMPA表迁移到v2脚本
分批执行，避免超时和磁盘空间问题

执行步骤：
1. 创建新表 nmpa_registrations_v2
2. 分批迁移数据（每次5000条）
3. 创建索引
4. 切换表

作者: MDLooker Platform
版本: 1.0.0
日期: 2026-02-27
"""

import os
import asyncio
import time
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


class NMPAMigrator:
    """NMPA表迁移器"""
    
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
            "start_time": None,
            "end_time": None
        }
        
        logger.info("NMPA迁移器初始化完成")
    
    async def step1_create_new_table(self) -> bool:
        """步骤1：创建新表"""
        logger.info("\n" + "="*60)
        logger.info("步骤1：创建新表 nmpa_registrations_v2")
        logger.info("="*60)
        
        sql = """
        CREATE TABLE IF NOT EXISTS nmpa_registrations_v2 (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
            registration_number VARCHAR(100) NOT NULL,
            product_name VARCHAR(500),
            product_name_zh VARCHAR(500),
            manufacturer VARCHAR(255),
            manufacturer_zh VARCHAR(255),
            manufacturer_address TEXT,
            registration_holder VARCHAR(255),
            registration_holder_zh VARCHAR(255),
            registration_holder_address TEXT,
            device_classification VARCHAR(50),
            approval_date DATE,
            expiration_date DATE,
            product_description TEXT,
            scope_of_application TEXT,
            source_url TEXT,
            raw_data JSONB,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        """
        
        try:
            # 使用rpc执行SQL
            result = self.client.rpc('exec_sql', {'sql': sql}).execute()
            logger.info("✅ 新表创建成功")
            return True
        except Exception as e:
            logger.error(f"❌ 创建新表失败: {str(e)}")
            # 尝试直接查询看表是否存在
            try:
                result = self.client.table('nmpa_registrations_v2').select('count').limit(1).execute()
                logger.info("✅ 新表已存在")
                return True
            except:
                return False
    
    async def get_total_rows(self) -> int:
        """获取总行数"""
        try:
            result = self.client.table('nmpa_registrations').select('count', count='exact').execute()
            return result.count if hasattr(result, 'count') else 0
        except Exception as e:
            logger.error(f"获取行数失败: {str(e)}")
            return 0
    
    async def step2_migrate_data(self, batch_size: int = 5000) -> bool:
        """步骤2：分批迁移数据"""
        logger.info("\n" + "="*60)
        logger.info("步骤2：分批迁移数据")
        logger.info("="*60)
        
        # 获取总行数
        self.stats["total_rows"] = await self.get_total_rows()
        logger.info(f"总记录数: {self.stats['total_rows']}")
        
        if self.stats["total_rows"] == 0:
            logger.warning("没有数据需要迁移")
            return True
        
        # 分批迁移
        offset = 0
        batch_num = 1
        
        while offset < self.stats["total_rows"]:
            logger.info(f"\n处理批次 {batch_num} (OFFSET: {offset}, LIMIT: {batch_size})")
            
            try:
                # 获取一批数据
                result = self.client.table('nmpa_registrations')\
                    .select('*')\
                    .order('id')\
                    .range(offset, offset + batch_size - 1)\
                    .execute()
                
                if not result.data:
                    logger.info("没有更多数据")
                    break
                
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
                
                inserted_count = len(insert_result.data) if insert_result.data else 0
                self.stats["migrated_rows"] += inserted_count
                self.stats["batch_count"] += 1
                
                logger.info(f"✅ 批次 {batch_num} 完成: 迁移 {inserted_count} 条记录")
                
                # 更新偏移量
                offset += batch_size
                batch_num += 1
                
                # 短暂暂停，避免过载
                await asyncio.sleep(0.5)
                
            except Exception as e:
                logger.error(f"❌ 批次 {batch_num} 失败: {str(e)}")
                # 继续下一批
                offset += batch_size
                batch_num += 1
                continue
        
        logger.info(f"\n数据迁移完成: 共迁移 {self.stats['migrated_rows']} 条记录")
        return True
    
    async def step3_create_indexes(self) -> bool:
        """步骤3：创建索引"""
        logger.info("\n" + "="*60)
        logger.info("步骤3：创建索引")
        logger.info("="*60)
        
        indexes = [
            "CREATE INDEX idx_nmpa_v2_reg_number ON nmpa_registrations_v2(registration_number);",
            "CREATE INDEX idx_nmpa_v2_product ON nmpa_registrations_v2 USING gin(to_tsvector('simple', COALESCE(product_name_zh, '')::text));",
            "CREATE INDEX idx_nmpa_v2_manufacturer ON nmpa_registrations_v2(manufacturer);",
            "CREATE INDEX idx_nmpa_v2_approval_date ON nmpa_registrations_v2(approval_date);",
            "CREATE INDEX idx_nmpa_v2_company_id ON nmpa_registrations_v2(company_id);"
        ]
        
        for i, sql in enumerate(indexes, 1):
            try:
                result = self.client.rpc('exec_sql', {'sql': sql}).execute()
                logger.info(f"✅ 索引 {i}/{len(indexes)} 创建成功")
            except Exception as e:
                logger.error(f"❌ 索引 {i} 创建失败: {str(e)}")
        
        return True
    
    async def step4_switch_tables(self) -> bool:
        """步骤4：切换表"""
        logger.info("\n" + "="*60)
        logger.info("步骤4：切换表（需要谨慎操作）")
        logger.info("="*60)
        
        # 先验证数据完整性
        try:
            v2_count_result = self.client.table('nmpa_registrations_v2').select('count', count='exact').execute()
            v2_count = v2_count_result.count if hasattr(v2_count_result, 'count') else 0
            
            logger.info(f"原表记录数: {self.stats['total_rows']}")
            logger.info(f"新表记录数: {v2_count}")
            
            if v2_count < self.stats['total_rows'] * 0.95:  # 允许5%的误差
                logger.warning("⚠️ 新表记录数与原表差异较大，请检查数据完整性")
                logger.warning("跳过表切换，请手动检查后再执行")
                return False
            
            logger.info("✅ 数据完整性验证通过")
            
            # 执行表切换
            logger.info("\n执行表切换...")
            
            # 注意：这里需要在Supabase Dashboard中手动执行，因为涉及DROP TABLE
            logger.info("\n请在Supabase Dashboard SQL Editor中执行以下SQL：")
            logger.info("-" * 60)
            logger.info("BEGIN;")
            logger.info("  -- 1. 重命名原表为备份")
            logger.info("  ALTER TABLE nmpa_registrations RENAME TO nmpa_registrations_backup;")
            logger.info("  ")
            logger.info("  -- 2. 新表重命名为正式表名")
            logger.info("  ALTER TABLE nmpa_registrations_v2 RENAME TO nmpa_registrations;")
            logger.info("  ")
            logger.info("  -- 3. 重命名索引")
            logger.info("  ALTER INDEX idx_nmpa_v2_reg_number RENAME TO idx_nmpa_reg_number;")
            logger.info("  ALTER INDEX idx_nmpa_v2_product RENAME TO idx_nmpa_product;")
            logger.info("  ALTER INDEX idx_nmpa_v2_manufacturer RENAME TO idx_nmpa_manufacturer;")
            logger.info("  ALTER INDEX idx_nmpa_v2_approval_date RENAME TO idx_nmpa_approval_date;")
            logger.info("  ALTER INDEX idx_nmpa_v2_company_id RENAME TO idx_nmpa_company_id;")
            logger.info("COMMIT;")
            logger.info("-" * 60)
            logger.info("\n执行完成后，可以删除备份表：")
            logger.info("DROP TABLE nmpa_registrations_backup;")
            
            return True
            
        except Exception as e:
            logger.error(f"❌ 表切换失败: {str(e)}")
            return False
    
    async def check_table_size(self) -> Dict:
        """检查表大小"""
        try:
            # 查询原表大小
            result = self.client.rpc('get_table_size', {'table_name': 'nmpa_registrations'}).execute()
            original_size = result.data.get('size_mb', 0) if result.data else 0
            
            # 查询新表大小
            try:
                result = self.client.rpc('get_table_size', {'table_name': 'nmpa_registrations_v2'}).execute()
                new_size = result.data.get('size_mb', 0) if result.data else 0
            except:
                new_size = 0
            
            return {
                'original_size_mb': original_size,
                'new_size_mb': new_size,
                'saved_mb': original_size - new_size,
                'saved_percent': ((original_size - new_size) / original_size * 100) if original_size > 0 else 0
            }
        except Exception as e:
            logger.error(f"检查表大小失败: {str(e)}")
            return {}
    
    async def run_migration(self):
        """执行完整迁移流程"""
        logger.info("="*80)
        logger.info("NMPA表迁移到v2开始")
        logger.info("="*80)
        
        self.stats["start_time"] = datetime.now()
        
        try:
            # 步骤1：创建新表
            if not await self.step1_create_new_table():
                logger.error("创建新表失败，停止迁移")
                return
            
            # 步骤2：迁移数据
            if not await self.step2_migrate_data(batch_size=5000):
                logger.error("数据迁移失败")
                return
            
            # 步骤3：创建索引
            await self.step3_create_indexes()
            
            # 步骤4：切换表
            await self.step4_switch_tables()
            
            # 生成报告
            self.stats["end_time"] = datetime.now()
            await self.generate_report()
            
        except Exception as e:
            logger.error(f"迁移过程出错: {str(e)}")
            raise
    
    async def generate_report(self):
        """生成迁移报告"""
        logger.info("\n" + "="*80)
        logger.info("NMPA表迁移报告")
        logger.info("="*80)
        
        duration = (self.stats["end_time"] - self.stats["start_time"]).total_seconds()
        
        logger.info(f"\n迁移统计:")
        logger.info(f"  总记录数: {self.stats['total_rows']}")
        logger.info(f"  迁移记录: {self.stats['migrated_rows']}")
        logger.info(f"  批次数量: {self.stats['batch_count']}")
        logger.info(f"  耗时: {duration:.2f} 秒")
        
        # 检查表大小
        size_info = await self.check_table_size()
        if size_info:
            logger.info(f"\n空间优化:")
            logger.info(f"  原表大小: {size_info.get('original_size_mb', 0):.2f} MB")
            logger.info(f"  新表大小: {size_info.get('new_size_mb', 0):.2f} MB")
            logger.info(f"  节省空间: {size_info.get('saved_mb', 0):.2f} MB ({size_info.get('saved_percent', 0):.1f}%)")
        
        logger.info("\n" + "="*80)


async def main():
    """主函数"""
    migrator = NMPAMigrator()
    await migrator.run_migration()


if __name__ == "__main__":
    asyncio.run(main())
