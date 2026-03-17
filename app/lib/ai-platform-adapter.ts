/**
 * AI 平台适配优化
 * 
 * 针对不同 AI 平台的特征进行内容优化
 * 提升在各平台的引用概率和响应质量
 */

/**
 * AI 平台特征
 */
export interface AIPlatformFeatures {
  // 平台名称
  name: string;
  // 提供商
  provider: string;
  // 上下文窗口大小（tokens）
  contextWindow: number;
  // 知识截止日期
  knowledgeCutoff?: string;
  // 优化策略
  optimizationStrategies: OptimizationStrategy[];
  // 响应偏好
  responsePreferences: ResponsePreferences;
}

/**
 * 优化策略
 */
export interface OptimizationStrategy {
  // 策略名称
  name: string;
  // 优先级（1-5）
  priority: 1 | 2 | 3 | 4 | 5;
  // 描述
  description: string;
  // 实施方法
  implementation: string[];
}

/**
 * 响应偏好
 */
export interface ResponsePreferences {
  // 内容长度
  contentLength: 'short' | 'medium' | 'long';
  // 结构化程度
  structureLevel: 'low' | 'medium' | 'high';
  // 技术深度
  technicalDepth: 'basic' | 'intermediate' | 'advanced';
  // 语气风格
  tone: 'formal' | 'professional' | 'conversational';
}

/**
 * 主流 AI 平台配置
 */
export const AI_PLATFORM_CONFIGS: Record<string, AIPlatformFeatures> = {
  /**
   * ChatGPT (GPT-4)
   */
  chatgpt: {
    name: 'ChatGPT',
    provider: 'OpenAI',
    contextWindow: 128000,
    knowledgeCutoff: '2024-04',
    optimizationStrategies: [
      {
        name: '结构化内容',
        priority: 5,
        description: '使用清晰的标题层级和列表',
        implementation: [
          '使用 Markdown 格式',
          '添加 H1-H3 标题',
          '使用编号和项目列表',
          '包含表格和数据',
        ],
      },
      {
        name: '上下文完整',
        priority: 4,
        description: '提供充分的背景信息',
        implementation: [
          '定义关键术语',
          '提供相关背景',
          '包含实例说明',
          '添加总结概括',
        ],
      },
      {
        name: '权威引用',
        priority: 5,
        description: '引用权威来源',
        implementation: [
          '使用官方数据',
          '引用法规文件',
          '标注数据来源',
          '提供 URL 链接',
        ],
      },
    ],
    responsePreferences: {
      contentLength: 'medium',
      structureLevel: 'high',
      technicalDepth: 'intermediate',
      tone: 'professional',
    },
  },

  /**
   * Google Gemini
   */
  gemini: {
    name: 'Gemini',
    provider: 'Google',
    contextWindow: 1000000,
    knowledgeCutoff: '2024-06',
    optimizationStrategies: [
      {
        name: '多模态内容',
        priority: 4,
        description: '结合文本、数据、图表',
        implementation: [
          '提供结构化数据',
          '使用表格展示',
          '包含图表说明',
          '添加图片描述',
        ],
      },
      {
        name: 'Google 搜索集成',
        priority: 5,
        description: '优化搜索引擎友好度',
        implementation: [
          '使用常见关键词',
          '包含最新数据',
          '引用权威网站',
          '优化元数据',
        ],
      },
      {
        name: '长上下文利用',
        priority: 3,
        description: '充分利用大上下文窗口',
        implementation: [
          '提供详细背景',
          '包含完整数据',
          '添加相关资源',
          '扩展阅读链接',
        ],
      },
    ],
    responsePreferences: {
      contentLength: 'long',
      structureLevel: 'high',
      technicalDepth: 'advanced',
      tone: 'professional',
    },
  },

  /**
   * Anthropic Claude
   */
  claude: {
    name: 'Claude',
    provider: 'Anthropic',
    contextWindow: 200000,
    knowledgeCutoff: '2024-04',
    optimizationStrategies: [
      {
        name: '逻辑清晰',
        priority: 5,
        description: '强调逻辑和推理',
        implementation: [
          '使用因果关联',
          '提供推理过程',
          '包含对比分析',
          '添加结论总结',
        ],
      },
      {
        name: '安全性优先',
        priority: 5,
        description: '确保内容安全合规',
        implementation: [
          '避免绝对化表述',
          '添加免责声明',
          '使用客观语气',
          '标注不确定性',
        ],
      },
      {
        name: '长文本分析',
        priority: 4,
        description: '支持深度内容分析',
        implementation: [
          '提供完整文档',
          '包含详细数据',
          '添加执行摘要',
          '结构化呈现',
        ],
      },
    ],
    responsePreferences: {
      contentLength: 'long',
      structureLevel: 'high',
      technicalDepth: 'advanced',
      tone: 'formal',
    },
  },

  /**
   * DeepSeek (深度求索)
   */
  deepseek: {
    name: 'DeepSeek',
    provider: '深度求索',
    contextWindow: 128000,
    optimizationStrategies: [
      {
        name: '中文优化',
        priority: 5,
        description: '针对中文场景优化',
        implementation: [
          '使用标准中文',
          '避免翻译腔',
          '使用行业术语',
          '包含本土案例',
        ],
      },
      {
        name: '代码能力',
        priority: 3,
        description: '利用代码解释能力',
        implementation: [
          '提供数据代码',
          '包含计算公式',
          '添加脚本示例',
          '使用伪代码',
        ],
      },
      {
        name: '推理能力',
        priority: 4,
        description: '强调逻辑推理',
        implementation: [
          '提供推理步骤',
          '包含数据分析',
          '添加逻辑链',
          '使用论证结构',
        ],
      },
    ],
    responsePreferences: {
      contentLength: 'medium',
      structureLevel: 'medium',
      technicalDepth: 'intermediate',
      tone: 'professional',
    },
  },

  /**
   * 通义千问 (Qwen)
   */
  qwen: {
    name: '通义千问',
    provider: '阿里巴巴',
    contextWindow: 32000,
    optimizationStrategies: [
      {
        name: '中文知识',
        priority: 5,
        description: '利用中文知识库',
        implementation: [
          '引用中文文献',
          '使用中国案例',
          '包含本土数据',
          '参考中国法规',
        ],
      },
      {
        name: '多轮对话',
        priority: 4,
        description: '支持多轮对话优化',
        implementation: [
          '提供上下文',
          '包含追问提示',
          '添加相关话题',
          '结构化问答',
        ],
      },
      {
        name: '实用导向',
        priority: 4,
        description: '强调实用性',
        implementation: [
          '提供实操步骤',
          '包含最佳实践',
          '添加工具推荐',
          '给出具体建议',
        ],
      },
    ],
    responsePreferences: {
      contentLength: 'medium',
      structureLevel: 'medium',
      technicalDepth: 'intermediate',
      tone: 'conversational',
    },
  },

  /**
   * 文心一言 (ERNIE Bot)
   */
  ernie: {
    name: '文心一言',
    provider: '百度',
    contextWindow: 80000,
    optimizationStrategies: [
      {
        name: '百度搜索集成',
        priority: 5,
        description: '优化百度搜索友好度',
        implementation: [
          '使用百度指数关键词',
          '引用百度百科',
          '包含中文来源',
          '优化中文 SEO',
        ],
      },
      {
        name: '中文知识图谱',
        priority: 4,
        description: '利用中文知识图谱',
        implementation: [
          '使用标准术语',
          '包含实体关联',
          '添加知识链接',
          '引用权威百科',
        ],
      },
      {
        name: '多模态理解',
        priority: 3,
        description: '支持多模态内容',
        implementation: [
          '提供图文结合',
          '包含数据可视化',
          '添加图表说明',
          '使用表格数据',
        ],
      },
    ],
    responsePreferences: {
      contentLength: 'medium',
      structureLevel: 'medium',
      technicalDepth: 'intermediate',
      tone: 'professional',
    },
  },
};

/**
 * GEO 优化建议生成器
 */
export class GEOOptimizer {
  private targetPlatforms: string[];

  constructor(platforms: string[] = ['chatgpt', 'gemini', 'claude']) {
    this.targetPlatforms = platforms;
  }

  /**
   * 生成优化建议
   */
  generateOptimizationSuggestions(content: string): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = [];

    this.targetPlatforms.forEach((platformId) => {
      const config = AI_PLATFORM_CONFIGS[platformId];
      if (!config) return;

      config.optimizationStrategies.forEach((strategy) => {
        const suggestion = this.checkStrategy(content, strategy, platformId);
        if (suggestion) {
          suggestions.push(suggestion);
        }
      });
    });

    return suggestions.sort((a, b) => b.priority - a.priority);
  }

  /**
   * 检查策略实施情况
   */
  private checkStrategy(
    content: string,
    strategy: OptimizationStrategy,
    platform: string
  ): OptimizationSuggestion | null {
    // 简单实现，实际应使用 NLP 分析
    const implemented = strategy.implementation.some((impl) =>
      content.includes(impl)
    );

    if (implemented) {
      return null; // 已实施，无需建议
    }

    return {
      platform,
      ...strategy,
      suggestion: `建议实施"${strategy.name}"策略：${strategy.implementation[0]}`,
    };
  }

  /**
   * 计算平台适配度评分
   */
  calculatePlatformScore(content: string, platformId: string): number {
    const config = AI_PLATFORM_CONFIGS[platformId];
    if (!config) return 0;

    let score = 0;
    let maxScore = 0;

    config.optimizationStrategies.forEach((strategy) => {
      const weight = strategy.priority * 10;
      maxScore += weight;

      const implemented = strategy.implementation.filter((impl) =>
        content.includes(impl)
      ).length;

      score += (implemented / strategy.implementation.length) * weight;
    });

    return Math.round((score / maxScore) * 100);
  }

  /**
   * 生成综合适配度报告
   */
  generateCompatibilityReport(content: string): PlatformCompatibilityReport {
    const report: PlatformCompatibilityReport = {
      platforms: {},
      averageScore: 0,
      recommendations: [],
    };

    let totalScore = 0;

    this.targetPlatforms.forEach((platformId) => {
      const score = this.calculatePlatformScore(content, platformId);
      report.platforms[platformId] = score;
      totalScore += score;
    });

    report.averageScore = Math.round(totalScore / this.targetPlatforms.length);
    report.recommendations = this.generateOptimizationSuggestions(content);

    return report;
  }
}

/**
 * 优化建议
 */
export interface OptimizationSuggestion {
  platform: string;
  name: string;
  priority: 1 | 2 | 3 | 4 | 5;
  description: string;
  implementation: string[];
  suggestion: string;
}

/**
 * 平台适配度报告
 */
export interface PlatformCompatibilityReport {
  platforms: Record<string, number>;
  averageScore: number;
  recommendations: OptimizationSuggestion[];
}

/**
 * 导出工具函数
 */
export const geoOptimizer = new GEOOptimizer();

export default {
  AI_PLATFORM_CONFIGS,
  GEOOptimizer,
  geoOptimizer,
};
