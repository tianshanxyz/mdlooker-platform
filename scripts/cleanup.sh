#!/bin/bash
# 清理 scripts 文件夹中的临时文件

echo "🧹 开始清理临时文件..."

# 删除 EUDAMED 截图（保留最新的 10 个作为示例）
echo "📸 清理 EUDAMED 截图..."
cd /Users/maxiaoha/Desktop/mdlooker-platform/scripts/scrapers
ls -t eudamed_page_*.png | tail -n +11 | xargs -I {} rm -f {}

# 删除 NMPA 临时文件
echo "🗑️  清理 NMPA 临时文件..."
rm -f nmpa_*.png nmpa_*.html nmpa_progress_*.json nmpa_data_backup_*.json

# 删除其他临时文件
echo "🗑️  清理其他临时文件..."
rm -f *.png *.html 2>/dev/null
rm -f eudamed_data_backup_page_*.json 2>/dev/null
rm -f nmpa_progress_*.json 2>/dev/null

# 保留的核心文件
echo "✅ 保留核心文件："
echo "  - EUDAMED 爬虫脚本"
echo "  - NMPA 解析和上传脚本"
echo "  - 数据清洗脚本"
echo "  - 最新的数据文件"

echo "🎉 清理完成！"
