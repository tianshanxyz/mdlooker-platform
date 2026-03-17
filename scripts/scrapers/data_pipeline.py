#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
数据采集管道（改进版）
流程：采集 -> 本地保存 -> 清洗 -> 压缩 -> 上传到 Supabase

特点：
1. 数据先保存到本地 JSON 文件
2. 进行数据清洗和去重
3. 压缩大字段（移除不必要的 raw_data）
4. 分批上传到 Supabase
5. 详细的日志和进度跟踪
"""

import json
import os
import sys
import gzip
import shutil
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Any, Optional, Tuple
import logging
from dotenv import load_dotenv

# 加载环境变量
env_path = Path(__file__).parent.parent.parent / '.env.local'
load_dotenv(env_path)

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('data_pipeline.log', encoding='utf-8'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# 尝试导入 supabase
try:
    from supabase import create_client, Client
except ImportError:
    logger.error("请先安装 supabase: pip install supabase")
    sys.exit(1)


class DataPipeline:
    """数据采集管道管理器"""
    
    def __init__(self, table_name: str):
        """
        初始化管道
        
        Args:
            table_name: Supabase 表名
        """
        self.table_name = table_name
        self.data_dir = Path(__file__).parent / 'data' / 'pipeline'
        self.data_dir.mkdir(parents=True, exist_ok=True)
        
        # Supabase 客户端
        self.supabase_url = os.getenv('NEXT_PUBLIC_SUPABASE_URL') or os.getenv('SUPABASE_URL')
        self.supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
        
        if not self.supabase_url or not self.supabase_key:
            raise ValueError("缺少 Supabase 配置，请检查环境变量")
        
        self.client: Client = create_client(self.supabase_url, self.supabase_key)
        
        # 统计信息
        self.stats = {
            'collected': 0,
            'cleaned': 0,
            'compressed': 0,
            'uploaded': 0,
            'failed': 0,
            'skipped': 0
        }
        
        logger.info(f"数据管道初始化完成 - 表：{table_name}")
        logger.info(f"数据目录：{self.data_dir}")
    
    def collect_data(self, collector, collect_method: str, **kwargs) -> List[Dict]:
        """
        步骤 1: 采集数据并保存到本地
        
        Args:
            collector: 采集器实例
            collect_method: 采集方法名
            **kwargs: 采集方法参数
            
        Returns:
            采集到的原始数据列表
        """
        logger.info("=" * 60)
        logger.info(f"步骤 1: 采集数据 - {self.table_name}")
        logger.info("=" * 60)
        
        start_time = datetime.now()
        
        # 调用采集方法
        try:
            collect_func = getattr(collector, collect_method)
            raw_data = collect_func(**kwargs)
            
            if not isinstance(raw_data, list):
                logger.error(f"采集方法返回的数据类型不正确：{type(raw_data)}")
                return []
            
            self.stats['collected'] = len(raw_data)
            logger.info(f"✅ 采集完成：{len(raw_data)} 条记录")
            
            # 保存到本地 JSON 文件
            raw_file = self.data_dir / f"{self.table_name}_raw_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
            with open(raw_file, 'w', encoding='utf-8') as f:
                json.dump(raw_data, f, ensure_ascii=False, indent=2)
            
            logger.info(f"💾 原始数据已保存：{raw_file}")
            logger.info(f"⏱️  采集耗时：{(datetime.now() - start_time).total_seconds():.2f} 秒")
            
            return raw_data
            
        except Exception as e:
            logger.error(f"❌ 采集失败：{e}")
            raise
    
    def clean_data(self, raw_data: List[Dict]) -> List[Dict]:
        """
        步骤 2: 数据清洗
        
        清洗规则：
        1. 移除空记录
        2. 移除重复记录
        3. 标准化字段格式
        4. 移除无效数据
        
        Args:
            raw_data: 原始数据列表
            
        Returns:
            清洗后的数据列表
        """
        logger.info("=" * 60)
        logger.info(f"步骤 2: 数据清洗 - {self.table_name}")
        logger.info("=" * 60)
        
        start_time = datetime.now()
        initial_count = len(raw_data)
        
        # 1. 移除空记录
        cleaned_data = [record for record in raw_data if record and isinstance(record, dict)]
        after_empty_removal = len(cleaned_data)
        logger.info(f"移除空记录：{initial_count - after_empty_removal} 条")
        
        # 2. 移除重复记录（根据关键字段）
        seen = set()
        unique_data = []
        duplicates = 0
        
        for record in cleaned_data:
            # 生成记录的唯一标识
            record_hash = self._generate_record_hash(record)
            
            if record_hash not in seen:
                seen.add(record_hash)
                unique_data.append(record)
            else:
                duplicates += 1
        
        cleaned_data = unique_data
        logger.info(f"移除重复记录：{duplicates} 条")
        
        # 3. 标准化字段
        for record in cleaned_data:
            self._normalize_record(record)
        
        # 4. 移除无效数据（根据业务规则）
        valid_data = []
        invalid_count = 0
        
        for record in cleaned_data:
            if self._is_valid_record(record):
                valid_data.append(record)
            else:
                invalid_count += 1
        
        logger.info(f"移除无效记录：{invalid_count} 条")
        
        self.stats['cleaned'] = len(valid_data)
        logger.info(f"✅ 清洗完成：{len(valid_data)} 条记录（原始：{initial_count}）")
        logger.info(f"⏱️  清洗耗时：{(datetime.now() - start_time).total_seconds():.2f} 秒")
        
        # 保存清洗后的数据
        cleaned_file = self.data_dir / f"{self.table_name}_cleaned_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(cleaned_file, 'w', encoding='utf-8') as f:
            json.dump(valid_data, f, ensure_ascii=False, indent=2)
        
        logger.info(f"💾 清洗后数据已保存：{cleaned_file}")
        
        return valid_data
    
    def compress_data(self, cleaned_data: List[Dict]) -> List[Dict]:
        """
        步骤 3: 数据压缩
        
        压缩策略：
        1. 移除 raw_data 字段（如果存在）
        2. 压缩过长的文本字段
        3. 移除不必要的元数据
        
        Args:
            cleaned_data: 清洗后的数据列表
            
        Returns:
            压缩后的数据列表
        """
        logger.info("=" * 60)
        logger.info(f"步骤 3: 数据压缩 - {self.table_name}")
        logger.info("=" * 60)
        
        start_time = datetime.now()
        compressed_data = []
        bytes_saved = 0
        
        for record in cleaned_data:
            compressed_record = record.copy()
            
            # 1. 移除 raw_data 字段
            if 'raw_data' in compressed_record:
                raw_data_size = len(json.dumps(compressed_record['raw_data'], ensure_ascii=False))
                del compressed_record['raw_data']
                bytes_saved += raw_data_size
            
            # 2. 压缩过长的描述字段（保留前 1000 字符）
            for field in ['description', 'description_zh', 'product_description', 'intended_use']:
                if field in compressed_record and isinstance(compressed_record[field], str):
                    if len(compressed_record[field]) > 1000:
                        original_length = len(compressed_record[field])
                        compressed_record[field] = compressed_record[field][:1000] + '...'
                        bytes_saved += original_length - 1000
            
            compressed_data.append(compressed_record)
        
        self.stats['compressed'] = len(compressed_data)
        logger.info(f"✅ 压缩完成：节省约 {bytes_saved / 1024:.2f} KB")
        logger.info(f"⏱️  压缩耗时：{(datetime.now() - start_time).total_seconds():.2f} 秒")
        
        # 保存压缩后的数据
        compressed_file = self.data_dir / f"{self.table_name}_compressed_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(compressed_file, 'w', encoding='utf-8') as f:
            json.dump(compressed_data, f, ensure_ascii=False, indent=2)
        
        logger.info(f"💾 压缩后数据已保存：{compressed_file}")
        
        # 创建 gzip 压缩版本（用于归档）
        gzip_file = self.data_dir / f"{self.table_name}_compressed_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json.gz"
        with open(compressed_file, 'rb') as f_in:
            with gzip.open(gzip_file, 'wb') as f_out:
                shutil.copyfileobj(f_in, f_out)
        
        logger.info(f"📦 Gzip 归档已创建：{gzip_file}")
        
        return compressed_data
    
    def upload_to_supabase(self, compressed_data: List[Dict], batch_size: int = 100) -> bool:
        """
        步骤 4: 上传到 Supabase
        
        Args:
            compressed_data: 压缩后的数据列表
            batch_size: 每批次上传的记录数
            
        Returns:
            是否成功
        """
        logger.info("=" * 60)
        logger.info(f"步骤 4: 上传到 Supabase - {self.table_name}")
        logger.info("=" * 60)
        
        start_time = datetime.now()
        total_records = len(compressed_data)
        
        if total_records == 0:
            logger.warning("⚠️  没有数据需要上传")
            return True
        
        logger.info(f"准备上传 {total_records} 条记录，批次大小：{batch_size}")
        
        successful_uploads = 0
        failed_uploads = 0
        
        # 分批上传
        for i in range(0, total_records, batch_size):
            batch_num = (i // batch_size) + 1
            total_batches = (total_records + batch_size - 1) // batch_size
            
            logger.info(f"上传批次 {batch_num}/{total_batches} (记录 {i+1}-{min(i+batch_size, total_records)})")
            
            batch = compressed_data[i:i + batch_size]
            
            try:
                # 使用 insert 而非 upsert 以提高性能
                response = self.client.table(self.table_name).insert(batch).execute()
                
                if response.data:
                    successful_uploads += len(batch)
                    logger.info(f"✅ 批次 {batch_num} 上传成功：{len(batch)} 条记录")
                else:
                    failed_uploads += len(batch)
                    logger.error(f"❌ 批次 {batch_num} 上传失败")
                
                # 避免请求过快
                time.sleep(0.5)
                
            except Exception as e:
                failed_uploads += len(batch)
                logger.error(f"❌ 批次 {batch_num} 上传异常：{e}")
                
                # 尝试单条记录上传（用于调试）
                if batch_size > 1:
                    logger.info("尝试单条记录上传...")
                    self._upload_batch_individually(batch, batch_num)
        
        self.stats['uploaded'] = successful_uploads
        self.stats['failed'] = failed_uploads
        
        logger.info("=" * 60)
        logger.info(f"✅ 上传完成")
        logger.info(f"成功：{successful_uploads} 条")
        logger.info(f"失败：{failed_uploads} 条")
        logger.info(f"⏱️  上传耗时：{(datetime.now() - start_time).total_seconds():.2f} 秒")
        logger.info("=" * 60)
        
        return failed_uploads == 0
    
    def run_pipeline(self, collector, collect_method: str, **kwargs) -> Dict[str, int]:
        """
        运行完整的数据管道
        
        Args:
            collector: 采集器实例
            collect_method: 采集方法名
            **kwargs: 采集方法参数
            
        Returns:
            统计信息字典
        """
        logger.info("🚀 开始运行数据管道")
        logger.info(f"表名：{self.table_name}")
        logger.info(f"采集方法：{collect_method}")
        
        pipeline_start = datetime.now()
        
        try:
            # 步骤 1: 采集
            raw_data = self.collect_data(collector, collect_method, **kwargs)
            
            if not raw_data:
                logger.warning("⚠️  采集到的数据为空，终止管道")
                return self.stats
            
            # 步骤 2: 清洗
            cleaned_data = self.clean_data(raw_data)
            
            if not cleaned_data:
                logger.warning("⚠️  清洗后数据为空，终止管道")
                return self.stats
            
            # 步骤 3: 压缩
            compressed_data = self.compress_data(cleaned_data)
            
            if not compressed_data:
                logger.warning("⚠️  压缩后数据为空，终止管道")
                return self.stats
            
            # 步骤 4: 上传
            success = self.upload_to_supabase(compressed_data)
            
            if success:
                logger.info("🎉 数据管道执行成功！")
            else:
                logger.warning("⚠️  数据管道执行完成，但有部分记录上传失败")
            
        except Exception as e:
            logger.error(f"❌ 管道执行异常：{e}", exc_info=True)
            raise
        
        finally:
            self.stats['end_time'] = datetime.now().isoformat()
            total_time = (datetime.now() - pipeline_start).total_seconds()
            
            logger.info("=" * 60)
            logger.info("📊 管道执行统计")
            logger.info("=" * 60)
            logger.info(f"采集：{self.stats['collected']} 条")
            logger.info(f"清洗后：{self.stats['cleaned']} 条")
            logger.info(f"压缩后：{self.stats['compressed']} 条")
            logger.info(f"上传成功：{self.stats['uploaded']} 条")
            logger.info(f"上传失败：{self.stats['failed']} 条")
            logger.info(f"总耗时：{total_time:.2f} 秒 ({total_time/60:.2f} 分钟)")
            logger.info("=" * 60)
        
        return self.stats
    
    def _generate_record_hash(self, record: Dict) -> str:
        """生成记录的唯一哈希值"""
        import hashlib
        
        # 提取关键字段（根据表名不同而不同）
        if self.table_name == 'fda_registrations':
            key_fields = {
                'fei_number': record.get('fei_number'),
                'registration_number': record.get('registration_number'),
            }
        elif self.table_name == 'nmpa_registrations':
            key_fields = {
                'registration_number': record.get('registration_number'),
                'product_name': record.get('product_name'),
            }
        elif self.table_name == 'eudamed_registrations':
            key_fields = {
                'actor_id': record.get('actor_id'),
                'srn': record.get('srn'),
            }
        else:
            # 默认使用所有字段
            key_fields = record
        
        # 生成哈希
        hash_str = json.dumps(key_fields, sort_keys=True, ensure_ascii=False)
        return hashlib.md5(hash_str.encode('utf-8')).hexdigest()
    
    def _normalize_record(self, record: Dict):
        """标准化记录字段"""
        # 移除空字符串字段
        for key, value in list(record.items()):
            if isinstance(value, str) and value.strip() == '':
                record[key] = None
            
            # 标准化日期格式
            if key.endswith('_date') and isinstance(value, str):
                try:
                    # 尝试解析并标准化日期
                    if 'T' in value:
                        record[key] = value.split('T')[0]
                except:
                    pass
    
    def _is_valid_record(self, record: Dict) -> bool:
        """验证记录是否有效"""
        # 基本验证规则
        if not record:
            return False
        
        # 根据表名添加特定验证规则
        if self.table_name == 'fda_registrations':
            return bool(record.get('fei_number') or record.get('registration_number'))
        elif self.table_name == 'nmpa_registrations':
            return bool(record.get('registration_number'))
        elif self.table_name == 'eudamed_registrations':
            return bool(record.get('actor_id') or record.get('srn'))
        
        # 默认验证：至少有一个非空字段
        return any(v is not None for v in record.values())
    
    def _upload_batch_individually(self, batch: List[Dict], batch_num: int):
        """单条记录上传（用于调试和错误恢复）"""
        success_count = 0
        
        for i, record in enumerate(batch):
            try:
                self.client.table(self.table_name).insert(record).execute()
                success_count += 1
                time.sleep(0.1)
            except Exception as e:
                logger.error(f"记录 {i+1} 上传失败：{e}")
        
        logger.info(f"批次 {batch_num} 单条上传结果：{success_count}/{len(batch)} 成功")


def main():
    """示例用法"""
    logger.info("数据管道示例")
    
    # 示例：使用 FDA 采集器
    # from fda_collector import FDACollector
    
    # collector = FDACollector()
    # pipeline = DataPipeline('fda_registrations')
    
    # stats = pipeline.run_pipeline(
    #     collector,
    #     'collect_all_data',
    #     companies=True,
    #     products=True
    # )
    
    # logger.info(f"执行统计：{stats}")
    
    logger.info("请根据实际需求调用相应的采集器和方法")


if __name__ == '__main__':
    main()
