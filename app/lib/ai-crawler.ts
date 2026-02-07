// AI-Powered Regulatory Data Crawler Framework
// AI驱动的法规数据爬虫框架

import { createClient } from './supabase';

const supabase = createClient();

// 爬虫任务配置接口
export interface CrawlerTask {
  id?: string;
  source: string; // FDA, NMPA, EMA, MHRA, etc.
  sourceType: 'api' | 'webpage' | 'pdf' | 'rss';
  url: string;
  method: 'GET' | 'POST';
  headers?: Record<string, string>;
  payload?: Record<string, any>;
  schedule: 'hourly' | 'daily' | 'weekly' | 'manual';
  lastRun?: Date;
  nextRun?: Date;
  isActive: boolean;
}

// 爬取结果接口
export interface CrawlResult {
  taskId: string;
  source: string;
  status: 'success' | 'partial' | 'failed';
  recordsFound: number;
  recordsProcessed: number;
  recordsInserted: number;
  recordsUpdated: number;
  recordsFailed: number;
  errors: string[];
  startedAt: Date;
  completedAt: Date;
  rawData?: any[];
}

// AI解析结果接口
export interface AIParsedData {
  entityType: 'regulation' | 'company' | 'product' | 'warning_letter' | 'recall';
  source: string;
  sourceUrl: string;
  title: string;
  content: string;
  metadata: Record<string, any>;
  effectiveDate?: Date;
  expirationDate?: Date;
  confidence: number; // AI解析置信度 0-1
}

// 监管机构配置
export const REGULATORY_SOURCES = {
  FDA: {
    name: 'U.S. Food and Drug Administration',
    country: 'USA',
    baseUrl: 'https://www.fda.gov',
    apis: {
      openFDA: 'https://api.fda.gov',
      registration: 'https://api.fda.gov/device/registrationlisting.json',
      recalls: 'https://api.fda.gov/device/recall.json',
      warningLetters: 'https://api.fda.gov/device/warningletter.json',
    },
    dataTypes: ['registrations', 'recalls', 'warning_letters', '510k', 'pma'],
  },
  NMPA: {
    name: '国家药品监督管理局',
    country: 'China',
    baseUrl: 'https://www.nmpa.gov.cn',
    apis: {
      // NMPA没有公开API，需要爬虫
      search: 'https://www.nmpa.gov.cn/datasearch/search-info.html',
    },
    dataTypes: ['registrations', 'recalls', 'announcements'],
    requiresScraping: true,
  },
  EMA: {
    name: 'European Medicines Agency',
    country: 'EU',
    baseUrl: 'https://www.ema.europa.eu',
    apis: {
      eudamed: 'https://ec.europa.eu/tools/eudamed/api',
    },
    dataTypes: ['registrations', 'certificates', 'vigilance'],
  },
  MHRA: {
    name: 'Medicines and Healthcare products Regulatory Agency',
    country: 'UK',
    baseUrl: 'https://www.gov.uk/government/organisations/medicines-and-healthcare-products-regulatory-agency',
    apis: {
      devices: 'https://aic.mhra.gov.uk/era/pdr.nsf/regsearch',
    },
    dataTypes: ['registrations', 'recalls', 'safety_alerts'],
  },
  PMDA: {
    name: 'Pharmaceuticals and Medical Devices Agency',
    country: 'Japan',
    baseUrl: 'https://www.pmda.go.jp',
    apis: {
      search: 'https://www.pmda.go.jp/PmdaSearch/iyakuSearch/',
    },
    dataTypes: ['approvals', 'recalls', 'safety_info'],
    requiresScraping: true,
  },
  HealthCanada: {
    name: 'Health Canada',
    country: 'Canada',
    baseUrl: 'https://www.canada.ca/en/health-canada.html',
    apis: {
      mdall: 'https://health-products.canada.ca/api/',
    },
    dataTypes: ['licences', 'recalls', 'safety_alerts'],
  },
  TGA: {
    name: 'Therapeutic Goods Administration',
    country: 'Australia',
    baseUrl: 'https://www.tga.gov.au',
    apis: {
      artg: 'https://www.tga.gov.au/resources/artg',
    },
    dataTypes: ['registrations', 'recalls', 'alerts'],
  },
  HSA: {
    name: 'Health Sciences Authority',
    country: 'Singapore',
    baseUrl: 'https://www.hsa.gov.sg',
    apis: {
      mdR: 'https://www.hsa.gov.sg/medical-devices',
    },
    dataTypes: ['registrations', 'recalls'],
  },
};

/**
 * AI爬虫主类
 */
export class AICrawler {
  private tasks: Map<string, CrawlerTask> = new Map();
  private isRunning: boolean = false;

  /**
   * 注册爬虫任务
   */
  registerTask(task: CrawlerTask): string {
    const id = task.id || crypto.randomUUID();
    task.id = id;
    this.tasks.set(id, task);
    return id;
  }

  /**
   * 获取所有任务
   */
  getTasks(): CrawlerTask[] {
    return Array.from(this.tasks.values());
  }

  /**
   * 执行单个爬虫任务
   */
  async executeTask(taskId: string): Promise<CrawlResult> {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }

    const startTime = new Date();
    const result: CrawlResult = {
      taskId,
      source: task.source,
      status: 'success',
      recordsFound: 0,
      recordsProcessed: 0,
      recordsInserted: 0,
      recordsUpdated: 0,
      recordsFailed: 0,
      errors: [],
      startedAt: startTime,
      completedAt: startTime,
    };

    try {
      console.log(`[AICrawler] Executing task: ${task.source} - ${task.url}`);

      // 1. 获取原始数据
      const rawData = await this.fetchData(task);
      result.recordsFound = rawData.length;

      // 2. AI解析数据
      const parsedData = await this.parseWithAI(rawData, task.source);
      result.recordsProcessed = parsedData.length;

      // 3. 数据验证和清洗
      const validatedData = await this.validateData(parsedData);

      // 4. 存储到数据库
      const storageResult = await this.storeData(validatedData, task.source);
      result.recordsInserted = storageResult.inserted;
      result.recordsUpdated = storageResult.updated;
      result.recordsFailed = storageResult.failed;

      // 5. 记录同步日志
      await this.logSync({
        data_source: task.source,
        sync_type: 'ai_crawler',
        records_processed: result.recordsProcessed,
        records_inserted: result.recordsInserted,
        records_updated: result.recordsUpdated,
        records_failed: result.recordsFailed,
        status: result.recordsFailed > 0 ? 'partial' : 'success',
        error_message: result.errors.join('; ') || undefined,
      });

      result.status = result.recordsFailed > 0 ? 'partial' : 'success';
    } catch (error) {
      result.status = 'failed';
      result.errors.push(error instanceof Error ? error.message : 'Unknown error');
      
      await this.logSync({
        data_source: task.source,
        sync_type: 'ai_crawler',
        records_processed: 0,
        records_inserted: 0,
        records_updated: 0,
        records_failed: 0,
        status: 'failed',
        error_message: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    result.completedAt = new Date();
    return result;
  }

  /**
   * 获取数据（API或爬虫）
   */
  private async fetchData(task: CrawlerTask): Promise<any[]> {
    if (task.sourceType === 'api') {
      return this.fetchFromAPI(task);
    } else if (task.sourceType === 'webpage') {
      return this.fetchFromWebpage(task);
    } else if (task.sourceType === 'rss') {
      return this.fetchFromRSS(task);
    }
    return [];
  }

  /**
   * 从API获取数据
   */
  private async fetchFromAPI(task: CrawlerTask): Promise<any[]> {
    const response = await fetch(task.url, {
      method: task.method,
      headers: {
        'Content-Type': 'application/json',
        ...task.headers,
      },
      body: task.payload ? JSON.stringify(task.payload) : undefined,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return Array.isArray(data) ? data : data.results || data.data || [];
  }

  /**
   * 从网页爬取数据（需要AI解析HTML）
   */
  private async fetchFromWebpage(task: CrawlerTask): Promise<any[]> {
    // 这里需要集成爬虫库如Puppeteer或Playwright
    // 以及AI解析HTML内容
    console.log(`[AICrawler] Webpage crawling not yet implemented for ${task.url}`);
    return [];
  }

  /**
   * 从RSS获取数据
   */
  private async fetchFromRSS(task: CrawlerTask): Promise<any[]> {
    const response = await fetch(task.url);
    const xml = await response.text();
    
    // 解析RSS XML
    // 这里需要XML解析库
    console.log(`[AICrawler] RSS parsing not yet implemented for ${task.url}`);
    return [];
  }

  /**
   * 使用AI解析数据
   * 这里集成OpenAI/Claude API进行智能解析
   */
  private async parseWithAI(rawData: any[], source: string): Promise<AIParsedData[]> {
    const parsed: AIParsedData[] = [];

    for (const item of rawData) {
      try {
        // 使用AI解析非结构化数据
        const parsedItem = await this.callAIParser(item, source);
        if (parsedItem) {
          parsed.push(parsedItem);
        }
      } catch (error) {
        console.error(`[AICrawler] AI parsing error:`, error);
      }
    }

    return parsed;
  }

  /**
   * 调用AI解析API
   */
  private async callAIParser(rawData: any, source: string): Promise<AIParsedData | null> {
    // 这里集成OpenAI/Claude API
    // 示例：使用OpenAI GPT-4解析法规文本
    
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.warn('[AICrawler] OPENAI_API_KEY not set, skipping AI parsing');
      // 返回基础解析结果
      return this.basicParse(rawData, source);
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: `You are a medical device regulatory data parser. Extract structured information from ${source} data.
              Return JSON with: entityType, title, content, metadata (object), effectiveDate, expirationDate.`
            },
            {
              role: 'user',
              content: `Parse this regulatory data: ${JSON.stringify(rawData)}`
            }
          ],
          temperature: 0.1,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const result = await response.json();
      const parsed = JSON.parse(result.choices[0].message.content);
      
      return {
        ...parsed,
        source,
        sourceUrl: rawData.url || rawData.source_url || '',
        confidence: 0.9,
      };
    } catch (error) {
      console.error('[AICrawler] AI API error:', error);
      return this.basicParse(rawData, source);
    }
  }

  /**
   * 基础解析（无AI时备用）
   */
  private basicParse(rawData: any, source: string): AIParsedData {
    return {
      entityType: 'regulation',
      source,
      sourceUrl: rawData.url || rawData.source_url || '',
      title: rawData.title || rawData.name || rawData.device_name || 'Unknown',
      content: JSON.stringify(rawData),
      metadata: rawData,
      confidence: 0.5,
    };
  }

  /**
   * 验证数据
   */
  private async validateData(data: AIParsedData[]): Promise<AIParsedData[]> {
    return data.filter(item => {
      // 基础验证
      if (!item.title || item.title === 'Unknown') return false;
      if (item.confidence < 0.3) return false;
      return true;
    });
  }

  /**
   * 存储数据到数据库
   */
  private async storeData(
    data: AIParsedData[],
    source: string
  ): Promise<{ inserted: number; updated: number; failed: number }> {
    let inserted = 0;
    let updated = 0;
    let failed = 0;

    for (const item of data) {
      try {
        // 根据entityType存储到不同表
        switch (item.entityType) {
          case 'regulation':
          case 'company':
            // 存储到相应表
            break;
          case 'warning_letter':
            await this.storeWarningLetter(item);
            break;
          case 'recall':
            await this.storeRecall(item);
            break;
          default:
            break;
        }
        inserted++;
      } catch (error) {
        failed++;
        console.error(`[AICrawler] Storage error:`, error);
      }
    }

    return { inserted, updated, failed };
  }

  /**
   * 存储警告信
   */
  private async storeWarningLetter(data: AIParsedData) {
    const { error } = await supabase
      .from('regulatory_warning_letters')
      .upsert({
        issuing_agency: data.source,
        agency_country: REGULATORY_SOURCES[data.source as keyof typeof REGULATORY_SOURCES]?.country,
        letter_number: data.metadata.letter_number,
        letter_date: data.metadata.letter_date,
        facility_name: data.metadata.facility_name,
        violation_summary: data.content,
        violation_categories: data.metadata.violation_categories,
        status: data.metadata.status,
        letter_url: data.sourceUrl,
        raw_data: data.metadata,
      }, {
        onConflict: 'letter_number',
      });

    if (error) throw error;
  }

  /**
   * 存储召回记录
   */
  private async storeRecall(data: AIParsedData) {
    const { error } = await supabase
      .from('regulatory_recalls')
      .upsert({
        issuing_agency: data.source,
        agency_country: REGULATORY_SOURCES[data.source as keyof typeof REGULATORY_SOURCES]?.country,
        recall_number: data.metadata.recall_number,
        recall_initiation_date: data.metadata.recall_date,
        recall_classification: data.metadata.classification,
        product_name: data.title,
        recall_reason: data.content,
        recall_status: data.metadata.status,
        recall_url: data.sourceUrl,
        raw_data: data.metadata,
      }, {
        onConflict: 'recall_number',
      });

    if (error) throw error;
  }

  /**
   * 记录同步日志
   */
  private async logSync(logData: {
    data_source: string;
    sync_type: string;
    records_processed: number;
    records_inserted: number;
    records_updated: number;
    records_failed: number;
    status: string;
    error_message?: string;
  }) {
    try {
      await supabase.from('sync_logs').insert({
        ...logData,
        completed_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('[AICrawler] Failed to log sync:', error);
    }
  }

  /**
   * 启动定时任务
   */
  async startScheduler(): Promise<void> {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log('[AICrawler] Scheduler started');

    // 每小时检查一次需要执行的任务
    setInterval(async () => {
      await this.checkScheduledTasks();
    }, 60 * 60 * 1000);

    // 立即执行一次检查
    await this.checkScheduledTasks();
  }

  /**
   * 检查计划任务
   */
  private async checkScheduledTasks(): Promise<void> {
    const now = new Date();

    for (const task of this.tasks.values()) {
      if (!task.isActive) continue;
      if (task.nextRun && task.nextRun > now) continue;

      // 执行任务
      await this.executeTask(task.id!);

      // 更新下次执行时间
      task.lastRun = now;
      task.nextRun = this.calculateNextRun(task.schedule, now);
    }
  }

  /**
   * 计算下次执行时间
   */
  private calculateNextRun(schedule: string, from: Date): Date {
    const next = new Date(from);
    
    switch (schedule) {
      case 'hourly':
        next.setHours(next.getHours() + 1);
        break;
      case 'daily':
        next.setDate(next.getDate() + 1);
        break;
      case 'weekly':
        next.setDate(next.getDate() + 7);
        break;
      default:
        next.setDate(next.getDate() + 1);
    }
    
    return next;
  }
}

// 导出单例实例
export const aiCrawler = new AICrawler();

/**
 * 初始化默认爬虫任务
 */
export function initializeDefaultTasks(): void {
  // FDA OpenFDA API 任务
  aiCrawler.registerTask({
    source: 'FDA',
    sourceType: 'api',
    url: 'https://api.fda.gov/device/registrationlisting.json',
    method: 'GET',
    schedule: 'daily',
    isActive: true,
  });

  // FDA Recalls API 任务
  aiCrawler.registerTask({
    source: 'FDA',
    sourceType: 'api',
    url: 'https://api.fda.gov/device/recall.json',
    method: 'GET',
    schedule: 'daily',
    isActive: true,
  });

  console.log('[AICrawler] Default tasks initialized');
}
