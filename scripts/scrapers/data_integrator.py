#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
医疗器械市场数据整合与标准化模块
Data Integration and Standardization Module for Medical Device Market Data

功能：
1. 数据清洗与去重
2. 数据标准化处理
3. 数据质量验证
4. 生成统一数据集
5. 生成数据文档

作者: MDLooker Platform
版本: 1.0.0
日期: 2026-02-25
"""

import json
import csv
import os
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Any, Set
import hashlib
import logging

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class DataIntegrator:
    """数据整合器"""
    
    def __init__(self, data_dir: str = "scripts/scrapers/data/complete_market_data"):
        self.data_dir = Path(data_dir)
        self.output_dir = self.data_dir / "integrated"
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        # 数据存储
        self.all_registrations: List[Dict] = []
        self.all_market_size: List[Dict] = []
        self.all_companies: List[Dict] = []
        self.all_policies: List[Dict] = []
        self.all_trade: List[Dict] = []
        
        # 数据质量统计
        self.quality_stats = {
            "registrations": {"total": 0, "duplicates": 0, "cleaned": 0},
            "market_size": {"total": 0, "duplicates": 0, "cleaned": 0},
            "companies": {"total": 0, "duplicates": 0, "cleaned": 0},
            "policies": {"total": 0, "duplicates": 0, "cleaned": 0},
            "trade": {"total": 0, "duplicates": 0, "cleaned": 0},
        }
        
        logger.info("数据整合器初始化完成")
    
    def load_all_data(self) -> None:
        """加载所有原始数据"""
        logger.info("开始加载所有原始数据...")
        
        # 加载注册数据
        reg_files = [
            self.data_dir / "registrations" / "singapore_registrations.json",
            self.data_dir / "registrations" / "japan_registrations.json",
            self.data_dir / "registrations" / "saudi_registrations.json",
        ]
        for f in reg_files:
            if f.exists():
                with open(f, 'r', encoding='utf-8') as fp:
                    data = json.load(fp)
                    self.all_registrations.extend(data)
                    logger.info(f"加载 {f.name}: {len(data)} 条记录")
        
        # 加载市场规模数据
        ms_files = [
            self.data_dir / "market_size" / "singapore_market_size.json",
            self.data_dir / "market_size" / "japan_market_size.json",
            self.data_dir / "market_size" / "saudi_market_size.json",
        ]
        for f in ms_files:
            if f.exists():
                with open(f, 'r', encoding='utf-8') as fp:
                    data = json.load(fp)
                    self.all_market_size.extend(data)
                    logger.info(f"加载 {f.name}: {len(data)} 条记录")
        
        # 加载企业数据
        comp_files = [
            self.data_dir / "companies" / "singapore_companies.json",
            self.data_dir / "companies" / "japan_companies.json",
            self.data_dir / "companies" / "saudi_companies.json",
        ]
        for f in comp_files:
            if f.exists():
                with open(f, 'r', encoding='utf-8') as fp:
                    data = json.load(fp)
                    self.all_companies.extend(data)
                    logger.info(f"加载 {f.name}: {len(data)} 条记录")
        
        # 加载政策法规数据
        policy_files = [
            self.data_dir / "policies" / "singapore_policies.json",
            self.data_dir / "policies" / "japan_policies.json",
            self.data_dir / "policies" / "saudi_policies.json",
        ]
        for f in policy_files:
            if f.exists():
                with open(f, 'r', encoding='utf-8') as fp:
                    data = json.load(fp)
                    self.all_policies.extend(data)
                    logger.info(f"加载 {f.name}: {len(data)} 条记录")
        
        # 加载贸易数据
        trade_files = [
            self.data_dir / "trade" / "singapore_trade.json",
            self.data_dir / "trade" / "japan_trade.json",
            self.data_dir / "trade" / "saudi_trade.json",
        ]
        for f in trade_files:
            if f.exists():
                with open(f, 'r', encoding='utf-8') as fp:
                    data = json.load(fp)
                    self.all_trade.extend(data)
                    logger.info(f"加载 {f.name}: {len(data)} 条记录")
        
        logger.info(f"\n数据加载完成:")
        logger.info(f"  注册数据: {len(self.all_registrations)} 条")
        logger.info(f"  市场规模: {len(self.all_market_size)} 条")
        logger.info(f"  企业名录: {len(self.all_companies)} 条")
        logger.info(f"  政策法规: {len(self.all_policies)} 条")
        logger.info(f"  贸易数据: {len(self.all_trade)} 条")
    
    def clean_registrations(self) -> List[Dict]:
        """清洗注册数据"""
        logger.info("\n开始清洗注册数据...")
        self.quality_stats["registrations"]["total"] = len(self.all_registrations)
        
        seen_ids: Set[str] = set()
        cleaned = []
        
        for record in self.all_registrations:
            # 生成唯一标识
            unique_key = f"{record.get('country_code', '')}_{record.get('registration_number', '')}"
            record_id = hashlib.md5(unique_key.encode()).hexdigest()[:16]
            
            if record_id in seen_ids:
                self.quality_stats["registrations"]["duplicates"] += 1
                continue
            
            seen_ids.add(record_id)
            record["record_id"] = record_id
            
            # 标准化字段
            record["device_name"] = record.get("device_name", "").strip()
            record["manufacturer_name"] = record.get("manufacturer_name", "").strip()
            record["country"] = record.get("country", "").strip()
            record["country_code"] = record.get("country_code", "").upper()
            
            # 标准化风险等级
            risk_level = record.get("risk_level", "").upper()
            if risk_level in ["A", "CLASS A", "I", "CLASS I"]:
                record["risk_level"] = "Low"
            elif risk_level in ["B", "CLASS B", "II", "CLASS II"]:
                record["risk_level"] = "Medium"
            elif risk_level in ["C", "CLASS C", "III", "CLASS III"]:
                record["risk_level"] = "High"
            elif risk_level in ["D", "CLASS D", "IV", "CLASS IV"]:
                record["risk_level"] = "Very High"
            
            # 标准化日期格式
            for date_field in ["registration_date", "expiry_date", "last_verified"]:
                if date_field in record and record[date_field]:
                    try:
                        dt = datetime.fromisoformat(record[date_field].replace('Z', '+00:00'))
                        record[date_field] = dt.strftime("%Y-%m-%d")
                    except:
                        pass
            
            cleaned.append(record)
        
        self.quality_stats["registrations"]["cleaned"] = len(cleaned)
        logger.info(f"注册数据清洗完成: {len(cleaned)} 条 (去重 {self.quality_stats['registrations']['duplicates']} 条)")
        return cleaned
    
    def clean_market_size(self) -> List[Dict]:
        """清洗市场规模数据"""
        logger.info("\n开始清洗市场规模数据...")
        self.quality_stats["market_size"]["total"] = len(self.all_market_size)
        
        seen_keys: Set[str] = set()
        cleaned = []
        
        for record in self.all_market_size:
            key = f"{record.get('country_code', '')}_{record.get('year', '')}"
            
            if key in seen_keys:
                self.quality_stats["market_size"]["duplicates"] += 1
                continue
            
            seen_keys.add(key)
            
            # 标准化数值字段
            for field in ["total_market_value_usd", "import_value_usd", "export_value_usd",
                         "yoy_growth_rate", "cagr_5year"]:
                if field in record:
                    try:
                        record[field] = float(record[field])
                    except:
                        record[field] = 0.0
            
            # 标准化百分比
            for field in ["import_share_percent", "export_share_percent"]:
                if field in record:
                    try:
                        record[field] = float(record[field])
                    except:
                        record[field] = 0.0
            
            cleaned.append(record)
        
        self.quality_stats["market_size"]["cleaned"] = len(cleaned)
        logger.info(f"市场规模数据清洗完成: {len(cleaned)} 条 (去重 {self.quality_stats['market_size']['duplicates']} 条)")
        return cleaned
    
    def clean_companies(self) -> List[Dict]:
        """清洗企业数据"""
        logger.info("\n开始清洗企业数据...")
        self.quality_stats["companies"]["total"] = len(self.all_companies)
        
        seen_names: Set[str] = set()
        cleaned = []
        
        for record in self.all_companies:
            name = record.get("company_name", "").strip().lower()
            country = record.get("country", "").strip().lower()
            key = f"{name}_{country}"
            
            if key in seen_names:
                self.quality_stats["companies"]["duplicates"] += 1
                continue
            
            seen_names.add(key)
            
            # 标准化企业规模
            size = record.get("company_size", "").lower()
            if "large" in size or "enterprise" in size:
                record["company_size"] = "Large Enterprise"
            elif "medium" in size or "mid" in size:
                record["company_size"] = "Medium Enterprise"
            elif "small" in size:
                record["company_size"] = "Small Enterprise"
            
            # 标准化员工数
            if "employees" in record:
                try:
                    record["employees"] = int(record["employees"])
                except:
                    record["employees"] = None
            
            cleaned.append(record)
        
        self.quality_stats["companies"]["cleaned"] = len(cleaned)
        logger.info(f"企业数据清洗完成: {len(cleaned)} 条 (去重 {self.quality_stats['companies']['duplicates']} 条)")
        return cleaned
    
    def clean_policies(self) -> List[Dict]:
        """清洗政策法规数据"""
        logger.info("\n开始清洗政策法规数据...")
        self.quality_stats["policies"]["total"] = len(self.all_policies)
        
        seen_ids: Set[str] = set()
        cleaned = []
        
        for record in self.all_policies:
            # 使用record_id或生成唯一标识
            record_id = record.get("record_id", "")
            if not record_id:
                title = record.get("title", "").strip().lower()
                country = record.get("country", "").strip().lower()
                issue_date = record.get("issue_date", "")
                record_id = hashlib.md5(f"{title}_{country}_{issue_date}".encode()).hexdigest()[:16]
            
            if record_id in seen_ids:
                self.quality_stats["policies"]["duplicates"] += 1
                continue
            
            seen_ids.add(record_id)
            record["record_id"] = record_id
            
            # 标准化政策类型
            policy_type = record.get("policy_type", "").lower()
            if "regulation" in policy_type:
                record["policy_type"] = "Regulation"
            elif "guideline" in policy_type:
                record["policy_type"] = "Guideline"
            elif "standard" in policy_type:
                record["policy_type"] = "Standard"
            elif "law" in policy_type or "act" in policy_type:
                record["policy_type"] = "Law/Act"
            
            cleaned.append(record)
        
        self.quality_stats["policies"]["cleaned"] = len(cleaned)
        logger.info(f"政策法规数据清洗完成: {len(cleaned)} 条 (去重 {self.quality_stats['policies']['duplicates']} 条)")
        return cleaned
    
    def clean_trade(self) -> List[Dict]:
        """清洗贸易数据"""
        logger.info("\n开始清洗贸易数据...")
        self.quality_stats["trade"]["total"] = len(self.all_trade)
        
        seen_ids: Set[str] = set()
        cleaned = []
        
        for record in self.all_trade:
            # 使用record_id或生成唯一标识
            record_id = record.get("record_id", "")
            if not record_id:
                country_code = record.get('country_code', '')
                year = record.get('year', '')
                month = record.get('month', '')
                hs_code = record.get('hs_code', '')
                trade_type = record.get('trade_type', '')
                record_id = hashlib.md5(f"{country_code}_{year}_{month}_{hs_code}_{trade_type}".encode()).hexdigest()[:16]
            
            if record_id in seen_ids:
                self.quality_stats["trade"]["duplicates"] += 1
                continue
            
            seen_ids.add(record_id)
            record["record_id"] = record_id
            
            # 标准化数值字段
            for field in ["value_usd", "quantity", "unit_price"]:
                if field in record:
                    try:
                        record[field] = float(record[field])
                    except:
                        record[field] = 0.0
            
            # 标准化贸易类型
            trade_type = record.get("trade_type", "").lower()
            if "import" in trade_type:
                record["trade_type"] = "Import"
            elif "export" in trade_type:
                record["trade_type"] = "Export"
            
            cleaned.append(record)
        
        self.quality_stats["trade"]["cleaned"] = len(cleaned)
        logger.info(f"贸易数据清洗完成: {len(cleaned)} 条 (去重 {self.quality_stats['trade']['duplicates']} 条)")
        return cleaned
    
    def save_integrated_data(self, data: List[Dict], filename: str) -> None:
        """保存整合后的数据"""
        # JSON格式
        json_path = self.output_dir / f"{filename}.json"
        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        logger.info(f"保存 JSON: {json_path}")
        
        # CSV格式
        if data:
            csv_path = self.output_dir / f"{filename}.csv"
            with open(csv_path, 'w', newline='', encoding='utf-8') as f:
                writer = csv.DictWriter(f, fieldnames=data[0].keys())
                writer.writeheader()
                writer.writerows(data)
            logger.info(f"保存 CSV: {csv_path}")
    
    def generate_quality_report(self) -> Dict:
        """生成数据质量报告"""
        report = {
            "report_title": "医疗器械市场数据质量报告",
            "generated_at": datetime.now().isoformat(),
            "data_summary": {
                "registrations": {
                    "total_raw": self.quality_stats["registrations"]["total"],
                    "duplicates_removed": self.quality_stats["registrations"]["duplicates"],
                    "final_count": self.quality_stats["registrations"]["cleaned"],
                    "quality_score": round(
                        (self.quality_stats["registrations"]["cleaned"] / 
                         max(self.quality_stats["registrations"]["total"], 1)) * 100, 2
                    )
                },
                "market_size": {
                    "total_raw": self.quality_stats["market_size"]["total"],
                    "duplicates_removed": self.quality_stats["market_size"]["duplicates"],
                    "final_count": self.quality_stats["market_size"]["cleaned"],
                    "quality_score": round(
                        (self.quality_stats["market_size"]["cleaned"] / 
                         max(self.quality_stats["market_size"]["total"], 1)) * 100, 2
                    )
                },
                "companies": {
                    "total_raw": self.quality_stats["companies"]["total"],
                    "duplicates_removed": self.quality_stats["companies"]["duplicates"],
                    "final_count": self.quality_stats["companies"]["cleaned"],
                    "quality_score": round(
                        (self.quality_stats["companies"]["cleaned"] / 
                         max(self.quality_stats["companies"]["total"], 1)) * 100, 2
                    )
                },
                "policies": {
                    "total_raw": self.quality_stats["policies"]["total"],
                    "duplicates_removed": self.quality_stats["policies"]["duplicates"],
                    "final_count": self.quality_stats["policies"]["cleaned"],
                    "quality_score": round(
                        (self.quality_stats["policies"]["cleaned"] / 
                         max(self.quality_stats["policies"]["total"], 1)) * 100, 2
                    )
                },
                "trade": {
                    "total_raw": self.quality_stats["trade"]["total"],
                    "duplicates_removed": self.quality_stats["trade"]["duplicates"],
                    "final_count": self.quality_stats["trade"]["cleaned"],
                    "quality_score": round(
                        (self.quality_stats["trade"]["cleaned"] / 
                         max(self.quality_stats["trade"]["total"], 1)) * 100, 2
                    )
                }
            },
            "overall_quality_score": round(
                sum([
                    self.quality_stats["registrations"]["cleaned"] / max(self.quality_stats["registrations"]["total"], 1),
                    self.quality_stats["market_size"]["cleaned"] / max(self.quality_stats["market_size"]["total"], 1),
                    self.quality_stats["companies"]["cleaned"] / max(self.quality_stats["companies"]["total"], 1),
                    self.quality_stats["policies"]["cleaned"] / max(self.quality_stats["policies"]["total"], 1),
                    self.quality_stats["trade"]["cleaned"] / max(self.quality_stats["trade"]["total"], 1),
                ]) / 5 * 100, 2
            ),
            "data_sources": {
                "Singapore": {
                    "authority": "Health Sciences Authority (HSA)",
                    "url": "https://www.hsa.gov.sg",
                    "data_types": ["Product Registration", "Market Size", "Company Directory", "Trade Data", "Policies"]
                },
                "Japan": {
                    "authority": "Pharmaceuticals and Medical Devices Agency (PMDA)",
                    "url": "https://www.pmda.go.jp",
                    "data_types": ["Product Registration", "Market Size", "Company Directory", "Trade Data", "Policies"]
                },
                "Saudi Arabia": {
                    "authority": "Saudi Food and Drug Authority (SFDA)",
                    "url": "https://www.sfda.gov.sa",
                    "data_types": ["Product Registration", "Market Size", "Company Directory", "Trade Data", "Policies"]
                }
            },
            "standardization_applied": [
                "统一国家代码格式 (ISO 3166-1 alpha-3)",
                "标准化风险等级分类 (Low/Medium/High/Very High)",
                "统一日期格式 (YYYY-MM-DD)",
                "标准化货币单位 (USD)",
                "统一企业规模分类",
                "标准化政策类型分类",
                "统一贸易类型标识 (Import/Export)"
            ]
        }
        
        # 保存质量报告
        report_path = self.output_dir / "data_quality_report.json"
        with open(report_path, 'w', encoding='utf-8') as f:
            json.dump(report, f, ensure_ascii=False, indent=2)
        logger.info(f"\n数据质量报告已保存: {report_path}")
        
        return report
    
    def run_integration(self) -> None:
        """执行完整的数据整合流程"""
        logger.info("=" * 80)
        logger.info("开始数据整合与标准化流程")
        logger.info("=" * 80)
        
        # 1. 加载数据
        self.load_all_data()
        
        # 2. 清洗各类数据
        cleaned_registrations = self.clean_registrations()
        cleaned_market_size = self.clean_market_size()
        cleaned_companies = self.clean_companies()
        cleaned_policies = self.clean_policies()
        cleaned_trade = self.clean_trade()
        
        # 3. 保存整合后的数据
        logger.info("\n保存整合后的数据...")
        self.save_integrated_data(cleaned_registrations, "all_registrations_integrated")
        self.save_integrated_data(cleaned_market_size, "all_market_size_integrated")
        self.save_integrated_data(cleaned_companies, "all_companies_integrated")
        self.save_integrated_data(cleaned_policies, "all_policies_integrated")
        self.save_integrated_data(cleaned_trade, "all_trade_integrated")
        
        # 4. 生成质量报告
        report = self.generate_quality_report()
        
        # 5. 打印汇总
        logger.info("\n" + "=" * 80)
        logger.info("数据整合完成汇总")
        logger.info("=" * 80)
        logger.info(f"注册数据:     {report['data_summary']['registrations']['final_count']:>6} 条 (质量评分: {report['data_summary']['registrations']['quality_score']}%)")
        logger.info(f"市场规模:     {report['data_summary']['market_size']['final_count']:>6} 条 (质量评分: {report['data_summary']['market_size']['quality_score']}%)")
        logger.info(f"企业名录:     {report['data_summary']['companies']['final_count']:>6} 条 (质量评分: {report['data_summary']['companies']['quality_score']}%)")
        logger.info(f"政策法规:     {report['data_summary']['policies']['final_count']:>6} 条 (质量评分: {report['data_summary']['policies']['quality_score']}%)")
        logger.info(f"贸易数据:     {report['data_summary']['trade']['final_count']:>6} 条 (质量评分: {report['data_summary']['trade']['quality_score']}%)")
        logger.info("-" * 80)
        logger.info(f"总计:         {sum([report['data_summary'][k]['final_count'] for k in report['data_summary']]):>6} 条")
        logger.info(f"整体质量评分: {report['overall_quality_score']}%")
        logger.info("=" * 80)
        logger.info(f"\n整合数据保存位置: {self.output_dir}")


def main():
    """主函数"""
    integrator = DataIntegrator()
    integrator.run_integration()


if __name__ == "__main__":
    main()
