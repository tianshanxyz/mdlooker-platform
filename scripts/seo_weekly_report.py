#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
SEO/GEO 周报生成器（任务 20）
自动生成 SEO 和 GEO 监控周报
"""

import json
import os
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from jinja2 import Template


class SEOWeeklyReportGenerator:
    """SEO/GEO 周报生成器"""
    
    def __init__(self, output_dir: str = './reports'):
        self.output_dir = output_dir
        os.makedirs(output_dir, exist_ok=True)
    
    def generate_report(
        self,
        start_date: str,
        end_date: str,
        metrics: Dict,
        keywords: List[Dict],
        ai_citations: List[Dict],
        output_format: str = 'html'
    ) -> str:
        """
        生成周报
        
        Args:
            start_date: 开始日期 (YYYY-MM-DD)
            end_date: 结束日期 (YYYY-MM-DD)
            metrics: SEO 指标数据
            keywords: 关键词排名数据
            ai_citations: AI 引用数据
            output_format: 输出格式 (html, pdf, markdown)
            
        Returns:
            生成的报告文件路径
        """
        report_data = {
            'report_title': 'SEO/GEO 监控周报',
            'generated_at': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'period': {
                'start': start_date,
                'end': end_date,
                'week_number': datetime.strptime(end_date, '%Y-%m-%d').isocalendar()[1]
            },
            'summary': self._generate_summary(metrics),
            'metrics': metrics,
            'top_keywords': sorted(keywords, key=lambda x: x.get('traffic', 0), reverse=True)[:20],
            'keyword_changes': self._analyze_keyword_changes(keywords),
            'ai_citations': ai_citations,
            'recommendations': self._generate_recommendations(metrics, keywords)
        }
        
        if output_format == 'html':
            return self._generate_html_report(report_data)
        elif output_format == 'markdown':
            return self._generate_markdown_report(report_data)
        elif output_format == 'json':
            return self._save_json_report(report_data)
        else:
            raise ValueError(f"不支持的输出格式：{output_format}")
    
    def _generate_summary(self, metrics: Dict) -> Dict:
        """生成执行摘要"""
        summary = {
            'total_organic_traffic': metrics.get('organicTraffic', 0),
            'traffic_growth': metrics.get('organicTrafficChange', 0),
            'average_position': metrics.get('averagePosition', 0),
            'position_change': metrics.get('positionChange', 0),
            'visibility': metrics.get('visibility', 0),
            'total_ai_mentions': metrics.get('aiMentions', 0),
            'performance_rating': '优秀' if metrics.get('organicTrafficChange', 0) > 10 else 
                                 '良好' if metrics.get('organicTrafficChange', 0) > 0 else 
                                 '需改进'
        }
        return summary
    
    def _analyze_keyword_changes(self, keywords: List[Dict]) -> Dict:
        """分析关键词排名变化"""
        improved = []
        declined = []
        stable = []
        
        for kw in keywords:
            change = kw.get('previousPosition', 0) - kw.get('position', 0)
            if change > 2:
                improved.append({
                    'keyword': kw.get('keyword'),
                    'current': kw.get('position'),
                    'previous': kw.get('previousPosition'),
                    'change': change
                })
            elif change < -2:
                declined.append({
                    'keyword': kw.get('keyword'),
                    'current': kw.get('position'),
                    'previous': kw.get('previousPosition'),
                    'change': change
                })
            else:
                stable.append(kw.get('keyword'))
        
        return {
            'improved': sorted(improved, key=lambda x: x['change'], reverse=True)[:10],
            'declined': sorted(declined, key=lambda x: x['change'])[:10],
            'stable_count': len(stable)
        }
    
    def _generate_recommendations(self, metrics: Dict, keywords: List[Dict]) -> List[str]:
        """生成优化建议"""
        recommendations = []
        
        # 流量分析
        if metrics.get('organicTrafficChange', 0) < -10:
            recommendations.append('⚠️ 自然流量下降超过 10%，建议立即检查核心关键词排名和网站可访问性')
        elif metrics.get('organicTrafficChange', 0) > 20:
            recommendations.append('✅ 自然流量增长显著，继续保持当前优化策略')
        
        # 排名分析
        if metrics.get('positionChange', 0) < -2:
            recommendations.append('📊 平均排名下降，建议优化低排名页面的内容质量和用户体验')
        
        # CTR 分析
        if metrics.get('ctr', 0) < 2:
            recommendations.append('✍️ 点击率偏低，建议优化标题标签和元描述，提高吸引力')
        
        # AI 引用分析
        if metrics.get('aiMentions', 0) < 10:
            recommendations.append('🤖 AI 平台引用较少，建议：\n'
                                 '   - 增加权威数据引用和专家背书\n'
                                 '   - 优化内容的结构和可读性\n'
                                 '   - 添加更多 FAQ 和结构化数据')
        
        # 关键词机会
        high_volume_low_rank = [
            kw for kw in keywords 
            if kw.get('searchVolume', 0) > 1000 and kw.get('position', 0) > 20
        ]
        if high_volume_low_rank:
            recommendations.append(f'💡 发现 {len(high_volume_low_rank)} 个高搜索量但排名较低的关键词，建议优先优化')
        
        # 外链建设
        if metrics.get('backlinksChange', 0) < 5:
            recommendations.append('🔗 反向链接增长缓慢，建议开展内容营销和外链建设活动')
        
        return recommendations
    
    def _generate_html_report(self, report_data: Dict) -> str:
        """生成 HTML 格式报告"""
        template = Template(HTML_REPORT_TEMPLATE)
        html_content = template.render(**report_data)
        
        filename = f"seo_weekly_report_{report_data['period']['start']}_to_{report_data['period']['end']}.html"
        filepath = os.path.join(self.output_dir, filename)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(html_content)
        
        print(f"HTML 报告已生成：{filepath}")
        return filepath
    
    def _generate_markdown_report(self, report_data: Dict) -> str:
        """生成 Markdown 格式报告"""
        template = Template(MARKDOWN_REPORT_TEMPLATE)
        md_content = template.render(**report_data)
        
        filename = f"seo_weekly_report_{report_data['period']['start']}_to_{report_data['period']['end']}.md"
        filepath = os.path.join(self.output_dir, filename)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(md_content)
        
        print(f"Markdown 报告已生成：{filepath}")
        return filepath
    
    def _save_json_report(self, report_data: Dict) -> str:
        """保存 JSON 格式报告"""
        filename = f"seo_weekly_report_{report_data['period']['start']}_to_{report_data['period']['end']}.json"
        filepath = os.path.join(self.output_dir, filename)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(report_data, f, ensure_ascii=False, indent=2)
        
        print(f"JSON 报告已保存：{filepath}")
        return filepath


# HTML 报告模板
HTML_REPORT_TEMPLATE = """
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ report_title }}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; margin-bottom: 30px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .metric-card { background: white; border: 1px solid #ddd; padding: 20px; border-radius: 8px; text-align: center; }
        .metric-value { font-size: 2em; font-weight: bold; color: #667eea; }
        .metric-label { color: #666; margin-top: 5px; }
        .positive { color: #10b981; }
        .negative { color: #ef4444; }
        section { background: white; padding: 20px; margin-bottom: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        h2 { color: #667eea; border-bottom: 2px solid #667eea; padding-bottom: 10px; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background: #f8f9fa; font-weight: 600; }
        .recommendation { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 10px 0; }
        .ai-citation { display: inline-block; background: #e0e7ff; padding: 8px 16px; margin: 5px; border-radius: 20px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>{{ report_title }}</h1>
        <p>报告周期：{{ period.start }} 至 {{ period.end }} (第 {{ period.week_number }} 周)</p>
        <p>生成时间：{{ generated_at }}</p>
    </div>
    
    <div class="summary">
        <div class="metric-card">
            <div class="metric-value">{{ summary.total_organic_traffic }}</div>
            <div class="metric-label">自然流量</div>
            <div class="{{ 'positive' if summary.traffic_growth > 0 else 'negative' }}">
                {{ '+' if summary.traffic_growth > 0 else '' }}{{ summary.traffic_growth }}%
            </div>
        </div>
        <div class="metric-card">
            <div class="metric-value">{{ "%.2f"|format(summary.average_position) }}</div>
            <div class="metric-label">平均排名</div>
            <div class="{{ 'positive' if summary.position_change < 0 else 'negative' }}">
                {{ '+' if summary.position_change > 0 else '' }}{{ summary.position_change }}
            </div>
        </div>
        <div class="metric-card">
            <div class="metric-value">{{ "%.2f"|format(summary.visibility * 100) }}%</div>
            <div class="metric-label">可见度</div>
        </div>
        <div class="metric-card">
            <div class="metric-value">{{ summary.total_ai_mentions }}</div>
            <div class="metric-label">AI 引用</div>
        </div>
        <div class="metric-card">
            <div class="metric-value" style="font-size: 1.5em;">{{ summary.performance_rating }}</div>
            <div class="metric-label">整体表现</div>
        </div>
    </div>
    
    <section>
        <h2>📈 关键词排名变化</h2>
        <h3>排名提升的关键词</h3>
        <table>
            <tr><th>关键词</th><th>当前排名</th><th>之前排名</th><th>变化</th></tr>
            {% for kw in keyword_changes.improved %}
            <tr>
                <td>{{ kw.keyword }}</td>
                <td>{{ kw.current }}</td>
                <td>{{ kw.previous }}</td>
                <td class="positive">+{{ kw.change }}</td>
            </tr>
            {% endfor %}
        </table>
        
        <h3>排名下降的关键词</h3>
        <table>
            <tr><th>关键词</th><th>当前排名</th><th>之前排名</th><th>变化</th></tr>
            {% for kw in keyword_changes.declined %}
            <tr>
                <td>{{ kw.keyword }}</td>
                <td>{{ kw.current }}</td>
                <td>{{ kw.previous }}</td>
                <td class="negative">{{ kw.change }}</td>
            </tr>
            {% endfor %}
        </table>
    </section>
    
    <section>
        <h2>🤖 AI 平台引用</h2>
        {% for citation in ai_citations %}
        <div class="ai-citation">
            <strong>{{ citation.platform }}</strong>: {{ citation.mentionCount }} 次引用
        </div>
        {% endfor %}
    </section>
    
    <section>
        <h2>💡 优化建议</h2>
        {% for rec in recommendations %}
        <div class="recommendation">{{ rec }}</div>
        {% endfor %}
    </section>
</body>
</html>
"""

# Markdown 报告模板
MARKDOWN_REPORT_TEMPLATE = """
# {{ report_title }}

**报告周期**: {{ period.start }} 至 {{ period.end }} (第 {{ period.week_number }} 周)  
**生成时间**: {{ generated_at }}

## 📊 执行摘要

| 指标 | 数值 | 变化 |
|------|------|------|
| 自然流量 | {{ summary.total_organic_traffic }} | {{ '+' if summary.traffic_growth > 0 else '' }}{{ summary.traffic_growth }}% |
| 平均排名 | {{ "%.2f"|format(summary.average_position) }} | {{ '+' if summary.position_change > 0 else '' }}{{ summary.position_change }} |
| 可见度 | {{ "%.2f"|format(summary.visibility * 100) }}% | - |
| AI 引用 | {{ summary.total_ai_mentions }} | - |
| **整体表现** | **{{ summary.performance_rating }}** | - |

## 📈 关键词排名变化

### 排名提升的关键词 (Top 10)

| 关键词 | 当前排名 | 之前排名 | 变化 |
|--------|----------|----------|------|
{% for kw in keyword_changes.improved %}
| {{ kw.keyword }} | {{ kw.current }} | {{ kw.previous }} | +{{ kw.change }} |
{% endfor %}

### 排名下降的关键词 (Top 10)

| 关键词 | 当前排名 | 之前排名 | 变化 |
|--------|----------|----------|------|
{% for kw in keyword_changes.declined %}
| {{ kw.keyword }} | {{ kw.current }} | {{ kw.previous }} | {{ kw.change }} |
{% endfor %}

## 🤖 AI 平台引用

{% for citation in ai_citations %}
- **{{ citation.platform }}**: {{ citation.mentionCount }} 次引用
{% endfor %}

## 💡 优化建议

{% for rec in recommendations %}
{{ rec }}

{% endfor %}

---

*本报告由 MDLooker SEO/GEO 监控系统自动生成*
"""


def main():
    """主函数示例"""
    generator = SEOWeeklyReportGenerator()
    
    # 示例数据（实际使用时从 API 获取）
    sample_metrics = {
        'organicTraffic': 15000,
        'organicTrafficChange': 12.5,
        'averagePosition': 8.5,
        'positionChange': -1.2,
        'visibility': 0.65,
        'aiMentions': 25,
        'ctr': 3.2,
        'backlinksChange': 8.5
    }
    
    sample_keywords = [
        {'keyword': '医疗器械注册', 'position': 3, 'previousPosition': 5, 'searchVolume': 2000, 'traffic': 500},
        {'keyword': 'FDA 认证', 'position': 7, 'previousPosition': 6, 'searchVolume': 1500, 'traffic': 300},
        {'keyword': 'CE 认证流程', 'position': 12, 'previousPosition': 15, 'searchVolume': 1000, 'traffic': 150}
    ]
    
    sample_ai_citations = [
        {'platform': 'chatgpt', 'mentionCount': 10},
        {'platform': 'gemini', 'mentionCount': 8},
        {'platform': 'claude', 'mentionCount': 7}
    ]
    
    # 生成报告
    end_date = datetime.now().strftime('%Y-%m-%d')
    start_date = (datetime.now() - timedelta(days=7)).strftime('%Y-%m-%d')
    
    generator.generate_report(
        start_date=start_date,
        end_date=end_date,
        metrics=sample_metrics,
        keywords=sample_keywords,
        ai_citations=sample_ai_citations,
        output_format='html'
    )
    
    generator.generate_report(
        start_date=start_date,
        end_date=end_date,
        metrics=sample_metrics,
        keywords=sample_keywords,
        ai_citations=sample_ai_citations,
        output_format='markdown'
    )


if __name__ == '__main__':
    main()
