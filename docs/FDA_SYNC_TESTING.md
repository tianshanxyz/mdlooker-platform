# FDA 数据同步测试指南

## 本地测试限制

FDA_API_KEY 已配置在 Vercel 环境变量中，本地开发环境无法直接访问。请使用以下方法测试：

## 测试方法

### 方法 1: 部署到 Vercel 后测试

1. **确保代码已部署到 Vercel**
   ```bash
   git add .
   git commit -m "Add FDA sync functionality"
   git push
   ```

2. **在 Vercel Dashboard 中验证环境变量**
   - 打开项目设置 → Environment Variables
   - 确认 `FDA_API_KEY` 已设置

3. **测试 API 端点**
   ```bash
   # 测试 FDA 同步（获取10条记录）
   curl "https://你的域名.com/api/fda-sync?limit=10"
   
   # 预期响应
   {
     "success": true,
     "message": "FDA data sync completed",
     "stats": {
       "fetched": 10,
       "companiesAdded": 5,
       "registrationsAdded": 10,
       "errors": 0
     }
   }
   ```

### 方法 2: 使用 Vercel CLI 本地测试

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 拉取环境变量
vercel env pull .env.local

# 启动开发服务器
npm run dev

# 测试 API
curl "http://localhost:3000/api/fda-sync?limit=5"
```

### 方法 3: 直接在 Supabase 中查看

部署后，FDA 同步数据将存储在以下表中：
- `companies` - 公司基本信息
- `fda_registrations` - FDA 注册详细信息

## API 端点说明

### GET /api/fda-sync
手动触发 FDA 数据同步

**参数:**
- `limit` - 获取记录数（默认 100，最大 1000）
- `skip` - 跳过记录数（用于分页）

**示例:**
```bash
# 获取前 50 条记录
curl "https://你的域名.com/api/fda-sync?limit=50"

# 获取第 51-100 条记录
curl "https://你的域名.com/api/fda-sync?limit=50&skip=50"
```

### POST /api/fda-sync
带认证的同步（用于定时任务）

**Headers:**
```
Authorization: Bearer YOUR_SYNC_TOKEN
Content-Type: application/json
```

**Body:**
```json
{
  "limit": 100,
  "skip": 0
}
```

## 定时任务配置

已在 `vercel.json` 中配置每天凌晨 2 点自动同步：

```json
{
  "crons": [
    {
      "path": "/api/cron/sync-fda",
      "schedule": "0 2 * * *"
    }
  ]
}
```

## 故障排除

### 问题: "FDA_API_KEY not configured"
**解决:** 在 Vercel Dashboard → Project Settings → Environment Variables 中添加 `FDA_API_KEY`

### 问题: "Unauthorized"
**解决:** POST 请求需要添加正确的 `Authorization: Bearer TOKEN` header

### 问题: 数据未写入 Supabase
**解决:** 检查 Supabase 连接配置和表权限

## 验证数据导入

同步成功后，在 Supabase SQL Editor 中运行：

```sql
-- 查看同步的公司数量
SELECT COUNT(*) as company_count FROM companies WHERE fda_fei_number IS NOT NULL;

-- 查看 FDA 注册记录数量
SELECT COUNT(*) as registration_count FROM fda_registrations;

-- 查看最新同步的记录
SELECT * FROM fda_registrations ORDER BY created_at DESC LIMIT 5;
```
