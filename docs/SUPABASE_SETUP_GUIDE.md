# Supabase 环境变量配置指南

## 🚀 快速开始（3 步）

### 第 1 步：创建 Supabase 项目

1. 访问 [Supabase](https://supabase.com) 官网
2. 点击 "Start your project"
3. 使用 GitHub 账号登录
4. 点击 "New project"
5. 填写项目名称（如：mdlooker-platform）
6. 设置数据库密码（请牢记！）
7. 选择区域（建议选择离用户最近的区域）
8. 点击 "Create new project"
9. 等待项目创建完成（约 1-2 分钟）

### 第 2 步：获取 API 密钥

1. 进入项目 Dashboard
2. 点击左侧菜单 "Project Settings"（项目设置）
3. 选择 "API" 标签页
4. 复制以下信息：

```
Project URL: https://xxxxxxxxxxxx.supabase.co
  → 对应环境变量：NEXT_PUBLIC_SUPABASE_URL

anon public: eyJhbGciOiJIUzI1NiIs...
  → 对应环境变量：NEXT_PUBLIC_SUPABASE_ANON_KEY

service_role secret: eyJhbGciOiJIUzI1NiIs...
  → 对应环境变量：SUPABASE_SERVICE_ROLE_KEY
```

⚠️ **重要提示**：
- `anon` 密钥用于客户端，权限受限
- `service_role` 密钥用于服务端，具有完全数据库访问权限，**请勿泄露！**

### 第 3 步：配置环境变量

#### 方法一：本地开发环境

```bash
# 1. 复制模板文件
cp .env.local.example .env.local

# 2. 编辑 .env.local 文件
nano .env.local
# 或使用 VS Code: code .env.local

# 3. 填入实际值
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# 4. 保存文件
```

#### 方法二：Vercel 部署环境

```bash
# 1. 登录 Vercel
vercel login

# 2. 进入项目目录
cd /Users/maxiaoha/Desktop/mdlooker-platform

# 3. 添加环境变量
vercel env add NEXT_PUBLIC_SUPABASE_URL
# 输入: https://your-project.supabase.co

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# 输入: your-anon-key

vercel env add SUPABASE_SERVICE_ROLE_KEY
# 输入: your-service-role-key

# 4. 重新部署
vercel --prod
```

#### 方法三：Vercel Web 界面

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择你的项目
3. 点击 "Settings"（设置）
4. 选择 "Environment Variables"（环境变量）
5. 添加以下变量：
   - Name: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: `https://your-project.supabase.co`
   - Environment: Production, Preview, Development

   - Name: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Value: `your-anon-key`
   - Environment: Production, Preview, Development

   - Name: `SUPABASE_SERVICE_ROLE_KEY`
   - Value: `your-service-role-key`
   - Environment: Production, Preview, Development

6. 点击 "Save" 保存
7. 重新部署项目

---

## 🗄️ 数据库表结构导入

### 方法一：使用 SQL Editor（推荐）

1. 进入 Supabase Dashboard
2. 点击左侧菜单 "SQL Editor"
3. 点击 "New query"
4. 打开 `database/schema.sql` 文件
5. 复制全部内容
6. 粘贴到 SQL Editor
7. 点击 "Run" 执行

### 方法二：使用 Supabase CLI

```bash
# 1. 安装 Supabase CLI
npm install -g supabase

# 2. 登录
supabase login

# 3. 链接项目
supabase link --project-ref your-project-ref

# 4. 执行 SQL 文件
supabase db execute --file database/schema.sql
```

### 方法三：使用种子数据（可选）

```bash
# 导入示例数据
npx ts-node scripts/import-seed-data.ts
```

---

## ✅ 验证配置

### 测试 1：检查环境变量

```bash
# 查看当前环境变量
cat .env.local | grep SUPABASE

# 预期输出：
# NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
# SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...
```

### 测试 2：测试数据库连接

```bash
# 运行测试脚本
cd scripts/scrapers
python3 test_supabase_connection.py

# 预期输出：
# ✅ Supabase URL: https://xxxxxxxxxxxx.supabase.co
# ✅ Service Role Key: eyJhbG...
# ✅ 查询成功！返回 X 条记录
# ✅ 插入成功！
# ✅ 清理成功！
# 🎉 Supabase 连接正常！
```

### 测试 3：启动应用测试

```bash
# 启动开发服务器
npm run dev

# 访问 http://localhost:3000
# 测试以下功能：
# - 首页加载
# - 搜索功能
# - 数据查询
```

---

## 🔧 常见问题

### 问题 1：环境变量未生效

**症状**：
```
Error: Supabase URL and Key are required
```

**解决方案**：
```bash
# 1. 确认文件存在
ls -la .env.local

# 2. 确认变量已设置
cat .env.local | grep SUPABASE

# 3. 重启应用
# 修改 .env.local 后需要重启 Next.js 开发服务器

# 4. 清除缓存
rm -rf .next
npm run dev
```

### 问题 2：数据库连接失败

**症状**：
```
Error: Failed to connect to Supabase
```

**解决方案**：
```bash
# 1. 检查网络连接
ping your-project.supabase.co

# 2. 确认 URL 正确
# 确保没有多余的空格或换行

# 3. 检查密钥权限
# anon key 用于客户端查询
# service_role key 用于服务端数据导入

# 4. 检查 IP 白名单
# Supabase Dashboard → Database → IPv4
# 确保你的 IP 没有被阻止
```

### 问题 3：表不存在

**症状**：
```
Error: relation "companies" does not exist
```

**解决方案**：
```bash
# 1. 确认已执行 schema.sql
# 使用 SQL Editor 重新执行

# 2. 检查表是否创建成功
# Supabase Dashboard → Table Editor
# 查看表列表

# 3. 检查 schema
# 确保在 public schema 下创建表
```

### 问题 4：权限不足

**症状**：
```
Error: new row violates row-level security policy
```

**解决方案**：
```sql
-- 1. 禁用 RLS（开发环境）
ALTER TABLE companies DISABLE ROW LEVEL SECURITY;

-- 2. 或创建策略（生产环境）
CREATE POLICY "Enable read access for all users" ON companies
  FOR SELECT USING (true);
```

---

## 🔒 安全最佳实践

### 1. 密钥管理

```bash
# ✅ 正确做法
# 1. 使用 .env.local 存储密钥
# 2. .env.local 已添加到 .gitignore
# 3. 生产环境使用强密码

# ❌ 错误做法
# 1. 将密钥硬编码在代码中
# 2. 将密钥提交到 Git
# 3. 在日志中打印密钥
```

### 2. 权限控制

```sql
-- 生产环境建议配置

-- 1. 启用 RLS
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- 2. 创建读取策略
CREATE POLICY "Enable read access for all users" ON companies
  FOR SELECT USING (true);

-- 3. 创建写入策略（仅认证用户）
CREATE POLICY "Enable insert for authenticated users only" ON companies
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```

### 3. 定期轮换密钥

```bash
# 1. 在 Supabase Dashboard 生成新密钥
# Project Settings → API → Generate new secret

# 2. 更新环境变量
# 本地：修改 .env.local
# Vercel：更新 Environment Variables

# 3. 重新部署应用
vercel --prod
```

---

## 📊 配置检查清单

### 开发环境

- [ ] 创建 Supabase 项目
- [ ] 获取 API 密钥（URL, anon, service_role）
- [ ] 创建 `.env.local` 文件
- [ ] 填入环境变量
- [ ] 导入数据库表结构
- [ ] 测试数据库连接
- [ ] 启动应用验证

### 生产环境

- [ ] 使用生产环境 Supabase 项目
- [ ] 配置 Vercel 环境变量
- [ ] 设置强密码和密钥
- [ ] 启用 RLS 和权限控制
- [ ] 配置备份策略
- [ ] 监控数据库性能
- [ ] 定期轮换密钥

---

## 🆘 获取帮助

### 官方文档

- [Supabase 官方文档](https://supabase.com/docs)
- [Supabase JavaScript 客户端](https://supabase.com/docs/reference/javascript)
- [Supabase Python 客户端](https://supabase.com/docs/reference/python)

### 社区支持

- [Supabase Discord](https://discord.supabase.com)
- [Supabase GitHub](https://github.com/supabase/supabase)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/supabase)

### MDLooker 支持

- 查看 `docs/` 目录下的其他文档
- 检查日志文件 `logs/` 目录
- 提交 Issue 到 GitHub

---

## ✅ 快速验证命令

```bash
# 1. 检查环境变量
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
echo $SUPABASE_SERVICE_ROLE_KEY

# 2. 测试连接
cd scripts/scrapers
python3 -c "
from supabase import create_client
import os
url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
client = create_client(url, key)
result = client.table('companies').select('*').limit(1).execute()
print('✅ 连接成功！')
print(f'数据: {result.data}')
"

# 3. 启动应用
npm run dev
```

---

**最后更新**: 2026-03-16  
**版本**: 1.0.0  
**状态**: ✅ 配置指南完成
