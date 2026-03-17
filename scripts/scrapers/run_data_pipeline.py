#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
一键运行数据采集管道（生产环境）
用法：python3 run_data_pipeline.py
"""

import sys
import os
from pathlib import Path

# 添加项目根目录到路径
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))
sys.path.insert(0, str(Path(__file__).parent))

from dotenv import load_dotenv
from datetime import datetime

# 加载环境变量
env_path = project_root / '.env.local'
load_dotenv(env_path)

# 导入采集器和管道
from fda_collector import FDACollector
from nmpa_collector import NMPACollector
from eudamed_collector import EUDAMEDCollector
from other_regulators_collector import PMDACollector, HealthCanadaCollector
from data_pipeline import DataPipeline


def print_banner(text: str):
    """打印横幅"""
    print("\n" + "=" * 70)
    print(f"  {text}")
    print("=" * 70 + "\n")


def collect_regulator_data(name: str, collector, pipeline_table: str, 
                          method: str, **kwargs):
    """采集单个监管机构的数据"""
    print_banner(f"采集 {name} 数据")
    
    try:
        pipeline = DataPipeline(pipeline_table)
        stats = pipeline.run_pipeline(collector, method, **kwargs)
        
        print(f"\n✅ {name} 数据采集完成")
        print(f"   采集：{stats['collected']} 条")
        print(f"   清洗后：{stats['cleaned']} 条")
        print(f"   压缩后：{stats['compressed']} 条")
        print(f"   上传成功：{stats['uploaded']} 条")
        print(f"   上传失败：{stats['failed']} 条")
        
        return stats
        
    except Exception as e:
        print(f"\n❌ {name} 数据采集失败：{e}")
        import traceback
        traceback.print_exc()
        return None


def main():
    """主函数"""
    print_banner("MDLooker 数据采集管道 - 生产环境")
    print(f"开始时间：{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"数据目录：{project_root}/scripts/scrapers/data/pipeline")
    
    # 检查环境变量
    if not os.getenv('NEXT_PUBLIC_SUPABASE_URL') or \
       not os.getenv('SUPABASE_SERVICE_ROLE_KEY'):
        print("❌ 错误：Supabase 环境变量未配置")
        print("   请检查 .env.local 文件")
        return 1
    
    print("✅ Supabase 配置检查通过")
    
    # 总统计
    all_stats = {}
    total_collected = 0
    total_uploaded = 0
    
    try:
        # 1. FDA 数据
        fda_stats = collect_regulator_data(
            name="FDA (美国)",
            collector=FDACollector(),
            pipeline_table='fda_registrations',
            method='collect_all_data',
            companies=True,
            products=True
        )
        if fda_stats:
            all_stats['fda'] = fda_stats
            total_collected += fda_stats['collected']
            total_uploaded += fda_stats['uploaded']
        
        # 2. NMPA 数据（中国）
        nmpa_stats = collect_regulator_data(
            name="NMPA (中国)",
            collector=NMPACollector(),
            pipeline_table='nmpa_registrations',
            method='collect_all_companies',
            max_pages=10
        )
        if nmpa_stats:
            all_stats['nmpa'] = nmpa_stats
            total_collected += nmpa_stats['collected']
            total_uploaded += nmpa_stats['uploaded']
        
        # 3. EUDAMED 数据（欧盟）
        eudamed_stats = collect_regulator_data(
            name="EUDAMED (欧盟)",
            collector=EUDAMEDCollector(),
            pipeline_table='eudamed_registrations',
            method='collect_all_data',
            max_pages=5
        )
        if eudamed_stats:
            all_stats['eudamed'] = eudamed_stats
            total_collected += eudamed_stats['collected']
            total_uploaded += eudamed_stats['uploaded']
        
        # 4. PMDA 数据（日本）
        pmda_stats = collect_regulator_data(
            name="PMDA (日本)",
            collector=PMDACollector(),
            pipeline_table='pmda_registrations',
            method='collect_all_data',
            max_pages=5
        )
        if pmda_stats:
            all_stats['pmda'] = pmda_stats
            total_collected += pmda_stats['collected']
            total_uploaded += pmda_stats['uploaded']
        
        # 5. Health Canada 数据（加拿大）
        hc_stats = collect_regulator_data(
            name="Health Canada (加拿大)",
            collector=HealthCanadaCollector(),
            pipeline_table='health_canada_registrations',
            method='collect_all_data',
            max_pages=5
        )
        if hc_stats:
            all_stats['health_canada'] = hc_stats
            total_collected += hc_stats['collected']
            total_uploaded += hc_stats['uploaded']
        
    except KeyboardInterrupt:
        print("\n\n⚠️  用户中断采集")
        print("已采集的数据已保存到本地，可以继续运行此脚本继续采集")
        return 1
    
    except Exception as e:
        print(f"\n❌ 采集过程中发生异常：{e}")
        import traceback
        traceback.print_exc()
        return 1
    
    # 打印总统计
    print_banner("数据采集完成")
    
    print(f"总采集：{total_collected} 条记录")
    print(f"总上传：{total_uploaded} 条记录")
    print(f"总耗时：{(datetime.now() - datetime.now()).total_seconds():.2f} 秒")
    
    print("\n各监管机构统计:")
    for regulator, stats in all_stats.items():
        print(f"  {regulator.upper()}:")
        print(f"    采集：{stats['collected']} 条")
        print(f"    上传：{stats['uploaded']} 条")
        if stats['failed'] > 0:
            print(f"    失败：{stats['failed']} 条 ⚠️")
    
    print("\n" + "=" * 70)
    print("✅ 所有数据采集完成！")
    print("=" * 70)
    
    print("\n下一步操作:")
    print("1. 检查数据文件：ls -lh scripts/scrapers/data/pipeline/")
    print("2. 查看日志文件：tail -f scripts/scrapers/data_pipeline.log")
    print("3. 验证 Supabase 数据：访问 Supabase Dashboard 查看表数据")
    print("4. 启动应用：npm run start")
    
    return 0


if __name__ == '__main__':
    exit_code = main()
    sys.exit(exit_code)
