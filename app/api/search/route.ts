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
  
  for (const keyword of productKeywords) {
    if (keyword.includes(queryLower) || queryLower.includes(keyword)) {
      if (keyword !== queryLower && !suggestions.includes(keyword)) {
        suggestions.push(keyword);
      }
    }
    if (similarityScore(keyword, queryLower) > 0.6) {
      if (!suggestions.includes(keyword)) {
        suggestions.push(keyword);
      }
    }
  }
  
  return suggestions.slice(0, 5);
}

// 智能搜索：自动识别搜索类型
function detectSearchType(query: string): 'company' | 'product' | 'udi' | 'general' {
  const queryLower = query.toLowerCase().trim();
  
  // UDI格式检测
  if (/^[0-9]{14}$/.test(query) || query.includes('(01)') || query.includes('UDI')) {
    return 'udi';
  }
  
  // 公司名称检测
  const companyIndicators = ['inc', 'corp', 'ltd', 'company', 'co.', 'medical', 'health', 'device', 'technology', 'pharma'];
  if (companyIndicators.some(ind => queryLower.includes(ind))) {
    return 'company';
  }
  
  // 产品名称检测
  const productIndicators = ['mask', 'glove', 'syringe', 'catheter', 'stent', 'implant', 'surgical', 'dental', 'orthopedic'];
  if (productIndicators.some(ind => queryLower.includes(ind))) {
    return 'product';
  }
  
  return 'general';
}

// 搜索注册表的通用函数
async function searchRegistrations(
  supabase: any,
  tableName: string,
  searchTerms: string[],
  pageSize: number,
  resultType: string,
  regionName: string
) {
  if (searchTerms.length === 0) return { data: [], count: 0 };

  let query = supabase
    .from(tableName)
    .select(`
      *,
      company:companies(id, name, name_zh, country)
    `, { count: 'exact' });

  // 构建搜索条件 - 搜索产品名称、公司名称、注册号
  const orConditions = searchTerms.map(term => {
    const cleanTerm = term.replace(/[%_]/g, '\\$&');
    return `device_name.ilike.%${cleanTerm}%,product_name.ilike.%${cleanTerm}%,company_name.ilike.%${cleanTerm}%,registration_number.ilike.%${cleanTerm}%,brand_name.ilike.%${cleanTerm}%`;
  }).join(',');
  
  query = query.or(orConditions);

  const { data, error, count } = await query
    .range(0, pageSize - 1)
    .order('created_at', { ascending: false });

  if (error) {
    console.error(`${tableName} search error:`, error);
    return { data: [], count: 0 };
  }

  const formattedResults = data?.map((item: any) => ({
    ...item,
    resultType,
    region: regionName,
    name: item.device_name || item.product_name || item.brand_name,
    name_zh: item.device_name_zh || item.product_name_zh,
    company_name: item.company?.name || item.company_name || item.applicant_name,
    company_name_zh: item.company?.name_zh,
    company_country: item.company?.country || item.country || regionName,
    registration_number: item.registration_number || item.fei_number || item.actor_id || item.device_identifier,
    registration_summary: {
      [`${resultType}_count`]: 1
    }
  })) || [];

  return { data: formattedResults, count: count || 0 };
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
  const searchType = searchParams.get('type') || 'auto';
  const source = searchParams.get('source') || 'all'; // all, fda, nmpa, eudamed, etc.

  if (!query.trim()) {
    return NextResponse.json({
      results: [],
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
    const detectedType = searchType === 'auto' ? detectSearchType(query) : searchType as any;
    const searchTerms = query.split(/\s+/).filter(term => term.length > 0);
    const hasChinese = /[\u4e00-\u9fa5]/.test(query);
    
    let allResults: any[] = [];
    let totalCount = 0;

    // 1. 搜索公司
    if ((detectedType === 'company' || detectedType === 'general') && (source === 'all' || source === 'companies')) {
      let companyQuery = supabase
        .from('companies')
        .select('*', { count: 'exact' });

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
        allResults = companies.map((c: any) => ({ ...c, resultType: 'company' }));
        totalCount = count || 0;
      }
    }

    // 2. 搜索产品
    if ((detectedType === 'product' || (detectedType === 'general' && allResults.length < 5)) && (source === 'all' || source === 'products')) {
      let productQuery = supabase
        .from('products')
        .select(`
          *,
          company:companies(id, name, name_zh, country)
        `, { count: 'exact' });

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
        const productResults = products.map((p: any) => ({
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

    // 3. 搜索FDA注册
    if ((source === 'all' || source === 'fda') && !hasNMPA && !hasEUDAMED) {
      const { data: fdaResults, count: fdaCount } = await searchRegistrations(
        supabase, 'fda_registrations', searchTerms, pageSize, 'fda_registration', 'USA'
      );
      allResults = [...allResults, ...fdaResults];
      totalCount += fdaCount;
    }

    // 4. 搜索NMPA注册 (中国)
    if ((hasChinese || detectedType === 'general' || detectedType === 'company' || source === 'nmpa') && (source === 'all' || source === 'nmpa')) {
      const { data: nmpaResults, count: nmpaCount } = await searchRegistrations(
        supabase, 'nmpa_registrations', searchTerms, pageSize, 'nmpa_registration', 'China'
      );
      allResults = [...allResults, ...nmpaResults];
      totalCount += nmpaCount;
    }

    // 5. 搜索EUDAMED注册 (欧盟)
    if ((source === 'all' || source === 'eudamed') && !hasFDA && !hasNMPA) {
      const { data: eudamedResults, count: eudamedCount } = await searchRegistrations(
        supabase, 'eudamed_registrations', searchTerms, pageSize, 'eudamed_registration', 'EU'
      );
      allResults = [...allResults, ...eudamedResults];
      totalCount += eudamedCount;
    }

    // 6. 搜索PMDA注册 (日本)
    if (source === 'all' || source === 'pmda') {
      const { data: pmdaResults, count: pmdaCount } = await searchRegistrations(
        supabase, 'pmda_registrations', searchTerms, pageSize, 'pmda_registration', 'Japan'
      );
      allResults = [...allResults, ...pmdaResults];
      totalCount += pmdaCount;
    }

    // 7. 搜索HSA注册 (新加坡)
    if (source === 'all' || source === 'hsa') {
      const { data: hsaResults, count: hsaCount } = await searchRegistrations(
        supabase, 'hsa_registrations', searchTerms, pageSize, 'hsa_registration', 'Singapore'
      );
      allResults = [...allResults, ...hsaResults];
      totalCount += hsaCount;
    }

    // 8. 搜索TGA注册 (澳大利亚)
    if (source === 'all' || source === 'tga') {
      const { data: tgaResults, count: tgaCount } = await searchRegistrations(
        supabase, 'tga_registrations', searchTerms, pageSize, 'tga_registration', 'Australia'
      );
      allResults = [...allResults, ...tgaResults];
      totalCount += tgaCount;
    }

    // 9. 搜索Health Canada注册
    if (source === 'all' || source === 'health_canada') {
      const { data: hcResults, count: hcCount } = await searchRegistrations(
        supabase, 'health_canada_registrations', searchTerms, pageSize, 'health_canada_registration', 'Canada'
      );
      allResults = [...allResults, ...hcResults];
      totalCount += hcCount;
    }

    // 10. 搜索MHRA注册 (英国)
    if (source === 'all' || source === 'mhra') {
      const { data: mhraResults, count: mhraCount } = await searchRegistrations(
        supabase, 'mhra_registrations', searchTerms, pageSize, 'mhra_registration', 'UK'
      );
      allResults = [...allResults, ...mhraResults];
      totalCount += mhraCount;
    }

    // 11. 搜索EMA注册
    if (source === 'all' || source === 'ema') {
      const { data: emaResults, count: emaCount } = await searchRegistrations(
        supabase, 'ema_registrations', searchTerms, pageSize, 'ema_registration', 'EU'
      );
      allResults = [...allResults, ...emaResults];
      totalCount += emaCount;
    }

    // 12. 搜索Swissmedic注册 (瑞士)
    if (source === 'all' || source === 'swissmedic') {
      const { data: swissResults, count: swissCount } = await searchRegistrations(
        supabase, 'swissmedic_registrations', searchTerms, pageSize, 'swissmedic_registration', 'Switzerland'
      );
      allResults = [...allResults, ...swissResults];
      totalCount += swissCount;
    }

    // 13. 搜索MFDS注册 (韩国)
    if (source === 'all' || source === 'mfds') {
      const { data: mfdsResults, count: mfdsCount } = await searchRegistrations(
        supabase, 'mfds_registrations', searchTerms, pageSize, 'mfds_registration', 'South Korea'
      );
      allResults = [...allResults, ...mfdsResults];
      totalCount += mfdsCount;
    }

    // 14. 搜索ANVISA注册 (巴西)
    if (source === 'all' || source === 'anvisa') {
      const { data: anvisaResults, count: anvisaCount } = await searchRegistrations(
        supabase, 'anvisa_registrations', searchTerms, pageSize, 'anvisa_registration', 'Brazil'
      );
      allResults = [...allResults, ...anvisaResults];
      totalCount += anvisaCount;
    }

    // 15. 搜索UDI
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
        const udiResults = udiData.map((u: any) => ({
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
        const companyName = (item.company_name || '').toLowerCase();
        
        // 精确匹配得分最高
        if (name === queryLower || nameZh === queryLower || companyName === queryLower) {
          score += 100;
        }
        // 开头匹配
        else if (name.startsWith(queryLower) || nameZh.startsWith(queryLower) || companyName.startsWith(queryLower)) {
          score += 80;
        }
        // 包含匹配
        else if (name.includes(queryLower) || nameZh.includes(queryLower) || companyName.includes(queryLower)) {
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
          const companyScore = similarityScore(companyName, queryLower);
          score += Math.max(nameScore, nameZhScore, companyScore) * 50;
        }
        
        // 根据结果类型调整分数
        if (detectedType === 'product' && item.resultType === 'product') {
          score += 10;
        } else if (detectedType === 'company' && item.resultType === 'company') {
          score += 10;
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
