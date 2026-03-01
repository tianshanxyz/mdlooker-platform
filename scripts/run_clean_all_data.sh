#!/bin/bash
# EUDAMED 数据清洗 - 完整版运行脚本

echo "=========================================="
echo "EUDAMED 数据清洗 - 完整版"
echo "汇总所有数据，清洗去重，输出 CSV"
echo "=========================================="
echo ""

cd "$(dirname "$0")/scrapers"

# 运行清洗脚本
python3 clean_eudamed_data_complete.py

echo ""
echo "=========================================="
echo "清洗完成！"
echo ""
echo "📁 输出文件说明："
echo "   - eudamed_all_data_*.csv: 所有数据汇总"
echo "   - eudamed_manufacturers_*.csv: 制造商数据"
echo "   - eudamed_importers_*.csv: 进口商数据"
echo "   - eudamed_devices_*.csv: 器械数据"
echo ""
echo "💡 上传到 Supabase:"
echo "   1. 登录 Supabase Dashboard"
echo "   2. 进入 Table Editor"
echo "   3. 选择对应表"
echo "   4. 点击 Import > Upload CSV"
echo "=========================================="
