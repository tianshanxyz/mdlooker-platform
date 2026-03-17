#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
EUDAMED 数据采集脚本
从 EUDAMED（欧洲医疗器械数据库）采集数据

API 文档：https://ec.europa.eu/tools/eudamed/
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

# EUDAMED 配置
EUDAMED_CONFIG = {
    'base_url': 'https://ec.europa.eu/tools/eudamed',
    'api_base': 'https://eudamed-api.ec.europa.eu',  # 假设有 API
    'web_base': 'https://ec.europa.eu/tools/eudamed/#/device/search',
}

class EUDAMEDCollector:
    """EUDAMED 数据采集器"""
    
    def __init__(self):
        """初始化采集器"""
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'en-US,en;q=0.9',
        })
        self.rate_limit_delay = 0.5
    
    def _make_request(self, url: str, params: Optional[Dict] = None) -> Optional[Dict]:
        """发送 HTTP 请求"""
        try:
            response = self.session.get(url, params=params, timeout=30)
            response.raise_for_status()
            time.sleep(self.rate_limit_delay)
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"请求失败：{e}")
            return None
    
    def search_economic_operators(self,
                                  actor_name: Optional[str] = None,
                                  country: Optional[str] = None,
                                  actor_type: Optional[str] = None,
                                  limit: int = 100) -> List[Dict]:
        """
        搜索经济运营商（企业）
        
        Args:
            actor_name: 企业名称
            country: 国家代码（如 DE, FR）
            actor_type: 角色类型（Manufacturer, Importer, Distributor）
            limit: 返回数量限制
            
        Returns:
            SRN（Single Registration Number）列表
        """
        logger.info(f"搜索 EUDAMED 经济运营商：{actor_name or '全部'}")
        
        # 示例数据结构
        actors = []
        
        sample_actor = {
            'source': 'eudamed',
            'srn': 'DE-MF-000000000-0000',  # Single Registration Number
            'actor_name': 'Example Medical GmbH',
            'actor_type': 'Manufacturer',
            'address': {
                'street': 'Musterstraße 123',
                'city': 'Berlin',
                'postal_code': '10115',
                'country': 'Germany',
                'country_code': 'DE',
            },
            'contact': {
                'phone': '+49 30 12345678',
                'email': 'info@example.de',
                'website': 'https://www.example.de',
            },
            'registration_date': '2021-05-26',  # EUDAMED 启用日期
            'status': 'Active',
            'authorized_representative': None,  # 如果有欧代
            'last_updated': datetime.now().isoformat(),
        }
        
        logger.info(f"找到 {len(actors)} 个经济运营商（示例数据）")
        return actors
    
    def search_devices(self,
                      device_name: Optional[str] = None,
                      manufacturer: Optional[str] = None,
                      device_class: Optional[str] = None,
                      udi_di: Optional[str] = None,
                      limit: int = 100) -> List[Dict]:
        """
        搜索医疗器械
        
        Args:
            device_name: 产品名称
            manufacturer: 制造商名称
            device_class: 风险类别（Class I, IIa, IIb, III）
            udi_di: UDI-DI（器械标识符）
            limit: 返回数量限制
            
        Returns:
            器械列表
        """
        logger.info(f"搜索 EUDAMED 器械：{device_name or manufacturer or '全部'}")
        
        devices = []
        
        sample_device = {
            'source': 'eudamed',
            'udi_di': '04012345678901',
            'device_name': 'Example Device',
            'device_type': 'Surgical instrument',
            'device_class': 'Class IIa',
            'classification_rule': 'Rule 1',
            'manufacturer': {
                'name': 'Example Medical GmbH',
                'srn': 'DE-MF-000000000-0000',
            },
            'authorized_representative': None,
            'certificate': {
                'number': 'DE/CA123/456789/01',
                'issuing_authority': 'TÜV SÜD',
                'issue_date': '2022-01-15',
                'valid_until': '2027-01-14',
                'status': 'Valid',
            },
            'intended_use': 'For surgical use in general procedures.',
            'contraindications': 'None known.',
            'target_patient_population': 'Adult patients.',
            'implantable': False,
            'sterile': True,
            'reusable': False,
            'last_updated': datetime.now().isoformat(),
        }
        
        logger.info(f"找到 {len(devices)} 个器械（示例数据）")
        return devices
    
    def search_certificates(self,
                           certificate_number: Optional[str] = None,
                           manufacturer: Optional[str] = None,
                           notified_body: Optional[str] = None,
                           limit: int = 100) -> List[Dict]:
        """
        搜索 CE 证书
        
        Args:
            certificate_number: 证书编号
            manufacturer: 制造商名称
            notified_body: 公告机构名称
            limit: 返回数量限制
            
        Returns:
            证书列表
        """
        logger.info(f"搜索 EUDAMED CE 证书")
        
        certificates = []
        
        sample_certificate = {
            'source': 'eudamed',
            'certificate_number': 'DE/CA123/456789/01',
            'certificate_type': 'EU Technical Documentation Assessment',
            'status': 'Valid',
            'manufacturer': {
                'name': 'Example Medical GmbH',
                'srn': 'DE-MF-000000000-0000',
            },
            'notified_body': {
                'name': 'TÜV SÜD Product Service GmbH',
                'identification_number': '0123',
                'country': 'Germany',
            },
            'issue_date': '2022-01-15',
            'valid_until': '2027-01-14',
            'scope': 'Active implantable medical devices',
            'devices_covered': 15,  # 覆盖的产品数量
            'last_updated': datetime.now().isoformat(),
        }
        
        logger.info(f"找到 {len(certificates)} 个证书（示例数据）")
        return certificates
    
    def parse_device_class(self, class_string: str) -> str:
        """
        解析器械分类
        
        Args:
            class_string: 分类字符串
            
        Returns:
            标准化分类
        """
        class_mapping = {
            'class i': 'Class I',
            'class is': 'Class Is',
            'class im': 'Class Im',
            'class ir': 'Class Ir',
            'class iia': 'Class IIa',
            'class iib': 'Class IIb',
            'class iii': 'Class III',
        }
        
        return class_mapping.get(class_string.lower(), class_string)
    
    def get_notified_body_info(self, nb_number: str) -> Optional[Dict]:
        """
        获取公告机构信息
        
        Args:
            nb_number: 公告机构编号（如 0123）
            
        Returns:
            公告机构信息
        """
        # 公告机构列表（部分示例）
        notified_bodies = {
            '0123': {
                'name': 'TÜV SÜD Product Service GmbH',
                'country': 'Germany',
                'website': 'https://www.tuv-sud.com',
            },
            '0197': {
                'name': 'BSI Group The Netherlands B.V.',
                'country': 'Netherlands',
                'website': 'https://www.bsigroup.com',
            },
            '2797': {
                'name': 'SGS Ireland Limited',
                'country': 'Ireland',
                'website': 'https://www.sgs.com',
            },
        }
        
        return notified_bodies.get(nb_number)
    
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
    collector = EUDAMEDCollector()
    
    # 示例 1: 搜索企业（经济运营商）
    logger.info("开始搜索 EUDAMED 经济运营商...")
    actors = collector.search_economic_operators(
        actor_name='Siemens',
        country='DE',
        limit=50
    )
    
    if actors:
        collector.export_to_json(actors, 'eudamed_actors.json')
    
    # 示例 2: 搜索器械
    logger.info("开始搜索 EUDAMED 器械...")
    devices = collector.search_devices(
        manufacturer='Siemens',
        device_class='Class IIa',
        limit=100
    )
    
    if devices:
        collector.export_to_json(devices, 'eudamed_devices.json')
    
    # 示例 3: 搜索证书
    logger.info("开始搜索 EUDAMED CE 证书...")
    certificates = collector.search_certificates(
        notified_body='TÜV SÜD',
        limit=50
    )
    
    if certificates:
        collector.export_to_json(certificates, 'eudamed_certificates.json')
    
    logger.info("完成 EUDAMED 数据采集")


if __name__ == '__main__':
    main()
