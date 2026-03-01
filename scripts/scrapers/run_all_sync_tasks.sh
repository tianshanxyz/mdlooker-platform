#!/usr/bin/env python3
"""
EUDAMED 数据同步主脚本
执行所有数据同步任务
"""

import os
import sys
import subprocess

def run_task(task_name: str, script_path: str):
    """运行单个任务"""
    print(f"\n{'='*60}")
    print(f"🚀 运行任务: {task_name}")
    print(f"{'='*60}")
    
    try:
        result = subprocess.run(
            ['python3', script_path],
            capture_output=True,
            text=True,
            check=True
        )
        
        if result.returncode == 0:
            print(f"✅ {task_name} 完成")
            print(result.stdout)
        else:
            print(f"❌ {task_name} 失败")
            print(result.stderr)
    
    except Exception as e:
        print(f"❌ {task_name} 异常: {e}")
    
    print(f"{'='*60}")


def main():
    print("="*60)
    print("EUDAMED 数据同步系统")
    print("="*60)
    print()
    
    tasks = [
        {
            'name': '批量上传数据到 Supabase',
            'script': 'upload_to_supabase_reliable.py',
            'description': '使用可靠的上传脚本（小批次+重试）'
        },
        {
            'name': '定期同步 EUDAMED 数据',
            'script': 'sync_eudamed_data.py',
            'description': '定期从 EUDAMED 网站抓取最新数据'
        },
        {
            'name': '检查 mdlooker.com 搜索问题',
            'description': '检查搜索结果是否只有公司名'
        },
        {
            'name': '修复 NMPA 爬虫',
            'script': 'nmpa_scraper.py',
            'description': '修复 NMPA 爬虫脚本'
        },
        {
            'name': '继续爬取 NMPA 数据',
            'script': 'nmpa_scraper.py',
            'description': '继续爬取 NMPA 数据'
        },
    ]
    
    print("📋 可用任务:")
    for i, task in enumerate(tasks, 1):
        print(f"  {i}. {task['name']}")
        print(f"     {task['description']}")
    
    print(f"\n{'='*60}")
    print("请选择要运行的任务:")
    print("  1. 批量上传数据到 Supabase")
    print("  2. 定期同步 EUDAMED 数据")
    print("  3. 检查 mdlooker.com 搜索问题")
    print("  4. 修复 NMPA 爬虫")
    print("  5. 继续爬取 NMPA 数据")
    print()
    print("输入任务编号（1-5），或输入 'all' 运行所有任务")
    print(f"{'='*60}")
    
    choice = input("👉 请选择: ").strip().lower()
    
    if choice == 'all':
        print("\n🚀 运行所有任务...")
        for task in tasks:
            run_task(task['name'], task['script'])
    elif choice in ['1', '2', '3', '4', '5']:
        task = tasks[int(choice) - 1]
        run_task(task['name'], task['script'])
    else:
        print("❌ 无效选择")
    
    print(f"\n{'='*60}")
    print("✅ 完成！")
    print(f"{'='*60}")


if __name__ == '__main__':
    main()
