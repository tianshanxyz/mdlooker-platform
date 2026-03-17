# SEO/GEO 监控配置指南（任务 20）

本指南介绍如何配置和使用 MDLooker 平台的 SEO/GEO 监控功能。

## 目录

1. [Google Analytics 配置](#google-analytics-配置)
2. [Google Search Console 配置](#google-search-console-配置)
3. [Ahrefs/SEMrush 配置](#ahrefssemrush-配置)
4. [AI 引用监控配置](#ai 引用监控配置)
5. [周报自动生成](#周报自动生成)

---

## Google Analytics 配置

### 1. 创建 Google Analytics 账号

1. 访问 [analytics.google.com](https://analytics.google.com)
2. 使用 Google 账号登录
3. 点击"开始测量"
4. 输入账号名称（如：MDLooker Platform）
5. 配置数据共享设置

### 2. 创建媒体资源

1. 点击"创建媒体资源"
2. 输入媒体属性名称
3. 选择报告时区和货币
4. 点击"创建"

### 3. 获取测量 ID

1. 在媒体属性中，点击"数据流"
2. 选择"Web"
3. 输入网站 URL 和流名称
4. 获取测量 ID（格式：G-XXXXXXXXXX）

### 4. 在 MDLooker 中配置

创建 `.env.local` 文件（如果不存在）：

```bash
# Google Analytics 配置
NEXT_PUBLIC_GA_ENABLED=true
NEXT_PUBLIC_GA_PROPERTY_ID=G-XXXXXXXXXX
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### 5. 安装 Google Analytics

在 `app/layout.tsx` 中添加 GA 脚本：

```typescript
import Script from 'next/script'

export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <Script
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
        />
        <Script
          id="gtag-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}', {
                page_path: window.location.pathname,
              });
            `,
          }}
        />
      </head>
      {children}
    </html>
  )
}
```

---

## Google Search Console 配置

### 1. 添加网站到 Search Console

1. 访问 [search.google.com/search-console](https://search.google.com/search-console)
2. 点击"立即开始"
3. 选择资源类型：
   - **域名资源**（推荐）：覆盖所有子域名和协议
   - **URL 前缀资源**：仅监控特定 URL

### 2. 验证网站所有权

#### 方法 1：DNS 记录验证（推荐用于域名资源）

1. 选择"DNS 记录"验证方法
2. 复制 TXT 记录值
3. 登录域名注册商后台
4. 添加 TXT 记录：
   - 主机：`@`
   - 值：`google-site-verification=XXXXXXXXXX`
5. 等待 DNS 生效（通常几分钟到几小时）
6. 返回 Search Console 点击"验证"

#### 方法 2：HTML 文件验证

1. 下载 HTML 验证文件
2. 上传到网站根目录
3. 确保文件可通过 `https://yourdomain.com/googleXXXXXXXXXX.html` 访问
4. 点击"验证"

#### 方法 3：HTML 标签验证

1. 复制 meta 标签代码
2. 粘贴到网站 `<head>` 部分：
   ```html
   <meta name="google-site-verification" content="XXXXXXXXXX" />
   ```
3. 点击"验证"

### 3. 提交站点地图

1. 在 Search Console 左侧菜单选择"站点地图"
2. 输入站点地图 URL：`sitemap.xml`
3. 点击"提交"

### 4. 在 MDLooker 中配置

```bash
# Google Search Console 配置
NEXT_PUBLIC_SEARCH_CONSOLE_ENABLED=true
NEXT_PUBLIC_SITE_URL=https://mdlooker.com
GOOGLE_SEARCH_CONSOLE_API_KEY=your_api_key  # 如需 API 访问
```

### 5. 启用 Search Console API（可选）

如需通过 API 获取数据：

1. 访问 [Google Cloud Console](https://console.cloud.google.com)
2. 创建新项目或选择现有项目
3. 启用 "Search Console API"
4. 创建服务账号或 OAuth 2.0 凭据
5. 下载 JSON 密钥文件
6. 将密钥文件路径添加到环境变量：
   ```bash
   GOOGLE_SEARCH_CONSOLE_CREDENTIALS=/path/to/credentials.json
   ```

---

## Ahrefs/SEMrush 配置

### Ahrefs API 配置

1. **获取 API 密钥**
   - 登录 [Ahrefs](https://ahrefs.com)
   - 进入账户设置 > API
   - 生成新的 API 令牌

2. **配置 MDLooker**
   ```bash
   AHREFS_API_KEY=your_ahrefs_api_key
   AHREFS_API_ENABLED=true
   ```

3. **API 使用示例**
   ```typescript
   import { SEOMonitoringService } from '@/lib/seo-monitoring'
   
   const service = new SEOMonitoringService([
     {
       provider: 'ahrefs',
       enabled: true,
       apiKey: process.env.AHREFS_API_KEY
     }
   ])
   
   const metrics = await service.getMetrics('2024-01-01', '2024-01-31')
   ```

### SEMrush API 配置

1. **获取 API 密钥**
   - 登录 [SEMrush](https://semrush.com)
   - 进入账户设置 > API
   - 创建新的 API 密钥

2. **配置 MDLooker**
   ```bash
   SEMRUSH_API_KEY=your_semrush_api_key
   SEMRUSH_API_ENABLED=true
   ```

---

## AI 引用监控配置

### 监控策略

MDLooker 提供 AI 平台引用监控功能，支持以下平台：

- **ChatGPT** (OpenAI)
- **Gemini** (Google)
- **Claude** (Anthropic)
- **DeepSeek** (深度求索)
- **通义千问** (阿里云)
- **文心一言** (百度)

### 配置方法

1. **创建监控关键词列表**
   
   在 `app/lib/ai-monitoring-config.ts` 中配置：
   
   ```typescript
   export const MONITORING_KEYWORDS = [
     'MDLooker',
     '医疗器械合规平台',
     '全球医疗器械注册',
     'FDA 注册查询',
     'NMPA 注册查询',
     // 添加更多品牌和产品关键词
   ]
   ```

2. **设置监控频率**
   
   ```typescript
   export const MONITORING_CONFIG = {
     checkInterval: 'daily',  // daily, weekly, monthly
     platforms: ['chatgpt', 'gemini', 'claude', 'deepseek', 'qwen', 'ernie'],
     alertThreshold: 5  // 引用次数超过阈值时发送警报
   }
   ```

3. **配置告警通知**
   
   ```bash
   # 邮件通知
   ALERT_EMAIL_ENABLED=true
   ALERT_EMAIL_TO=admin@mdlooker.com
   
   # Slack 通知
   ALERT_SLACK_ENABLED=true
   ALERT_SLACK_WEBHOOK_URL=https://hooks.slack.com/services/XXX/YYY/ZZZ
   
   # Webhook 通知
   ALERT_WEBHOOK_ENABLED=false
   ALERT_WEBHOOK_URL=https://your-api.com/webhook
   ```

---

## 周报自动生成

### 使用命令行生成周报

```bash
# 进入脚本目录
cd scripts

# 生成上周的 SEO/GEO 报告（HTML 格式）
python seo_weekly_report.py

# 生成指定日期的报告
python seo_weekly_report.py --start-date 2024-01-01 --end-date 2024-01-07 --format html
```

### 定时任务配置

#### 使用 Cron（Linux/Mac）

编辑 crontab：
```bash
crontab -e
```

添加任务（每周一上午 9 点生成上周报告）：
```bash
0 9 * * 1 cd /path/to/mdlooker-platform/scripts && python seo_weekly_report.py
```

#### 使用 Windows 任务计划程序

1. 打开"任务计划程序"
2. 创建基本任务
3. 设置触发器：每周一次，周一，9:00 AM
4. 设置操作：启动程序
   - 程序：`python.exe`
   - 参数：`seo_weekly_report.py`
   - 起始于：`C:\path\to\mdlooker-platform\scripts`

### 周报内容

自动生成的周报包含：

1. **执行摘要**
   - 自然流量及增长率
   - 平均排名及变化
   - 可见度指数
   - AI 引用总数
   - 整体表现评级

2. **关键词排名分析**
   - 排名提升的关键词 Top 10
   - 排名下降的关键词 Top 10
   - 稳定排名关键词统计

3. **AI 平台引用监控**
   - 各 AI 平台引用次数
   - 引用情感分析（正面/中性/负面）
   - 热门引用主题

4. **优化建议**
   - 基于数据变化的针对性建议
   - 优先级排序的改进行动项

### 报告输出格式

支持多种输出格式：

- **HTML**: 可视化报告，适合在线查看
- **Markdown**: 文本格式，适合版本控制和邮件
- **JSON**: 结构化数据，适合进一步分析
- **PDF**: 打印格式（需额外配置）

生成指定格式：
```bash
python seo_weekly_report.py --format html    # HTML 格式
python seo_weekly_report.py --format markdown # Markdown 格式
python seo_weekly_report.py --format json     # JSON 格式
```

---

## 监控仪表板访问

配置完成后，访问 SEO/GEO 监控仪表板：

```
https://your-domain.com/seo-monitoring
```

仪表板功能：

- ✅ 实时流量和排名监控
- ✅ 关键词排名追踪
- ✅ AI 引用监控
- ✅ 数据可视化图表
- ✅ 自定义时间范围
- ✅ 报告导出功能

---

## 故障排查

### 问题：无法获取 Google Analytics 数据

**解决方案**：
1. 检查测量 ID 是否正确
2. 确认 GA 脚本已正确安装
3. 验证网站是否产生流量数据
4. 检查 API 权限设置

### 问题：Search Console API 返回认证错误

**解决方案**：
1. 确认 API 已启用
2. 检查服务账号权限
3. 重新生成 API 密钥
4. 验证域名所有权

### 问题：周报生成失败

**解决方案**：
1. 检查 Python 依赖：`pip install -r requirements.txt`
2. 确认 Jinja2 模板语法正确
3. 检查输出目录权限
4. 查看详细错误日志

---

## 最佳实践

1. **定期检查监控数据**
   - 每天查看关键指标变化
   - 每周查看详细报告
   - 每月进行趋势分析

2. **设置合理的告警阈值**
   - 流量下降 > 10% 触发告警
   - 排名下降 > 3 位触发告警
   - AI 引用异常波动触发告警

3. **持续优化内容**
   - 根据关键词排名调整内容策略
   - 增加权威引用和专家背书
   - 优化 FAQ 和结构化数据

4. **多渠道数据验证**
   - 交叉验证不同工具的数据
   - 结合定性和定量分析
   - 定期校准监控指标

---

## 技术支持

如有问题，请联系：
- 邮箱：support@mdlooker.com
- 文档：https://mdlooker.com/docs
- GitHub: https://github.com/mdlooker/platform
