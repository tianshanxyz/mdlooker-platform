# MDLooker Database Setup

## 数据库 Schema

本目录包含 MDLooker 平台的完整数据库结构定义。

### 表结构

1. **companies** - 企业基础信息
2. **fda_registrations** - FDA 注册信息
3. **nmpa_registrations** - NMPA 注册信息
4. **eudamed_registrations** - EUDAMED 注册信息
5. **products** - 产品信息

### 快速开始

1. 在 Supabase 中执行 `schema.sql` 创建表结构
2. 执行 `seed_data.sql` 导入示例数据

### 在 Supabase SQL Editor 中执行:

```sql
-- 1. 创建表结构
\i schema.sql

-- 2. 导入示例数据
\i seed_data.sql
```

或者直接在 Supabase Dashboard 的 SQL Editor 中复制粘贴执行。

### 示例数据包含的企业

- Medtronic plc (美敦力) - 心脏起搏器、除颤器
- Johnson & Johnson (强生) - 外科缝线
- Siemens Healthineers (西门子医疗) - CT扫描仪、MRI
- Mindray Medical (迈瑞医疗) - 监护仪、超声
- Roche Diagnostics (罗氏诊断) - 免疫分析仪

### 数据来源

- FDA: https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfRL/rl.cfm
- NMPA: https://www.nmpa.gov.cn/datasearch/search-info.html
- EUDAMED: https://ec.europa.eu/tools/eudamed
