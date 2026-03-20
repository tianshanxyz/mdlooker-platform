# 方案一实施指南

## 概述
本指南描述了如何实施完整数据获取与存储方案，包括存储监控机制、数据同步和压缩策略。

## 当前状态
- **总容量**: 40 GB
- **已使用**: 8.8 GB (22%)
- **剩余可用**: 31.2 GB

## 实施步骤

### 第一步：部署存储监控机制

#### 1.1 在Supabase中创建监控表和函数

1. 登录 Supabase Dashboard
2. 打开 SQL Editor
3. 执行 `scripts/setup-storage-monitor.sql` 中的内容

验证执行成功：
```sql
SELECT * FROM get_database_size();
SELECT * FROM get_table_sizes() LIMIT 5;
```

#### 1.2 设置定时监控任务

已在 `vercel.json` 中配置：
- **存储监控**: 每天 6:00 AM 自动执行
- **FDA同步**: 每周日 2:00 AM 自动执行

### 第二步：FDA数据完整同步

#### 2.1 首次完整同步

```bash
# 同步所有FDA数据（可能需要数小时）
npx ts-node scripts/sync-fda-full.ts

# 或者先测试同步前10000条
npx ts-node scripts/sync-fda-full.ts 10000
```

#### 2.2 监控同步进度

同步过程中会输出进度信息：
```
[FDA] Progress: 1000 records (850 inserted, 150 updated) @ 5.2 rec/s
```

#### 2.3 验证同步结果

```bash
# 检查FDA数据量
curl "http://localhost:3000/api/stats?type=country-summary"
```

### 第三步：NMPA数据核实

#### 3.1 运行核实脚本

```bash
npx ts-node scripts/verify-nmpa-data.ts
```

#### 3.2 根据核实结果采取行动

- 如果数据质量评分 ≥ 80: 数据可用
- 如果数据质量评分 60-79: 需要清理
- 如果数据质量评分 < 60: 需要重新导入

### 第四步：数据压缩策略

#### 4.1 手动压缩（需要时执行）

```sql
-- 在Supabase SQL Editor中执行
SELECT * FROM compress_fda_raw_data();
SELECT * FROM cleanup_old_logs();
```

#### 4.2 自动压缩

系统会在以下情况自动压缩：
- 存储使用率超过 70% 时触发警告
- 存储使用率超过 85% 时触发严重告警

### 第五步：验证数据准确性

#### 5.1 检查统计数据

```bash
curl "http://localhost:3000/api/stats?type=country-summary"
```

预期结果（同步完成后）：
```json
{
  "countries": [
    { "name": "China", "count": 72000 },
    { "name": "USA", "count": 500000 },
    { "name": "EU", "count": 43798 }
  ]
}
```

#### 5.2 监控存储使用情况

```bash
# 手动触发存储监控
curl "http://localhost:3000/api/admin/storage-monitor"
```

## 存储优化建议

### 定期维护任务

| 任务 | 频率 | 命令/操作 |
|------|------|-----------|
| 存储监控 | 每日自动 | `/api/admin/storage-monitor` |
| FDA增量同步 | 每周自动 | `/api/cron/sync-fda` |
| 清理旧日志 | 每月手动 | `SELECT * FROM cleanup_old_logs()` |
| 压缩raw_data | 按需 | `SELECT * FROM compress_fda_raw_data()` |
| 数据库分析 | 每月 | `ANALYZE` (在SQL Editor执行) |

### 存储告警阈值

- **70% (28GB)**: 警告，建议实施压缩
- **85% (34GB)**: 严重告警，必须立即清理
- **90% (36GB)**: 危险，可能触发只读模式

## 预期存储增长

| 数据源 | 当前 | 同步后 | 年增长 |
|--------|------|--------|--------|
| FDA | 1,236 | ~500,000 | ~250 MB |
| NMPA | 72,000 | ~150,000 | ~80 MB |
| EUDAMED | 43,798 | ~500,000 | ~500 MB |
| **总计** | **117,034** | **~1,150,000** | **~1 GB** |

**结论**: 40GB容量足够支撑3-5年的数据增长

## 故障排除

### FDA同步中断

```bash
# 从上次位置恢复同步
npx ts-node scripts/sync-fda-full.ts 100000 50000
# 参数：最大记录数，起始位置
```

### 存储空间不足

1. 立即执行压缩：
```sql
SELECT * FROM compress_fda_raw_data();
SELECT * FROM cleanup_old_logs();
```

2. 在Supabase Dashboard执行：
```sql
VACUUM FULL;
```

### 数据质量问题

运行核实脚本：
```bash
npx ts-node scripts/verify-nmpa-data.ts
npx ts-node scripts/verify-fda-data.ts  # 如有需要
```

## 联系与支持

如有问题，请检查：
1. Supabase Dashboard 中的数据库状态
2. Vercel 部署日志
3. 存储监控 API 返回的告警信息
