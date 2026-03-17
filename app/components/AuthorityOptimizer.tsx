/**
 * 权威性与可信度优化组件
 * 
 * 实施 E-E-A-T（经验、专业性、权威性、可信度）原则
 * 提升内容在 AI 引擎中的权重
 */

'use client';

import { FC } from 'react';
import { Shield, Award, BookOpen, Users, TrendingUp, Calendar, FileText } from 'lucide-react';

/**
 * 权威性指标
 */
export interface AuthorityMetrics {
  // 数据来源权威性
  dataAuthority: 'high' | 'medium' | 'low';
  // 内容专业性
  expertise: 'expert' | 'professional' | 'general';
  // 更新时效性
  timeliness: 'recent' | 'current' | 'outdated';
  // 引用数量
  citations: number;
  // 专家审核
  expertReviewed: boolean;
}

/**
 * 引用来源
 */
export interface CitationSource {
  title: string;
  source: string;
  url?: string;
  date?: string;
  authority: 'high' | 'medium' | 'low';
  type: 'government' | 'academic' | 'industry' | 'news';
}

/**
 * 专家信息
 */
export interface ExpertInfo {
  name: string;
  title: string;
  credentials: string[];
  affiliation?: string;
  bio?: string;
}

/**
 * 权威性展示组件
 */
export const AuthorityBadge: FC<{ metrics: AuthorityMetrics }> = ({ metrics }) => {
  return (
    <div className="flex flex-wrap gap-3">
      {metrics.dataAuthority === 'high' && (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
          <Shield className="w-3 h-3" />
          权威数据
        </span>
      )}
      
      {metrics.expertise === 'expert' && (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
          <Award className="w-3 h-3" />
          专家级内容
        </span>
      )}
      
      {metrics.timeliness === 'recent' && (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
          <Calendar className="w-3 h-3" />
          最新更新
        </span>
      )}
      
      {metrics.expertReviewed && (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
          <Users className="w-3 h-3" />
          专家审核
        </span>
      )}
    </div>
  );
};

/**
 * 引用来源列表组件
 */
export const CitationList: FC<{ citations: CitationSource[] }> = ({ citations }) => {
  if (!citations || citations.length === 0) {
    return null;
  }

  return (
    <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
      <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-[#339999]" />
        数据来源与引用
      </h3>
      
      <ul className="space-y-3">
        {citations.map((citation, index) => (
          <li key={index} className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-[#339999]/10 rounded-full flex items-center justify-center text-[#339999] text-xs font-bold">
              {index + 1}
            </span>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-900">
                {citation.title}
                {citation.authority === 'high' && (
                  <span className="ml-2 px-1.5 py-0.5 bg-green-100 text-green-700 text-xs rounded">
                    权威
                  </span>
                )}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {citation.source}
                {citation.date && ` · ${citation.date}`}
              </p>
              {citation.url && (
                <a
                  href={citation.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#339999] hover:underline mt-1 inline-block"
                >
                  查看原文 →
                </a>
              )}
            </div>
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              citation.type === 'government' 
                ? 'bg-blue-100 text-blue-700'
                : citation.type === 'academic'
                ? 'bg-purple-100 text-purple-700'
                : citation.type === 'industry'
                ? 'bg-slate-100 text-slate-700'
                : 'bg-gray-100 text-gray-700'
            }`}>
              {citation.type === 'government' ? '官方' :
               citation.type === 'academic' ? '学术' :
               citation.type === 'industry' ? '行业' : '媒体'}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

/**
 * 专家信息展示组件
 */
export const ExpertReview: FC<{ expert: ExpertInfo }> = ({ expert }) => {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold">
          {expert.name.charAt(0)}
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-bold text-slate-900">
            {expert.name}
            <span className="ml-2 text-sm font-normal text-slate-600">
              {expert.title}
            </span>
          </h3>
          
          {expert.affiliation && (
            <p className="text-sm text-slate-600 mt-1">
              {expert.affiliation}
            </p>
          )}
          
          {expert.credentials.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {expert.credentials.map((cred, index) => (
                <span
                  key={index}
                  className="px-2.5 py-1 bg-white text-blue-700 text-xs font-medium rounded-full border border-blue-200"
                >
                  {cred}
                </span>
              ))}
            </div>
          )}
          
          {expert.bio && (
            <p className="text-sm text-slate-600 mt-3 leading-relaxed">
              {expert.bio}
            </p>
          )}
          
          <div className="flex items-center gap-2 mt-4 text-xs text-slate-500">
            <Shield className="w-4 h-4" />
            <span>本文由专家审核，确保内容准确性和专业性</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * 数据更新提示组件
 */
export const DataFreshness: FC<{ 
  lastUpdated: string;
  updateFrequency?: string;
  nextUpdate?: string;
}> = ({ lastUpdated, updateFrequency, nextUpdate }) => {
  const isRecent = new Date(lastUpdated) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  
  return (
    <div className={`flex items-center gap-3 p-4 rounded-lg ${
      isRecent ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'
    }`}>
      <Calendar className={`w-5 h-5 ${isRecent ? 'text-green-600' : 'text-amber-600'}`} />
      
      <div className="flex-1">
        <p className={`text-sm font-medium ${isRecent ? 'text-green-900' : 'text-amber-900'}`}>
          数据更新时间：{new Date(lastUpdated).toLocaleDateString('zh-CN')}
        </p>
        {updateFrequency && (
          <p className={`text-xs ${isRecent ? 'text-green-700' : 'text-amber-700'}`}>
            更新频率：{updateFrequency}
            {nextUpdate && ` · 下次更新：${nextUpdate}`}
          </p>
        )}
      </div>
      
      {isRecent && (
        <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
          最新数据
        </span>
      )}
    </div>
  );
};

/**
 * 统计指标展示组件
 */
export const StatsMetrics: FC<{ 
  stats: Array<{ label: string; value: string | number; trend?: string }>;
}> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white rounded-xl p-4 border border-slate-200">
          <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
          <p className="text-sm text-slate-600 mt-1">{stat.label}</p>
          {stat.trend && (
            <div className="flex items-center gap-1 mt-2 text-xs text-green-600">
              <TrendingUp className="w-3 h-3" />
              <span>{stat.trend}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

/**
 * 内容可信度评分
 */
export function calculateCredibilityScore(metrics: AuthorityMetrics): number {
  let score = 0;
  
  // 数据权威性（30 分）
  if (metrics.dataAuthority === 'high') score += 30;
  else if (metrics.dataAuthority === 'medium') score += 20;
  else score += 10;
  
  // 专业性（25 分）
  if (metrics.expertise === 'expert') score += 25;
  else if (metrics.expertise === 'professional') score += 18;
  else score += 10;
  
  // 时效性（20 分）
  if (metrics.timeliness === 'recent') score += 20;
  else if (metrics.timeliness === 'current') score += 15;
  else score += 5;
  
  // 引用数量（15 分）
  score += Math.min(15, metrics.citations * 3);
  
  // 专家审核（10 分）
  if (metrics.expertReviewed) score += 10;
  
  return score;
}

/**
 * 生成引用来源列表（示例）
 */
export function generateSampleCitations(): CitationSource[] {
  return [
    {
      title: 'FDA 医疗器械注册指南',
      source: 'U.S. Food and Drug Administration',
      url: 'https://www.fda.gov/medical-devices',
      date: '2024-01',
      authority: 'high',
      type: 'government',
    },
    {
      title: '医疗器械监督管理条例',
      source: '国家药品监督管理局',
      url: 'https://www.nmpa.gov.cn',
      date: '2023-12',
      authority: 'high',
      type: 'government',
    },
    {
      title: 'EU MDR 法规全文',
      source: 'European Commission',
      url: 'https://ec.europa.eu/health/md_sector/overview_en',
      date: '2024-01',
      authority: 'high',
      type: 'government',
    },
    {
      title: '全球医疗器械市场分析报告',
      source: 'Evaluate MedTech',
      date: '2023-Q4',
      authority: 'medium',
      type: 'industry',
    },
  ];
}

/**
 * 生成专家信息（示例）
 */
export function generateSampleExpert(): ExpertInfo {
  return {
    name: '张医生',
    title: '医疗器械法规专家',
    credentials: ['PhD', 'RAC', 'ISO 13485 Lead Auditor'],
    affiliation: '某知名医疗器械咨询公司 首席顾问',
    bio: '拥有 15 年医疗器械法规经验，曾帮助 100+ 企业完成 FDA、NMPA、CE 认证。',
  };
}

export default {
  AuthorityBadge,
  CitationList,
  ExpertReview,
  DataFreshness,
  StatsMetrics,
  calculateCredibilityScore,
  generateSampleCitations,
  generateSampleExpert,
};
