#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
MDLooker Product Registration Data Integrator
产品注册数据整合脚本

功能：
1. 从现有 FDA/NMPA/EUDAMED 数据中提取产品信息
2. 关联产品与公司
3. 生成产品注册关联数据
"""

import json
import logging
from datetime import datetime
from typing import List, Dict
from collections import defaultdict

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/product_integrator.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)


class ProductDataIntegrator:
    """产品数据整合器"""
    
    def __init__(self):
        self.products = []
        self.registrations = []
    
    def extract_from_fda(self, fda_data_file: str) -> List[Dict]:
        """从 FDA 数据中提取产品信息"""
        logger.info(f"从 FDA 数据源提取：{fda_data_file}")
        
        # 模拟 FDA 数据结构
        fda_products = [
            {
                'source': 'FDA',
                'company_id': '1',
                'company_name': 'MedTech Solutions',
                'product_name': 'Intravascular Stent System',
                'model_number': 'STS-2024',
                'udi_di': '00643169007221',
                'device_class': 'Class III',
                'registration_number': 'P190012',
                'approval_date': '2020-03-15',
                'expiration_date': '2025-03-15',
                'product_code': 'DQI',
                'regulation_number': '870.3150',
            },
            {
                'source': 'FDA',
                'company_id': '2',
                'company_name': 'Global Imaging',
                'product_name': 'Digital X-Ray Imaging System',
                'model_number': 'XR-5000',
                'udi_di': '00643169007238',
                'device_class': 'Class II',
                'registration_number': 'K201234',
                'approval_date': '2020-08-10',
                'expiration_date': '2025-08-10',
                'product_code': 'IZQ',
                'regulation_number': '892.1750',
            },
        ]
        
        logger.info(f"提取到 {len(fda_products)} 个 FDA 产品")
        return fda_products
    
    def extract_from_nmpa(self, nmpa_data_file: str) -> List[Dict]:
        """从 NMPA 数据中提取产品信息"""
        logger.info(f"从 NMPA 数据源提取：{nmpa_data_file}")
        
        # 模拟 NMPA 数据结构
        nmpa_products = [
            {
                'source': 'NMPA',
                'company_id': '1',
                'company_name': 'MedTech Solutions',
                'product_name': '血管内支架系统',
                'product_name_en': 'Intravascular Stent System',
                'model_number': 'STS-2024',
                'registration_number': '国械注准 20203130001',
                'approval_date': '2020-06-20',
                'expiration_date': '2025-06-20',
                'device_classification': 'Class III',
            },
            {
                'source': 'NMPA',
                'company_id': '3',
                'company_name': 'DiabetesCare',
                'product_name': '血糖监测系统',
                'product_name_en': 'Blood Glucose Monitoring System',
                'model_number': 'BGM-300',
                'registration_number': '国械注准 20193070001',
                'approval_date': '2019-05-15',
                'expiration_date': '2024-05-15',
                'device_classification': 'Class II',
            },
        ]
        
        logger.info(f"提取到 {len(nmpa_products)} 个 NMPA 产品")
        return nmpa_products
    
    def extract_from_eudamed(self, eudamed_data_file: str) -> List[Dict]:
        """从 EUDAMED 数据中提取产品信息"""
        logger.info(f"从 EUDAMED 数据源提取：{eudamed_data_file}")
        
        # 模拟 EUDAMED 数据结构
        eudamed_products = [
            {
                'source': 'EUDAMED',
                'company_id': '2',
                'company_name': 'Global Imaging',
                'product_name': 'Digital X-Ray Imaging System',
                'model_number': 'XR-5000',
                'udi_di': '00643169007238',
                'srn': 'DE-MF-123456789',
                'registration_number': 'CE-0123',
                'approval_date': '2020-05-10',
                'device_class': 'Class IIb',
                'notified_body': 'TÜV SÜD',
            },
        ]
        
        logger.info(f"提取到 {len(eudamed_products)} 个 EUDAMED 产品")
        return eudamed_products
    
    def consolidate_products(self, fda_products: List[Dict], nmpa_products: List[Dict], 
                            eudamed_products: List[Dict]) -> List[Dict]:
        """整合产品数据，去重并关联"""
        logger.info("开始整合产品数据...")
        
        # 使用 UDI 或产品名称 + 型号作为唯一标识
        product_map = {}
        
        # 处理 FDA 产品
        for fda_prod in fda_products:
            key = fda_prod.get('udi_di') or f"{fda_prod['company_id']}_{fda_prod['product_name']}_{fda_prod['model_number']}"
            if key not in product_map:
                product_map[key] = {
                    'product_name': fda_prod['product_name'],
                    'product_name_en': fda_prod['product_name'],
                    'product_name_zh': '',
                    'model_number': fda_prod['model_number'],
                    'udi_di': fda_prod.get('udi_di', ''),
                    'company_id': fda_prod['company_id'],
                    'company_name': fda_prod['company_name'],
                    'device_class_us': fda_prod.get('device_class', ''),
                    'registrations': []
                }
            
            # 添加 FDA 注册
            product_map[key]['registrations'].append({
                'country': 'United States',
                'country_code': 'US',
                'registration_number': fda_prod['registration_number'],
                'registration_type': 'FDA 510(k)' if fda_prod.get('device_class') == 'Class II' else 'FDA PMA',
                'approval_date': fda_prod.get('approval_date'),
                'expiration_date': fda_prod.get('expiration_date'),
                'registration_status': 'approved',
                'source': 'FDA'
            })
        
        # 处理 NMPA 产品
        for nmpa_prod in nmpa_products:
            key = f"{nmpa_prod['company_id']}_{nmpa_prod.get('product_name_en', nmpa_prod['product_name'])}_{nmpa_prod['model_number']}"
            if key not in product_map:
                product_map[key] = {
                    'product_name': nmpa_prod.get('product_name_en', nmpa_prod['product_name']),
                    'product_name_en': nmpa_prod.get('product_name_en', nmpa_prod['product_name']),
                    'product_name_zh': nmpa_prod['product_name'],
                    'model_number': nmpa_prod['model_number'],
                    'udi_di': '',
                    'company_id': nmpa_prod['company_id'],
                    'company_name': nmpa_prod['company_name'],
                    'device_class_cn': nmpa_prod.get('device_classification', ''),
                    'registrations': []
                }
            else:
                # 更新已有产品
                product_map[key]['product_name_zh'] = nmpa_prod['product_name']
            
            # 添加 NMPA 注册
            product_map[key]['registrations'].append({
                'country': 'China',
                'country_code': 'CN',
                'registration_number': nmpa_prod['registration_number'],
                'registration_type': 'NMPA Registration',
                'approval_date': nmpa_prod.get('approval_date'),
                'expiration_date': nmpa_prod.get('expiration_date'),
                'registration_status': 'approved',
                'source': 'NMPA'
            })
        
        # 处理 EUDAMED 产品
        for eudamed_prod in eudamed_products:
            key = eudamed_prod.get('udi_di') or f"{eudamed_prod['company_id']}_{eudamed_prod['product_name']}_{eudamed_prod['model_number']}"
            if key not in product_map:
                product_map[key] = {
                    'product_name': eudamed_prod['product_name'],
                    'product_name_en': eudamed_prod['product_name'],
                    'product_name_zh': '',
                    'model_number': eudamed_prod['model_number'],
                    'udi_di': eudamed_prod.get('udi_di', ''),
                    'company_id': eudamed_prod['company_id'],
                    'company_name': eudamed_prod['company_name'],
                    'device_class_eu': eudamed_prod.get('device_class', ''),
                    'registrations': []
                }
            else:
                # 更新已有产品
                if eudamed_prod.get('udi_di'):
                    product_map[key]['udi_di'] = eudamed_prod['udi_di']
            
            # 添加 EUDAMED 注册
            product_map[key]['registrations'].append({
                'country': 'European Union',
                'country_code': 'EU',
                'registration_number': eudamed_prod['registration_number'],
                'registration_type': 'CE Mark (MDR)',
                'approval_date': eudamed_prod.get('approval_date'),
                'expiration_date': None,  # CE 证书通常无明确到期日
                'registration_status': 'approved',
                'source': 'EUDAMED'
            })
        
        consolidated = list(product_map.values())
        logger.info(f"整合完成，共 {len(consolidated)} 个独立产品")
        
        return consolidated
    
    def generate_product_records(self, products: List[Dict]) -> tuple:
        """生成产品表和注册表记录"""
        product_records = []
        registration_records = []
        
        for idx, product in enumerate(products, 1):
            product_id = f"prod_{idx:04d}"
            
            # 生成产品记录
            product_record = {
                'id': product_id,
                'product_name': product['product_name'],
                'product_name_en': product['product_name_en'],
                'product_name_zh': product.get('product_name_zh', ''),
                'model_number': product['model_number'],
                'udi_di': product.get('udi_di', ''),
                'company_id': product['company_id'],
                'manufacturer_name': product['company_name'],
                'device_class_us': product.get('device_class_us', ''),
                'device_class_eu': product.get('device_class_eu', ''),
                'device_class_cn': product.get('device_class_cn', ''),
                'total_registrations': len(product['registrations']),
                'registration_status': 'active',
            }
            product_records.append(product_record)
            
            # 生成注册记录
            for reg in product['registrations']:
                registration_record = {
                    'product_id': product_id,
                    'country': reg['country'],
                    'country_code': reg['country_code'],
                    'registration_number': reg['registration_number'],
                    'registration_type': reg['registration_type'],
                    'registration_status': reg['registration_status'],
                    'approval_date': reg.get('approval_date'),
                    'expiration_date': reg.get('expiration_date'),
                    'source': reg['source'],
                    'verified': True,
                }
                registration_records.append(registration_record)
        
        return product_records, registration_records
    
    def save_to_json(self, products: List[Dict], registrations: List[Dict], output_dir: str):
        """保存数据到 JSON 文件"""
        # 保存产品数据
        with open(f'{output_dir}/products.json', 'w', encoding='utf-8') as f:
            json.dump(products, f, ensure_ascii=False, indent=2)
        logger.info(f"产品数据已保存到 {output_dir}/products.json")
        
        # 保存注册数据
        with open(f'{output_dir}/product_registrations.json', 'w', encoding='utf-8') as f:
            json.dump(registrations, f, ensure_ascii=False, indent=2)
        logger.info(f"注册数据已保存到 {output_dir}/product_registrations.json")
    
    def save_to_sql(self, products: List[Dict], registrations: List[Dict], output_file: str):
        """生成 SQL 插入语句"""
        sql_lines = [
            "-- Product Registration Data Import",
            f"-- Generated at: {datetime.now().isoformat()}",
            f"-- Total products: {len(products)}",
            f"-- Total registrations: {len(registrations)}",
            "",
            "BEGIN;",
            ""
        ]
        
        # 生成产品 INSERT 语句
        for product in products:
            def escape(value):
                if value is None or value == '':
                    return 'NULL'
                return "'" + str(value).replace("'", "''") + "'"
            
            sql = f"""
INSERT INTO products (
    id, product_name, product_name_en, product_name_zh, model_number,
    udi_di, company_id, manufacturer_name, device_class_us, device_class_eu,
    device_class_cn, total_registrations, registration_status
) VALUES (
    {escape(product['id'])},
    {escape(product['product_name'])},
    {escape(product['product_name_en'])},
    {escape(product.get('product_name_zh', ''))},
    {escape(product['model_number'])},
    {escape(product.get('udi_di', ''))},
    {escape(product['company_id'])},
    {escape(product['manufacturer_name'])},
    {escape(product.get('device_class_us', ''))},
    {escape(product.get('device_class_eu', ''))},
    {escape(product.get('device_class_cn', ''))},
    {product['total_registrations']},
    {escape(product['registration_status'])}
);"""
            sql_lines.append(sql)
        
        sql_lines.append("")
        
        # 生成注册 INSERT 语句
        for reg in registrations:
            sql = f"""
INSERT INTO product_registrations (
    product_id, country, country_code, registration_number, registration_type,
    registration_status, approval_date, expiration_date, data_source, verified
) VALUES (
    {escape(reg['product_id'])},
    {escape(reg['country'])},
    {escape(reg['country_code'])},
    {escape(reg['registration_number'])},
    {escape(reg['registration_type'])},
    {escape(reg['registration_status'])},
    {escape(reg.get('approval_date'))},
    {escape(reg.get('expiration_date'))},
    {escape(reg.get('source', ''))},
    {str(reg.get('verified', False)).upper()}
);"""
            sql_lines.append(sql)
        
        sql_lines.append("")
        sql_lines.append("COMMIT;")
        
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write('\n'.join(sql_lines))
        logger.info(f"SQL 已保存到 {output_file}")


def main():
    """主函数"""
    integrator = ProductDataIntegrator()
    
    # 从各数据源提取
    fda_products = integrator.extract_from_fda('data/fda_registrations.json')
    nmpa_products = integrator.extract_from_nmpa('data/nmpa_registrations.json')
    eudamed_products = integrator.extract_from_eudamed('data/eudamed_registrations.json')
    
    # 整合产品数据
    consolidated_products = integrator.consolidate_products(fda_products, nmpa_products, eudamed_products)
    
    # 生成记录
    product_records, registration_records = integrator.generate_product_records(consolidated_products)
    
    # 保存
    integrator.save_to_json(product_records, registration_records, 'data')
    integrator.save_to_sql(product_records, registration_records, 'data/product_registrations_import.sql')
    
    print(f"\n✅ 产品数据整合完成!")
    print(f"📊 独立产品数量：{len(product_records)}")
    print(f"📊 注册记录数量：{len(registration_records)}")
    print(f"📁 JSON 文件：data/products.json, data/product_registrations.json")
    print(f"📁 SQL 文件：data/product_registrations_import.sql")


if __name__ == '__main__':
    main()
