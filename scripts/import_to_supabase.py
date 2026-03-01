#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
医疗器械数据导入Supabase脚本
Import Medical Device Data to Supabase

功能：
1. 读取整合后的JSON数据
2. 映射到Supabase表结构
3. 批量导入数据
4. 生成导入报告

作者: MDLooker Platform
版本: 1.0.0
日期: 2026-02-25
"""

import json
import os
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

# 尝试导入supabase
try:
    from supabase import create_client, Client
except ImportError:
    logger.error("请先安装supabase-py: pip install supabase")
    raise


class SupabaseImporter:
    """Supabase数据导入器"""
    
    def __init__(self):
        self.supabase_url = os.getenv('NEXT_PUBLIC_SUPABASE_URL') or os.getenv('SUPABASE_URL')
        self.supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY') or os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
        
        if not self.supabase_url or not self.supabase_key:
            raise ValueError("缺少Supabase配置，请检查环境变量")
        
        self.client: Client = create_client(self.supabase_url, self.supabase_key)
        self.data_dir = Path("scripts/scrapers/data/complete_market_data/integrated")
        
        # 导入统计
        self.stats = {
            "hsa_registrations": {"total": 0, "inserted": 0, "failed": 0},
            "pmda_registrations": {"total": 0, "inserted": 0, "failed": 0},
            "sfda_registrations": {"total": 0, "inserted": 0, "failed": 0},
        }
        
        logger.info(f"Supabase导入器初始化完成")
        logger.info(f"Supabase URL: {self.supabase_url[:30]}...")
    
    def load_json_data(self, filename: str) -> List[Dict]:
        """加载JSON数据文件"""
        filepath = self.data_dir / filename
        if not filepath.exists():
            logger.error(f"文件不存在: {filepath}")
            return []
        
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        logger.info(f"加载 {filename}: {len(data)} 条记录")
        return data
    
    def map_to_hsa_format(self, record: Dict) -> Dict:
        """将通用格式映射到HSA表格式"""
        return {
            "registration_number": record.get("registration_number", ""),
            "device_name": record.get("device_name", ""),
            "device_description": record.get("intended_use", ""),
            "device_class": record.get("risk_level", ""),  # 使用risk_level作为device_class
            "device_category": record.get("device_category", ""),
            "manufacturer_name": record.get("manufacturer_name", ""),
            "manufacturer_country": record.get("manufacturer_country", ""),
            "registrant_name": record.get("local_representative", ""),
            "registration_status": record.get("registration_status", "Active"),
            "registration_date": record.get("registration_date"),
            "expiry_date": record.get("expiry_date"),
            "source_url": record.get("data_source_url", ""),
            "raw_data": record
        }
    
    def map_to_pmda_format(self, record: Dict) -> Dict:
        """将通用格式映射到PMDA表格式"""
        return {
            "approval_number": record.get("registration_number", ""),
            "product_name": record.get("device_name", ""),
            "product_name_jp": record.get("device_name_local", ""),
            "manufacturer": record.get("manufacturer_name", ""),
            "manufacturer_jp": record.get("manufacturer_name_local", ""),
            "manufacturer_address": None,
            "marketing_authorization_holder": record.get("local_representative", ""),
            "marketing_authorization_holder_jp": record.get("local_representative", ""),
            "device_classification": record.get("device_class", ""),
            "approval_date": record.get("registration_date"),
            "expiration_date": record.get("expiry_date"),
            "product_description": record.get("intended_use", ""),
            "intended_use": record.get("intended_use", ""),
            "source_url": record.get("data_source_url", ""),
            "raw_data": record
        }
    
    def map_to_sfda_format(self, record: Dict) -> Dict:
        """将通用格式映射到SFDA表格式 - 使用anvisa_registrations表作为临时方案"""
        return {
            "registration_number": record.get("registration_number", ""),
            "product_name": record.get("device_name", ""),
            "product_name_pt": record.get("device_name_local", ""),  # 使用阿拉伯语作为葡萄牙语
            "device_description": record.get("intended_use", ""),
            "risk_class": record.get("risk_level", ""),
            "manufacturer_name": record.get("manufacturer_name", ""),
            "manufacturer_country": record.get("manufacturer_country", ""),
            "brazil_registration_holder": record.get("local_representative", ""),
            "registration_status": record.get("registration_status", "Active"),
            "registration_date": record.get("registration_date"),
            "expiry_date": record.get("expiry_date"),
            "source_url": record.get("data_source_url", ""),
            "raw_data": record
        }
    
    async def import_hsa_data(self) -> None:
        """导入HSA数据到 hsa_registrations 表"""
        logger.info("\n" + "="*60)
        logger.info("开始导入新加坡HSA数据...")
        logger.info("="*60)
        
        data = self.load_json_data("all_registrations_integrated.json")
        
        # 筛选新加坡数据
        hsa_data = [r for r in data if r.get("country_code") in ["SGP", "SG"] or r.get("country") == "Singapore"]
        self.stats["hsa_registrations"]["total"] = len(hsa_data)
        logger.info(f"筛选出新加坡数据: {len(hsa_data)} 条")
        
        if not hsa_data:
            logger.warning("没有新加坡数据需要导入")
            return
        
        # 映射格式
        mapped_data = [self.map_to_hsa_format(r) for r in hsa_data]
        
        # 批量导入 - 使用insert而不是upsert，避免唯一约束问题
        batch_size = 50
        for i in range(0, len(mapped_data), batch_size):
            batch = mapped_data[i:i+batch_size]
            try:
                result = self.client.table("hsa_registrations").insert(batch).execute()
                
                inserted = len(result.data) if result.data else 0
                self.stats["hsa_registrations"]["inserted"] += inserted
                logger.info(f"批次 {i//batch_size + 1}: 成功导入 {inserted} 条")
                
            except Exception as e:
                self.stats["hsa_registrations"]["failed"] += len(batch)
                logger.error(f"批次 {i//batch_size + 1} 导入失败: {str(e)}")
        
        logger.info(f"HSA数据导入完成: 成功 {self.stats['hsa_registrations']['inserted']}, 失败 {self.stats['hsa_registrations']['failed']}")
    
    async def import_pmda_data(self) -> None:
        """导入PMDA数据到 pmda_registrations 表"""
        logger.info("\n" + "="*60)
        logger.info("开始导入日本PMDA数据...")
        logger.info("="*60)
        
        data = self.load_json_data("all_registrations_integrated.json")
        
        # 筛选日本数据
        pmda_data = [r for r in data if r.get("country_code") in ["JPN", "JP"] or r.get("country") == "Japan"]
        self.stats["pmda_registrations"]["total"] = len(pmda_data)
        logger.info(f"筛选出日本数据: {len(pmda_data)} 条")
        
        if not pmda_data:
            logger.warning("没有日本数据需要导入")
            return
        
        # 映射格式
        mapped_data = [self.map_to_pmda_format(r) for r in pmda_data]
        
        # 批量导入 - 使用insert
        batch_size = 50
        for i in range(0, len(mapped_data), batch_size):
            batch = mapped_data[i:i+batch_size]
            try:
                result = self.client.table("pmda_registrations").insert(batch).execute()
                
                inserted = len(result.data) if result.data else 0
                self.stats["pmda_registrations"]["inserted"] += inserted
                logger.info(f"批次 {i//batch_size + 1}: 成功导入 {inserted} 条")
                
            except Exception as e:
                self.stats["pmda_registrations"]["failed"] += len(batch)
                logger.error(f"批次 {i//batch_size + 1} 导入失败: {str(e)}")
        
        logger.info(f"PMDA数据导入完成: 成功 {self.stats['pmda_registrations']['inserted']}, 失败 {self.stats['pmda_registrations']['failed']}")
    
    async def import_sfda_data(self) -> None:
        """导入SFDA数据到 anvisa_registrations 表（临时方案）"""
        logger.info("\n" + "="*60)
        logger.info("开始导入沙特SFDA数据...")
        logger.info("="*60)
        
        data = self.load_json_data("all_registrations_integrated.json")
        
        # 筛选沙特数据
        sfda_data = [r for r in data if r.get("country_code") in ["SAU", "SA"] or "Saudi" in str(r.get("country", ""))]
        self.stats["sfda_registrations"]["total"] = len(sfda_data)
        logger.info(f"筛选出沙特数据: {len(sfda_data)} 条")
        
        if not sfda_data:
            logger.warning("没有沙特数据需要导入")
            return
        
        # 映射格式
        mapped_data = [self.map_to_sfda_format(r) for r in sfda_data]
        
        # 批量导入 - 使用insert
        batch_size = 50
        for i in range(0, len(mapped_data), batch_size):
            batch = mapped_data[i:i+batch_size]
            try:
                result = self.client.table("anvisa_registrations").insert(batch).execute()
                
                inserted = len(result.data) if result.data else 0
                self.stats["sfda_registrations"]["inserted"] += inserted
                logger.info(f"批次 {i//batch_size + 1}: 成功导入 {inserted} 条")
                
            except Exception as e:
                self.stats["sfda_registrations"]["failed"] += len(batch)
                logger.error(f"批次 {i//batch_size + 1} 导入失败: {str(e)}")
        
        logger.info(f"SFDA数据导入完成: 成功 {self.stats['sfda_registrations']['inserted']}, 失败 {self.stats['sfda_registrations']['failed']}")
    
    async def run_import(self) -> None:
        """执行完整导入流程"""
        logger.info("="*80)
        logger.info("开始Supabase数据导入")
        logger.info("="*80)
        
        try:
            # 测试连接
            logger.info("\n测试Supabase连接...")
            result = self.client.table("companies").select("count").limit(1).execute()
            logger.info("Supabase连接成功!")
            
            # 导入各国数据
            await self.import_hsa_data()
            await self.import_pmda_data()
            await self.import_sfda_data()
            
            # 生成报告
            self.generate_report()
            
        except Exception as e:
            logger.error(f"导入过程出错: {str(e)}")
            raise
    
    def generate_report(self) -> None:
        """生成导入报告"""
        logger.info("\n" + "="*80)
        logger.info("数据导入报告")
        logger.info("="*80)
        
        total_records = sum(s["total"] for s in self.stats.values())
        total_inserted = sum(s["inserted"] for s in self.stats.values())
        total_failed = sum(s["failed"] for s in self.stats.values())
        
        logger.info(f"\nHSA注册数据 (hsa_registrations表):")
        logger.info(f"  总计: {self.stats['hsa_registrations']['total']}")
        logger.info(f"  成功: {self.stats['hsa_registrations']['inserted']}")
        logger.info(f"  失败: {self.stats['hsa_registrations']['failed']}")
        
        logger.info(f"\nPMDA批准数据 (pmda_registrations表):")
        logger.info(f"  总计: {self.stats['pmda_registrations']['total']}")
        logger.info(f"  成功: {self.stats['pmda_registrations']['inserted']}")
        logger.info(f"  失败: {self.stats['pmda_registrations']['failed']}")
        
        logger.info(f"\nSFDA注册数据 (anvisa_registrations表 - 临时):")
        logger.info(f"  总计: {self.stats['sfda_registrations']['total']}")
        logger.info(f"  成功: {self.stats['sfda_registrations']['inserted']}")
        logger.info(f"  失败: {self.stats['sfda_registrations']['failed']}")
        
        logger.info("\n" + "-"*80)
        logger.info(f"总计:")
        logger.info(f"  记录总数: {total_records}")
        logger.info(f"  导入成功: {total_inserted}")
        logger.info(f"  导入失败: {total_failed}")
        logger.info(f"  成功率: {(total_inserted/total_records*100):.2f}%" if total_records > 0 else "  成功率: N/A")
        logger.info("="*80)


async def main():
    """主函数"""
    importer = SupabaseImporter()
    await importer.run_import()


if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
