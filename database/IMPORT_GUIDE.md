# Supabase 数据导入指南

## 概述

本指南说明如何将扩展数据导入到 Supabase 数据库。包含 62 家公司和 92 个产品的完整数据。

## 数据内容

### 公司数据 (62家)
- **基础数据**: 12家全球知名医疗器械公司
- **扩展数据**: 50家新增公司（3M、BD、GE Healthcare、Philips等）

### 产品数据 (92个)
- **基础数据**: 12个高端医疗器械产品
- **扩展数据**: 80个常见产品，包括：
  - 口罩类：N95口罩、外科口罩
  - 注射器类：各类注射器、胰岛素注射器
  - 手套类：乳胶手套、丁腈手套
  - 绷带敷料：纱布、透明敷料、泡沫敷料
  - 导管类：导尿管、静脉导管
  - 手术器械：手术刀、超声刀、手术剪
  - 监护设备：病人监护仪、血氧仪
  - 血糖监测：血糖仪
  - 轮椅康复：手动轮椅、电动轮椅、假肢
  - 听力设备：助听器、人工耳蜗
  - 实验室设备：血液分析仪、测序仪

## 导入方法

### 方法一：使用 SQL 文件（最简单，推荐）

如果 TypeScript 脚本遇到问题，直接使用 SQL 文件是最可靠的方法：

1. **登录 Supabase Dashboard**
   - 访问 https://app.supabase.io
   - 选择你的项目

2. **打开 SQL Editor**
   - 点击左侧菜单 "SQL Editor"
   - 选择 "New query"

3. **执行 SQL 文件**
   - 复制 `database/seed_data_backup.sql` 的内容
   - 粘贴到 SQL Editor
   - 点击 "Run"

### 方法二：使用 TypeScript 脚本

1. **安装依赖**
```bash
cd /Users/maxiaoha/Desktop/mdlooker-platform
npm install @supabase/supabase-js ts-node typescript
```

2. **设置环境变量**
```bash
export NEXT_PUBLIC_SUPABASE_URL="你的Supabase URL"
export NEXT_PUBLIC_SUPABASE_ANON_KEY="你的Supabase Anon Key"
```

3. **运行导入脚本**
```bash
npx ts-node scripts/import-seed-data.ts
```

**注意**：如果遇到 `TypeError: fetch failed` 错误，请使用方法一（SQL文件）导入。

1. **登录 Supabase Dashboard**
   - 访问 https://app.supabase.io
   - 选择你的项目

2. **打开 SQL Editor**
   - 点击左侧菜单 "SQL Editor"
   - 选择 "New query"

3. **执行 SQL 文件**
   - 复制 `database/seed_data_extended.sql` 的内容
   - 粘贴到 SQL Editor
   - 点击 "Run"

### 方法三：使用 Supabase CLI

1. **安装 Supabase CLI**
```bash
npm install -g supabase
```

2. **登录**
```bash
supabase login
```

3. **链接项目**
```bash
supabase link --project-ref 你的项目ID
```

4. **执行 SQL**
```bash
supabase db execute --file database/seed_data_extended.sql
```

## 验证导入

导入完成后，运行以下 SQL 查询验证数据：

```sql
-- 检查公司数量
SELECT COUNT(*) as company_count FROM companies;

-- 检查产品数量
SELECT COUNT(*) as product_count FROM products;

-- 查看部分公司数据
SELECT name, name_zh, country FROM companies LIMIT 10;

-- 查看部分产品数据
SELECT name, name_zh, category FROM products LIMIT 10;

-- 按类别统计产品
SELECT category, COUNT(*) as count 
FROM products 
GROUP BY category 
ORDER BY count DESC;
```

## 常见问题

### 1. 重复数据
脚本使用 `UPSERT` 操作，如果数据已存在会更新而不是报错。

### 2. 外键约束
确保先导入公司数据，再导入产品数据（产品依赖公司）。

### 3. 权限问题
确保使用的 Supabase Key 有写入权限（使用 `anon` key 或 `service_role` key）。

### 4. 网络问题
如果导入中断，可以重新运行脚本，已导入的数据不会重复。

## 数据更新

如需更新数据：

1. 修改 `scripts/import-seed-data.ts` 中的数据
2. 重新运行脚本
3. 或使用 SQL `UPDATE` 语句

## 备份建议

导入前建议备份数据：

```sql
-- 导出数据
\copy companies TO 'companies_backup.csv' CSV HEADER;
\copy products TO 'products_backup.csv' CSV HEADER;
```

## 后续步骤

导入完成后：

1. **测试搜索功能** - 访问网站测试搜索
2. **同步 FDA 数据** - 运行 `/api/fda-sync` 获取真实注册数据
3. **设置自动同步** - 配置定时任务定期更新数据

## 支持

如有问题，请检查：
- Supabase 连接配置
- 数据库表结构是否正确
- 环境变量是否设置
