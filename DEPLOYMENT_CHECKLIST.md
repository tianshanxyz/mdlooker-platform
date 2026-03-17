# MDLooker 部署快速检查清单

## 部署前检查（必须完成）

### 1. 环境配置 ✅

```bash
# 检查 Node.js 版本
node -v  # 需要 18+

# 检查 Python 版本
python3 --version  # 需要 3.10+

# 检查环境变量
cat .env.local | grep SUPABASE
```

**必须配置的环境变量：**
- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Supabase 项目 URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase 匿名密钥
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Supabase 服务角色密钥

### 2. 依赖安装 ✅

```bash
# 安装前端依赖
npm ci --production

# 安装 Python 依赖
pip install -r scripts/scrapers/requirements.txt
```

**检查清单：**
- [ ] Node.js 依赖安装成功
- [ ] Python 依赖安装成功
- [ ] supabase 包已安装（`pip show supabase`）

### 3. 数据库表结构 ✅

**必须存在的表：**
- [ ] `companies` - 企业基础信息
- [ ] `fda_registrations` - FDA 注册信息
- [ ] `nmpa_registrations` - NMPA 注册信息
- [ ] `eudamed_registrations` - EUDAMED 注册信息
- [ ] `pmda_registrations` - PMDA 注册信息
- [ ] `health_canada_registrations` - Health Canada 注册信息
- [ ] `company_patents` - 公司专利（可选）
- [ ] `company_trademarks` - 公司商标（可选）

**验证方法：**
```sql
-- 在 Supabase SQL Editor 中执行
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'companies',
    'fda_registrations',
    'nmpa_registrations',
    'eudamed_registrations',
    'pmda_registrations',
    'health_canada_registrations'
  );
```

### 4. 磁盘空间检查 ✅

```bash
# 检查可用磁盘空间
df -h .

# 检查项目大小
du -sh .
```

**要求：**
- [ ] 至少 5GB 可用空间（用于临时数据存储）
- [ ] 项目文件 < 500MB（不包括采集的数据）

### 5. 数据目录结构 ✅

```bash
# 创建必要的数据目录
mkdir -p scripts/scrapers/data/{pipeline,raw,cleaned,compressed}
mkdir -p logs
```

**检查清单：**
- [ ] `scripts/scrapers/data/pipeline/` - 管道处理目录
- [ ] `scripts/scrapers/data/raw/` - 原始数据目录
- [ ] `scripts/scrapers/data/cleaned/` - 清洗后数据目录
- [ ] `scripts/scrapers/data/compressed/` - 压缩后数据目录
- [ ] `logs/` - 日志目录

---

## 部署步骤

### 步骤 1：构建项目

```bash
npm run build
```

**预期输出：**
```
✓ Compiled successfully
✓ Generating static pages
✓ Finalizing page optimization
```

### 步骤 2：运行数据管道（推荐）

```bash
cd scripts/scrapers
python3 run_data_pipeline.py
```

**预期行为：**
1. ✅ 采集 FDA 数据并上传
2. ✅ 采集 NMPA 数据并上传
3. ✅ 采集 EUDAMED 数据并上传
4. ✅ 采集 PMDA 数据并上传
5. ✅ 采集 Health Canada 数据并上传

**预期输出：**
```
======================================================================
  采集 FDA (美国) 数据
======================================================================
✅ FDA (美国) 数据采集完成
   采集：10000 条
   清洗后：9800 条
   压缩后：9800 条
   上传成功：9800 条
   上传失败：0 条
```

### 步骤 3：验证数据

**检查本地文件：**
```bash
ls -lh scripts/scrapers/data/pipeline/
```

**检查 Supabase 数据：**
访问 Supabase Dashboard → Table Editor，检查各表数据量。

**或者使用 SQL 查询：**
```sql
SELECT 
  'fda_registrations' as table_name, 
  COUNT(*) as record_count 
FROM fda_registrations
UNION ALL
SELECT 'nmpa_registrations', COUNT(*) FROM nmpa_registrations
UNION ALL
SELECT 'eudamed_registrations', COUNT(*) FROM eudamed_registrations
UNION ALL
SELECT 'pmda_registrations', COUNT(*) FROM pmda_registrations
UNION ALL
SELECT 'health_canada_registrations', COUNT(*) FROM health_canada_registrations;
```

### 步骤 4：启动应用

**开发环境：**
```bash
npm run dev
```

**生产环境：**
```bash
npm run start
```

**使用 PM2（推荐）：**
```bash
pm2 start npm --name "mdlooker" -- start
pm2 save
pm2 startup
```

---

## 部署后验证

### 功能测试

- [ ] 访问首页：http://localhost:3000
- [ ] 搜索功能正常
- [ ] 企业详情页正常
- [ ] 产品详情页正常
- [ ] 多语言切换正常
- [ ] 响应式设计正常

### 性能测试

- [ ] 首页加载 < 3 秒
- [ ] 搜索结果加载 < 2 秒
- [ ] 图片懒加载正常
- [ ] 数据库查询有索引

### 数据验证

- [ ] FDA 数据可查询
- [ ] NMPA 数据可查询
- [ ] EUDAMED 数据可查询
- [ ] 数据字段完整
- [ ] 无乱码或格式错误

---

## 常见问题排查

### 问题 1：Supabase 连接失败

**症状：**
```
Error: Supabase URL and Key are required
```

**解决方案：**
1. 检查 `.env.local` 文件是否存在
2. 确认 `NEXT_PUBLIC_SUPABASE_URL` 和 `SUPABASE_SERVICE_ROLE_KEY` 已配置
3. 重启应用

### 问题 2：数据上传失败

**症状：**
```
❌ 批次 5/10 上传异常：timeout
```

**解决方案：**
1. 减小批次大小：修改 `batch_size=50`
2. 检查网络连接
3. 验证 Supabase 配额

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
```

### 问题 4：端口被占用

**症状：**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**解决方案：**
```bash
# 查找占用端口的进程
lsof -i :3000

# 杀死进程
kill -9 <PID>

# 或者使用其他端口
PORT=3001 npm run start
```

---

## 监控和维护

### 日志位置

```
logs/
├── data_collection.log    # 数据采集日志
├── data_pipeline.log      # 数据处理日志
├── nextjs.log            # Next.js 应用日志
└── pm2.log               # PM2 进程管理日志
```

### 监控命令

```bash
# 查看实时日志
tail -f logs/data_pipeline.log

# 查看 PM2 状态
pm2 status

# 查看应用日志
pm2 logs mdlooker

# 重启应用
pm2 restart mdlooker
```

### 定期维护

**每周：**
- [ ] 运行数据采集管道
- [ ] 检查磁盘空间
- [ ] 查看错误日志

**每月：**
- [ ] 清理旧日志文件
- [ ] 优化数据库索引
- [ ] 备份重要数据

---

## 回滚方案

如果部署后出现问题，可以快速回滚：

```bash
# 1. 停止当前应用
pm2 stop mdlooker

# 2. 恢复到上一个版本
git checkout <previous-commit>

# 3. 重新构建和部署
npm run build
pm2 restart mdlooker

# 4. 验证功能
```

---

## 联系支持

- 文档：`docs/` 目录
- 问题反馈：GitHub Issues
- 紧急联系：技术支持邮箱

---

**部署成功检查清单完成日期**: _______________  
**部署人员**: _______________  
**备注**: _______________
