# 无需信用卡的搜索方案

## 问题
Brave Search API 需要国际信用卡才能申请

## 解决方案

### 方案 A：Google Custom Search API（推荐）

**免费额度**: 100次/天
**申请**: 只需要 Gmail，不需要信用卡

**申请步骤**:
1. 访问 https://programmablesearchengine.google.com/
2. 用 Gmail 登录
3. 点击 "Create a custom search engine"
4. 填写：
   - Name: MDLooker Search
   - Sites to search: 留空（表示搜索全网）
5. 创建后点击 "Control Panel" → "Search engine ID"（这就是 CX）
6. 访问 https://developers.google.com/custom-search/v1/introduction
7. 点击 "Get a Key" → 创建项目 → 获取 API Key

**配置到 Vercel**:
```
GOOGLE_SEARCH_API_KEY=你的API_Key
GOOGLE_SEARCH_CX=你的CX_ID
```

### 方案 B：DuckDuckGo 跳转（备用）

当 API 配额用完时，直接跳转到 DuckDuckGo：
```
https://duckduckgo.com/?q=face+mask+medical+device
```

### 方案 C：SearXNG 自建（长期方案）

当用户量增长后，自建 SearXNG：
```bash
# 部署到 $5/月的 VPS
docker run -d --name searxng -p 8080:8080 searxng/searxng
```

## 推荐实施顺序

1. **立即**: 申请 Google Custom Search API（免费，无需信用卡）
2. **部署**: 修改代码支持 Google API + DuckDuckGo 备用
3. **后期**: 如果 100次/天不够，再考虑 SearXNG 自建

## 成本对比

| 方案 | 成本 | 搜索次数 | 实施难度 |
|------|------|---------|---------|
| Google Custom Search | $0 | 100次/天 | 低 |
| DuckDuckGo 跳转 | $0 | 无限 | 极低 |
| SearXNG 自建 | $5/月 | 无限 | 中 |

## 下一步

要我修改代码支持 Google Custom Search API 吗？
