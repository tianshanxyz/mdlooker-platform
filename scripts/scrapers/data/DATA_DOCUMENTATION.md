# 医疗器械市场数据文档
# Medical Device Market Data Documentation

**版本**: 1.0.0  
**生成日期**: 2026-02-25  
**数据覆盖**: 新加坡 (HSA) | 日本 (PMDA) | 沙特阿拉伯 (SFDA)

---

## 目录

1. [数据概览](#数据概览)
2. [数据来源](#数据来源)
3. [数据文件结构](#数据文件结构)
4. [数据字段说明](#数据字段说明)
5. [数据质量标准](#数据质量标准)
6. [使用指南](#使用指南)

---

## 数据概览

### 数据统计汇总

| 数据类型 | 新加坡 (HSA) | 日本 (PMDA) | 沙特 (SFDA) | 总计 |
|---------|-------------|------------|------------|------|
| 产品注册信息 | 200 | 170 | 155 | **525** |
| 市场规模统计 | 5 | 5 | 5 | **15** |
| 生产企业名录 | 17 | 16 | 16 | **49** |
| 政策法规 | 13 | 14 | 13 | **40** |
| 进出口贸易 | 400 | 400 | 400 | **1200** |
| **总计** | **635** | **605** | **589** | **1829** |

### 数据时间范围

- **产品注册**: 2019-2025年
- **市场规模**: 2020-2024年
- **贸易数据**: 2020-2024年月度数据
- **政策法规**: 2010-2025年

---

## 数据来源

### 新加坡 (Singapore)

| 机构 | 网址 | 数据类型 |
|-----|------|---------|
| Health Sciences Authority (HSA) | https://www.hsa.gov.sg | 产品注册、企业许可 |
| Singapore Department of Statistics | https://www.singstat.gov.sg | 市场统计、贸易数据 |
| Ministry of Health Singapore | https://www.moh.gov.sg | 政策法规 |
| Association of Medical Device Industry Singapore | - | 行业数据 |

### 日本 (Japan)

| 机构 | 网址 | 数据类型 |
|-----|------|---------|
| Pharmaceuticals and Medical Devices Agency (PMDA) | https://www.pmda.go.jp | 产品注册、审评数据 |
| Ministry of Health, Labour and Welfare (MHLW) | https://www.mhlw.go.jp | 政策法规 |
| Japan Ministry of Finance | https://www.mof.go.jp | 贸易统计 |
| Japan Medical Devices Manufacturers Association | - | 行业数据 |

### 沙特阿拉伯 (Saudi Arabia)

| 机构 | 网址 | 数据类型 |
|-----|------|---------|
| Saudi Food and Drug Authority (SFDA) | https://www.sfda.gov.sa | 产品注册、法规标准 |
| Ministry of Health Saudi Arabia | https://www.moh.gov.sa | 政策数据 |
| Saudi Customs | - | 贸易数据 |
| General Authority for Statistics | https://www.stats.gov.sa | 市场统计 |

---

## 数据文件结构

```
scripts/scrapers/data/complete_market_data/
├── registrations/                    # 产品注册数据
│   ├── singapore_registrations.json
│   ├── singapore_registrations.csv
│   ├── japan_registrations.json
│   ├── japan_registrations.csv
│   ├── saudi_registrations.json
│   └── saudi_registrations.csv
├── market_size/                      # 市场规模数据
│   ├── singapore_market_size.json
│   ├── singapore_market_size.csv
│   ├── japan_market_size.json
│   ├── japan_market_size.csv
│   ├── saudi_market_size.json
│   └── saudi_market_size.csv
├── companies/                        # 企业名录
│   ├── singapore_companies.json
│   ├── singapore_companies.csv
│   ├── japan_companies.json
│   ├── japan_companies.csv
│   ├── saudi_companies.json
│   └── saudi_companies.csv
├── policies/                         # 政策法规
│   ├── singapore_policies.json
│   ├── singapore_policies.csv
│   ├── japan_policies.json
│   ├── japan_policies.csv
│   ├── saudi_policies.json
│   └── saudi_policies.csv
├── trade/                            # 进出口贸易
│   ├── singapore_trade.json
│   ├── singapore_trade.csv
│   ├── japan_trade.json
│   ├── japan_trade.csv
│   ├── saudi_trade.json
│   └── saudi_trade.csv
├── integrated/                       # 整合后的数据
│   ├── all_registrations_integrated.json
│   ├── all_registrations_integrated.csv
│   ├── all_market_size_integrated.json
│   ├── all_market_size_integrated.csv
│   ├── all_companies_integrated.json
│   ├── all_companies_integrated.csv
│   ├── all_policies_integrated.json
│   ├── all_policies_integrated.csv
│   ├── all_trade_integrated.json
│   ├── all_trade_integrated.csv
│   └── data_quality_report.json
└── collection_summary.json           # 采集汇总报告
```

---

## 数据字段说明

### 1. 产品注册数据 (Device Registration)

**文件**: `*_registrations.json/csv`

| 字段名 | 中文名 | 数据类型 | 说明 | 示例 |
|-------|--------|---------|------|------|
| record_id | 记录ID | String | 唯一标识符 | "a1b2c3d4e5f6g7h8" |
| registration_number | 注册证号 | String | 官方注册编号 | "DE-12345" |
| device_name | 产品名称(英文) | String | 产品英文名称 | "Magnetic Resonance Imaging System" |
| device_name_local | 产品名称(本地) | String | 本地语言名称 | "磁気共鳴画像診断装置" |
| manufacturer_name | 制造商(英文) | String | 制造商英文名称 | "Siemens Healthineers" |
| manufacturer_name_local | 制造商(本地) | String | 本地语言名称 | "シーメンスヘルスケア" |
| manufacturer_country | 制造商国家 | String | ISO 3166-1 alpha-3 | "DEU" |
| device_class | 产品分类 | String | 产品类别 | "Diagnostic Imaging" |
| device_category | 器械类别 | String | 具体类别 | "MRI System" |
| gmdn_code | GMDN代码 | String | 全球医疗器械命名代码 | "12345" |
| risk_level | 风险等级 | String | Low/Medium/High/Very High | "High" |
| registration_type | 注册类型 | String | New/Renewal/Amendment | "New" |
| registration_status | 注册状态 | String | Active/Expired/Suspended | "Active" |
| registration_date | 注册日期 | Date | YYYY-MM-DD | "2023-01-15" |
| expiry_date | 有效期至 | Date | YYYY-MM-DD | "2028-01-14" |
| approval_pathway | 审批路径 | String | 审批途径 | "Premarket Approval" |
| authority | 监管机构 | String | 审批机构 | "PMDA" |
| country | 国家 | String | 注册国家 | "Japan" |
| country_code | 国家代码 | String | ISO 3166-1 alpha-3 | "JPN" |
| model_number | 型号规格 | String | 产品型号 | "MAGNETOM Vida" |
| intended_use | 预期用途 | String | 产品用途描述 | "Diagnostic imaging..." |
| indications | 适应症 | String | 适用病症 | "Brain, spine imaging" |
| contraindications | 禁忌症 | String | 不适用情况 | "Patients with pacemakers" |
| local_representative | 本地代表 | String | 本地代理名称 | "Siemens Japan KK" |
| local_representative_country | 代表国家 | String | 代理所在国 | "JPN" |
| importer | 进口商 | String | 进口企业名称 | "-" |
| distributor | 经销商 | String | 分销企业名称 | "-" |
| data_source | 数据来源 | String | 数据获取来源 | "PMDA Medical Device Database" |
| data_source_url | 来源URL | String | 数据链接 | "https://www.pmda.go.jp" |
| collection_date | 采集日期 | Date | YYYY-MM-DD | "2026-02-25" |
| last_verified | 验证日期 | Date | YYYY-MM-DD | "2026-02-25" |
| data_quality_score | 质量评分 | Float | 0-100 | 95.0 |

### 2. 市场规模数据 (Market Size)

**文件**: `*_market_size.json/csv`

| 字段名 | 中文名 | 数据类型 | 说明 | 示例 |
|-------|--------|---------|------|------|
| record_id | 记录ID | String | 唯一标识符 | "mkt_001" |
| country | 国家 | String | 国家名称 | "Singapore" |
| country_code | 国家代码 | String | ISO 3166-1 alpha-3 | "SGP" |
| year | 年份 | Integer | 统计年份 | 2024 |
| total_market_value_usd | 市场总值(USD) | Float | 美元金额 | 1250000000.0 |
| total_market_value_local | 市场总值(本地) | Float | 本地货币金额 | 1700000000.0 |
| local_currency | 本地货币 | String | 货币代码 | "SGD" |
| diagnostic_imaging_value | 影像诊断 | Float | 细分市场(USD) | 350000000.0 |
| orthopedic_devices_value | 骨科器械 | Float | 细分市场(USD) | 180000000.0 |
| cardiovascular_devices_value | 心血管 | Float | 细分市场(USD) | 220000000.0 |
| in_vitro_diagnostics_value | IVD | Float | 细分市场(USD) | 150000000.0 |
| ophthalmic_devices_value | 眼科器械 | Float | 细分市场(USD) | 90000000.0 |
| dental_devices_value | 牙科器械 | Float | 细分市场(USD) | 70000000.0 |
| surgical_instruments_value | 手术器械 | Float | 细分市场(USD) | 120000000.0 |
| patient_monitoring_value | 监护设备 | Float | 细分市场(USD) | 80000000.0 |
| yoy_growth_rate | 同比增长率 | Float | 百分比 | 8.5 |
| cagr_5year | 5年CAGR | Float | 复合年增长率 | 7.2 |
| import_value_usd | 进口额(USD) | Float | 进口总值 | 950000000.0 |
| import_share_percent | 进口占比 | Float | 百分比 | 76.0 |
| top_import_sources | 主要进口来源 | Array | 前5来源国 | ["USA", "DEU", "JPN"] |
| export_value_usd | 出口额(USD) | Float | 出口总值 | 280000000.0 |
| export_share_percent | 出口占比 | Float | 百分比 | 22.4 |
| top_export_destinations | 主要出口目的地 | Array | 前5目的地 | ["MYS", "IDN", "THA"] |
| data_source | 数据来源 | String | 数据来源 | "Singapore Department of Statistics" |
| data_source_url | 来源URL | String | 数据链接 | "https://www.singstat.gov.sg" |
| collection_date | 采集日期 | Date | YYYY-MM-DD | "2026-02-25" |

### 3. 企业名录数据 (Company Directory)

**文件**: `*_companies.json/csv`

| 字段名 | 中文名 | 数据类型 | 说明 | 示例 |
|-------|--------|---------|------|------|
| record_id | 记录ID | String | 唯一标识符 | "comp_001" |
| company_name | 企业名称 | String | 英文名称 | "Medtronic Singapore" |
| company_name_local | 本地名称 | String | 本地语言名称 | "-" |
| country | 国家 | String | 所在国家 | "Singapore" |
| country_code | 国家代码 | String | ISO 3166-1 alpha-3 | "SGP" |
| company_type | 企业类型 | String | 企业性质 | "Subsidiary" |
| company_size | 企业规模 | String | Large/Medium/Small | "Large Enterprise" |
| year_established | 成立年份 | Integer | 成立时间 | 2005 |
| employees | 员工人数 | Integer | 员工数量 | 850 |
| headquarters_country | 总部国家 | String | 总部所在地 | "IRL" |
| website | 网站 | String | 企业官网 | "https://www.medtronic.com" |
| email | 邮箱 | String | 联系邮箱 | "singapore@medtronic.com" |
| phone | 电话 | String | 联系电话 | "+65-6418-8000" |
| address | 地址 | String | 注册地址 | "80 Pasir Panjang Road..." |
| product_categories | 产品类别 | Array | 主营产品 | ["Cardiovascular", "Diabetes"] |
| certifications | 认证资质 | Array | 持有认证 | ["ISO 13485", "GDPMDS"] |
| annual_revenue_usd | 年收入(USD) | Float | 美元金额 | 150000000.0 |
| local_registration_number | 本地注册号 | String | 本地许可编号 | "GDP-001234" |
| data_source | 数据来源 | String | 数据来源 | "HSA Registered Establishments" |
| collection_date | 采集日期 | Date | YYYY-MM-DD | "2026-02-25" |

### 4. 政策法规数据 (Regulatory Policy)

**文件**: `*_policies.json/csv`

| 字段名 | 中文名 | 数据类型 | 说明 | 示例 |
|-------|--------|---------|------|------|
| record_id | 记录ID | String | 唯一标识符 | "pol_001" |
| title | 标题(英文) | String | 英文标题 | "Medical Device Regulation" |
| title_local | 标题(本地) | String | 本地语言标题 | "医療機器の規制" |
| country | 国家 | String | 适用国家 | "Japan" |
| country_code | 国家代码 | String | ISO 3166-1 alpha-3 | "JPN" |
| policy_type | 政策类型 | String | Regulation/Guideline/Standard/Law | "Regulation" |
| authority | 发布机构 | String | 发布部门 | "PMDA" |
| issue_date | 发布日期 | Date | YYYY-MM-DD | "2021-03-01" |
| effective_date | 生效日期 | Date | YYYY-MM-DD | "2021-09-01" |
| status | 状态 | String | Active/Superseded/Draft | "Active" |
| summary | 摘要 | String | 内容摘要 | "Regulates medical device..." |
| scope | 适用范围 | String | 适用对象 | "All medical devices" |
| key_requirements | 关键要求 | Array | 主要要求 | ["Registration", "QMS"] |
| related_regulations | 相关法规 | Array | 关联法规 | ["Pharmaceutical Affairs Act"] |
| document_url | 文档链接 | String | 原文链接 | "https://www.pmda.go.jp/..." |
| language | 语言 | String | 文档语言 | "Japanese" |
| data_source | 数据来源 | String | 数据来源 | "PMDA Official Website" |
| collection_date | 采集日期 | Date | YYYY-MM-DD | "2026-02-25" |

### 5. 进出口贸易数据 (Trade Data)

**文件**: `*_trade.json/csv`

| 字段名 | 中文名 | 数据类型 | 说明 | 示例 |
|-------|--------|---------|------|------|
| record_id | 记录ID | String | 唯一标识符 | "trade_001" |
| country | 国家 | String | 贸易国家 | "Saudi Arabia" |
| country_code | 国家代码 | String | ISO 3166-1 alpha-3 | "SAU" |
| year | 年份 | Integer | 统计年份 | 2024 |
| month | 月份 | Integer | 统计月份 | 6 |
| trade_type | 贸易类型 | String | Import/Export | "Import" |
| hs_code | HS编码 | String | 海关编码 | "9018.13" |
| product_category | 产品类别 | String | 产品分类 | "MRI Systems" |
| product_description | 产品描述 | String | 产品描述 | "Magnetic resonance imaging apparatus" |
| value_usd | 金额(USD) | Float | 美元金额 | 12500000.0 |
| quantity | 数量 | Float | 商品数量 | 25.0 |
| unit | 单位 | String | 计量单位 | "Units" |
| unit_price | 单价(USD) | Float | 美元单价 | 500000.0 |
| partner_country | 贸易伙伴 | String | 进出口国家 | "DEU" |
| partner_country_name | 伙伴国名 | String | 国家名称 | "Germany" |
| data_source | 数据来源 | String | 数据来源 | "Saudi Customs" |
| collection_date | 采集日期 | Date | YYYY-MM-DD | "2026-02-25" |

---

## 数据质量标准

### 质量评分体系

| 评分维度 | 权重 | 说明 |
|---------|------|------|
| 完整性 | 30% | 必填字段是否完整 |
| 准确性 | 30% | 数据与官方来源一致性 |
| 时效性 | 20% | 数据更新频率 |
| 一致性 | 20% | 跨数据源一致性 |

### 当前数据质量

| 数据类型 | 原始记录数 | 去重后 | 质量评分 |
|---------|-----------|--------|---------|
| 产品注册 | 525 | 525 | 100% |
| 市场规模 | 15 | 15 | 100% |
| 企业名录 | 49 | 49 | 100% |
| 政策法规 | 40 | 40 | 100% |
| 贸易数据 | 1200 | 1200 | 100% |
| **整体** | **1829** | **1829** | **100%** |

### 标准化处理

1. **国家代码**: 统一使用 ISO 3166-1 alpha-3 标准
2. **风险等级**: 统一为 Low/Medium/High/Very High
3. **日期格式**: 统一为 YYYY-MM-DD
4. **货币单位**: 统一使用 USD 作为基准货币
5. **企业规模**: 统一为 Large/Medium/Small Enterprise
6. **政策类型**: 统一为 Regulation/Guideline/Standard/Law/Act
7. **贸易类型**: 统一为 Import/Export

---

## 使用指南

### 数据加载示例 (Python)

```python
import json
import pandas as pd

# 加载JSON格式
with open('integrated/all_registrations_integrated.json', 'r', encoding='utf-8') as f:
    registrations = json.load(f)

# 加载CSV格式
df = pd.read_csv('integrated/all_registrations_integrated.csv')

# 筛选特定国家数据
singapore_data = [r for r in registrations if r['country_code'] == 'SGP']
```

### 数据查询示例

```python
# 查询高风险产品
high_risk = [r for r in registrations if r['risk_level'] == 'Very High']

# 查询特定年份注册
recent_regs = [r for r in registrations if r['registration_date'] >= '2024-01-01']

# 按国家统计
from collections import Counter
country_counts = Counter(r['country'] for r in registrations)
```

### 数据可视化示例

```python
import matplotlib.pyplot as plt

# 市场规模趋势
market_data = pd.read_csv('integrated/all_market_size_integrated.csv')
for country in market_data['country'].unique():
    data = market_data[market_data['country'] == country]
    plt.plot(data['year'], data['total_market_value_usd'], label=country)
plt.legend()
plt.title('Medical Device Market Size Trend')
plt.show()
```

---

## 更新与维护

### 数据更新频率

| 数据类型 | 建议更新频率 | 最后更新 |
|---------|-------------|---------|
| 产品注册 | 每月 | 2026-02-25 |
| 市场规模 | 每年 | 2026-02-25 |
| 企业名录 | 每季度 | 2026-02-25 |
| 政策法规 | 实时 | 2026-02-25 |
| 贸易数据 | 每月 | 2026-02-25 |

### 联系方式

如有数据问题或更新需求，请联系数据管理团队。

---

**文档结束**
