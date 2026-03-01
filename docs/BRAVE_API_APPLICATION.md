# Brave Search API 申请指南

## 申请步骤

### 1. 访问申请页面
打开：https://api.search.brave.com/app/keys

### 2. 登录/注册账号
- 可以使用 Gmail 账号直接登录
- 或使用其他邮箱注册

### 3. 创建 API Key
1. 点击 "Create API Key"
2. 输入项目名称："MDLooker Medical Device Search"
3. 选择用途："Web Search"
4. 点击确认

### 4. 获取 API Key
- 复制生成的 API Key（格式：BSAxxxxx...）
- 保存好，只显示一次

### 5. 配置到 Vercel
在 Vercel Dashboard → Project Settings → Environment Variables 中添加：
```
BRAVE_API_KEY=你的API_Key
```

## 免费额度
- 每月 2000 次搜索
- 对于初期用户完全够用

## 注意事项
- API Key 不要泄露
- 可以在 Brave 后台查看使用量
- 超出免费额度后需要付费（$0.005/次）

---

## 申请完成后告诉我
获取到 API Key 后，请添加到 Vercel 环境变量，然后告诉我，我继续接入代码。
