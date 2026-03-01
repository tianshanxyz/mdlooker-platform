#!/bin/bash
# EUDAMED 智能自动爬虫运行脚本

echo "=========================================="
echo "EUDAMED 智能自动爬虫"
echo "自动检测分页，自动翻页"
echo "=========================================="
echo ""

# 检查 Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 未安装"
    exit 1
fi

echo "✅ Python3 已安装"

# 检查依赖
echo "📦 检查依赖..."
pip3 list | grep -E "playwright" > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "📥 安装依赖..."
    pip3 install playwright
fi

# 检查 Playwright 浏览器
echo "🌐 检查 Playwright 浏览器..."
python3 -m playwright install chromium 2>/dev/null || echo "浏览器已安装"

echo ""
echo "🚀 启动智能自动爬虫..."
echo "⚠️  注意："
echo "   1. 首次需要手动导航到搜索页面"
echo "   2. 之后会自动检测分页并翻页"
echo "   3. 如果自动翻页失败，会提示手动操作"
echo ""

# 运行爬虫
cd "$(dirname "$0")/scrapers"
python3 eudamed_smart_auto.py

echo ""
echo "=========================================="
echo "爬虫运行完成！"
echo "=========================================="
