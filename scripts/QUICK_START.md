# 快速开始指南

由于环境变量加载问题，最简单可靠的方法是使用现有的API端点。开发服务器已经在运行（terminal 21），我们通过curl来调用API。

## 前置条件
✅ 开发服务器已启动：`npm run dev` (在 terminal 21 中运行)

---

## 第一步：存储监控

打开浏览器访问或使用curl：

```bash
# 查看存储状态
curl "http://localhost:3000/api/admin/storage-monitor"
```

---

## 第二步：NMPA数据核实

直接通过stats API查看数据：

```bash
# 查看国家统计数据
curl "http://localhost:3000/api/stats?type=country-summary"
```

---

## 第三步：FDA数据同步

使用现有的FDA同步API：

```bash
# 手动触发FDA增量同步
curl -X POST "http://localhost:3000/api/fda-sync"
```

或者通过浏览器访问：
http://localhost:3000/api/fda-sync

---

## 第四步：验证同步结果

同步完成后，再次检查统计数据：

```bash
curl "http://localhost:3000/api/stats?type=country-summary"
```

---

## 完整实施步骤总结

1. **确保开发服务器运行** (已完成)
2. **执行存储监控**：`curl "http://localhost:3000/api/admin/storage-monitor"`
3. **查看当前统计**：`curl "http://localhost:3000/api/stats?type=country-summary"`
4. **触发FDA同步**：`curl -X POST "http://localhost:3000/api/fda-sync"`
5. **等待同步完成** (约1-2分钟)
6. **再次检查统计**：`curl "http://localhost:3000/api/stats?type=country-summary"`

---

## 存储监控SQL (在Supabase中执行)

如果需要在Supabase SQL Editor中执行存储监控：

```sql
-- 查看所有表大小
SELECT * FROM get_table_sizes();

-- 查看数据库总大小
SELECT * FROM get_database_size();

-- 获取完整存储报告
SELECT * FROM get_storage_report();
```
