# MDLooker 数据采集和上传指南（生产环境）

## 重要说明

**⚠️ 数据上传策略改进**

根据之前的经验教训（一个数据表占用太多磁盘空间），本次部署采用以下策略：

1. ✅ **数据先保存到本地** - 所有采集的数据先保存到本地 JSON 文件
2. ✅ **数据清洗** - 去重、验证、标准化
3. ✅ **数据压缩** - 移除 raw_data 字段、压缩长文本
4. ✅ **分批上传** - 小批量上传到 Supabase，避免失败
5. ✅ **详细日志** - 完整的采集和上传日志

---

## 目录结构

```
scripts/scrapers/data/
├── pipeline/          # 管道处理的数据
│   ├── raw/          # 原始数据
│   ├── cleaned/      # 清洗后数据
│   └── compressed/   # 压缩后数据
├── raw/              # 各采集器的原始输出
└── complete_market_data/  # 完整的市场数据
```

---

## 快速开始

### 1. 环境准备

```bash
# 1. 确保已安装依赖
cd /Users/maxiaoha/Desktop/mdlooker-platform
npm install
pip install -r scripts/scrapers/requirements.txt

# 2. 配置环境变量
cp .env.local.example .env.local
# 编辑 .env.local，填入 Supabase 配置
```

### 2. 数据采集（保存到本地）

```bash
cd scripts/scrapers

# 采集所有数据（推荐）
python3 data_collector_manager.py --all

# 或者只采集特定监管机构的数据
python3 data_collector_manager.py --fda        # 只采集 FDA
python3 data_collector_manager.py --nmpa       # 只采集 NMPA
python3 data_collector_manager.py --eudamed    # 只采集 EUDAMED
python3 data_collector_manager.py --pmda       # 只采集 PMDA
```

**采集的数据会保存到：**
- `data/raw/` - 各采集器的原始数据
- `data/complete_market_data/` - 整合后的完整数据

### 3. 数据清洗和压缩

使用改进的数据管道：

```bash
cd scripts/scrapers

# 使用数据管道（推荐）
python3 -c "
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
"
```

**数据管道会自动执行：**
1. 采集数据并保存到本地 JSON
2. 清洗数据（去重、验证、标准化）
3. 压缩数据（移除 raw_data、压缩长文本）
4. 创建 gzip 归档

**输出文件：**
- `data/pipeline/fda_registrations_raw_YYYYMMDD_HHMMSS.json` - 原始数据
- `data/pipeline/fda_registrations_cleaned_YYYYMMDD_HHMMSS.json` - 清洗后
- `data/pipeline/fda_registrations_compressed_YYYYMMDD_HHMMSS.json` - 压缩后
- `data/pipeline/fda_registrations_compressed_YYYYMMDD_HHMMSS.json.gz` - gzip 归档

### 4. 上传到 Supabase

#### 方法一：使用数据管道（推荐）

数据管道会自动上传压缩后的数据：

```bash
# 接上一步，数据管道会自动执行上传
# 查看日志确认上传结果
```

#### 方法二：手动上传压缩后的数据

```bash
cd scripts/scrapers

# 使用上传脚本
python3 upload_compressed_data.py \
  --input data/pipeline/fda_registrations_compressed_*.json \
  --table fda_registrations \
  --batch-size 100
```

#### 方法三：使用现有的上传脚本

```bash
# 上传 FDA 数据
python3 upload_fda_to_supabase.py

# 上传 NMPA 数据
python3 upload_nmpa_to_supabase.py

# 上传 EUDAMED 数据
python3 upload_eudamed_to_supabase.py
```

---

## 详细配置

### 数据管道配置

创建自定义数据管道脚本：

```python
# scripts/scrapers/run_pipeline.py
from data_pipeline import DataPipeline
from fda_collector import FDACollector
from nmpa_collector import NMPACollector
from eudamed_collector import EUDAMEDCollector

def main():
    # FDA 数据管道
    print("=" * 60)
    print("FDA 数据管道")
    print("=" * 60)
    
    fda_collector = FDACollector()
    fda_pipeline = DataPipeline('fda_registrations')
    
    fda_stats = fda_pipeline.run_pipeline(
        fda_collector,
        'collect_all_data',
        companies=True,
        products=True
    )
    
    # NMPA 数据管道
    print("=" * 60)
    print("NMPA 数据管道")
    print("=" * 60)
    
    nmpa_collector = NMPACollector()
    nmpa_pipeline = DataPipeline('nmpa_registrations')
    
    nmpa_stats = nmpa_pipeline.run_pipeline(
        nmpa_collector,
        'collect_all_companies',
        max_pages=10
    )
    
    # EUDAMED 数据管道
    print("=" * 60)
    print("EUDAMED 数据管道")
    print("=" * 60)
    
    eudamed_collector = EUDAMEDCollector()
    eudamed_pipeline = DataPipeline('eudamed_registrations')
    
    eudamed_stats = eudamed_pipeline.run_pipeline(
        eudamed_collector,
        'collect_all_data',
        max_pages=5
    )
    
    # 打印总统计
    print("=" * 60)
    print("总统计")
    print("=" * 60)
    print(f"FDA: {fda_stats}")
    print(f"NMPA: {nmpa_stats}")
    print(f"EUDAMED: {eudamed_stats}")

if __name__ == '__main__':
    main()
```

运行：

```bash
cd scripts/scrapers
python3 run_pipeline.py
```

### 上传配置

创建自定义上传脚本：

```python
# scripts/scrapers/upload_all_data.py
#!/usr/bin/env python3
"""
批量上传所有压缩后的数据到 Supabase
"""

import glob
import os
from pathlib import Path
from supabase import create_client
from dotenv import load_dotenv
import json

load_dotenv()

def upload_file(file_path: str, table_name: str, batch_size: int = 100):
    """上传单个文件"""
    print(f"上传文件：{file_path}")
    
    # 读取数据
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    print(f"  读取到 {len(data)} 条记录")
    
    # 初始化客户端
    supabase_url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
    supabase = create_client(supabase_url, supabase_key)
    
    # 分批上传
    total = len(data)
    uploaded = 0
    failed = 0
    
    for i in range(0, total, batch_size):
        batch = data[i:i+batch_size]
        batch_num = (i // batch_size) + 1
        
        try:
            response = supabase.table(table_name).insert(batch).execute()
            
            if response.data:
                uploaded += len(batch)
                print(f"  ✓ 批次 {batch_num} 上传成功：{len(batch)} 条")
            else:
                failed += len(batch)
                print(f"  ✗ 批次 {batch_num} 上传失败")
            
            # 避免请求过快
            import time
            time.sleep(0.5)
            
        except Exception as e:
            failed += len(batch)
            print(f"  ✗ 批次 {batch_num} 异常：{e}")
    
    print(f"上传完成：成功 {uploaded} 条，失败 {failed} 条")
    return uploaded, failed

def main():
    data_dir = Path(__file__).parent / 'data' / 'pipeline'
    
    # 查找所有压缩后的文件
    compressed_files = list(data_dir.glob('*_compressed_*.json'))
    
    print(f"找到 {len(compressed_files)} 个压缩文件")
    
    total_uploaded = 0
    total_failed = 0
    
    for file_path in compressed_files:
        # 从文件名推断表名
        filename = file_path.stem
        parts = filename.split('_')
        
        if len(parts) >= 2:
            # 表名通常是前两部分，如 fda_registrations
            table_name = '_'.join(parts[:-2])  # 去掉 compressed 和日期
            
            print(f"\n处理：{file_path.name}")
            print(f"推断表名：{table_name}")
            
            uploaded, failed = upload_file(str(file_path), table_name)
            total_uploaded += uploaded
            total_failed += failed
    
    print("\n" + "=" * 60)
    print("总上传统计")
    print("=" * 60)
    print(f"成功：{total_uploaded} 条")
    print(f"失败：{total_failed} 条")

if __name__ == '__main__':
    main()
```

运行：

```bash
cd scripts/scrapers
python3 upload_all_data.py
```

---

## 数据压缩策略

### 压缩前后对比

| 数据类型 | 压缩前 | 压缩后 | 压缩率 |
|---------|--------|--------|--------|
| FDA 注册 | ~500MB | ~50MB | 90% |
| NMPA 注册 | ~200MB | ~20MB | 90% |
| EUDAMED | ~300MB | ~30MB | 90% |

### 压缩措施

1. **移除 raw_data 字段**
   - raw_data 包含完整的 API 响应
   - 占用空间大，实际使用频率低
   - 如需保留，可单独存储到冷存储

2. **压缩长文本字段**
   - description: 限制 1000 字符
   - product_description: 限制 1000 字符
   - intended_use: 限制 1000 字符

3. **标准化字段**
   - 空字符串转为 null
   - 日期格式统一为 YYYY-MM-DD
   - 移除不必要的元数据

### 恢复 raw_data（可选）

如需保留 raw_data，可以：

```python
# 单独保存 raw_data 到冷存储
import gzip

raw_data = record.get('raw_data')
if raw_data:
    # 压缩保存
    with gzip.open(f'raw_data/{record_id}.json.gz', 'wt', encoding='utf-8') as f:
        json.dump(raw_data, f, ensure_ascii=False)
```

---

## 监控和日志

### 日志文件位置

```
logs/
├── data_collection.log    # 采集日志
├── data_pipeline.log      # 管道处理日志
└── upload.log            # 上传日志
```

### 查看实时日志

```bash
# 查看采集日志
tail -f scripts/scrapers/data_collection.log

# 查看管道日志
tail -f scripts/scrapers/data_pipeline.log

# 查看上传日志
tail -f scripts/scrapers/upload.log
```

### 监控指标

关键指标记录在日志中：

```
✅ 采集完成：10000 条记录
💾 原始数据已保存：xxx.json
移除空记录：50 条
移除重复记录：120 条
移除无效记录：30 条
✅ 清洗完成：9800 条记录（原始：10000）
✅ 压缩完成：节省约 45000.50 KB
✅ 上传完成
成功：9800 条
失败：0 条
⏱️  总耗时：125.30 秒 (2.09 分钟)
```

---

## 错误处理

### 常见错误及解决方案

#### 1. Supabase 连接失败

```
错误：❌ 管道执行异常：Failed to connect to Supabase
```

**解决方案：**
- 检查 `.env.local` 中的 `SUPABASE_URL` 和 `SUPABASE_SERVICE_ROLE_KEY`
- 检查网络连接
- 验证 Supabase 项目状态

#### 2. 上传批次失败

```
错误：❌ 批次 5/10 上传异常：timeout
```

**解决方案：**
- 减小 `batch_size`（从 100 改为 50）
- 增加批次间延迟（从 0.5s 改为 1s）
- 检查 Supabase 配额和限制

#### 3. 数据格式错误

```
错误：❌ 记录 15 上传失败：invalid input syntax for type uuid
```

**解决方案：**
- 检查数据字段的类型匹配
- 使用数据清洗脚本标准化字段
- 查看具体的错误记录

#### 4. 磁盘空间不足

```
错误：No space left on device
```

**解决方案：**
- 清理旧的采集文件：`rm data/raw/*.json`
- 清理管道文件：`rm data/pipeline/*.json`
- 压缩归档：`gzip data/raw/*.json`

---

## 最佳实践

### 1. 定期采集

设置定时任务（每周执行一次）：

```bash
# 编辑 crontab
crontab -e

# 添加任务（每周日凌晨 2 点）
0 2 * * 0 cd /Users/maxiaoha/Desktop/mdlooker-platform/scripts/scrapers && \
    python3 data_collector_manager.py --all >> data_collection.log 2>&1
```

### 2. 增量更新

只采集新增或变更的数据：

```python
# 记录上次采集的时间
last_sync = get_last_sync_time()

# 只采集更新的数据
new_data = collector.collect_since(last_sync)

# 更新同步时间
update_last_sync_time(datetime.now())
```

### 3. 数据备份

定期备份 Supabase 数据：

```bash
# 导出 Supabase 数据到本地
pg_dump -h db.xxx.supabase.co -U postgres -d postgres \
  -t fda_registrations -t nmpa_registrations \
  -F c -f backup_$(date +%Y%m%d).dump
```

### 4. 性能优化

- 使用索引加速查询
- 分页加载大数据表
- 使用物化视图缓存复杂查询
- 定期清理无用数据

---

## 故障恢复

### 场景 1：上传中断

如果上传过程中断：

```python
# 1. 检查已上传的记录数
import os
from supabase import create_client

supabase = create_client(url, key)
result = supabase.table('fda_registrations').select('*', count='exact').execute()
print(f"已上传：{result.count} 条")

# 2. 找到中断的文件
# 查看日志，找到最后一个成功上传的批次

# 3. 从断点继续
# 修改上传脚本，跳过已上传的记录
```

### 场景 2：数据错误

如果上传后发现数据错误：

```python
# 1. 回滚错误的批次
supabase.table('fda_registrations')\
  .delete()\
  .eq('batch_id', 'batch_20240316_001')\
  .execute()

# 2. 修正数据
# 编辑 JSON 文件，修正错误

# 3. 重新上传
```

### 场景 3：磁盘空间告急

```bash
# 1. 检查磁盘使用
df -h

# 2. 查找大文件
du -sh scripts/scrapers/data/* | sort -hr

# 3. 清理旧文件
rm scripts/scrapers/data/raw/*.json
rm scripts/scrapers/data/pipeline/*_raw_*.json

# 4. 压缩归档
gzip scripts/scrapers/data/raw/*.json
```

---

## 联系支持

如有问题，请查看：
- 完整文档：`docs/` 目录
- 日志文件：`logs/` 目录
- GitHub Issues: https://github.com/mdlooker/platform/issues

---

**最后更新**: 2026-03-16  
**版本**: 1.0.0
