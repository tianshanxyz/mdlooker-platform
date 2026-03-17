#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
FDA 数据采集脚本
从 FDA 官方 API 采集医疗器械企业注册和产品列表信息

API 文档：https://www.fda.gov/about-fda/openfda
"""

import requests
import json
import time
from datetime import datetime
from typing import List, Dict, Any, Optional
import logging

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# FDA OpenFDA API 配置
FDA_API_BASE = 'https://api.fda.gov'
FDA_DEVICE_ENDPOINTS = {
    'registration_listing': '/device/enforcement.json',  # 企业注册
    'device_clearance': '/device/510k.json',  # 510(k) 许可
    'pma': '/device/pma.json',  # PMA 批准
    'udi': '/device/udi.json',  # UDI 数据库
}

class FDACollector:
    """FDA 数据采集器"""
    
    def __init__(self, api_key: Optional[str] = None):
        """
        初始化采集器
        
        Args:
            api_key: FDA API Key（可选，有 key 可以提高请求限制）
        """
        self.api_key = api_key
        self.session = requests.Session()
        if api_key:
            self.session.headers.update({'X-Api-Key': api_key})
        
        self.base_url = FDA_API_BASE
        self.rate_limit_delay = 0.1  # 100ms 延迟避免限流
    
    def _make_request(self, endpoint: str, params: Dict[str, Any]) -> Optional[Dict]:
        """
        发送 API 请求
        
        Args:
            endpoint: API 端点
            params: 查询参数
            
        Returns:
            API 响应数据
        """
        url = f"{self.base_url}{endpoint}"
        
        try:
            response = self.session.get(url, params=params, timeout=30)
            response.raise_for_status()
            
            # 遵守速率限制
            time.sleep(self.rate_limit_delay)
            
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"API 请求失败：{e}")
            return None
    
    def search_companies(self, 
                        company_name: Optional[str] = None,
                        state: Optional[str] = None,
                        country: Optional[str] = None,
                        limit: int = 100) -> List[Dict]:
        """
        搜索 FDA 注册企业
        
        Args:
            company_name: 企业名称
            state: 州/省
            country: 国家
            limit: 返回数量限制
            
        Returns:
            企业列表
        """
        search_terms = []
        
        if company_name:
            search_terms.append(f'establishment_name:"{company_name}"')
        if state:
            search_terms.append(f'state:"{state}"')
        if country:
            search_terms.append(f'country:"{country}"')
        
        if not search_terms:
            # 默认查询所有活跃企业
            search_query = 'registration_status:"Active"'
        else:
            search_query = '+'.join(search_terms)
        
        params = {
            'search': search_query,
            'limit': min(limit, 1000),  # FDA API 单次最多 1000 条
        }
        
        data = self._make_request(FDA_DEVICE_ENDPOINTS['registration_listing'], params)
        
        if data and 'results' in data:
            return self._parse_company_results(data['results'])
        
        return []
    
    def _parse_company_results(self, results: List[Dict]) -> List[Dict]:
        """
        解析企业数据
        
        Args:
            results: 原始 API 结果
            
        Returns:
            解析后的企业数据
        """
        companies = []
        
        for result in results:
            company = {
                'source': 'fda',
                'fda_establishment_id': result.get('fda_establishment_id'),
                'name': result.get('establishment_name', ''),
                'registration_number': result.get('registration_number'),
                'status': result.get('registration_status', ''),
                'address': {
                    'street': result.get('address_1', ''),
                    'city': result.get('city', ''),
                    'state': result.get('state', ''),
                    'postal_code': result.get('zip', ''),
                    'country': result.get('country', ''),
                },
                'contact': {
                    'phone': result.get('phone', ''),
                    'email': result.get('email', ''),
                },
                'business_type': result.get('type_of_business', ''),
                'activities': result.get('activities', []),
                'registration_date': result.get('initial_importer_registration_date', ''),
                'last_updated': datetime.now().isoformat(),
            }
            companies.append(company)
        
        logger.info(f"解析了 {len(companies)} 家企业数据")
        return companies
    
    def search_510k(self,
                   company_name: Optional[str] = None,
                   product_code: Optional[str] = None,
                   regulation_number: Optional[str] = None,
                   limit: int = 100) -> List[Dict]:
        """
        搜索 510(k) 许可信息
        
        Args:
            company_name: 企业名称
            product_code: 产品代码
            regulation_number: 法规编号
            limit: 返回数量限制
            
        Returns:
            510(k) 许可列表
        """
        search_terms = []
        
        if company_name:
            search_terms.append(f'openfda.device_name:"{company_name}"')
        if product_code:
            search_terms.append(f'openfda.product_code:"{product_code}"')
        if regulation_number:
            search_terms.append(f'openfda.regulation_number:"{regulation_number}"')
        
        # 默认只查询最近 5 年的数据
        five_years_ago = datetime.now().year - 5
        search_terms.append(f'date_received:[{five_years_ago}0101 TO *]')
        
        search_query = '+'.join(search_terms)
        
        params = {
            'search': search_query,
            'limit': min(limit, 1000),
        }
        
        data = self._make_request(FDA_DEVICE_ENDPOINTS['device_clearance'], params)
        
        if data and 'results' in data:
            return self._parse_510k_results(data['results'])
        
        return []
    
    def _parse_510k_results(self, results: List[Dict]) -> List[Dict]:
        """
        解析 510(k) 数据
        
        Args:
            results: 原始 API 结果
            
        Returns:
            解析后的 510(k) 数据
        """
        clearances = []
        
        for result in results:
            clearance = {
                'source': 'fda',
                'k_number': result.get('k_number', ''),
                'device_name': result.get('device_name', ''),
                'applicant': result.get('applicant', ''),
                'status': result.get('decision', ''),
                'decision_date': result.get('decision_date', ''),
                'received_date': result.get('date_received', ''),
                'regulation_number': result.get('openfda', {}).get('regulation_number', ''),
                'product_code': result.get('openfda', {}).get('product_code', ''),
                'device_class': result.get('device_class', ''),
                'advisory_committee': result.get('advisory_committee', ''),
                'review_panel': result.get('review_panel', ''),
                'last_updated': datetime.now().isoformat(),
            }
            clearances.append(clearance)
        
        logger.info(f"解析了 {len(clearances)} 条 510(k) 数据")
        return clearances
    
    def search_pma(self,
                  company_name: Optional[str] = None,
                  limit: int = 100) -> List[Dict]:
        """
        搜索 PMA 批准信息
        
        Args:
            company_name: 企业名称
            limit: 返回数量限制
            
        Returns:
            PMA 批准列表
        """
        search_terms = []
        
        if company_name:
            search_terms.append(f'openfda.device_name:"{company_name}"')
        
        search_query = '+'.join(search_terms) if search_terms else ''
        
        params = {
            'search': search_query,
            'limit': min(limit, 1000),
        }
        
        data = self._make_request(FDA_DEVICE_ENDPOINTS['pma'], params)
        
        if data and 'results' in data:
            return self._parse_pma_results(data['results'])
        
        return []
    
    def _parse_pma_results(self, results: List[Dict]) -> List[Dict]:
        """解析 PMA 数据"""
        approvals = []
        
        for result in results:
            approval = {
                'source': 'fda',
                'pma_number': result.get('pma_number', ''),
                'device_name': result.get('name', ''),
                'applicant': result.get('applicant', ''),
                'status': result.get('status', ''),
                'approval_date': result.get('approval_date', ''),
                'regulation_number': result.get('openfda', {}).get('regulation_number', ''),
                'product_code': result.get('openfda', {}).get('product_code', ''),
                'device_class': 'Class III',  # PMA 都是 III 类
                'last_updated': datetime.now().isoformat(),
            }
            approvals.append(approval)
        
        logger.info(f"解析了 {len(approvals)} 条 PMA 数据")
        return approvals
    
    def export_to_json(self, data: List[Dict], filename: str):
        """导出数据到 JSON 文件"""
        try:
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            logger.info(f"数据已导出到 {filename}")
        except Exception as e:
            logger.error(f"导出失败：{e}")


def main():
    """主函数 - 示例用法"""
    # 初始化采集器
    collector = FDACollector()
    
    # 示例 1: 搜索企业
    logger.info("开始搜索 FDA 注册企业...")
    companies = collector.search_companies(
        company_name='Medtronic',
        country='United States',
        limit=50
    )
    logger.info(f"找到 {len(companies)} 家企业")
    
    if companies:
        collector.export_to_json(companies, 'fda_companies.json')
    
    # 示例 2: 搜索 510(k)
    logger.info("开始搜索 510(k) 许可...")
    clearances = collector.search_510k(
        company_name='Medtronic',
        limit=100
    )
    logger.info(f"找到 {len(clearances)} 条 510(k) 数据")
    
    if clearances:
        collector.export_to_json(clearances, 'fda_510k.json')
    
    # 示例 3: 搜索 PMA
    logger.info("开始搜索 PMA 批准...")
    approvals = collector.search_pma(
        company_name='Medtronic',
        limit=50
    )
    logger.info(f"找到 {len(approvals)} 条 PMA 数据")
    
    if approvals:
        collector.export_to_json(approvals, 'fda_pma.json')


if __name__ == '__main__':
    main()
