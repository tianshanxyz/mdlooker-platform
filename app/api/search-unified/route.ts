import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '../../lib/supabase';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: 'company' | 'product' | 'registration' | 'web';
  source: string;
  url?: string;
  metadata?: Record<string, any>;
  relevance: number;
}

/**
 * 检测搜索类型
 */
function detectSearchType(query: string): {
  type: 'udi' | 'company' | 'product' | 'general';
  confidence: number;
} {
  // UDI 检测
  if (/^\(01\)\d{14}|^\d{14}$/.test(query.replace(/\s/g, ''))) {
    return { type: 'udi', confidence: 0.95 };
  }
  
  // 公司名检测（常见医疗器械公司后缀）
  const companyPatterns = [
    /\b(Inc\.?|Corp\.?|Ltd\.?|Limited|GmbH|AG|BV|S\.A\.?|株式会社)\b/i,
    /\b(Medtronic|Johnson|Abbott|Siemens|Philips|GE Healthcare|3M|Stryker|Boston Scientific)\b/i,
  ];
  if (companyPatterns.some(p => p.test(query))) {
    return { type: 'company', confidence: 0.8 };
  }
  
  // 产品名检测（常见医疗器械关键词）
  const productPatterns = [
    /\b(mask|syringe|catheter|stent|pacemaker|implant|scanner|monitor)\b/i,
    /\b(口罩|注射器|导管|支架|起搏器|植入物|扫描仪|监护仪)\b/i,
  ];
  if (productPatterns.some(p => p.test(query))) {
    return { type: 'product', confidence: 0.75 };
  }
  
  return { type: 'general', confidence: 0.5 };
}

/**
 * 搜索本地数据库
 */
async function searchLocalDatabase(
  query: string,
  type: 'company' | 'product' | 'all' = 'all',
  limit: number = 10
): Promise<SearchResult[]> {
  const supabase = getSupabaseClient();
  const results: SearchResult[] = [];
  
  try {
    // 搜索公司
    if (type === 'all' || type === 'company') {
      const { data: companies } = await supabase
        .from('companies')
        .select('id, name, name_zh, description, country, website')
        .or(`name.ilike.%${query}%,name_zh.ilike.%${query}%`)
        .limit(limit);
      
      companies?.forEach(company => {
        results.push({
          id: company.id,
          title: company.name_zh || company.name,
          description: company.description || '',
          type: 'company',
          source: 'local_database',
          url: company.website,
          metadata: {
            country: company.country,
          },
          relevance: 0.9,
        });
      });
    }
    
    // 搜索产品
    if (type === 'all' || type === 'product') {
      const { data: products } = await supabase
        .from('products')
        .select('id, name, name_zh, description, category, company_id')
        .or(`name.ilike.%${query}%,name_zh.ilike.%${query}%`)
        .limit(limit);
      
      products?.forEach(product => {
        results.push({
          id: product.id,
          title: product.name_zh || product.name,
          description: product.description || '',
          type: 'product',
          source: 'local_database',
          metadata: {
            category: product.category,
            company_id: product.company_id,
          },
          relevance: 0.85,
        });
      });
    }
    
    // 搜索 FDA 注册
    if (type === 'all') {
      const { data: fdaRegs } = await supabase
        .from('fda_registrations')
        .select('id, device_name, device_description, product_code, registration_number')
        .or(`device_name.ilike.%${query}%,device_description.ilike.%${query}%`)
        .limit(limit);
      
      fdaRegs?.forEach(reg => {
        results.push({
          id: reg.id,
          title: reg.device_name,
          description: reg.device_description || '',
          type: 'registration',
          source: 'fda',
          url: `https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfRL/rl.cfm?lid=${reg.registration_number}`,
          metadata: {
            product_code: reg.product_code,
            registration_number: reg.registration_number,
          },
          relevance: 0.8,
        });
      });
    }
    
  } catch (error) {
    console.error('Local database search error:', error);
  }
  
  return results;
}

/**
 * 搜索全网
 */
async function searchWeb(query: string, limit: number = 5): Promise<SearchResult[]> {
  try {
    // 调用内部 API
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/search-web?q=${encodeURIComponent(query)}&count=${limit}`, {
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Web search failed: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success || !data.results) {
      return [];
    }
    
    return data.results.map((item: any, index: number) => ({
      id: `web-${index}`,
      title: item.title,
      description: item.description,
      type: 'web',
      source: 'brave_search',
      url: item.url,
      metadata: {
        age: item.age,
        favicon: item.favicon,
      },
      relevance: 0.6 - (index * 0.05), // 递减相关性
    }));
    
  } catch (error) {
    console.error('Web search error:', error);
    return [];
  }
}

/**
 * 生成搜索建议
 */
function generateSuggestions(query: string, detectedType: string): string[] {
  const suggestions: string[] = [];
  
  if (detectedType === 'general') {
    suggestions.push(
      `${query} medical device`,
      `${query} FDA registration`,
      `${query} CE marking`,
      `${query} manufacturer`
    );
  }
  
  // 常见医疗器械相关建议
  const commonSuggestions = [
    'face mask FDA',
    'surgical gloves CE',
    'syringe manufacturer',
    'blood pressure monitor',
    'diabetes test strips',
  ];
  
  return [...suggestions, ...commonSuggestions].slice(0, 5);
}

/**
 * POST /api/search-unified - 统一搜索
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      query,
      limit = 20,
      includeWeb = true,
      locale = 'en',
    } = body;

    if (!query || query.length < 2) {
      return NextResponse.json(
        { error: 'Query must be at least 2 characters' },
        { status: 400 }
      );
    }

    const startTime = Date.now();
    
    // 1. 检测搜索类型
    const detectedType = detectSearchType(query);
    console.log(`Detected search type: ${detectedType.type} (confidence: ${detectedType.confidence})`);
    
    // 2. 并行搜索多个数据源
    const searchPromises: Promise<SearchResult[]>[] = [
      // 本地数据库搜索
      searchLocalDatabase(query, detectedType.type === 'company' ? 'company' : 'all', limit),
    ];
    
    // 如果本地结果少，或者用户明确要求，添加全网搜索
    if (includeWeb) {
      searchPromises.push(searchWeb(query, 5));
    }
    
    const searchResults = await Promise.all(searchPromises);
    
    // 3. 合并结果
    let allResults: SearchResult[] = [];
    searchResults.forEach(results => {
      allResults = [...allResults, ...results];
    });
    
    // 4. 去重（基于 title）
    const seen = new Set<string>();
    allResults = allResults.filter(item => {
      const key = item.title.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    
    // 5. 排序（按相关性）
    allResults.sort((a, b) => b.relevance - a.relevance);
    
    // 6. 限制结果数
    allResults = allResults.slice(0, limit);
    
    // 7. 生成建议
    const suggestions = generateSuggestions(query, detectedType.type);
    
    const endTime = Date.now();
    
    return NextResponse.json({
      success: true,
      query: {
        original: query,
        detected_type: detectedType.type,
        confidence: detectedType.confidence,
      },
      results: allResults,
      suggestions,
      stats: {
        total_results: allResults.length,
        local_results: allResults.filter(r => r.source === 'local_database').length,
        web_results: allResults.filter(r => r.source === 'brave_search').length,
        search_time_ms: endTime - startTime,
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Unified search error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/search-unified - 统一搜索（GET 版本）
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const includeWeb = searchParams.get('web') !== 'false';
    
    if (!query || query.length < 2) {
      return NextResponse.json(
        { error: 'Query must be at least 2 characters' },
        { status: 400 }
      );
    }
    
    // 转发到 POST 处理逻辑
    return POST(request);
    
  } catch (error) {
    console.error('Unified search error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
