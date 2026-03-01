#!/usr/bin/env python3
"""
MDLooker APP 图标尺寸生成脚本
将主图标调整为各种所需尺寸
"""

from PIL import Image
import os

# 配置
SOURCE_ICON = '/Users/maxiaoha/Desktop/mdlooker-platform/public/icons/mdlooker.png'
OUTPUT_DIR = '/Users/maxiaoha/Desktop/mdlooker-platform/public/icons'

# 所需尺寸列表 (宽, 高, 文件名)
SIZES = [
    (72, 72, 'icon-72x72.png'),
    (96, 96, 'icon-96x96.png'),
    (128, 128, 'icon-128x128.png'),
    (144, 144, 'icon-144x144.png'),
    (152, 152, 'icon-152x152.png'),
    (192, 192, 'icon-192x192.png'),
    (384, 384, 'icon-384x384.png'),
    (512, 512, 'icon-512x512.png'),
]

def generate_icons():
    """生成各种尺寸的图标"""
    
    # 检查源文件是否存在
    if not os.path.exists(SOURCE_ICON):
        print(f"❌ 源文件不存在: {SOURCE_ICON}")
        return
    
    # 加载源图片
    try:
        source = Image.open(SOURCE_ICON)
        # 转换为RGBA模式（支持透明）
        if source.mode != 'RGBA':
            source = source.convert('RGBA')
        print(f"✅ 已加载源图标: {source.size[0]}x{source.size[1]}")
    except Exception as e:
        print(f"❌ 加载源图标失败: {e}")
        return
    
    # 生成各种尺寸
    for width, height, filename in SIZES:
        try:
            # 调整尺寸
            resized = source.resize((width, height), Image.Resampling.LANCZOS)
            
            # 保存
            output_path = os.path.join(OUTPUT_DIR, filename)
            resized.save(output_path, 'PNG')
            print(f"✅ 已生成: {filename} ({width}x{height})")
            
        except Exception as e:
            print(f"❌ 生成 {filename} 失败: {e}")
    
    print("\n🎉 图标生成完成！")
    print(f"📁 输出目录: {OUTPUT_DIR}")

if __name__ == '__main__':
    generate_icons()
