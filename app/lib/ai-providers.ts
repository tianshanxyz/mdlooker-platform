// AI Providers Configuration
// 支持多种AI服务提供商：京医千询、百度翻译、Octoparse、BioBERT等

// 京医千询配置
interface JingyiQianxunConfig {
  apiKey: string;
  apiEndpoint: string;
  model: string;
}

// 百度翻译配置
interface BaiduTranslateConfig {
  appId: string;
  secretKey: string;
  apiEndpoint: string;
}

// Octoparse配置
interface OctoparseConfig {
  apiKey: string;
  apiEndpoint: string;
}

// BioBERT配置（医疗领域NLP）
interface BioBERTConfig {
  apiEndpoint: string;
  modelPath?: string;
}

// AI解析结果
export interface AIParseResult {
  entityType: 'regulation' | 'company' | 'product' | 'warning_letter' | 'recall';
  title: string;
  content: string;
  metadata: Record<string, any>;
  effectiveDate?: string;
  expirationDate?: string;
  confidence: number;
  rawResponse?: any;
}

// 翻译结果
export interface TranslationResult {
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  confidence: number;
}

/**
 * 京医千询 AI 服务
 * 用于法规解析、实体识别、智能问答
 */
export class JingyiQianxunProvider {
  private config: JingyiQianxunConfig;

  constructor(config?: Partial<JingyiQianxunConfig>) {
    this.config = {
      apiKey: process.env.JINGYI_API_KEY || '',
      apiEndpoint: process.env.JINGYI_API_ENDPOINT || 'https://api.jingyi.com/v1',
      model: process.env.JINGYI_MODEL || 'jingyi-medical-v1',
      ...config,
    };
  }

  /**
   * 解析法规文本
   */
  async parseRegulatoryText(text: string, source: string): Promise<AIParseResult> {
    if (!this.config.apiKey) {
      console.warn('[JingyiQianxun] API key not configured');
      return this.fallbackParse(text, source);
    }

    try {
      const response = await fetch(`${this.config.apiEndpoint}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            {
              role: 'system',
              content: `你是医疗器械法规专家。请从以下${source}的法规文本中提取结构化信息。
              返回JSON格式：{
                "entityType": "regulation|company|product|warning_letter|recall",
                "title": "标题",
                "content": "摘要内容",
                "metadata": { "key": "value" },
                "effectiveDate": "生效日期",
                "expirationDate": "失效日期"
              }`
            },
            {
              role: 'user',
              content: text,
            }
          ],
          temperature: 0.1,
        }),
      });

      if (!response.ok) {
        throw new Error(`Jingyi API error: ${response.status}`);
      }

      const result = await response.json();
      const parsed = JSON.parse(result.choices[0].message.content);

      return {
        ...parsed,
        confidence: 0.9,
        rawResponse: result,
      };
    } catch (error) {
      console.error('[JingyiQianxun] Parse error:', error);
      return this.fallbackParse(text, source);
    }
  }

  /**
   * 医疗术语标准化
   */
  async normalizeMedicalTerm(term: string): Promise<string> {
    if (!this.config.apiKey) return term;

    try {
      const response = await fetch(`${this.config.apiEndpoint}/medical/normalize`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ term }),
      });

      if (!response.ok) return term;

      const result = await response.json();
      return result.normalizedTerm || term;
    } catch (error) {
      return term;
    }
  }

  /**
   * 备用解析（无AI时）
   */
  private fallbackParse(text: string, source: string): AIParseResult {
    return {
      entityType: 'regulation',
      title: text.slice(0, 100),
      content: text,
      metadata: { source, rawText: text },
      confidence: 0.5,
    };
  }
}

/**
 * 百度翻译服务
 * 用于中英双语术语翻译
 */
export class BaiduTranslateProvider {
  private config: BaiduTranslateConfig;

  constructor(config?: Partial<BaiduTranslateConfig>) {
    this.config = {
      appId: process.env.BAIDU_TRANSLATE_APP_ID || '',
      secretKey: process.env.BAIDU_TRANSLATE_SECRET_KEY || '',
      apiEndpoint: 'https://fanyi-api.baidu.com/api/trans/vip/translate',
      ...config,
    };
  }

  /**
   * 翻译文本
   */
  async translate(text: string, from: string, to: string): Promise<TranslationResult> {
    if (!this.config.appId || !this.config.secretKey) {
      console.warn('[BaiduTranslate] Not configured');
      return {
        translatedText: text,
        sourceLanguage: from,
        targetLanguage: to,
        confidence: 0,
      };
    }

    try {
      const salt = Date.now().toString();
      const sign = this.generateSign(text, salt);

      const params = new URLSearchParams({
        q: text,
        from,
        to,
        appid: this.config.appId,
        salt,
        sign,
      });

      const response = await fetch(`${this.config.apiEndpoint}?${params}`);
      const result = await response.json();

      if (result.error_code) {
        throw new Error(`Baidu Translate error: ${result.error_msg}`);
      }

      const translatedText = result.trans_result
        .map((r: any) => r.dst)
        .join('\n');

      return {
        translatedText,
        sourceLanguage: from,
        targetLanguage: to,
        confidence: 0.85,
      };
    } catch (error) {
      console.error('[BaiduTranslate] Error:', error);
      return {
        translatedText: text,
        sourceLanguage: from,
        targetLanguage: to,
        confidence: 0,
      };
    }
  }

  /**
   * 批量翻译术语
   */
  async translateTerms(terms: string[], from: string, to: string): Promise<Map<string, string>> {
    const results = new Map<string, string>();

    for (const term of terms) {
      const result = await this.translate(term, from, to);
      results.set(term, result.translatedText);
    }

    return results;
  }

  /**
   * 生成签名
   */
  private generateSign(text: string, salt: string): string {
    const crypto = require('crypto');
    const str = this.config.appId + text + salt + this.config.secretKey;
    return crypto.createHash('md5').update(str).digest('hex');
  }
}

/**
 * Octoparse 爬虫服务
 * 用于可视化数据爬取
 */
export class OctoparseProvider {
  private config: OctoparseConfig;

  constructor(config?: Partial<OctoparseConfig>) {
    this.config = {
      apiKey: process.env.OCTOPARSE_API_KEY || '',
      apiEndpoint: 'https://dataapi.octoparse.com',
      ...config,
    };
  }

  /**
   * 获取任务列表
   */
  async getTasks(): Promise<any[]> {
    if (!this.config.apiKey) {
      console.warn('[Octoparse] API key not configured');
      return [];
    }

    try {
      const response = await fetch(`${this.config.apiEndpoint}/api/tasks`, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Octoparse API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('[Octoparse] Error:', error);
      return [];
    }
  }

  /**
   * 启动爬取任务
   */
  async startTask(taskId: string): Promise<boolean> {
    if (!this.config.apiKey) return false;

    try {
      const response = await fetch(`${this.config.apiEndpoint}/api/tasks/${taskId}/start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      return response.ok;
    } catch (error) {
      console.error('[Octoparse] Start task error:', error);
      return false;
    }
  }

  /**
   * 获取爬取结果
   */
  async getTaskData(taskId: string): Promise<any[]> {
    if (!this.config.apiKey) return [];

    try {
      const response = await fetch(`${this.config.apiEndpoint}/api/tasks/${taskId}/data`, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
      });

      if (!response.ok) return [];

      return await response.json();
    } catch (error) {
      console.error('[Octoparse] Get data error:', error);
      return [];
    }
  }
}

/**
 * BioBERT 医疗NLP服务
 * 用于医疗实体识别和关系抽取
 */
export class BioBERTProvider {
  private config: BioBERTConfig;

  constructor(config?: Partial<BioBERTConfig>) {
    this.config = {
      apiEndpoint: process.env.BIOBERT_API_ENDPOINT || 'http://localhost:8000',
      modelPath: process.env.BIOBERT_MODEL_PATH,
      ...config,
    };
  }

  /**
   * 识别医疗实体
   */
  async extractEntities(text: string): Promise<Array<{ entity: string; type: string; confidence: number }>> {
    try {
      const response = await fetch(`${this.config.apiEndpoint}/extract_entities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error(`BioBERT API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('[BioBERT] Extract entities error:', error);
      return [];
    }
  }

  /**
   * 分类法规文本
   */
  async classifyRegulation(text: string): Promise<{ category: string; confidence: number }> {
    try {
      const response = await fetch(`${this.config.apiEndpoint}/classify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error(`BioBERT API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('[BioBERT] Classify error:', error);
      return { category: 'unknown', confidence: 0 };
    }
  }

  /**
   * 提取法规关系
   */
  async extractRelations(text: string): Promise<Array<{ subject: string; predicate: string; object: string }>> {
    try {
      const response = await fetch(`${this.config.apiEndpoint}/extract_relations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error(`BioBERT API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('[BioBERT] Extract relations error:', error);
      return [];
    }
  }
}

/**
 * AI服务管理器
 * 统一管理所有AI服务
 */
export class AIProviderManager {
  private jingyi: JingyiQianxunProvider;
  private baiduTranslate: BaiduTranslateProvider;
  private octoparse: OctoparseProvider;
  private biobert: BioBERTProvider;

  constructor() {
    this.jingyi = new JingyiQianxunProvider();
    this.baiduTranslate = new BaiduTranslateProvider();
    this.octoparse = new OctoparseProvider();
    this.biobert = new BioBERTProvider();
  }

  /**
   * 获取京医千询实例
   */
  getJingyiQianxun(): JingyiQianxunProvider {
    return this.jingyi;
  }

  /**
   * 获取百度翻译实例
   */
  getBaiduTranslate(): BaiduTranslateProvider {
    return this.baiduTranslate;
  }

  /**
   * 获取Octoparse实例
   */
  getOctoparse(): OctoparseProvider {
    return this.octoparse;
  }

  /**
   * 获取BioBERT实例
   */
  getBioBERT(): BioBERTProvider {
    return this.biobert;
  }

  /**
   * 智能解析法规文本（使用最佳可用服务）
   */
  async parseRegulatoryText(text: string, source: string): Promise<AIParseResult> {
    // 优先使用京医千询
    const result = await this.jingyi.parseRegulatoryText(text, source);
    
    // 如果京医千询不可用，尝试BioBERT
    if (result.confidence < 0.3) {
      const entities = await this.biobert.extractEntities(text);
      const classification = await this.biobert.classifyRegulation(text);
      
      return {
        entityType: this.mapCategoryToEntityType(classification.category),
        title: text.slice(0, 100),
        content: text,
        metadata: { entities, classification },
        confidence: classification.confidence,
      };
    }

    return result;
  }

  /**
   * 翻译术语
   */
  async translateTerm(term: string, from: string, to: string): Promise<string> {
    const result = await this.baiduTranslate.translate(term, from, to);
    return result.translatedText;
  }

  /**
   * 映射分类到实体类型
   */
  private mapCategoryToEntityType(category: string): AIParseResult['entityType'] {
    const mapping: Record<string, AIParseResult['entityType']> = {
      'regulation': 'regulation',
      'company': 'company',
      'product': 'product',
      'warning_letter': 'warning_letter',
      'recall': 'recall',
    };
    return mapping[category] || 'regulation';
  }
}

// 导出单例实例
export const aiProviderManager = new AIProviderManager();
