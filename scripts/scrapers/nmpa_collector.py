#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
NMPA 数据采集脚本
从 NMPA（国家药品监督管理局）采集医疗器械注册信息

注意：NMPA 没有官方公开 API，此脚本演示如何从公开数据源采集
实际使用时需要根据具体数据源调整
"""

import requests
import json
import time
from datetime import datetime
from typing import List, Dict, Any, Optional
import logging
from bs4 import BeautifulSoup
import re

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# NMPA 数据源配置
NMPA_SOURCES = {
    'base_url': 'https://www.nmpa.gov.cn',
    'device_search': '/datasearch/search/index.html',  # 数据查询页面
    'company_search': 'https://app1.nmpa.gov.cn/datasearchserver/GetEnterprise.do',
    'product_search': 'https://app1.nmpa.gov.cn/datasearchserver/GetProduct.do',
}

class NMPACollector:
    """NMPA 数据采集器"""
    
    def __init__(self):
        """初始化采集器"""
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        })
        self.rate_limit_delay = 0.5  # 500ms 延迟
    
    def _make_request(self, url: str, params: Optional[Dict] = None, 
                     method: str = 'GET') -> Optional[Any]:
        """
        发送 HTTP 请求
        
        Args:
            url: 请求 URL
            params: 请求参数
            method: 请求方法
            
        Returns:
            响应数据
        """
        try:
            if method == 'GET':
                response = self.session.get(url, params=params, timeout=30)
            else:
                response = self.session.post(url, data=params, timeout=30)
            
            response.raise_for_status()
            time.sleep(self.rate_limit_delay)
            
            # 尝试解析 JSON
            try:
                return response.json()
            except:
                return response.text
                
        except requests.exceptions.RequestException as e:
            logger.error(f"请求失败：{e}")
            return None
    
    def search_companies(self,
                        company_name: Optional[str] = None,
                        province: Optional[str] = None,
                        limit: int = 100) -> List[Dict]:
        """
        搜索医疗器械生产企业
        
        Args:
            company_name: 企业名称
            province: 所在省份
            limit: 返回数量限制
            
        Returns:
            企业列表
        """
        # 注意：这是示例代码，实际 NMPA 数据需要通过官方数据查询接口获取
        # 这里模拟数据结构
        
        companies = []
        
        # 实际使用时需要调用真实 API 或解析网页
        logger.info(f"搜索 NMPA 企业：{company_name or '全部'}")
        
        # 示例数据结构
        sample_company = {
            'source': 'nmpa',
            'company_name': '示例企业有限公司',
            'company_name_en': 'Example Co., Ltd.',
            'unified_social_credit_code': '91110000XXXXXXXXXX',
            'registration_number': '京食药监械生产许 20200001 号',
            'status': '有效',
            'address': {
                'province': '北京市',
                'city': '北京市',
                'district': '朝阳区',
                'detail': '某某路某某号',
            },
            'legal_representative': '张三',
            'business_scope': 'II 类、III 类医疗器械生产',
            'issue_date': '2020-01-15',
            'valid_until': '2025-01-14',
            'issuing_authority': '北京市药品监督管理局',
            'last_updated': datetime.now().isoformat(),
        }
        
        # 实际应该从 API 获取数据
        # companies = self._fetch_companies_from_api(company_name, province, limit)
        
        logger.info(f"找到 {len(companies)} 家企业（示例数据）")
        return companies
    
    def search_products(self,
                       product_name: Optional[str] = None,
                       company_name: Optional[str] = None,
                       device_class: Optional[str] = None,
                       registration_number: Optional[str] = None,
                       limit: int = 100) -> List[Dict]:
        """
        搜索医疗器械产品注册信息
        
        Args:
            product_name: 产品名称
            company_name: 企业名称
            device_class: 管理类别（II 类、III 类）
            registration_number: 注册证编号
            limit: 返回数量限制
            
        Returns:
            产品列表
        """
        products = []
        
        logger.info(f"搜索 NMPA 产品：{product_name or company_name or '全部'}")
        
        # 示例数据结构
        sample_product = {
            'source': 'nmpa',
            'product_name': '示例产品',
            'product_name_en': 'Example Product',
            'registration_number': '国械注准 20203140001',
            'registration_status': '有效',
            'device_class': 'III 类',
            'device_type': '6815 注射穿刺器械',
            'structure_composition': '由针管、针座组成。无菌。',
            'scope_of_application': '用于注射药液。',
            'manufacturer': {
                'name': '示例企业有限公司',
                'address': '北京市某某区某某路',
            },
            'agent': None,  # 进口产品有代理商
            'issue_date': '2020-03-20',
            'valid_until': '2025-03-19',
            'change_records': [],  # 变更历史
            'last_updated': datetime.now().isoformat(),
        }
        
        logger.info(f"找到 {len(products)} 个产品（示例数据）")
        return products
    
    def parse_product_detail(self, html_content: str) -> Optional[Dict]:
        """
        解析产品详情页 HTML
        
        Args:
            html_content: HTML 内容
            
        Returns:
            产品详情数据
        """
        try:
            soup = BeautifulSoup(html_content, 'html.parser')
            
            product = {
                'source': 'nmpa',
                'product_name': '',
                'registration_number': '',
                'device_class': '',
            }
            
            # 查找表格中的信息
            table = soup.find('table', class_='detail-table')
            if table:
                rows = table.find_all('tr')
                for row in rows:
                    th = row.find('th')
                    td = row.find('td')
                    if th and td:
                        label = th.get_text(strip=True)
                        value = td.get_text(strip=True)
                        
                        if '产品名称' in label:
                            product['product_name'] = value
                        elif '注册证编号' in label:
                            product['registration_number'] = value
                        elif '管理类别' in label:
                            product['device_class'] = value
                        # ... 解析更多字段
            
            return product
            
        except Exception as e:
            logger.error(f"解析 HTML 失败：{e}")
            return None
    
    def classify_device(self, product_name: str, description: str) -> Optional[str]:
        """
        根据产品名称和描述判断管理类别
        
        Args:
            product_name: 产品名称
            description: 产品描述
            
        Returns:
            管理类别（I 类、II 类、III 类）
        """
        # III 类器械关键词
        class_iii_keywords = [
            '植入', '介入', '心脏', '起搏器', '支架',
            '人工关节', '人工晶体', '血管',
        ]
        
        # II 类器械关键词
        class_ii_keywords = [
            '注射器', '输液器', '导管', '监护仪',
            '超声', 'X 射线', '心电图',
        ]
        
        text = product_name + ' ' + description
        
        # 检查 III 类
        for keyword in class_iii_keywords:
            if keyword in text:
                return 'III 类'
        
        # 检查 II 类
        for keyword in class_ii_keywords:
            if keyword in text:
                return 'II 类'
        
        # 默认 I 类
        return 'I 类'
    
    def export_to_json(self, data: List[Dict], filename: str):
        """导出数据到 JSON 文件"""
        try:
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            logger.info(f"数据已导出到 {filename}")
        except Exception as e:
            logger.error(f"导出失败：{e}")
    
    def export_to_database(self, data: List[Dict], table_name: str):
        """
        导出到数据库（示例）
        
        实际使用时需要配置数据库连接
        """
        logger.info(f"准备导出 {len(data)} 条数据到 {table_name} 表")
        # 实际数据库操作代码
        # conn = psycopg2.connect(...)
        # cursor = conn.cursor()
        # for item in data:
        #     cursor.execute(...)
        # conn.commit()


def main():
    """主函数 - 示例用法"""
    collector = NMPACollector()
    
    # 示例 1: 搜索企业
    logger.info("开始搜索 NMPA 企业...")
    companies = collector.search_companies(
        company_name='迈瑞',
        province='广东省',
        limit=50
    )
    
    if companies:
        collector.export_to_json(companies, 'nmpa_companies.json')
    
    # 示例 2: 搜索产品
    logger.info("开始搜索 NMPA 产品...")
    products = collector.search_products(
        product_name='注射器',
        device_class='III 类',
        limit=100
    )
    
    if products:
        collector.export_to_json(products, 'nmpa_products.json')
    
    # 示例 3: 按注册证号搜索
    logger.info("搜索特定注册证...")
    specific_products = collector.search_products(
        registration_number='国械注准 2020'
    )
    
    logger.info(f"完成数据采集")


if __name__ == '__main__':
    main()
