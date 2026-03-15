# MDLooker 平台优化方案 Spec

## 项目背景
MDLooker 是一个全球医疗器械合规情报与准入查询平台，已完成基础数据抓取和搜索功能。当前需要基于用户需求进行针对性优化。

## 当前状态分析
✅ **已完成功能：**
- 多数据源搜索（FDA、NMPA、EUDAMED 等）
- 公司详情页
- AI 聊天助手
- 基础数据同步（FDA cron job）
- 用户认证系统

❌ **待优化问题：**
- NMPA 数据 company_id 关联缺失（已修复搜索，但需要数据治理）
- 缺少高级筛选功能
- 无数据导出功能
- 无竞品监控功能
- 缺少数据可视化

## 优化原则
1. **低成本优先**：利用现有 Supabase + Next.js 架构
2. **快速见效**：优先实现用户最需要的功能
3. **数据驱动**：基于现有 72000+ NMPA、43000+ EUDAMED 数据做文章

## 优化方案（分阶段）

### 第一阶段：核心体验优化（1-2 周）
**目标：解决当前搜索和详情查看的基础问题**

1. **搜索功能增强**
   - ✅ 支持中文搜索（已修复）
   - ⬜ 添加筛选器（国家、证书状态、公司类型）
   - ⬜ 搜索结果分页优化

2. **数据治理**
   - ⬜ NMPA 数据 company_id 批量修复
   - ⬜ 建立公司 - 产品关联关系

3. **详情页优化**
   - ✅ NMPA 公司详情支持（已实现）
   - ⬜ 添加证书到期日期提醒
   - ⬜ 显示注册历史趋势

### 第二阶段：数据导出与监控（2-3 周）
**目标：提供实用工具，增加用户粘性**

1. **导出功能**
   - ⬜ 搜索结果导出 CSV/Excel
   - ⬜ 公司详情导出 PDF（简化版）

2. **竞品监控（简化版）**
   - ⬜ 用户收藏公司/产品
   - ⬜ 新增注册时邮件通知
   - ⬜ 监控看板页面

3. **基础数据统计**
   - ⬜ 各国注册数量统计
   - ⬜ 月度增长趋势图（使用 Chart.js）

### 第三阶段：智能化与可视化（3-4 周）
**目标：提升平台专业度和差异化**

1. **数据可视化**
   - ⬜ 市场热度仪表盘
   - ⬜ 注册趋势图表
   - ⬜ 竞品对比工具

2. **AI 增强**
   - ⬜ AI 合规助手优化（基于现有 AI chat）
   - ⬜ 自动解读证书关键信息

3. **报告生成（可选）**
   - ⬜ 简易版市场准入报告
   - ⬜ 自定义 Logo（付费功能预留）

## 技术架构建议

### 推荐技术栈（保持现有架构）
- **前端**: Next.js 14 + React + TailwindCSS（已有）
- **图表**: Chart.js 或 Recharts（轻量级）
- **数据库**: Supabase PostgreSQL（已有）
- **导出**: `json2csv` + `@react-pdf/renderer`
- **邮件**: Resend 或 SendGrid（竞品监控通知）
- **定时任务**: Vercel Cron（已有 FDA sync）

### 不建议引入（成本过高）
- ❌ 复杂的 BI 工具
- ❌ 实时流处理
- ❌ 微服务架构
- ❌ 复杂的消息队列

## 核心功能实现方案

### 1. 竞品监控看板（简化版）
**实现思路：**
- 用户收藏公司/产品 → 存入 `user_favorites` 表
- 每日 cron job 检查新增注册 → 对比 favorites
- 发送邮件通知 + 站内消息

**数据库表：**
```sql
CREATE TABLE user_favorites (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  company_id UUID REFERENCES companies(id),
  product_name TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE favorite_notifications (
  id UUID PRIMARY KEY,
  user_id UUID,
  favorite_id UUID,
  new_registration_id UUID,
  notified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 2. 数据导出功能
**实现思路：**
- 前端：添加"导出"按钮
- 后端：查询搜索结果 → 转 CSV/JSON
- 使用浏览器下载

**API 端点：**
```
GET /api/export/companies?ids=xxx,yyy&format=csv
GET /api/export/search-results?query=xxx&format=csv
```

### 3. 市场热度仪表盘
**实现思路：**
- 后端聚合查询各国注册数量
- 前端使用 Chart.js 展示柱状图/折线图
- 缓存查询结果（5 分钟）

**SQL 示例：**
```sql
-- 各国月度注册趋势
SELECT 
  DATE_TRUNC('month', approval_date) as month,
  country,
  COUNT(*) as registration_count
FROM nmpa_registrations
WHERE approval_date >= NOW() - INTERVAL '12 months'
GROUP BY month, country
ORDER BY month DESC;
```

## 数据治理方案

### NMPA company_id 修复
**问题：** 72000 条 NMPA 记录的 company_id 为 NULL

**解决方案：**
1. 批量提取唯一的 manufacturer 名称
2. 在 companies 表中查找或创建对应记录
3. 批量更新 nmpa_registrations.company_id

**执行脚本：**
```sql
-- 1. 创建临时表存储唯一制造商
CREATE TEMP TABLE unique_manufacturers AS
SELECT DISTINCT manufacturer_zh, manufacturer
FROM nmpa_registrations
WHERE company_id IS NULL;

-- 2. 为每个制造商创建/查找公司
-- （通过脚本批量处理）

-- 3. 更新 company_id
UPDATE nmpa_registrations n
SET company_id = c.id
FROM companies c
WHERE n.company_id IS NULL
  AND (n.manufacturer_zh = c.name_zh OR n.manufacturer = c.name);
```

## 优先级排序

| 优先级 | 功能 | 工作量 | 价值 | 状态 |
|--------|------|--------|------|------|
| P0 | 搜索优化（中文支持） | ✅ 完成 | 高 | ✅ |
| P0 | NMPA 数据治理 | 中 | 高 | ⬜ |
| P1 | 筛选器 | 低 | 高 | ⬜ |
| P1 | 导出 CSV | 低 | 高 | ⬜ |
| P1 | 竞品监控（基础版） | 中 | 高 | ⬜ |
| P2 | 数据可视化图表 | 中 | 中 | ⬜ |
| P2 | 详情页增强 | 低 | 中 | ⬜ |
| P3 | 报告生成 | 高 | 低 | ⬜ |
| P3 | API 开放 | 高 | 低 | ⬜ |

## 成功指标（KPIs）
- 搜索转化率提升 30%
- 用户平均停留时长 > 3 分钟
- 导出功能使用率 > 20%
- 监控功能订阅率 > 15%

## 风险与注意事项
1. **数据准确性**：明确标注"数据仅供参考"
2. **性能优化**：大数据量查询需要添加索引
3. **邮件送达率**：使用专业邮件服务，避免进垃圾箱
4. **版权合规**：遵守各国药监局数据使用政策

## 下一步行动
1. 确认优化方案优先级
2. 开始第一阶段实施（搜索优化 + 数据治理）
3. 2 周后评审，进入第二阶段
