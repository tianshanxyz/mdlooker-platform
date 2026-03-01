#!/usr/bin/env python3
"""
生成 SVG 图标文件
使用 Lucide 风格的图标
"""

import os

OUTPUT_DIR = '/Users/maxiaoha/Desktop/mdlooker-platform/public/icons'

# SVG 图标定义
ICONS = {
    'search.svg': '''<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="#339999" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>''',
    
    'favorites.svg': '''<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 24 24" fill="#339999" stroke="#339999" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>''',
    
    'scan.svg': '''<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="#339999" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><rect width="10" height="8" x="7" y="8" rx="1"/></svg>''',
    
    'badge-72x72.svg': '''<svg xmlns="http://www.w3.org/2000/svg" width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>''',
}

def generate_svg_icons():
    """生成 SVG 图标文件"""
    
    for filename, svg_content in ICONS.items():
        try:
            filepath = os.path.join(OUTPUT_DIR, filename)
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(svg_content)
            print(f"✅ 已生成: {filename}")
        except Exception as e:
            print(f"❌ 生成 {filename} 失败: {e}")
    
    print("\n🎉 SVG 图标生成完成！")

if __name__ == '__main__':
    generate_svg_icons()
