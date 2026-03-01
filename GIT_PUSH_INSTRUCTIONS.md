# GitHub 推送指南

由于系统Xcode许可限制，请手动执行以下步骤推送代码到GitHub：

## 步骤1：配置Git

```bash
cd /Users/maxiaoha/Desktop/mdlooker-platform

# 配置用户信息
git config user.email "deploy@mdlooker.com"
git config user.name "MDLooker Deploy"

# 检查Git状态
git status
```

## 步骤2：添加和提交文件

```bash
# 添加所有文件
git add .

# 提交更改
git commit -m "Update: Optimize NMPA table, add multi-country data support

Changes:
- Compress NMPA table from 7.2GB to 61MB (99% reduction)
- Add Singapore HSA, Japan PMDA, Saudi SFDA data (1829 records)
- Optimize database queries and indexes
- Update UI components and mobile support
- Add AI assistant and compliance profile features"
```

## 步骤3：推送到GitHub

```bash
# 推送到远程仓库
git push -u origin main --force
```

## 步骤4：验证推送

访问 https://github.com/tianshanxyz/mdlooker-platform 确认代码已更新

## 步骤5：Vercel自动部署

代码推送到GitHub后，Vercel会自动重新部署网站。
访问 https://vercel.com/dashboard 查看部署状态。

## 数据验证清单

部署完成后，请验证以下功能：

- [ ] 网站能正常访问 mdlooker.com
- [ ] 搜索功能正常工作
- [ ] NMPA数据能正常显示
- [ ] HSA/PMDA/SFDA数据能正常显示
- [ ] AI助手功能正常
- [ ] 企业对比功能正常
- [ ] 移动端页面正常

## 问题排查

如果推送失败，尝试：

1. 检查网络连接
2. 确认GitHub仓库权限
3. 使用GitHub Desktop图形界面推送
4. 或者将代码压缩后上传到GitHub Releases
