#!/usr/bin/env python3
"""
插入示例数据到HSA/PMDA/SFDA表
用于测试和演示
"""

import os
import sys
from datetime import datetime

# 添加项目根目录到路径
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

# 加载环境变量
from dotenv import load_dotenv
env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), '.env.local')
load_dotenv(env_path)

from supabase import create_client

def insert_hsa_data():
    """插入HSA示例数据"""
    url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
    key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
    
    if not url or not key:
        print("Error: Supabase credentials not found")
        return
    
    supabase = create_client(url, key)
    
    # HSA示例数据
    hsa_data = [
        {
            'registration_number': 'DE0001234',
            'device_name': 'Cardiac Monitor',
            'device_name_zh': '心脏监护仪',
            'manufacturer_name': 'MedTech Solutions Pte Ltd',
            'manufacturer_address': '123 Tech Park, Singapore 123456',
            'local_representative': 'Local Rep Pte Ltd',
            'product_owner': 'MedTech Global Inc',
            'risk_class': 'B',
            'device_category': 'Active Medical Device',
            'gmdn_code': '12345',
            'registration_type': 'Full',
            'registration_status': 'Active',
            'registration_date': '2024-01-15',
            'expiry_date': '2029-01-14',
            'intended_use': 'For continuous monitoring of cardiac activity',
            'indications_for_use': 'Adult patients in healthcare facilities'
        },
        {
            'registration_number': 'DE0001235',
            'device_name': 'Surgical Sutures',
            'device_name_zh': '外科缝合线',
            'manufacturer_name': 'SutureTech Manufacturing',
            'manufacturer_address': '456 Industrial Ave, Singapore 456789',
            'local_representative': 'MedSupply Singapore',
            'product_owner': 'SutureTech Global',
            'risk_class': 'A',
            'device_category': 'Non-Active Medical Device',
            'gmdn_code': '23456',
            'registration_type': 'Immediate',
            'registration_status': 'Active',
            'registration_date': '2024-02-01',
            'expiry_date': '2029-01-31',
            'intended_use': 'For wound closure in surgical procedures',
            'indications_for_use': 'General surgery applications'
        },
        {
            'registration_number': 'DE0001236',
            'device_name': 'Insulin Pump',
            'device_name_zh': '胰岛素泵',
            'manufacturer_name': 'Diabetes Care Systems',
            'manufacturer_address': '789 Health Blvd, Singapore 789012',
            'local_representative': 'Diabetes Solutions SG',
            'product_owner': 'Diabetes Care International',
            'risk_class': 'C',
            'device_category': 'Active Medical Device',
            'gmdn_code': '34567',
            'registration_type': 'Full',
            'registration_status': 'Active',
            'registration_date': '2023-12-10',
            'expiry_date': '2028-12-09',
            'intended_use': 'For subcutaneous delivery of insulin',
            'indications_for_use': 'Diabetes mellitus management'
        },
        {
            'registration_number': 'DE0001237',
            'device_name': 'Implantable Pacemaker',
            'device_name_zh': '植入式心脏起搏器',
            'manufacturer_name': 'Cardiac Devices Inc',
            'manufacturer_address': '321 Heart Center, Singapore 321654',
            'local_representative': 'Cardiac Solutions Pte Ltd',
            'product_owner': 'Cardiac Devices Global',
            'risk_class': 'D',
            'device_category': 'Active Implantable Device',
            'gmdn_code': '45678',
            'registration_type': 'Full',
            'registration_status': 'Active',
            'registration_date': '2023-11-20',
            'expiry_date': '2028-11-19',
            'intended_use': 'For management of cardiac arrhythmias',
            'indications_for_use': 'Patients with bradycardia or heart block'
        }
    ]
    
    print("Inserting HSA data...")
    inserted = 0
    updated = 0
    
    for data in hsa_data:
        try:
            # 检查是否已存在
            existing = supabase.table('hsa_registrations')\
                .select('id')\
                .eq('registration_number', data['registration_number'])\
                .execute()
            
            if existing.data:
                # 更新
                supabase.table('hsa_registrations')\
                    .update(data)\
                    .eq('registration_number', data['registration_number'])\
                    .execute()
                updated += 1
                print(f"  Updated: {data['registration_number']}")
            else:
                # 插入
                supabase.table('hsa_registrations').insert(data).execute()
                inserted += 1
                print(f"  Inserted: {data['registration_number']}")
        except Exception as e:
            print(f"  Error with {data['registration_number']}: {e}")
    
    print(f"\nHSA Summary: {inserted} inserted, {updated} updated")
    return inserted, updated

def insert_pmda_data():
    """插入PMDA示例数据"""
    url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
    key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
    
    supabase = create_client(url, key)
    
    pmda_data = [
        {
            'approval_number': '23000BZX00011000',
            'device_name': 'MRI System',
            'device_name_jp': 'MRI装置',
            'manufacturer_name': 'Siemens Healthineers Japan',
            'manufacturer_name_jp': 'シーメンスヘルスケア株式会社',
            'classification': 'Class III',
            'approval_date': '2024-01-20',
            'approval_status': 'Approved'
        },
        {
            'approval_number': '23000BZX00022000',
            'device_name': 'Digital X-Ray System',
            'device_name_jp': 'デジタルX線診断装置',
            'manufacturer_name': 'Canon Medical Systems',
            'manufacturer_name_jp': 'キヤノンメディカルシステムズ株式会社',
            'classification': 'Class II',
            'approval_date': '2024-02-15',
            'approval_status': 'Approved'
        },
        {
            'approval_number': '23000BZX00033000',
            'device_name': 'Dialysis Machine',
            'device_name_jp': '人工透析装置',
            'manufacturer_name': 'Fresenius Medical Care Japan',
            'manufacturer_name_jp': 'フレゼニウス・メディカル・ケア・ジャパン株式会社',
            'classification': 'Class III',
            'approval_date': '2023-12-05',
            'approval_status': 'Approved'
        }
    ]
    
    print("\nInserting PMDA data...")
    inserted = 0
    updated = 0
    
    for data in pmda_data:
        try:
            existing = supabase.table('pmda_approvals')\
                .select('id')\
                .eq('approval_number', data['approval_number'])\
                .execute()
            
            if existing.data:
                supabase.table('pmda_approvals')\
                    .update(data)\
                    .eq('approval_number', data['approval_number'])\
                    .execute()
                updated += 1
                print(f"  Updated: {data['approval_number']}")
            else:
                supabase.table('pmda_approvals').insert(data).execute()
                inserted += 1
                print(f"  Inserted: {data['approval_number']}")
        except Exception as e:
            print(f"  Error with {data['approval_number']}: {e}")
    
    print(f"\nPMDA Summary: {inserted} inserted, {updated} updated")
    return inserted, updated

def insert_sfda_data():
    """插入SFDA示例数据"""
    url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
    key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
    
    supabase = create_client(url, key)
    
    sfda_data = [
        {
            'mdma_number': 'MDMA-2024-0001234',
            'device_name': 'Patient Monitor',
            'device_name_ar': 'مراقب المريض',
            'manufacturer_name': 'Philips Healthcare',
            'manufacturer_name_ar': 'فيليبس للرعاية الصحية',
            'risk_class': 'Class B',
            'issue_date': '2024-01-10',
            'expiry_date': '2027-01-09',
            'approval_status': 'Approved'
        },
        {
            'mdma_number': 'MDMA-2024-0001235',
            'device_name': 'Infusion Pump',
            'device_name_ar': 'مضخة الحقن',
            'manufacturer_name': 'Becton Dickinson',
            'manufacturer_name_ar': 'بيكتون ديكنسون',
            'risk_class': 'Class C',
            'issue_date': '2024-02-05',
            'expiry_date': '2027-02-04',
            'approval_status': 'Approved'
        },
        {
            'mdma_number': 'MDMA-2023-0009876',
            'device_name': 'Surgical Instruments Set',
            'device_name_ar': 'مجموعة الأدوات الجراحية',
            'manufacturer_name': 'Medtronic',
            'manufacturer_name_ar': 'مدترونيك',
            'risk_class': 'Class A',
            'issue_date': '2023-11-15',
            'expiry_date': '2026-11-14',
            'approval_status': 'Approved'
        }
    ]
    
    print("\nInserting SFDA data...")
    inserted = 0
    updated = 0
    
    for data in sfda_data:
        try:
            existing = supabase.table('sfda_mdma')\
                .select('id')\
                .eq('mdma_number', data['mdma_number'])\
                .execute()
            
            if existing.data:
                supabase.table('sfda_mdma')\
                    .update(data)\
                    .eq('mdma_number', data['mdma_number'])\
                    .execute()
                updated += 1
                print(f"  Updated: {data['mdma_number']}")
            else:
                supabase.table('sfda_mdma').insert(data).execute()
                inserted += 1
                print(f"  Inserted: {data['mdma_number']}")
        except Exception as e:
            print(f"  Error with {data['mdma_number']}: {e}")
    
    print(f"\nSFDA Summary: {inserted} inserted, {updated} updated")
    return inserted, updated

def main():
    """主函数"""
    print("=" * 60)
    print("MDLooker International Data Import")
    print("=" * 60)
    
    try:
        # 插入HSA数据
        hsa_inserted, hsa_updated = insert_hsa_data()
        
        # 插入PMDA数据
        pmda_inserted, pmda_updated = insert_pmda_data()
        
        # 插入SFDA数据
        sfda_inserted, sfda_updated = insert_sfda_data()
        
        print("\n" + "=" * 60)
        print("Import Summary:")
        print("=" * 60)
        print(f"HSA:  {hsa_inserted} inserted, {hsa_updated} updated")
        print(f"PMDA: {pmda_inserted} inserted, {pmda_updated} updated")
        print(f"SFDA: {sfda_inserted} inserted, {sfda_updated} updated")
        print(f"Total: {hsa_inserted + pmda_inserted + sfda_inserted} inserted, {hsa_updated + pmda_updated + sfda_updated} updated")
        print("=" * 60)
        
    except Exception as e:
        print(f"\nError: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    main()
