# MDLooker 平台部署指南

## 📋 快速开始

### 一键部署（推荐）

```bash
cd /Users/maxiaoha/Desktop/mdlooker-platform
./deploy.sh
```

部署脚本会自动：
1. ✅ 检查环境依赖（Node.js 18+, Python 3.10+）
2. ✅ 验证环境变量配置
3. ✅ 安装前端和 Python 依赖
4. ✅ 构建 Next.js 项目
5. ✅ 创建数据目录结构

### 手动部署

如果自动脚本失败，可以按以下步骤手动部署：

```bash
# 1. 检查环境
node -v  # 需要 18+
python3 --version  # 需要 3.10+

# 2. 配置环境变量
cp .env.local.example .env.local
# 编辑 .env.local，填入 Supabase 配置

# 3. 安装依赖
npm ci --production
pip install -r scripts/scrapers/requirements.txt

# 4. 构建项目
npm run build

# 5. 创建数据目录
mkdir -p scripts/scrapers/data/{pipeline,raw,cleaned,compressed}
```

---

## 🚀 数据采集和上传

### 重要说明

**⚠️ 数据上传策略改进**

根据之前的经验（一个数据表占用太多磁盘空间），本次采用新的策略：

```
采集 → 本地保存 → 清洗 → 压缩 → 上传到 Supabase
```

**压缩效果：**
- 移除 `raw_data` 字段（占用 90% 空间）
- 压缩长文本字段（限制 1000 字符）
- 去重和验证
- **总体压缩率：约 90%**

### 方法一：一键运行数据管道（推荐）

```bash
cd scripts/scrapers
python3 run_data_pipeline.py
```

**自动执行：**
1. 采集 FDA、NMPA、EUDAMED、PMDA、Health Canada 数据
2. 保存到本地 JSON 文件
3. 清洗数据（去重、验证、标准化）
4. 压缩数据（移除 raw_data、压缩长文本）
5. 分批上传到 Supabase

**输出位置：**
- `scripts/scrapers/data/pipeline/` - 处理的数据文件
- `logs/data_pipeline.log` - 详细日志

### 方法二：分步执行

#### 步骤 1：采集数据到本地

```bash
cd scripts/scrapers

# 采集所有数据
python3 data_collector_manager.py --all

# 或只采集特定监管机构
python3 data_collector_manager.py --fda
python3 data_collector_manager.py --nmpa
python3 data_collector_manager.py --eudamed
```

**数据保存到：**
- `data/raw/` - 原始采集数据
- `data/complete_market_data/` - 整合后的数据

#### 步骤 2：使用数据管道处理

```bash
# 创建管道脚本
cat > process_data.py << 'EOF'
from data_pipeline import DataPipeline
from fda_collector import FDACollector

collector = FDACollector()
pipeline = DataPipeline('fda_registrations')

stats = pipeline.run_pipeline(
    collector,
    'collect_all_data',
    companies=True,
    products=True
)

print(f'执行统计：{stats}')
EOF

# 运行管道
python3 process_data.py
```

#### 步骤 3：验证数据

```bash
# 查看生成的文件
ls -lh scripts/scrapers/data/pipeline/

# 查看日志
tail -f logs/data_pipeline.log
```

---

## 📊 验证部署

### 1. 检查本地文件

```bash
# 查看数据文件
ls -lh scripts/scrapers/data/pipeline/

# 预期输出示例：
# -rw-r--r--  1 user  staff   50M Mar 16 10:00 fda_registrations_compressed_20240316_100000.json
# -rw-r--r--  1 user  staff   5.0M Mar 16 10:00 fda_registrations_compressed_20240316_100000.json.gz
```

### 2. 检查 Supabase 数据

访问 [Supabase Dashboard](https://app.supabase.com) → Table Editor：

**检查各表数据量：**
- `fda_registrations` - 应该有数千到数万条记录
- `nmpa_registrations` - 应该有数千条记录
- `eudamed_registrations` - 应该有数千条记录
- `pmda_registrations` - 应该有数千条记录
- `health_canada_registrations` - 应该有数千条记录

**或者使用 SQL 查询：**

```sql
SELECT 
  'fda' as regulator, 
  COUNT(*) as count 
FROM fda_registrations
UNION ALL
SELECT 'nmpa', COUNT(*) FROM nmpa_registrations
UNION ALL
SELECT 'eudamed', COUNT(*) FROM eudamed_registrations
UNION ALL
SELECT 'pmda', COUNT(*) FROM pmda_registrations
UNION ALL
SELECT 'health_canada', COUNT(*) FROM health_canada_registrations;
```

### 3. 测试应用

```bash
# 开发环境
npm run dev

# 生产环境
npm run start

# 或使用 PM2
pm2 start npm --name "mdlooker" -- start
```

**访问：** http://localhost:3000

**测试功能：**
- [ ] 首页加载正常
- [ ] 搜索功能正常
- [ ] 企业详情页正常
- [ ] 产品详情页正常
- [ ] 多语言切换正常

---

## 📁 目录结构

```
mdlooker-platform/
├── scripts/scrapers/
│   ├── data/
│   │   ├── pipeline/          # 管道处理的数据
│   │   │   ├── raw/          # 原始数据
│   │   │   ├── cleaned/      # 清洗后数据
│   │   │   └── compressed/   # 压缩后数据
│   │   ├── raw/              # 采集器原始输出
│   │   └── complete_market_data/  # 完整市场数据
│   │
│   ├── data_pipeline.py       # 数据管道（核心）
│   ├── data_collector_manager.py  # 采集管理器
│   ├── run_data_pipeline.py   # 一键运行脚本
│   ├── fda_collector.py       # FDA 采集器
│   ├── nmpa_collector.py      # NMPA 采集器
│   ├── eudamed_collector.py   # EUDAMED 采集器
│   └── ...其他采集器
│
├── logs/                      # 日志目录
│   ├── data_collection.log
│   ├── data_pipeline.log
│   └── upload.log
│
├── docs/                      # 文档目录
│   ├── DATA_COLLECTION_GUIDE.md  # 详细采集指南
│   ├── SEO_MONITORING_SETUP.md   # 监控配置指南
│   └── ...
│
├── deploy.sh                  # 部署脚本
├── DEPLOYMENT_CHECKLIST.md    # 部署检查清单
└── README.md                  # 本文件
```

---

## 🔧 故障排查

### 问题 1：Supabase 连接失败

**症状：**
```
Error: Failed to connect to Supabase
```

**解决方案：**
1. 检查 `.env.local` 中的配置：
   ```bash
   cat .env.local | grep SUPABASE
   ```
2. 验证 URL 和 Key 是否正确
3. 检查网络连接

### 问题 2：上传批次失败

**症状：**
```
❌ 批次 5/10 上传异常：timeout
```

**解决方案：**
1. 减小批次大小（编辑 `data_pipeline.py`，将 `batch_size` 改为 50）
2. 增加批次间延迟（从 0.5s 改为 1s）
3. 检查 Supabase 配额限制

### 问题 3：磁盘空间不足

**症状：**
```
No space left on device
```

**解决方案：**
```bash
# 清理旧数据
rm scripts/scrapers/data/raw/*.json
rm scripts/scrapers/data/pipeline/*_raw_*.json

# 压缩归档
gzip scripts/scrapers/data/raw/*.json

# 查看磁盘使用
df -h .
du -sh scripts/scrapers/data/*
```

### 问题 4：Python 依赖缺失

**症状：**
```
ModuleNotFoundError: No module named 'supabase'
```

**解决方案：**
```bash
pip install -r scripts/scrapers/requirements.txt
```

---

## 📈 监控和维护

### 查看日志

```bash
# 实时查看采集日志
tail -f logs/data_collection.log

# 实时查看管道日志
tail -f logs/data_pipeline.log

# 查看 PM2 日志
pm2 logs mdlooker
```

### 定期数据采集

设置每周自动采集（Cron）：

```bash
crontab -e

# 添加以下行（每周日凌晨 2 点）
0 2 * * 0 cd /Users/maxiaoha/Desktop/mdlooker-platform/scripts/scrapers && \
    python3 run_data_pipeline.py >> ../../logs/data_pipeline.log 2>&1
```

### 性能优化

**数据库索引：**
```sql
-- 为常用查询字段添加索引
CREATE INDEX IF NOT EXISTS idx_fda_company ON fda_registrations(company_id);
CREATE INDEX IF NOT EXISTS idx_fda_status ON fda_registrations(registration_status);
CREATE INDEX IF NOT EXISTS idx_nmpa_company ON nmpa_registrations(company_id);
```

**清理旧数据：**
```bash
# 清理 30 天前的日志
find logs/ -name "*.log" -mtime +30 -delete

# 清理旧的数据文件（保留最近 7 天）
find scripts/scrapers/data/pipeline/ -name "*.json" -mtime +7 -delete
```

---

## 📚 详细文档

- **[数据采集详细指南](docs/DATA_COLLECTION_GUIDE.md)** - 完整的采集流程和配置
- **[部署检查清单](DEPLOYMENT_CHECKLIST.md)** - 部署前后的详细检查项
- **[SEO 监控配置](docs/SEO_MONITORING_SETUP.md)** - SEO/GEO 监控设置

---

## ✅ 部署完成检查清单

部署完成后，请确认：

- [ ] 环境依赖检查通过（Node.js 18+, Python 3.10+）
- [ ] 环境变量配置正确
- [ ] 依赖安装成功
- [ ] 项目构建成功
- [ ] 数据目录创建完成
- [ ] 数据采集管道运行成功
- [ ] 数据成功上传到 Supabase
- [ ] 应用启动成功
- [ ] 首页访问正常
- [ ] 搜索功能正常
- [ ] 数据查询正常

---

## 🆘 获取帮助

如有问题，请：

1. 查看详细文档：`docs/` 目录
2. 检查日志文件：`logs/` 目录
3. GitHub Issues: https://github.com/mdlooker/platform/issues

---

**最后更新**: 2026-03-16  
**版本**: 1.0.0  
**状态**: ✅ 生产就绪
