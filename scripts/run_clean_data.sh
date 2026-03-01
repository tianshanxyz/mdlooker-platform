#!/bin/bash
# 数据清洗运行脚本

echo "=========================================="
echo "EUDAMED 数据清洗"
echo "=========================================="
echo ""

cd "$(dirname "$0")/scrapers"

# 检查是否有参数
if [ $# -eq 0 ]; then
    echo "🔍 自动查找最新的数据文件..."
    python3 clean_eudamed_data.py
else
    echo "📂 处理指定文件: $1"
    python3 clean_eudamed_data.py "$1"
fi

echo ""
echo "=========================================="
echo "清洗完成！"
echo "=========================================="
