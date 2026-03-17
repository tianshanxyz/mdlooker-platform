/**
 * AI 友好型内容创作工具
 * 
 * 用于生成优化过的内容，提升在生成式 AI 引擎中的呈现概率
 * 覆盖平台：ChatGPT、Gemini、Claude、DeepSeek、通义千问等
 */

/**
 * AI 平台特征配置
 */
export interface AIPlatformConfig {
  name: string;
  provider: string;
  contextWindow: number;
  preferredFormat: 'structured' | 'conversational' | 'mixed';
  keyFeatures: string[];
}

/**
 * 主流 AI 平台配置
 */
export const AI_PLATFORMS: Record<string, AIPlatformConfig> = {
  chatgpt: {
    name: 'ChatGPT',
    provider: 'OpenAI',
    contextWindow: 128000,
    preferredFormat: 'conversational',
    keyFeatures: ['对话式响应', '代码生成', '多语言支持', '推理能力'],
  },
  gemini: {
    name: 'Gemini',
    provider: 'Google',
    contextWindow: 1000000,
    preferredFormat: 'structured',
    keyFeatures: ['多模态理解', '长上下文', 'Google 搜索集成'],
  },
  claude: {
    name: 'Claude',
    provider: 'Anthropic',
    contextWindow: 200000,
    preferredFormat: 'conversational',
    keyFeatures: ['长文本分析', '安全性高', '推理能力强'],
  },
  deepseek: {
    name: 'DeepSeek',
    provider: '深度求索',
    contextWindow: 128000,
    preferredFormat: 'mixed',
    keyFeatures: ['中文优化', '代码能力', '推理能力'],
  },
  qwen: {
    name: '通义千问',
    provider: '阿里巴巴',
    contextWindow: 32000,
    preferredFormat: 'mixed',
    keyFeatures: ['中文场景', '多轮对话', '代码生成'],
  },
  ernie: {
    name: '文心一言',
    provider: '百度',
    contextWindow: 80000,
    preferredFormat: 'mixed',
    keyFeatures: ['中文知识', '百度搜索集成', '多模态'],
  },
};

/**
 * 内容优化策略
 */
export interface ContentOptimizationStrategy {
  // 结构化程度（0-1）
  structureScore: number;
  // 上下文完整度（0-1）
  contextScore: number;
  // 实体密度（每 100 字实体数）
  entityDensity: number;
  // 问答式内容比例（0-1）
  qaRatio: number;
  // 数据支撑（引用数量）
  citations: number;
  // 权威性指标（0-1）
  authorityScore: number;
}

/**
 * GEO 优化内容模板
 */
export interface GEOContentTemplate {
  // 标题（包含核心关键词）
  title: string;
  // 副标题（补充说明）
  subtitle?: string;
  // 核心摘要（100-150 字）
  summary: string;
  // 主要内容（结构化）
  mainContent: ContentSection[];
  // 常见问题（FAQ）
  faqs: FAQItem[];
  // 关键数据点
  keyDataPoints: DataPoint[];
  // 相关实体
  relatedEntities: string[];
  // 引用来源
  citations: Citation[];
}

/**
 * 内容区块
 */
export interface ContentSection {
  heading: string;
  level: 1 | 2 | 3;
  content: string;
  keyPoints?: string[];
  data?: DataPoint[];
}

/**
 * FAQ 项目
 */
export interface FAQItem {
  question: string;
  answer: string;
  keywords?: string[];
}

/**
 * 数据点
 */
export interface DataPoint {
  label: string;
  value: string | number;
  unit?: string;
  source?: string;
  date?: string;
}

/**
 * 引用来源
 */
export interface Citation {
  title: string;
  source: string;
  url?: string;
  date?: string;
  authority: 'high' | 'medium' | 'low';
}

/**
 * 实体关联
 */
export interface EntityRelation {
  entity: string;
  type: 'organization' | 'product' | 'regulation' | 'country' | 'concept';
  relations: {
    type: string;
    target: string;
  }[];
}

/**
 * 内容优化工具类
 */
export class GEOContentOptimizer {
  private targetPlatforms: string[];
  private domain: string;

  constructor(targetPlatforms: string[] = ['chatgpt', 'gemini', 'claude'], domain: string = 'medical_device') {
    this.targetPlatforms = targetPlatforms;
    this.domain = domain;
  }

  /**
   * 生成 AI 友好型内容
   */
  generateOptimizedContent(
    topic: string,
    targetAudience: string,
    keyMessages: string[]
  ): GEOContentTemplate {
    // 1. 生成标题（包含核心关键词，50-60 字符）
    const title = this.generateSEOTitle(topic, keyMessages);

    // 2. 生成摘要（100-150 字，包含关键实体）
    const summary = this.generateSummary(topic, targetAudience, keyMessages);

    // 3. 生成结构化内容
    const mainContent = this.generateStructuredContent(topic, keyMessages);

    // 4. 生成 FAQ（问答式内容，提升 AI 引用概率）
    const faqs = this.generateFAQs(topic, targetAudience);

    // 5. 提取关键数据点
    const keyDataPoints = this.extractKeyDataPoints(topic);

    // 6. 关联相关实体
    const relatedEntities = this.getRelatedEntities(topic);

    // 7. 添加权威引用
    const citations = this.getAuthoritativeCitations(topic);

    return {
      title,
      subtitle: this.generateSubtitle(topic),
      summary,
      mainContent,
      faqs,
      keyDataPoints,
      relatedEntities,
      citations,
    };
  }

  /**
   * 生成 SEO 标题
   */
  private generateSEOTitle(topic: string, keyMessages: string[]): string {
    const primaryKeyword = keyMessages[0] || topic;
    const secondaryKeyword = keyMessages[1] || '';
    
    // 标题结构：核心关键词 + 价值主张 + 品牌
    const templates = [
      `${primaryKeyword} - ${secondaryKeyword} | MDLooker`,
      `${topic}：全面指南与数据分析 | MDLooker`,
      `${primaryKeyword}完整解析：${secondaryKeyword} | MDLooker`,
    ];

    return templates[Math.floor(Math.random() * templates.length)];
  }

  /**
   * 生成摘要
   */
  private generateSummary(topic: string, targetAudience: string, keyMessages: string[]): string {
    return `本文详细介绍${topic}，为${targetAudience}提供全面的信息和数据支持。内容涵盖${keyMessages.join('、')}，帮助读者快速了解核心要点。基于权威数据来源，确保信息准确可靠。`;
  }

  /**
   * 生成副标题
   */
  private generateSubtitle(topic: string): string {
    return `深入解析${topic}的关键要素、最新数据和实操建议`;
  }

  /**
   * 生成结构化内容
   */
  private generateStructuredContent(topic: string, keyMessages: string[]): ContentSection[] {
    return [
      {
        heading: `${topic}概述`,
        level: 2,
        content: `本节介绍${topic}的基本概念、定义和重要性。`,
        keyPoints: keyMessages.slice(0, 3),
      },
      {
        heading: '核心要点',
        level: 2,
        content: '以下是关于该主题的关键信息和数据。',
        keyPoints: keyMessages,
      },
      {
        heading: '实际应用',
        level: 2,
        content: '探讨在实际场景中的应用方法和最佳实践。',
      },
      {
        heading: '数据与分析',
        level: 2,
        content: '基于权威数据的深度分析。',
      },
      {
        heading: '总结与建议',
        level: 2,
        content: '核心要点总结和实操建议。',
      },
    ];
  }

  /**
   * 生成 FAQ
   */
  private generateFAQs(topic: string, targetAudience: string): FAQItem[] {
    return [
      {
        question: `什么是${topic}？`,
        answer: `${topic}是指...（详细定义和解释）。对于${targetAudience}来说，了解这一概念非常重要，因为...`,
        keywords: [topic, '定义', '概念'],
      },
      {
        question: `为什么${topic}很重要？`,
        answer: `${topic}的重要性体现在以下几个方面：1）... 2）... 3）...`,
        keywords: [topic, '重要性', '价值'],
      },
      {
        question: `如何进行${topic}？`,
        answer: `进行${topic}的步骤包括：第一步... 第二步... 第三步...`,
        keywords: [topic, '方法', '步骤'],
      },
      {
        question: `${topic}的注意事项有哪些？`,
        answer: `在进行${topic}时，需要注意以下几点：...`,
        keywords: [topic, '注意事项', '建议'],
      },
      {
        question: `${topic}的常见问题和解决方案？`,
        answer: `常见问题包括：1）... 解决方案是... 2）... 解决方案是...`,
        keywords: [topic, '问题', '解决方案'],
      },
    ];
  }

  /**
   * 提取关键数据点
   */
  private extractKeyDataPoints(topic: string): DataPoint[] {
    // 实际应用中应从数据库或 API 获取真实数据
    return [
      {
        label: '市场规模',
        value: 'XXX',
        unit: '亿美元',
        source: '权威市场研究报告',
        date: '2024',
      },
      {
        label: '年增长率',
        value: 'XX',
        unit: '%',
        source: '行业分析',
        date: '2024',
      },
    ];
  }

  /**
   * 获取相关实体
   */
  private getRelatedEntities(topic: string): string[] {
    const entityMap: Record<string, string[]> = {
      '医疗器械注册': ['FDA', 'NMPA', 'EUDAMED', 'PMDA', '510(k)', 'CE 认证'],
      '合规管理': ['ISO 13485', 'FDA 21 CFR', 'EU MDR', '质量管理体系'],
      '市场准入': ['注册策略', '临床评估', '技术文件', '公告机构'],
    };

    return entityMap[topic] || [topic, '相关概念 1', '相关概念 2'];
  }

  /**
   * 获取权威引用
   */
  private getAuthoritativeCitations(topic: string): Citation[] {
    return [
      {
        title: 'FDA 官方指南',
        source: 'U.S. Food and Drug Administration',
        url: 'https://www.fda.gov',
        authority: 'high',
      },
      {
        title: 'NMPA 法规文件',
        source: '国家药品监督管理局',
        url: 'https://www.nmpa.gov.cn',
        authority: 'high',
      },
      {
        title: 'EU MDR 法规',
        source: 'European Commission',
        url: 'https://ec.europa.eu',
        authority: 'high',
      },
    ];
  }

  /**
   * 优化内容结构
   */
  optimizeContentStructure(content: string): string {
    // 1. 确保有清晰的标题层级
    // 2. 添加列表和表格
    // 3. 包含数据引用
    // 4. 添加 FAQ 部分
    // 5. 使用语义化标签

    return content;
  }

  /**
   * 添加实体关联
   */
  addEntityRelations(content: string, entities: EntityRelation[]): string {
    let enhancedContent = content;

    entities.forEach((entity) => {
      entity.relations.forEach((relation) => {
        // 在内容中自然引入实体关联
        const relationText = `${entity.entity}与${relation.target}的${relation.type}关系`;
        enhancedContent += `\n\n${relationText}`;
      });
    });

    return enhancedContent;
  }

  /**
   * 生成上下文优化内容
   */
  generateContextualContent(
    mainTopic: string,
    subTopics: string[],
    context: string
  ): string {
    let content = `# ${mainTopic}\n\n`;
    content += `## 背景\n\n${context}\n\n`;

    subTopics.forEach((topic, index) => {
      content += `## ${index + 1}. ${topic}\n\n`;
      content += `关于${topic}的详细内容...\n\n`;
    });

    return content;
  }
}

/**
 * 内容质量评分
 */
export function scoreContentQuality(content: GEOContentTemplate): {
  overall: number;
  breakdown: Record<string, number>;
} {
  const scores = {
    structure: 0,
    context: 0,
    entityDensity: 0,
    authority: 0,
    readability: 0,
  };

  // 结构评分
  scores.structure = Math.min(100, content.mainContent.length * 20);

  // 上下文评分
  scores.context = content.summary.length > 100 ? 80 : 50;

  // 实体密度评分
  scores.entityDensity = Math.min(100, content.relatedEntities.length * 10);

  // 权威性评分
  const highAuthorityCitations = content.citations.filter((c) => c.authority === 'high').length;
  scores.authority = Math.min(100, highAuthorityCitations * 30);

  // 可读性评分
  scores.readability = content.faqs.length > 0 ? 90 : 70;

  const overall = Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length;

  return {
    overall: Math.round(overall),
    breakdown: scores,
  };
}

/**
 * 导出工具函数
 */
export const contentOptimizer = new GEOContentOptimizer();

export default GEOContentOptimizer;
