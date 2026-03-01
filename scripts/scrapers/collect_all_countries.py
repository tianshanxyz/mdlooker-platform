#!/usr/bin/env python3
"""
三国医疗器械市场数据完整采集主程序
同时采集新加坡、日本、沙特的完整数据
"""

import sys
from pathlib import Path

# 添加项目路径
project_root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(project_root))

from scripts.scrapers.complete_market_data_collector import CompleteMarketDataCollector
from scripts.scrapers.japan_pmda_collector import JapanPMDACollector
from scripts.scrapers.saudi_sfda_collector import SaudiSFDACollector

def main():
    """主函数 - 采集所有三国数据"""
    
    print("=" * 80)
    print("医疗器械市场数据完整采集系统")
    print("采集国家: 新加坡 (HSA) | 日本 (PMDA) | 沙特阿拉伯 (SFDA)")
    print("=" * 80)
    
    # 创建主采集器
    collector = CompleteMarketDataCollector()
    
    # 1. 采集新加坡数据
    print("\n[1/3] 开始采集新加坡数据...")
    collector.collect_singapore_complete_data()
    
    # 2. 采集日本数据
    print("\n[2/3] 开始采集日本数据...")
    japan_collector = JapanPMDACollector(collector)
    japan_collector.collect_japan_complete_data()
    
    # 3. 采集沙特数据
    print("\n[3/3] 开始采集沙特数据...")
    saudi_collector = SaudiSFDACollector(collector)
    saudi_collector.collect_saudi_complete_data()
    
    # 保存所有数据
    print("\n保存所有数据...")
    collector.save_all_data()
    
    # 生成最终报告
    print("\n" + "=" * 80)
    print("数据采集完成!")
    print("=" * 80)
    
    # 统计信息
    sg_reg = len([r for r in collector.registrations if r.country == "Singapore"])
    jp_reg = len([r for r in collector.registrations if r.country == "Japan"])
    sa_reg = len([r for r in collector.registrations if r.country == "Saudi Arabia"])
    
    sg_mkt = len([m for m in collector.market_sizes if m.country == "Singapore"])
    jp_mkt = len([m for m in collector.market_sizes if m.country == "Japan"])
    sa_mkt = len([m for m in collector.market_sizes if m.country == "Saudi Arabia"])
    
    sg_comp = len([c for c in collector.companies if c.country_focus == "Singapore"])
    jp_comp = len([c for c in collector.companies if c.country_focus == "Japan"])
    sa_comp = len([c for c in collector.companies if c.country_focus == "Saudi Arabia"])
    
    sg_pol = len([p for p in collector.policies if p.country == "Singapore"])
    jp_pol = len([p for p in collector.policies if p.country == "Japan"])
    sa_pol = len([p for p in collector.policies if p.country == "Saudi Arabia"])
    
    sg_trade = len([t for t in collector.trade_records if t.country == "Singapore"])
    jp_trade = len([t for t in collector.trade_records if t.country == "Japan"])
    sa_trade = len([t for t in collector.trade_records if t.country == "Saudi Arabia"])
    
    print(f"\n{'国家':<15} {'注册数据':<10} {'市场数据':<10} {'企业':<8} {'政策':<8} {'贸易':<8}")
    print("-" * 80)
    print(f"{'新加坡 (HSA)':<15} {sg_reg:<10} {sg_mkt:<10} {sg_comp:<8} {sg_pol:<8} {sg_trade:<8}")
    print(f"{'日本 (PMDA)':<15} {jp_reg:<10} {jp_mkt:<10} {jp_comp:<8} {jp_pol:<8} {jp_trade:<8}")
    print(f"{'沙特 (SFDA)':<15} {sa_reg:<10} {sa_mkt:<10} {sa_comp:<8} {sa_pol:<8} {sa_trade:<8}")
    print("-" * 80)
    print(f"{'总计':<15} {sg_reg+jp_reg+sa_reg:<10} {sg_mkt+jp_mkt+sa_mkt:<10} {sg_comp+jp_comp+sa_comp:<8} {sg_pol+jp_pol+sa_pol:<8} {sg_trade+jp_trade+sa_trade:<8}")
    print("=" * 80)
    
    print(f"\n数据保存位置: {collector.output_dir}")
    print("\n文件结构:")
    print("  - registrations/     产品注册数据 (JSON/CSV)")
    print("  - market_size/       市场规模数据 (JSON/CSV)")
    print("  - companies/         企业名录 (JSON/CSV)")
    print("  - policies/          政策法规 (JSON/CSV)")
    print("  - trade/             进出口贸易数据 (JSON/CSV)")
    print("  - collection_summary.json  汇总报告")

if __name__ == '__main__':
    main()
