#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Supabase 连接测试脚本
用于验证环境变量配置和数据库连接
"""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# 加载环境变量
env_path = Path(__file__).parent.parent.parent / '.env.local'
load_dotenv(env_path)


def test_environment_variables():
    """测试环境变量配置"""
    print("=" * 60)
    print("1. 环境变量检查")
    print("=" * 60)
    
    url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
    anon_key = os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
    service_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
    
    errors = []
    
    if not url:
        errors.append("❌ NEXT_PUBLIC_SUPABASE_URL 未设置")
    else:
        print(f"✅ NEXT_PUBLIC_SUPABASE_URL: {url[:30]}...")
    
    if not anon_key:
        errors.append("❌ NEXT_PUBLIC_SUPABASE_ANON_KEY 未设置")
    else:
        print(f"✅ NEXT_PUBLIC_SUPABASE_ANON_KEY: {anon_key[:20]}...")
    
    if not service_key:
        errors.append("❌ SUPABASE_SERVICE_ROLE_KEY 未设置")
    else:
        print(f"✅ SUPABASE_SERVICE_ROLE_KEY: {service_key[:20]}...")
    
    if errors:
        print("\n错误详情:")
        for error in errors:
            print(f"  {error}")
        print("\n请检查 .env.local 文件配置")
        return False
    
    print("\n✅ 所有环境变量已配置")
    return True


def test_supabase_connection():
    """测试 Supabase 连接"""
    print("\n" + "=" * 60)
    print("2. Supabase 连接测试")
    print("=" * 60)
    
    try:
        from supabase import create_client
    except ImportError:
        print("❌ 未安装 supabase 库")
        print("   请运行: pip install supabase")
        return False
    
    url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
    service_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
    
    if not url or not service_key:
        print("❌ 环境变量未配置，跳过连接测试")
        return False
    
    try:
        # 创建客户端
        client = create_client(url, service_key)
        print("✅ Supabase 客户端创建成功")
        
        # 测试查询
        print("\n测试查询...")
        result = client.table('companies').select('*').limit(1).execute()
        print(f"✅ 查询成功！返回 {len(result.data)} 条记录")
        
        if result.data:
            print(f"   示例数据: {result.data[0].get('name', 'N/A')}")
        
        # 测试插入（可选）
        print("\n测试插入...")
        test_data = {
            'name': 'Test Company',
            'name_zh': '测试公司',
            'country': 'Test',
            'data_source': 'test'
        }
        
        try:
            insert_result = client.table('companies').insert(test_data).execute()
            print("✅ 插入成功！")
            
            # 清理测试数据
            if insert_result.data:
                test_id = insert_result.data[0].get('id')
                client.table('companies').delete().eq('id', test_id).execute()
                print("✅ 清理成功！")
        except Exception as e:
            print(f"⚠️  插入测试失败（可能是表不存在或权限问题）: {e}")
        
        return True
        
    except Exception as e:
        print(f"❌ 连接失败: {e}")
        print("\n可能的原因:")
        print("  1. 网络连接问题")
        print("  2. API 密钥错误")
        print("  3. Supabase 项目未启动")
        print("  4. 数据库表未创建")
        return False


def test_database_tables():
    """测试数据库表是否存在"""
    print("\n" + "=" * 60)
    print("3. 数据库表检查")
    print("=" * 60)
    
    try:
        from supabase import create_client
    except ImportError:
        print("❌ 未安装 supabase 库")
        return False
    
    url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
    service_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
    
    if not url or not service_key:
        print("❌ 环境变量未配置，跳过表检查")
        return False
    
    client = create_client(url, service_key)
    
    # 检查核心表
    tables = [
        'companies',
        'fda_registrations',
        'nmpa_registrations',
        'eudamed_registrations',
        'pmda_registrations',
        'health_canada_registrations'
    ]
    
    print("\n检查核心表:")
    all_exist = True
    
    for table in tables:
        try:
            result = client.table(table).select('count', count='exact').limit(0).execute()
            count = result.count if hasattr(result, 'count') else '?'
            print(f"  ✅ {table}: 存在 ({count} 条记录)")
        except Exception as e:
            print(f"  ❌ {table}: 不存在或无法访问")
            all_exist = False
    
    if all_exist:
        print("\n✅ 所有核心表已创建")
    else:
        print("\n⚠️  部分表不存在，请执行 database/schema.sql")
    
    return all_exist


def main():
    """主函数"""
    print("=" * 60)
    print("Supabase 配置验证工具")
    print("=" * 60)
    print()
    
    # 检查环境变量
    env_ok = test_environment_variables()
    
    if not env_ok:
        print("\n" + "=" * 60)
        print("❌ 配置验证失败")
        print("=" * 60)
        print("\n请按照以下步骤配置:")
        print("1. 复制 .env.local.example 为 .env.local")
        print("2. 编辑 .env.local，填入 Supabase 配置")
        print("3. 重新运行此脚本")
        return 1
    
    # 测试连接
    connection_ok = test_supabase_connection()
    
    if not connection_ok:
        print("\n" + "=" * 60)
        print("❌ 连接测试失败")
        print("=" * 60)
        return 1
    
    # 检查表
    tables_ok = test_database_tables()
    
    print("\n" + "=" * 60)
    if tables_ok:
        print("🎉 所有测试通过！Supabase 配置正确")
    else:
        print("⚠️  部分测试未通过，但核心功能可用")
    print("=" * 60)
    
    print("\n下一步:")
    print("  1. 启动应用: npm run dev")
    print("  2. 访问 http://localhost:3000")
    print("  3. 测试数据导入: python3 run_data_pipeline.py")
    
    return 0 if tables_ok else 1


if __name__ == '__main__':
    sys.exit(main())
