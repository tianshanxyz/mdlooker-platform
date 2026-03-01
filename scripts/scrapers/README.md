# MDLooker 数据爬虫

## 爬虫列表

### 1. EUDAMED 爬虫 (eudamed_scraper.py)
- **数据源**: 欧盟医疗器械数据库
- **URL**: https://ec.europa.eu/tools/eudamed
- **数据量**: 30,000+ 制造商，100,000+ 器械
- **特点**: 无需注册，公开访问

### 2. NMPA 爬虫 (nmpa_scraper.py) ✅ 已完成
- **数据源**: 中国药监局
- **URL**: https://www.nmpa.gov.cn
- **数据量**: 200,000+ 器械
- **特点**: 
  - ✅ 验证码检测与处理
  - ✅ 国产/进口器械分类抓取
  - ✅ 反爬对策（代理、延迟、User-Agent）

## 安装

```bash
# 1. 安装 Python 依赖
pip install -r requirements.txt

# 2. 安装 Playwright 浏览器
playwright install chromium

# 3. 设置环境变量（可选，用于保存到 Supabase）
export SUPABASE_URL="你的 Supabase URL"
export SUPABASE_SERVICE_ROLE_KEY="你的 Service Role Key"
```

## 使用

### EUDAMED 爬虫

```bash
# 运行示例
python eudamed_scraper.py

# 抓取特定国家制造商
python -c "
from eudamed_scraper import EudamedScraper
with EudamedScraper() as scraper:
    actors = scraper.search_actors(country_code='DE', max_results=100)
    scraper.save_to_json(actors, 'german_actors.json')
"

# 抓取特定风险等级器械
python -c "
from eudamed_scraper import EudamedScraper
with EudamedScraper() as scraper:
    devices = scraper.search_devices(risk_class='III', max_results=100)
    scraper.save_to_supabase(devices, 'eudamed_devices')
"
```

### NMPA 爬虫

```bash
# 运行示例（会打开浏览器窗口，需要人工协助解决验证码）
python nmpa_scraper.py

# 抓取国产器械
python -c "
from nmpa_scraper import NMPAScraper
with NMPAScraper(headless=False) as scraper:
    devices = scraper.scrape_by_category('domestic', max_pages=10)
    scraper.save_to_json(devices, 'nmpa_domestic.json')
    scraper.save_to_supabase(devices, 'nmpa_devices')
"

# 抓取进口器械
python -c "
from nmpa_scraper import NMPAScraper
with NMPAScraper(headless=False) as scraper:
    devices = scraper.scrape_by_category('import', max_pages=5)
    scraper.save_to_json(devices, 'nmpa_import.json')
"

# 使用代理
python -c "
from nmpa_scraper import NMPAScraper
with NMPAScraper(headless=False, proxy='http://proxy:port') as scraper:
    devices = scraper.scrape_by_category('domestic', max_pages=5)
"
```

## 数据字段

### EUDAMED - Actor（制造商）
- `name`: 公司名称
- `srn`: Single Registration Number
- `country`: 国家
- `type`: 类型（manufacturer/authorized representative/importer）
- `scraped_at`: 抓取时间

### EUDAMED - Device（器械）
- `name`: 器械名称
- `udi_di`: UDI-DI 标识符
- `risk_class`: 风险等级（I, IIa, IIb, III）
- `manufacturer`: 制造商名称
- `scraped_at`: 抓取时间

### NMPA - Device（器械）
- `registration_number`: 注册证号
- `product_name`: 产品名称
- `product_name_zh`: 产品名称（中文）
- `company_name`: 注册人名称
- `company_name_zh`: 注册人名称（中文）
- `company_address`: 注册人住所
- `production_address`: 生产地址
- `approval_date`: 批准日期
- `expiry_date`: 有效期至
- `registration_category`: 注册类别（国产/进口）
- `model_specification`: 型号规格
- `structure_composition`: 结构及组成
- `scope_application`: 适用范围
- `remarks`: 备注
- `updated_at`: 更新日期
- `scraped_at`: 抓取时间

## 注意事项

### EUDAMED
1. **频率控制**: 默认 3-7 秒随机延迟，避免被封
2. **代理支持**: 可通过 proxy 参数使用代理
3. **数据保存**: 支持 JSON 文件和 Supabase 数据库
4. **错误处理**: 自动跳过错误行，继续抓取

### NMPA
1. **验证码处理**: 需要人工协助解决验证码（弹出浏览器窗口）
2. **反爬机制**: 网站有严格的反爬机制，建议使用代理
3. **抓取速度**: 较慢（需要处理验证码和动态加载）
4. **数据完整性**: 部分字段可能需要进入详情页抓取

## 反爬对策

- 随机 User-Agent
- 随机延迟（可配置）
- 代理池支持
- Cookie 池维护
- 验证码检测与处理
- 自动重试机制

## 更新计划

- [ ] 添加更多国家筛选（EUDAMED）
- [ ] 添加证书信息抓取（EUDAMED）
- [ ] 添加公告机构信息（EUDAMED）
- [ ] 实现增量更新（所有爬虫）
- [ ] 添加自动验证码识别（NMPA）
- [ ] 优化详情页抓取（NMPA）

## 故障排除

### NMPA 验证码问题
如果频繁遇到验证码：
1. 使用代理 IP（轮换）
2. 降低抓取频率（增大延迟）
3. 考虑使用打码平台（如 2Captcha）

### 数据抓取不完整
1. 检查网络连接
2. 查看浏览器窗口是否有错误提示
3. 增加超时时间
4. 检查页面结构是否变化

## 性能优化建议

1. **批量抓取**: 使用 `max_pages` 参数控制抓取页数
2. **分批保存**: 数据量大时定期保存到文件
3. **断点续传**: 记录已抓取的页码，支持中断后继续
4. **多线程**: 后期可考虑多代理并发抓取
