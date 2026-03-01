#!/bin/bash
# EUDAMED 人工辅助爬虫运行脚本
# 一定能拿到数据！

echo "=========================================="
echo "EUDAMED 人工辅助爬虫"
echo "一定能拿到数据！"
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
pip3 list | grep -E "playwright|supabase" > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "📥 安装依赖..."
    pip3 install playwright supabase python-dotenv requests beautifulsoup4 lxml
fi

# 检查 Playwright 浏览器
echo "🌐 检查 Playwright 浏览器..."
python3 -m playwright install chromium 2>/dev/null || echo "浏览器已安装"

# 设置环境变量
echo ""
echo "⚙️  设置环境变量..."
export SUPABASE_URL="https://tiosujipxpvivdjwtfa.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="你的Service Role Key"

echo ""
echo "🚀 启动人工辅助爬虫..."
echo "⚠️  注意："
echo "   1. 会打开浏览器窗口"
echo "   2. 需要你在浏览器中手动点击菜单"
echo "   3. 按提示操作即可"
echo ""

# 运行爬虫
cd "$(dirname "$0")/scrapers"
python3 eudamed_manual_helper.py

echo ""
echo "=========================================="
echo "爬虫运行完成！"
echo "=========================================="
