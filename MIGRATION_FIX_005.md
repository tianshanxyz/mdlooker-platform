# 📋 数据库迁移执行说明

## 修复内容

已修复 SQL 语法错误：
- Line 50: `monthly']` → `monthly')`
- Line 69: `wechat']` → `wechat')`

---

## 执行步骤

### 方法一：Supabase Dashboard（推荐）

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择你的项目
3. 进入 **SQL Editor**
4. 复制文件内容：`database/migrations/005_regulation_updates.sql`
5. 粘贴到 SQL Editor
6. 点击 **Run** 执行

---

## 验证成功

执行以下 SQL 验证：

```sql
-- 检查表是否创建成功
SELECT 
  'regulation_updates' as table_name,
  COUNT(*) as record_count
FROM regulation_updates
UNION ALL
SELECT 
  'user_subscriptions',
  COUNT(*)
FROM user_subscriptions
UNION ALL
SELECT 
  'push_notifications',
  COUNT(*)
FROM push_notifications;

-- 预期结果：
-- regulation_updates: 4 条记录
-- user_subscriptions: 0 条记录
-- push_notifications: 0 条记录
```

---

## 查看示例数据

```sql
-- 查看法规更新示例
SELECT 
  country_name,
  title_zh,
  importance,
  effective_date,
  action_required
FROM regulation_updates
ORDER BY published_date DESC;

-- 预期：4 条法规数据（新加坡、美国、欧盟、中国）
```

---

## 预期结果

### 表结构
✅ 3 张表创建成功：
- `regulation_updates` - 法规更新表
- `user_subscriptions` - 用户订阅表
- `push_notifications` - 推送通知表

### 示例数据
✅ 4 条法规更新数据：
- 🇸🇬 新加坡 - 医用口罩要求更新（High）
- 🇺🇸 美国 - FDA N95 呼吸器指南（Critical）
- 🇪🇺 欧盟 - MDR 实施更新（Medium）
- 🇨🇳 中国 - 医疗器械注册管理办法修订（Critical）

### 视图和函数
✅ `pending_notifications` - 待发送通知视图
✅ `send_notification()` - 通知函数

---

## 如果仍然报错

请提供完整的错误信息，包括：
1. 错误行号
2. 完整错误消息
3. SQL Editor 中的 SQL 内容截图

---

**修复完成时间**: 2026-03-19 23:50 UTC  
**状态**: 等待执行
