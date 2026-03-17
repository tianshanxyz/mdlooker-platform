'use client';

import React, { useState, useEffect } from 'react';
import { createSEOMonitoringService, SEOMetrics, KeywordRanking, AICitation } from '../../lib/seo-monitoring';

interface DashboardStats {
  metrics: SEOMetrics | null;
  topKeywords: KeywordRanking[];
  aiCitations: AICitation[];
  loading: boolean;
  error: string | null;
}

export default function SEOMonitoringDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    metrics: null,
    topKeywords: [],
    aiCitations: [],
    loading: true,
    error: null
  });
  
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month' | 'quarter'>('month');

  useEffect(() => {
    loadDashboardData();
  }, [dateRange, selectedPeriod]);

  const loadDashboardData = async () => {
    setStats(prev => ({ ...prev, loading: true }));
    
    try {
      const monitoringService = createSEOMonitoringService();
      
      const [metrics, keywords, citations] = await Promise.all([
        monitoringService.getMetrics(dateRange.startDate, dateRange.endDate, selectedPeriod),
        monitoringService.getKeywordRankings(undefined, 50),
        monitoringService.getAICitations()
      ]);
      
      setStats({
        metrics,
        topKeywords: keywords.slice(0, 20),
        aiCitations: citations,
        loading: false,
        error: null
      });
    } catch (err) {
      setStats(prev => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : '加载数据失败'
      }));
    }
  };

  const handlePeriodChange = (period: 'day' | 'week' | 'month' | 'quarter') => {
    setSelectedPeriod(period);
    
    const now = new Date();
    let startDate = new Date();
    
    switch (period) {
      case 'day':
        startDate.setDate(now.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
    }
    
    setDateRange({
      startDate: startDate.toISOString().split('T')[0],
      endDate: now.toISOString().split('T')[0]
    });
  };

  if (stats.loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载监控数据...</p>
        </div>
      </div>
    );
  }

  if (stats.error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
          <h2 className="text-xl font-bold text-red-600 mb-4">加载失败</h2>
          <p className="text-gray-600 mb-4">{stats.error}</p>
          <button
            onClick={loadDashboardData}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">SEO/GEO 监控仪表板</h1>
            <div className="flex space-x-2">
              {(['day', 'week', 'month', 'quarter'] as const).map(period => (
                <button
                  key={period}
                  onClick={() => handlePeriodChange(period)}
                  className={`px-4 py-2 rounded ${
                    selectedPeriod === period
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {period === 'day' ? '日' : period === 'week' ? '周' : period === 'month' ? '月' : '季度'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* 核心指标卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="自然流量"
            value={stats.metrics?.organicTraffic || 0}
            change={stats.metrics?.organicTrafficChange || 0}
            icon="📈"
          />
          <MetricCard
            title="平均排名"
            value={stats.metrics?.averagePosition || 0}
            change={stats.metrics?.positionChange || 0}
            inverse={true}
            icon="🎯"
          />
          <MetricCard
            title="可见度"
            value={`${((stats.metrics?.visibility || 0) * 100).toFixed(2)}%`}
            change={stats.metrics?.visibilityChange || 0}
            icon="👁️"
          />
          <MetricCard
            title="AI 引用"
            value={stats.metrics?.aiMentions || 0}
            change={stats.metrics?.aiMentionsChange || 0}
            icon="🤖"
          />
        </div>

        {/* 流量和排名趋势 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">流量趋势</h3>
            <TrafficChart metrics={stats.metrics} />
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">关键词排名分布</h3>
            <RankingDistribution metrics={stats.metrics} />
          </div>
        </div>

        {/* 关键词排名 */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Top 20 关键词</h3>
          <KeywordsTable keywords={stats.topKeywords} />
        </div>

        {/* AI 平台引用 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">AI 平台引用监控</h3>
          <AICitationsGrid citations={stats.aiCitations} />
        </div>
      </main>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: number | string;
  change: number;
  inverse?: boolean;
  icon: string;
}

function MetricCard({ title, value, change, inverse = false, icon }: MetricCardProps) {
  const isPositive = inverse ? change < 0 : change > 0;
  const isNegative = inverse ? change > 0 : change < 0;
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-2xl">{icon}</span>
        <span className={`text-sm font-medium ${
          isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-600'
        }`}>
          {change > 0 ? '↑' : change < 0 ? '↓' : '→'} {Math.abs(change).toFixed(2)}%
        </span>
      </div>
      <h3 className="text-gray-600 text-sm mb-2">{title}</h3>
      <p className="text-2xl font-bold text-gray-900">{typeof value === 'number' ? value.toLocaleString() : value}</p>
    </div>
  );
}

function TrafficChart({ metrics }: { metrics: SEOMetrics | null }) {
  // TODO: 使用图表库实现流量趋势图
  return (
    <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
      <p className="text-gray-500">流量趋势图（待实现）</p>
      {metrics && (
        <div className="ml-4">
          <p>自然流量：{metrics.organicTraffic.toLocaleString()}</p>
          <p>点击：{metrics.clicks.toLocaleString()}</p>
          <p>展示：{metrics.impressions.toLocaleString()}</p>
        </div>
      )}
    </div>
  );
}

function RankingDistribution({ metrics }: { metrics: SEOMetrics | null }) {
  if (!metrics) return null;
  
  return (
    <div className="space-y-4">
      <div>
        <div className="flex justify-between mb-1">
          <span className="text-sm text-gray-600">前 3 名</span>
          <span className="text-sm font-medium">{metrics.top3Keywords}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-green-500 h-2 rounded-full" 
            style={{ width: `${Math.min(100, (metrics.top3Keywords / 100) * 100)}%` }}
          ></div>
        </div>
      </div>
      
      <div>
        <div className="flex justify-between mb-1">
          <span className="text-sm text-gray-600">前 10 名</span>
          <span className="text-sm font-medium">{metrics.top10Keywords}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full" 
            style={{ width: `${Math.min(100, (metrics.top10Keywords / 100) * 100)}%` }}
          ></div>
        </div>
      </div>
      
      <div>
        <div className="flex justify-between mb-1">
          <span className="text-sm text-gray-600">前 100 名</span>
          <span className="text-sm font-medium">{metrics.top100Keywords}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-purple-500 h-2 rounded-full" 
            style={{ width: `${Math.min(100, (metrics.top100Keywords / 100) * 100)}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}

function KeywordsTable({ keywords }: { keywords: KeywordRanking[] }) {
  if (keywords.length === 0) {
    return <p className="text-gray-500 text-center py-8">暂无数据</p>;
  }
  
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">关键词</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">当前排名</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">变化</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">搜索量</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">难度</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">流量</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {keywords.map((keyword, index) => (
            <tr key={index}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {keyword.keyword}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {keyword.position}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <span className={keyword.position < keyword.previousPosition ? 'text-green-600' : 'text-red-600'}>
                  {keyword.previousPosition - keyword.position > 0 ? '+' : ''}{keyword.previousPosition - keyword.position}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {keyword.searchVolume.toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {keyword.difficulty}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {keyword.traffic.toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AICitationsGrid({ citations }: { citations: AICitation[] }) {
  if (citations.length === 0) {
    return <p className="text-gray-500 text-center py-8">暂无数据</p>;
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {citations.map((citation, index) => (
        <div key={index} className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold capitalize">{citation.platform}</h4>
            <span className={`px-2 py-1 rounded text-xs ${
              citation.sentiment === 'positive' ? 'bg-green-100 text-green-800' :
              citation.sentiment === 'negative' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {citation.sentiment === 'positive' ? '正面' :
               citation.sentiment === 'negative' ? '负面' : '中性'}
            </span>
          </div>
          <p className="text-2xl font-bold mb-2">{citation.mentionCount}</p>
          <p className="text-sm text-gray-600 mb-2">引用次数</p>
          {citation.topics.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {citation.topics.slice(0, 3).map((topic, i) => (
                <span key={i} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                  {topic}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
