import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '../../lib/supabase';

// 计算字符串相似度 (Levenshtein Distance)
function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,
          dp[i][j - 1] + 1,
          dp[i - 1][j - 1] + 1
        );
      }
    }
  }
  return dp[m][n];
}

// 计算相似度分数 (0-1)
function similarityScore(str1: string, str2: string): number {
  const maxLen = Math.max(str1.length, str2.length);
  if (maxLen === 0) return 1;
  const distance = levenshteinDistance(str1.toLowerCase(), str2.toLowerCase());
  return 1 - distance / maxLen;
}

// 生成搜索建议
function generateSuggestions(query: string): string[] {
  const suggestions: string[] = [];
  const queryLower = query.toLowerCase();
  
  // 常见医疗器械产品词库
  const productKeywords = [
    'mask', 'face mask', 'surgical mask', 'n95', 'respirator',
    'glove', 'gloves', 'surgical gloves', 'exam gloves',
    'syringe', 'needle', 'injection',
    'bandage', 'dressing', 'wound care',
    'stethoscope', 'thermometer', 'blood pressure',
    'wheelchair', 'walker', 'crutch',
    'catheter', 'tube', 'drainage',
    'implant', 'pacemaker', 'stent',
    'ultrasound', 'x-ray', 'mri', 'ct',
    'surgical instrument', 'scalpel', 'forceps',
    'dental', 'orthopedic', 'cardiovascular',
    '口罩', '手套', '注射器', '绷带', '体温计',
    '轮椅', '导管', '植入物', '超声', '手术器械'
  ];
  
  // 如果查询词不在常见词库中，推荐相关词
  for (const keyword of productKeywords) {
    if (keyword.includes(queryLower) || queryLower.includes(keyword)) {
      if (keyword !== queryLower) {
        suggestions.push(keyword);
      }
    }
    // 相似度匹配
    if (similarityScore(keyword, queryLower) > 0.6) {
      if (!suggestions.includes(keyword)) {
        suggestions.push(keyword);
      }
    }
  }
  
  return suggestions.slice(0, 5); // 最多返回5个建议
}

// 智能搜索：自动识别搜索类型
function detectSearchType(query: string): 'company' | 'product' | 'udi' | 'general' {
  const queryLower = query.toLowerCase().trim();
  
  // UDI格式检测 (通常包含特定字符或长度)
  if (/^[0-9]{14}$/.test(query) || query.includes('(01)') || query.includes('UDI')) {
    return 'udi';
  }
  
  // 公司名称检测（通常包含公司类型词汇）
  const companyIndicators = ['inc', 'corp', 'ltd', 'company', 'co.', 'medical', 'health', 'device', 'technology', 'pharma'];
  if (companyIndicators.some(ind => queryLower.includes(ind))) {
    return 'company';
  }
  
  // 产品名称检测（常见医疗器械词汇）
  const productIndicators = ['mask', 'glove', 'syringe', 'catheter', 'stent', 'implant', 'surgical', 'dental', 'orthopedic'];
  if (productIndicators.some(ind => queryLower.includes(ind))) {
    return 'product';
  }
  
  return 'general';
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
  const country = searchParams.get('country');
  const hasFDA = searchParams.get('hasFDA') === 'true';
  const hasNMPA = searchParams.get('hasNMPA') === 'true';
  const hasEUDAMED = searchParams.get('hasEUDAMED') === 'true';
  const searchType = searchParams.get('type') || 'auto'; // auto, company, product, udi

  if (!query.trim()) {
    return NextResponse.json({
      companies: [],
      total: 0,
      page,
      pageSize,
      suggestions: [],
      detectedType: 'general',
      message: 'Please enter a search term'
    });
  }

  try {
    const supabase = getSupabaseClient();
    
    // 自动检测搜索类型
    const detectedType = searchType === 'auto' ? detectSearchType(query) : searchType as any;
    
    let allResults: any[] = [];
    let totalCount = 0;
    
    // 根据搜索类型执行不同的搜索策略
    if (detectedType === 'company' || detectedType === 'general') {
      // 搜索公司
      let companyQuery = supabase
        .from('companies')
        .select('*', { count: 'exact' });

      const searchTerms = query.split(/\s+/).filter(term => term.length > 0);
      if (searchTerms.length > 0) {
        const orConditions = searchTerms.map(term => {
          const cleanTerm = term.replace(/[%_]/g, '\\$&');
          return `name.ilike.%${cleanTerm}%,name_zh.ilike.%${cleanTerm}%,description.ilike.%${cleanTerm}%`;
        }).join(',');
        companyQuery = companyQuery.or(orConditions);
      }

      if (country) {
        companyQuery = companyQuery.eq('country', country);
      }

      const { data: companies, error, count } = await companyQuery
        .range((page - 1) * pageSize, page * pageSize - 1)
        .order('name', { ascending: true });

      if (!error && companies) {
        allResults = companies.map(c => ({ ...c, resultType: 'company' }));
        totalCount = count || 0;
      }
    }
    
    // 搜索产品（如果类型是product或general且结果较少）
    if (detectedType === 'product' || (detectedType === 'general' && allResults.length < 5)) {
      let productQuery = supabase
        .from('products')
        .select(`
          *,
          company:companies(id, name, name_zh, country)
        `, { count: 'exact' });

      const searchTerms = query.split(/\s+/).filter(term => term.length > 0);
      if (searchTerms.length > 0) {
        const orConditions = searchTerms.map(term => {
          const cleanTerm = term.replace(/[%_]/g, '\\$&');
          return `name.ilike.%${cleanTerm}%,name_zh.ilike.%${cleanTerm}%,description.ilike.%${cleanTerm}%`;
        }).join(',');
        productQuery = productQuery.or(orConditions);
      }

      const { data: products, error, count } = await productQuery
        .range(0, pageSize - 1)
        .order('name', { ascending: true });

      if (!error && products) {
        // 将产品结果转换为统一格式
        const productResults = products.map(p => ({
          ...p,
          resultType: 'product',
          company_name: p.company?.name,
          company_name_zh: p.company?.name_zh,
          company_country: p.company?.country
        }));
        allResults = [...allResults, ...productResults];
        totalCount += (count || 0);
      }
    }
    
    // 搜索UDI（如果类型是udi）
    if (detectedType === 'udi') {
      const { data: udiData, error } = await supabase
        .from('eudamed_registrations')
        .select(`
          *,
          company:companies(id, name, name_zh, country)
        `)
        .ilike('udi_di', `%${query}%`)
        .limit(pageSize);

      if (!error && udiData) {
        const udiResults = udiData.map(u => ({
          ...u,
          resultType: 'udi',
          company_name: u.company?.name,
          company_name_zh: u.company?.name_zh,
          company_country: u.company?.country
        }));
        allResults = [...allResults, ...udiResults];
      }
    }

    // 计算匹配分数并排序
    if (query && allResults.length > 0) {
      const queryLower = query.toLowerCase();
      
      const scoredResults = allResults.map((item: any) => {
        let score = 0;
        const name = (item.name || '').toLowerCase();
        const nameZh = (item.name_zh || '').toLowerCase();
        const description = (item.description || '').toLowerCase();
        
        // 精确匹配得分最高
        if (name === queryLower || nameZh === queryLower) {
          score += 100;
        }
        // 开头匹配
        else if (name.startsWith(queryLower) || nameZh.startsWith(queryLower)) {
          score += 80;
        }
        // 包含匹配
        else if (name.includes(queryLower) || nameZh.includes(queryLower)) {
          score += 60;
        }
        // 描述中包含
        else if (description.includes(queryLower)) {
          score += 40;
        }
        // 模糊匹配
        else {
          const nameScore = similarityScore(name, queryLower);
          const nameZhScore = similarityScore(nameZh, queryLower);
          score += Math.max(nameScore, nameZhScore) * 50;
        }
        
        // 根据结果类型调整分数
        if (detectedType === 'product' && item.resultType === 'product') {
          score += 10; // 产品搜索时优先显示产品
        } else if (detectedType === 'company' && item.resultType === 'company') {
          score += 10; // 公司搜索时优先显示公司
        }
        
        return { ...item, matchScore: score };
      });
      
      scoredResults.sort((a: any, b: any) => b.matchScore - a.matchScore);
      allResults = scoredResults;
    }

    // 过滤有特定注册的公司
    if (hasFDA || hasNMPA || hasEUDAMED) {
      const companyIds = allResults.map((c: any) => c.id);
      
      if (hasFDA && companyIds.length > 0) {
        const { data: fdaData } = await supabase
          .from('fda_registrations')
          .select('company_id')
          .in('company_id', companyIds);
        const fdaCompanyIds = new Set(fdaData?.map((r: any) => r.company_id) || []);
        allResults = allResults.filter((c: any) => fdaCompanyIds.has(c.id));
      }
      
      if (hasNMPA && allResults.length > 0) {
        const companyIds = allResults.map((c: any) => c.id);
        const { data: nmpaData } = await supabase
          .from('nmpa_registrations')
          .select('company_id')
          .in('company_id', companyIds);
        const nmpaCompanyIds = new Set(nmpaData?.map((r: any) => r.company_id) || []);
        allResults = allResults.filter((c: any) => nmpaCompanyIds.has(c.id));
      }
      
      if (hasEUDAMED && allResults.length > 0) {
        const companyIds = allResults.map((c: any) => c.id);
        const { data: eudamedData } = await supabase
          .from('eudamed_registrations')
          .select('company_id')
          .in('company_id', companyIds);
        const eudamedCompanyIds = new Set(eudamedData?.map((r: any) => r.company_id) || []);
        allResults = allResults.filter((c: any) => eudamedCompanyIds.has(c.id));
      }
    }

    // 生成搜索建议
    const suggestions = allResults.length === 0 ? generateSuggestions(query) : [];

    return NextResponse.json({
      results: allResults.slice(0, pageSize),
      total: allResults.length,
      page,
      pageSize,
      suggestions,
      detectedType,
      query,
      hasMore: allResults.length > pageSize
    });

  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Search failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
