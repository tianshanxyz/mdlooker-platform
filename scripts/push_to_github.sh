#!/bin/bash
# 推送代码到GitHub脚本

cd /Users/maxiaoha/Desktop/mdlooker-platform

# 配置Git用户信息
git config user.email "deploy@mdlooker.com"
git config user.name "MDLooker Deploy"

# 检查是否有.git目录
if [ ! -d ".git" ]; then
    echo "初始化Git仓库..."
    git init
fi

# 检查远程仓库
if ! git remote | grep -q "origin"; then
    echo "添加远程仓库..."
    git remote add origin https://github.com/tianshanxyz/mdlooker-platform.git
fi

# 获取远程最新代码
echo "获取远程代码..."
git fetch origin || echo "无法获取远程代码，可能仓库为空"

# 添加所有文件
echo "添加文件..."
git add .

# 提交
echo "提交更改..."
git commit -m "Update: Optimize NMPA table, add multi-country data support, improve search

Changes:
- Compress NMPA table from 7.2GB to 61MB
- Add Singapore HSA, Japan PMDA, Saudi SFDA data
- Optimize database queries
- Update UI components
- Add mobile support"

# 推送到GitHub
echo "推送到GitHub..."
git push -u origin main --force

echo "完成！"
