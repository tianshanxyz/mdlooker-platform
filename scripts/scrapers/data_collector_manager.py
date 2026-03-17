#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
数据采集管理脚本
统一管理和调度所有监管机构的数据采集任务

用法：
    python data_collector_manager.py --all          # 采集所有数据
    python data_collector_manager.py --fda          # 只采集 FDA 数据
    python data_collector_manager.py --nmpa         # 只采集 NMPA 数据
    python data_collector_manager.py --eudamed      # 只采集 EUDAMED 数据
    python data_collector_manager.py --companies    # 只采集企业数据
    python data_collector_manager.py --products     # 只采集产品数据
"""

import argparse
import json
import time
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Any, Optional
import logging

# 导入各采集器
from fda_collector import FDACollector
from nmpa_collector import NMPACollector
from eudamed_collector import EUDAMEDCollector
from other_regulators_collector import (
    PMDACollector, 
    HealthCanadaCollector, 
    TGACollector, 
    MFDSCollector, 
    SGACollector
)

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('data_collection.log', encoding='utf-8'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)


class DataCollectorManager:
    """数据采集管理器"""
    
    def __init__(self, output_dir: str = 'output'):
        """
        初始化管理器
        
        Args:
            output_dir: 数据输出目录
        """
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        # 初始化各采集器
        self.collectors = {
            'fda': FDACollector(),
            'nmpa': NMPACollector(),
            'eudamed': EUDAMEDCollector(),
            'pmda': PMDACollector(),
            'health_canada': HealthCanadaCollector(),
            'tga': TGACollector(),
            'mfds': MFDSCollector(),
            'hsa': SGACollector(),
        }
        
        # 采集统计
        self.stats = {
            'start_time': None,
            'end_time': None,
            'regulators': {},
            'total_companies': 0,
            'total_products': 0,
        }
    
    def collect_fda_data(self, 
                        companies: bool = True,
                        products: bool = True,
                        sample_keywords: Optional[List[str]] = None):
        """
        采集 FDA 数据
        
        Args:
            companies: 是否采集企业数据
            products: 是否采集产品数据
            sample_keywords: 示例关键词列表
        """
        logger.info("=" * 60)
        logger.info("开始采集 FDA 数据")
        logger.info("=" * 60)
        
        collector = self.collectors['fda']
        regulator_stats = {'companies': 0, 'products': 0}
        
        if sample_keywords is None:
            sample_keywords = ['Medtronic', 'Johnson & Johnson', 'Abbott', 'Boston Scientific']
        
        # 采集企业数据
        if companies:
            logger.info("采集 FDA 注册企业...")
            all_companies = []
            
            for keyword in sample_keywords:
                companies = collector.search_companies(
                    company_name=keyword,
                    limit=100
                )
                all_companies.extend(companies)
                time.sleep(1)  # 避免限流
            
            if all_companies:
                self._save_data(all_companies, 'fda_companies.json')
                regulator_stats['companies'] = len(all_companies)
                logger.info(f"采集到 {len(all_companies)} 家 FDA 企业")
        
        # 采集产品数据（510k 和 PMA）
        if products:
            logger.info("采集 FDA 产品注册...")
            all_products = []
            
            # 510(k)
            for keyword in sample_keywords:
                clearances = collector.search_510k(
                    company_name=keyword,
                    limit=200
                )
                all_products.extend(clearances)
                time.sleep(1)
            
            # PMA
            for keyword in sample_keywords:
                approvals = collector.search_pma(
                    company_name=keyword,
                    limit=100
                )
                all_products.extend(approvals)
                time.sleep(1)
            
            if all_products:
                self._save_data(all_products, 'fda_products.json')
                regulator_stats['products'] = len(all_products)
                logger.info(f"采集到 {len(all_products)} 个 FDA 产品")
        
        self.stats['regulators']['fda'] = regulator_stats
        self.stats['total_companies'] += regulator_stats['companies']
        self.stats['total_products'] += regulator_stats['products']
    
    def collect_nmpa_data(self,
                         companies: bool = True,
                         products: bool = True,
                         sample_keywords: Optional[List[str]] = None):
        """采集 NMPA 数据"""
        logger.info("=" * 60)
        logger.info("开始采集 NMPA 数据")
        logger.info("=" * 60)
        
        collector = self.collectors['nmpa']
        regulator_stats = {'companies': 0, 'products': 0}
        
        if sample_keywords is None:
            sample_keywords = ['迈瑞', '联影', '微创', '乐普']
        
        # 采集企业数据
        if companies:
            logger.info("采集 NMPA 企业...")
            all_companies = []
            
            for keyword in sample_keywords:
                companies = collector.search_companies(
                    company_name=keyword,
                    limit=100
                )
                all_companies.extend(companies)
                time.sleep(1)
            
            if all_companies:
                self._save_data(all_companies, 'nmpa_companies.json')
                regulator_stats['companies'] = len(all_companies)
                logger.info(f"采集到 {len(all_companies)} 家 NMPA 企业")
        
        # 采集产品数据
        if products:
            logger.info("采集 NMPA 产品注册...")
            all_products = []
            
            for keyword in sample_keywords:
                products = collector.search_products(
                    company_name=keyword,
                    limit=200
                )
                all_products.extend(products)
                time.sleep(1)
            
            if all_products:
                self._save_data(all_products, 'nmpa_products.json')
                regulator_stats['products'] = len(all_products)
                logger.info(f"采集到 {len(all_products)} 个 NMPA 产品")
        
        self.stats['regulators']['nmpa'] = regulator_stats
        self.stats['total_companies'] += regulator_stats['companies']
        self.stats['total_products'] += regulator_stats['products']
    
    def collect_eudamed_data(self,
                            companies: bool = True,
                            products: bool = True,
                            sample_keywords: Optional[List[str]] = None):
        """采集 EUDAMED 数据"""
        logger.info("=" * 60)
        logger.info("开始采集 EUDAMED 数据")
        logger.info("=" * 60)
        
        collector = self.collectors['eudamed']
        regulator_stats = {'companies': 0, 'products': 0}
        
        if sample_keywords is None:
            sample_keywords = ['Siemens', 'Philips', 'Medtronic', 'Roche']
        
        # 采集经济运营商（企业）
        if companies:
            logger.info("采集 EUDAMED 经济运营商...")
            all_actors = []
            
            for keyword in sample_keywords:
                actors = collector.search_economic_operators(
                    actor_name=keyword,
                    limit=100
                )
                all_actors.extend(actors)
                time.sleep(1)
            
            if all_actors:
                self._save_data(all_actors, 'eudamed_actors.json')
                regulator_stats['companies'] = len(all_actors)
                logger.info(f"采集到 {len(all_actors)} 个 EUDAMED 经济运营商")
        
        # 采集器械数据
        if products:
            logger.info("采集 EUDAMED 器械...")
            all_devices = []
            
            for keyword in sample_keywords:
                devices = collector.search_devices(
                    manufacturer=keyword,
                    limit=200
                )
                all_devices.extend(devices)
                time.sleep(1)
            
            if all_devices:
                self._save_data(all_devices, 'eudamed_devices.json')
                regulator_stats['products'] = len(all_devices)
                logger.info(f"采集到 {len(all_devices)} 个 EUDAMED 器械")
        
        self.stats['regulators']['eudamed'] = regulator_stats
        self.stats['total_companies'] += regulator_stats['companies']
        self.stats['total_products'] += regulator_stats['products']
    
    def collect_other_regulators_data(self,
                                     companies: bool = True,
                                     products: bool = True):
        """采集其他监管机构数据"""
        logger.info("=" * 60)
        logger.info("开始采集其他监管机构数据")
        logger.info("=" * 60)
        
        other_collectors = ['pmda', 'health_canada', 'tga', 'mfds', 'hsa']
        
        for regulator in other_collectors:
            logger.info(f"采集 {regulator.upper()} 数据...")
            collector = self.collectors[regulator]
            regulator_stats = {'companies': 0, 'products': 0}
            
            # 示例采集
            if products:
                devices = collector.search_devices(limit=100)
                if devices:
                    self._save_data(devices, f'{regulator}_devices.json')
                    regulator_stats['products'] = len(devices)
            
            self.stats['regulators'][regulator] = regulator_stats
            self.stats['total_products'] += regulator_stats['products']
    
    def _save_data(self, data: List[Dict], filename: str):
        """
        保存数据到 JSON 文件
        
        Args:
            data: 数据列表
            filename: 文件名
        """
        filepath = self.output_dir / filename
        try:
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            logger.info(f"数据已保存到 {filepath}")
        except Exception as e:
            logger.error(f"保存数据失败：{e}")
    
    def save_statistics(self):
        """保存采集统计信息"""
        self.stats['end_time'] = datetime.now().isoformat()
        
        # 计算总耗时
        start = datetime.fromisoformat(self.stats['start_time'])
        end = datetime.fromisoformat(self.stats['end_time'])
        duration = (end - start).total_seconds()
        
        stats_with_duration = {
            **self.stats,
            'duration_seconds': duration,
            'duration_minutes': duration / 60,
        }
        
        filepath = self.output_dir / 'collection_statistics.json'
        self._save_data([stats_with_duration], str(filepath))
        logger.info(f"采集统计：{stats_with_duration}")
    
    def run_all(self, companies: bool = True, products: bool = True):
        """
        运行所有采集任务
        
        Args:
            companies: 是否采集企业数据
            products: 是否采集产品数据
        """
        self.stats['start_time'] = datetime.now().isoformat()
        
        logger.info("🚀 开始执行全部数据采集任务")
        
        # 采集主要监管机构
        self.collect_fda_data(companies, products)
        time.sleep(2)
        
        self.collect_nmpa_data(companies, products)
        time.sleep(2)
        
        self.collect_eudamed_data(companies, products)
        time.sleep(2)
        
        # 采集其他监管机构
        self.collect_other_regulators_data(companies, products)
        
        # 保存统计信息
        self.save_statistics()
        
        logger.info("✅ 所有数据采集任务完成")
        logger.info(f"📊 总计：{self.stats['total_companies']} 家企业，{self.stats['total_products']} 个产品")


def main():
    """主函数"""
    parser = argparse.ArgumentParser(description='医疗器械监管数据采集管理器')
    parser.add_argument('--all', action='store_true', help='采集所有数据')
    parser.add_argument('--fda', action='store_true', help='只采集 FDA 数据')
    parser.add_argument('--nmpa', action='store_true', help='只采集 NMPA 数据')
    parser.add_argument('--eudamed', action='store_true', help='只采集 EUDAMED 数据')
    parser.add_argument('--companies', action='store_true', help='只采集企业数据')
    parser.add_argument('--products', action='store_true', help='只采集产品数据')
    parser.add_argument('--output', type=str, default='output', help='输出目录')
    
    args = parser.parse_args()
    
    # 创建管理器
    manager = DataCollectorManager(output_dir=args.output)
    
    # 根据参数执行采集
    if args.all:
        manager.run_all(
            companies=not args.products,
            products=not args.companies
        )
    elif args.fda:
        manager.collect_fda_data(
            companies=not args.products,
            products=not args.companies
        )
    elif args.nmpa:
        manager.collect_nmpa_data(
            companies=not args.products,
            products=not args.companies
        )
    elif args.eudamed:
        manager.collect_eudamed_data(
            companies=not args.products,
            products=not args.companies
        )
    else:
        # 默认采集所有
        manager.run_all()


if __name__ == '__main__':
    main()
