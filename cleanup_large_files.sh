#!/bin/bash
# 清理大文件脚本

cd /Users/maxiaoha/Desktop/mdlooker-platform

echo "=== 清理Git历史中的大文件 ==="

# 1. 从Git历史中彻底删除大文件
echo "1. 删除 nmpa_data_100000_records.json..."
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch scripts/nmpa_data_100000_records.json' \
  --prune-empty --tag-name-filter cat -- --all

echo "2. 删除 nmpa_progress_20files_95129records.json..."
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch scripts/nmpa_progress_20files_95129records.json' \
  --prune-empty --tag-name-filter cat -- --all

echo "3. 删除 nmpa_full_slim.json.gz..."
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch scripts/nmpa_full_slim.json.gz' \
  --prune-empty --tag-name-filter cat -- --all

echo "4. 删除 nmpa_progress_10files_50000records.json..."
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch scripts/nmpa_progress_10files_50000records.json' \
  --prune-empty --tag-name-filter cat -- --all

# 2. 清理垃圾回收
echo "5. 清理垃圾回收..."
rm -rf .git/refs/original/
git reflog expire --expire=now --all
git gc --prune=now --aggressive

echo "=== 清理完成 ==="
echo "现在可以执行: git push -u origin main --force"
