#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
NMPA表优化工具
用于分析、压缩和优化nmpa_registrations表

功能：
1. 分析表大小和raw_data字段分布
2. 压缩raw_data字段
3. 清理重复数据
4. 优化索引
5. 生成优化报告

作者: MDLooker Platform
版本: 1.0.0
日期: 2026-02-27
"""

import os
import json
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


class NMPAOptimizer:
    """NMPA表优化器"""
    
    def __init__(self):
        self.supabase_url = os.getenv('NEXT_PUBLIC_SUPABASE_URL') or os.getenv('SUPABASE_URL')
        self.supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY') or os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
        
        if not self.supabase_url or not self.supabase_key:
            raise ValueError("缺少Supabase配置，请检查环境变量")
        
        self.client: Client = create_client(self.supabase_url, self.supabase_key)
        self.stats = {
            "original_size_mb": 0,
            "row_count": 0,
            "large_raw_data_count": 0,
            "duplicate_count": 0,
            "optimized_size_mb": 0,
            "space_saved_mb": 0
        }
        
        logger.info("NMPA优化器初始化完成")
    
    async def analyze_table(self) -> Dict:
        """分析表结构和大小"""
        logger.info("\n" + "="*60)
        logger.info("开始分析NMPA表...")
        logger.info("="*60)
        
        try:
            # 1. 获取表大小
            result = self.client.rpc('get_table_size', {'table_name': 'nmpa_registrations'}).execute()
            if result.data:
                self.stats["original_size_mb"] = result.data.get('size_mb', 0)
                logger.info(f"表大小: {self.stats['original_size_mb']:.2f} MB")
            
            # 2. 获取行数
            result = self.client.table('nmpa_registrations').select('count', count='exact').execute()
            self.stats["row_count"] = result.count if hasattr(result, 'count') else 0
            logger.info(f"总行数: {self.stats['row_count']}")
            
            # 3. 分析raw_data大小分布
            # 获取所有数据进行分析
            logger.info("分析raw_data字段...")
            all_data = []
            batch_size = 1000
            offset = 0
            
            while True:
                result = self.client.table('nmpa_registrations')\
                    .select('id, registration_number, raw_data')\
                    .range(offset, offset + batch_size - 1)\
                    .execute()
                
                if not result.data:
                    break
                
                all_data.extend(result.data)
                offset += batch_size
                
                if len(result.data) < batch_size:
                    break
            
            # 分析raw_data大小
            large_records = []
            duplicate_check = {}
            
            for record in all_data:
                raw_data = record.get('raw_data', {})
                if raw_data:
                    raw_data_size = len(json.dumps(raw_data, ensure_ascii=False))
                    if raw_data_size > 10000:  # 大于10KB的记录
                        large_records.append({
                            'id': record['id'],
                            'reg_number': record.get('registration_number', 'N/A'),
                            'size': raw_data_size
                        })
                    
                    # 检查重复
                    reg_num = record.get('registration_number')
                    if reg_num:
                        if reg_num in duplicate_check:
                            duplicate_check[reg_num] += 1
                        else:
                            duplicate_check[reg_num] = 1
            
            self.stats["large_raw_data_count"] = len(large_records)
            self.stats["duplicate_count"] = sum(1 for v in duplicate_check.values() if v > 1)
            
            logger.info(f"大raw_data记录(>10KB): {self.stats['large_raw_data_count']}")
            logger.info(f"重复注册证号: {self.stats['duplicate_count']}")
            
            if large_records:
                logger.info("\n最大的10条raw_data记录:")
                for rec in sorted(large_records, key=lambda x: x['size'], reverse=True)[:10]:
                    logger.info(f"  {rec['reg_number']}: {rec['size'] / 1024:.2f} KB")
            
            return self.stats
            
        except Exception as e:
            logger.error(f"分析失败: {str(e)}")
            raise
    
    async def compress_raw_data(self) -> int:
        """压缩raw_data字段，只保留关键信息"""
        logger.info("\n" + "="*60)
        logger.info("开始压缩raw_data字段...")
        logger.info("="*60)
        
        compressed_count = 0
        batch_size = 100
        offset = 0
        
        try:
            while True:
                # 获取一批数据
                result = self.client.table('nmpa_registrations')\
                    .select('*')\
                    .range(offset, offset + batch_size - 1)\
                    .execute()
                
                if not result.data:
                    break
                
                for record in result.data:
                    raw_data = record.get('raw_data', {})
                    
                    if raw_data and isinstance(raw_data, dict):
                        # 压缩raw_data，只保留关键字段
                        compressed = {
                            'registration_number': record.get('registration_number'),
                            'product_name': record.get('product_name'),
                            'manufacturer': record.get('manufacturer'),
                            'device_classification': record.get('device_classification'),
                            'approval_date': str(record.get('approval_date')) if record.get('approval_date') else None,
                            'source': 'NMPA',
                            # 保留其他可能有用的字段，但限制大小
                            'model': raw_data.get('model', '')[:100] if isinstance(raw_data.get('model'), str) else '',
                            'specification': raw_data.get('specification', '')[:200] if isinstance(raw_data.get('specification'), str) else ''
                        }
                        
                        # 更新记录
                        self.client.table('nmpa_registrations')\
                            .update({'raw_data': compressed})\
                            .eq('id', record['id'])\
                            .execute()
                        
                        compressed_count += 1
                
                offset += batch_size
                
                if compressed_count % 1000 == 0:
                    logger.info(f"已压缩 {compressed_count} 条记录...")
                
                if len(result.data) < batch_size:
                    break
            
            logger.info(f"压缩完成: {compressed_count} 条记录")
            return compressed_count
            
        except Exception as e:
            logger.error(f"压缩失败: {str(e)}")
            raise
    
    async def remove_duplicates(self) -> int:
        """删除重复记录，保留最新的一条"""
        logger.info("\n" + "="*60)
        logger.info("开始清理重复数据...")
        logger.info("="*60)
        
        try:
            # 查找重复记录
            result = self.client.rpc('find_duplicate_nmpa').execute()
            
            if not result.data:
                logger.info("没有发现重复记录")
                return 0
            
            duplicates = result.data
            deleted_count = 0
            
            for dup in duplicates:
                reg_number = dup['registration_number']
                count = dup['count']
                
                # 获取该注册证号的所有记录，按更新时间排序
                records = self.client.table('nmpa_registrations')\
                    .select('id, updated_at')\
                    .eq('registration_number', reg_number)\
                    .order('updated_at', desc=True)\
                    .execute()
                
                if records.data and len(records.data) > 1:
                    # 保留第一条（最新的），删除其余
                    for record in records.data[1:]:
                        self.client.table('nmpa_registrations')\
                            .delete()\
                            .eq('id', record['id'])\
                            .execute()
                        deleted_count += 1
            
            logger.info(f"删除重复记录: {deleted_count} 条")
            return deleted_count
            
        except Exception as e:
            logger.error(f"清理重复数据失败: {str(e)}")
            # 不抛出异常，继续执行
            return 0
    
    async def optimize_indexes(self):
        """优化索引"""
        logger.info("\n" + "="*60)
        logger.info("开始优化索引...")
        logger.info("="*60)
        
        try:
            # 执行VACUUM ANALYZE（需要在Supabase Dashboard中执行）
            logger.info("建议在Supabase Dashboard中执行以下SQL:")
            logger.info("  VACUUM ANALYZE nmpa_registrations;")
            logger.info("  REINDEX TABLE nmpa_registrations;")
            
        except Exception as e:
            logger.error(f"优化索引失败: {str(e)}")
    
    async def run_optimization(self):
        """执行完整优化流程"""
        logger.info("="*80)
        logger.info("NMPA表优化开始")
        logger.info("="*80)
        
        try:
            # 1. 分析表
            await self.analyze_table()
            
            # 2. 压缩raw_data
            compressed = await self.compress_raw_data()
            
            # 3. 清理重复数据
            duplicates_removed = await self.remove_duplicates()
            
            # 4. 优化索引
            await self.optimize_indexes()
            
            # 5. 生成报告
            self.generate_report(compressed, duplicates_removed)
            
        except Exception as e:
            logger.error(f"优化过程出错: {str(e)}")
            raise
    
    def generate_report(self, compressed: int, duplicates_removed: int):
        """生成优化报告"""
        logger.info("\n" + "="*80)
        logger.info("NMPA表优化报告")
        logger.info("="*80)
        
        logger.info(f"\n原始状态:")
        logger.info(f"  表大小: {self.stats['original_size_mb']:.2f} MB")
        logger.info(f"  总行数: {self.stats['row_count']}")
        logger.info(f"  大raw_data记录: {self.stats['large_raw_data_count']}")
        logger.info(f"  重复记录: {self.stats['duplicate_count']}")
        
        logger.info(f"\n优化操作:")
        logger.info(f"  压缩raw_data: {compressed} 条")
        logger.info(f"  删除重复: {duplicates_removed} 条")
        
        logger.info(f"\n建议:")
        logger.info("  1. 在Supabase Dashboard执行: VACUUM FULL ANALYZE nmpa_registrations;")
        logger.info("  2. 考虑创建分区表按年份分割数据")
        logger.info("  3. 定期清理raw_data中的冗余字段")
        logger.info("  4. 使用物化视图加速常用查询")
        
        logger.info("\n" + "="*80)


async def main():
    """主函数"""
    optimizer = NMPAOptimizer()
    await optimizer.run_optimization()


if __name__ == "__main__":
    asyncio.run(main())
