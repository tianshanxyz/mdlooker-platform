import { NextRequest, NextResponse } from 'next/server';

// SearXNG 公共实例列表（无需注册，完全免费）
const SEARXNG_INSTANCES = [
  'https://searx.be',
  'https://search.sapti.me',
  'https://search.disroot.org',
  'https://searx.tiekoetter.com',
  'https://search.bus-hit.me',
];

// 备选：Brave Search（如果你有 API Key）
const BRAVE_API_BASE = 'https://api.search.brave.com/res/v1/web/search';

interface SearchResult {
  title: string;
  url: string;
  description: string;
  source: 'searxng' | 'brave' | 'duckduckgo';
}

interface SearchResponse {
  query: string;
  results: SearchResult[];
  source: string;
}

/**
 * 使用 SearXNG 公共实例进行搜索
 */
async function searchSearxng(query: string, count: number = 10): Promise<SearchResponse | null> {
  // 尝试多个实例，直到成功
  for (const instance of SEARXNG_INSTANCES) {
    try {
      console.log(`Trying SearXNG instance: ${instance}`);
      
      const params = new URLSearchParams({
        q: query,
        format: 'json',
        language: 'en',
        safesearch: '1',
        categories: 'general',
      });

      const url = `${instance}/search?${params.toString()}`;
      
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        signal: AbortSignal.timeout(10000), // 10秒超时
      });

      if (!response.ok) {
        console.log(`Instance ${instance} returned ${response.status}`);
        continue;
      }

      const data = await response.json();
      
      if (!data.results || !Array.isArray(data.results) || data.results.length === 0) {
        console.log(`Instance ${instance} returned no results`);
        continue;
      }

      const results: SearchResult[] = data.results
        .slice(0, count)
        .map((item: any) => ({
          title: item.title || '',
          url: item.url || '',
          description: item.content || item.abstract || '',
          source: 'searxng',
        }));

      console.log(`SearXNG (${instance}) returned ${results.length} results`);
      
      return {
        query,
        results,
        source: `searxng:${instance}`,
      };

    } catch (error) {
      console.log(`Instance ${instance} failed:`, error);
      continue;
    }
  }
  
  return null;
}

/**
 * 使用 Brave Search API 进行搜索（如果你有 API Key）
 */
async function searchBrave(query: string, count: number = 10): Promise<SearchResponse | null> {
  const apiKey = process.env.BRAVE_API_KEY;
  
  if (!apiKey) {
    console.log('Brave Search API not configured');
    return null;
  }

  try {
    const params = new URLSearchParams({
      q: query,
      count: count.toString(),
      offset: '0',
      mkt: 'en-US',
      safesearch: 'moderate',
    });

    const url = `${BRAVE_API_BASE}?${params.toString()}`;
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'X-Subscription-Token': apiKey,
      },
    });

    if (!response.ok) {
      console.error(`Brave Search API error: ${response.status}`);
      return null;
    }

    const data = await response.json();
    
    const results: SearchResult[] = [];
    
    if (data.web && data.web.results) {
      for (const item of data.web.results) {
        results.push({
          title: item.title || '',
          url: item.url || '',
          description: item.description || '',
          source: 'brave',
        });
      }
    }

    return {
      query,
      results,
      source: 'brave',
    };

  } catch (error) {
    console.error('Brave Search error:', error);
    return null;
  }
}

/**
 * 生成 DuckDuckGo 搜索链接（最后的备选）
 */
function getDuckDuckGoFallback(query: string): SearchResponse {
  const enhancedQuery = `${query} medical device FDA CE`;
  const duckduckgoUrl = `https://duckduckgo.com/?q=${encodeURIComponent(enhancedQuery)}`;
  
  return {
    query,
    results: [{
      title: `Search "${query}" on DuckDuckGo`,
      url: duckduckgoUrl,
      description: 'Click to search on DuckDuckGo (privacy-focused search engine)',
      source: 'duckduckgo',
    }],
    source: 'duckduckgo',
  };
}

/**
 * 构建医疗器械相关搜索查询
 */
function buildMedicalDeviceQuery(userQuery: string): string {
  const medicalTerms = ['medical', 'device', '器械', '医疗', 'FDA', 'CE', 'NMPA', 'EUDAMED'];
  const hasMedicalTerm = medicalTerms.some(term => 
    userQuery.toLowerCase().includes(term.toLowerCase())
  );
  
  if (hasMedicalTerm) {
    return userQuery;
  }
  
  return `${userQuery} medical device FDA CE registration`;
}

/**
 * 主搜索函数 - 自动选择可用的搜索引擎
 */
async function performSearch(query: string, count: number = 10): Promise<SearchResponse> {
  const searchQuery = buildMedicalDeviceQuery(query);
  
  // 1. 优先尝试 SearXNG（免费，无需注册）
  console.log('Trying SearXNG...');
  const searxngResults = await searchSearxng(searchQuery, count);
  if (searxngResults && searxngResults.results.length > 0) {
    return searxngResults;
  }
  
  // 2. 备选 Brave Search（如果你有 API Key）
  console.log('Trying Brave Search...');
  const braveResults = await searchBrave(searchQuery, count);
  if (braveResults && braveResults.results.length > 0) {
    return braveResults;
  }
  
  // 3. 最后的备选：DuckDuckGo 链接
  console.log('All APIs failed, returning DuckDuckGo fallback');
  return getDuckDuckGoFallback(query);
}

/**
 * GET /api/search-web - 全网搜索
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const count = parseInt(searchParams.get('count') || '10', 10);

    if (!query || query.length < 2) {
      return NextResponse.json(
        { error: 'Query must be at least 2 characters' },
        { status: 400 }
      );
    }

    const searchResults = await performSearch(query, count);

    return NextResponse.json({
      success: true,
      query: {
        original: query,
        enhanced: buildMedicalDeviceQuery(query),
      },
      results: searchResults.results,
      total: searchResults.results.length,
      source: searchResults.source,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Web search error:', error);
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
 * POST /api/search-web - 带更多参数的搜索
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, count = 10 } = body;

    if (!query || query.length < 2) {
      return NextResponse.json(
        { error: 'Query must be at least 2 characters' },
        { status: 400 }
      );
    }

    const searchResults = await performSearch(query, count);

    return NextResponse.json({
      success: true,
      query: {
        original: query,
        enhanced: buildMedicalDeviceQuery(query),
      },
      results: searchResults.results,
      total: searchResults.results.length,
      source: searchResults.source,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Web search error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
