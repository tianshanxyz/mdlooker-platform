#!/bin/bash
# EUDAMED 爬虫运行脚本
# 在你的 Mac 本地终端运行此脚本

echo "=========================================="
echo "EUDAMED 数据爬虫"
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
export SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpb3N1amlweHB2aXZkam13dGZhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTkwNDcwMSwiZXhwIjoyMDg1NDgwNzAxfQ.JF0V15N88ihN2cvU6iPohDYwuntECXTUOEaxOOMrVi0"

echo ""
echo "🚀 开始抓取 EUDAMED 数据..."
echo "⚠️  注意：会打开浏览器窗口，请不要关闭"
echo ""

# 运行爬虫（使用 V2 调试版本）
cd "$(dirname "$0")/scrapers"
echo "🧪 运行调试版本，用于检查 EUDAMED 网站结构"
python3 eudamed_scraper_v2.py

echo ""
echo "=========================================="
echo "爬虫运行完成！"
echo "=========================================="
