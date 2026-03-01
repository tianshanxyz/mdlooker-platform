#!/usr/bin/env python3
"""
测试Supabase连接状态
"""
import os
import sys
from pathlib import Path

# 添加项目根目录到Python路径
project_root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(project_root))

from supabase import create_client
from dotenv import load_dotenv

# 加载环境变量
env_path = project_root / '.env.local'
load_dotenv(env_path)

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_SERVICE_ROLE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

def test_connection():
    """测试Supabase连接"""
    try:
        print("🔄 正在连接Supabase...")
        supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
        
        # 尝试查询一条记录
        print("🔄 测试查询 hsa_registrations 表...")
        result = supabase.table('hsa_registrations').select('*').limit(1).execute()
        print(f"✅ 查询成功！返回 {len(result.data)} 条记录")
        
        # 尝试插入测试数据
        print("🔄 测试插入数据...")
        test_record = {
            'registration_number': 'TEST-001',
            'device_name': 'Test Device',
            'manufacturer_name': 'Test Manufacturer',
            'device_class': 'B',
            'registration_status': 'Active',
            'authority': 'HSA',
            'country': 'Singapore'
        }
        
        insert_result = supabase.table('hsa_registrations').insert(test_record).execute()
        print(f"✅ 插入成功！")
        
        # 清理测试数据
        print("🔄 清理测试数据...")
        supabase.table('hsa_registrations').delete().eq('registration_number', 'TEST-001').execute()
        print(f"✅ 清理成功！")
        
        print("\n🎉 Supabase服务已恢复正常！可以开始批量导入数据。")
        return True
        
    except Exception as e:
        print(f"\n❌ Supabase连接失败: {e}")
        print("\n⏳ 服务尚未恢复，请稍后重试。")
        return False

if __name__ == '__main__':
    test_connection()
