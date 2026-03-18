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
  
  if (/^[0-9]{14}$/.test(query) || query.includes('(01)') || query.includes('UDI')) {
    return 'udi';
  }
  
  const companyIndicators = ['inc', 'corp', 'ltd', 'company', 'co.', 'medical', 'health', 'device', 'technology', 'pharma'];
  if (companyIndicators.some(ind => queryLower.includes(ind))) {
    return 'company';
  }
  
  const productIndicators = ['mask', 'glove', 'syringe', 'catheter', 'stent', 'implant', 'surgical', 'dental', 'orthopedic'];
  if (productIndicators.some(ind => queryLower.includes(ind))) {
    return 'product';
  }
  
  return 'general';
}

// 计算合规评分
function calculateComplianceScore(
  fdaCount: number,
  nmpaCount: number,
  eudamedCount: number,
  otherCount: number,
  warningLetters: number,
  recalls: number
): number {
  let score = 50; // 基础分

  // 注册数量加分
  score += Math.min(fdaCount * 2, 20);
  score += Math.min(nmpaCount * 2, 15);
  score += Math.min(eudamedCount * 2, 15);
  score += Math.min(otherCount * 1, 10);

  // 合规历史减分
  score -= warningLetters * 5;
  score -= recalls * 10;

  return Math.max(0, Math.min(100, score));
}

// 监管机构配置
const REGULATORY_AGENCIES = [
  { table: 'fda_registrations', market: 'USA', key: 'fda' },
  { table: 'nmpa_registrations', market: 'China', key: 'nmpa' },
  { table: 'eudamed_registrations', market: 'EU', key: 'eudamed' },
  { table: 'pmda_registrations', market: 'Japan', key: 'pmda' },
  { table: 'hsa_registrations', market: 'Singapore', key: 'hsa' },
  { table: 'tga_registrations', market: 'Australia', key: 'tga' },
  { table: 'health_canada_registrations', market: 'Canada', key: 'health_canada' },
  { table: 'mhra_registrations', market: 'UK', key: 'mhra' },
  { table: 'ema_registrations', market: 'EU', key: 'ema' },
  { table: 'swissmedic_registrations', market: 'Switzerland', key: 'swissmedic' },
  { table: 'mfds_registrations', market: 'Korea', key: 'mfds' },
  { table: 'anvisa_registrations', market: 'Brazil', key: 'anvisa' }
] as const;

// 获取单个监管机构的注册数量
async function getRegistrationCount(
  supabase: any,
  companyId: string,
  table: string
): Promise<number> {
  const { count } = await supabase
    .from(table)
    .select('*', { count: 'exact', head: true })
    .eq('company_id', companyId);
  return count || 0;
}

// 并行获取所有监管机构的注册数量
async function getAllRegistrationCounts(
  supabase: any,
  companyId: string
): Promise<Record<string, number>> {
  const counts = await Promise.all(
    REGULATORY_AGENCIES.map(async (agency) => ({
      key: agency.key,
      count: await getRegistrationCount(supabase, companyId, agency.table)
    }))
  );

  return counts.reduce((acc, { key, count }) => {
    acc[key] = count;
    return acc;
  }, {} as Record<string, number>);
}

// 获取监管历史记录
async function getRegulatoryHistory(
  supabase: any,
  companyId: string
): Promise<{ warningLetters: any[]; recalls: any[] }> {
  const [warningLetters, recalls] = await Promise.all([
    supabase.from('regulatory_warning_letters').select('*').eq('company_id', companyId),
    supabase.from('regulatory_recalls').select('*').eq('company_id', companyId)
  ]);

  return {
    warningLetters: warningLetters.data || [],
    recalls: recalls.data || []
  };
}

// 构建市场列表
function buildMarkets(counts: Record<string, number>): string[] {
  return REGULATORY_AGENCIES
    .filter(agency => counts[agency.key] > 0)
    .map(agency => agency.market);
}

// 计算总注册数
function calculateTotalRegistrations(counts: Record<string, number>): number {
  return Object.values(counts).reduce((sum, count) => sum + count, 0);
}

// 格式化监管历史记录
function formatRegulatoryHistory(
  warningLetters: any[],
  recalls: any[]
): Array<{ type: string; date: string; description: string }> {
  return [
    ...warningLetters.map(w => ({
      type: 'alert',
      date: w.letter_date,
      description: w.subject || 'Warning Letter'
    })),
    ...recalls.map(r => ({
      type: 'recall',
      date: r.recall_initiation_date,
      description: r.product_description || 'Product Recall'
    }))
  ].slice(0, 5);
}

// 构建注册摘要
function buildRegistrationSummary(counts: Record<string, number>): Record<string, number> {
  return counts;
}

// 获取公司完整信息（包括注册统计）
async function getCompanyFullInfo(supabase: any, companyId: string) {
  // 1. 并行获取所有数据
  const [counts, { warningLetters, recalls }] = await Promise.all([
    getAllRegistrationCounts(supabase, companyId),
    getRegulatoryHistory(supabase, companyId)
  ]);

  // 2. 计算总注册数和市场列表
  const totalRegistrations = calculateTotalRegistrations(counts);
  const markets = buildMarkets(counts);

  // 3. 计算合规评分
  const complianceScore = calculateComplianceScore(
    counts.fda,
    counts.nmpa,
    counts.eudamed,
    counts.pmda + counts.hsa + counts.tga,
    warningLetters.length,
    recalls.length
  );

  // 4. 返回结果
  return {
    registration_count: totalRegistrations,
    compliance_score: complianceScore,
    markets: markets,
    device_classes: ['Class II', 'Class III'], // 简化处理
    regulatory_history: formatRegulatoryHistory(warningLetters, recalls),
    registration_summary: buildRegistrationSummary(counts)
  };
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
  const country = searchParams.get('country');
  const certificateStatus = searchParams.get('certificateStatus');
  const companyType = searchParams.get('companyType');
  const hasFDA = searchParams.get('hasFDA') === 'true';
  const hasNMPA = searchParams.get('hasNMPA') === 'true';
  const hasEUDAMED = searchParams.get('hasEUDAMED') === 'true';
  const searchType = searchParams.get('type') || 'auto';
  const source = searchParams.get('source') || 'all';

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
        // 为每个公司获取完整信息
        const companiesWithInfo = await Promise.all(
          companies.map(async (company: any) => {
            const fullInfo = await getCompanyFullInfo(supabase, company.id);
            return {
              ...company,
              resultType: 'company',
              ...fullInfo
            };
          })
        );
        allResults = companiesWithInfo;
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

    // 3. 搜索NMPA注册 (中国) - 通过产品/公司名称反查公司
    if ((hasChinese || detectedType === 'general' || detectedType === 'company' || source === 'nmpa') && (source === 'all' || source === 'nmpa')) {
      try {
        console.log('[NMPA Search] Query:', query, 'hasChinese:', hasChinese, 'searchTerms:', searchTerms);
        
        // NMPA 表的 company_id 都是 NULL，所以不关联 companies 表
        let nmpaQuery = supabase
          .from('nmpa_registrations')
          .select('*', { count: 'exact' });

        if (searchTerms.length > 0) {
          const orConditions = searchTerms.map(term => {
            const cleanTerm = term.replace(/[%_]/g, '\\$&');
            // NMPA表使用 manufacturer/registration_holder 而不是 company_name
            return `product_name.ilike.%${cleanTerm}%,product_name_zh.ilike.%${cleanTerm}%,manufacturer.ilike.%${cleanTerm}%,manufacturer_zh.ilike.%${cleanTerm}%,registration_holder.ilike.%${cleanTerm}%,registration_holder_zh.ilike.%${cleanTerm}%,registration_number.ilike.%${cleanTerm}%`;
          }).join(',');
          nmpaQuery = nmpaQuery.or(orConditions);
        }

        const { data: nmpaData, error, count } = await nmpaQuery
          .range(0, pageSize - 1)
          .order('approval_date', { ascending: false });

        if (error) {
          console.error('NMPA search error:', error);
        } else if (nmpaData && nmpaData.length > 0) {
          console.log('[NMPA Search] Found', nmpaData.length, 'records');
          
          // 提取唯一的制造商名称
          const manufacturerNames = new Set<string>();
          nmpaData.forEach((n: any) => {
            const name = n.manufacturer_zh || n.manufacturer;
            if (name) manufacturerNames.add(name);
          });
          
          console.log('[NMPA Search] Manufacturers:', Array.from(manufacturerNames));
          
          // 为每个制造商创建公司记录
          for (const manufacturer of Array.from(manufacturerNames)) {
            // 先在 companies 表中查找
            const { data: foundCompanies } = await supabase
              .from('companies')
              .select('*')
              .or(`name_zh.ilike.%${manufacturer}%,name.ilike.%${manufacturer}%`)
              .limit(1);
            
            if (foundCompanies && foundCompanies.length > 0) {
              // 找到匹配的公司
              const company = foundCompanies[0];
              const fullInfo = await getCompanyFullInfo(supabase, company.id);
              allResults.push({
                ...company,
                resultType: 'company',
                ...fullInfo,
                matched_via: 'nmpa_registration'
              });
            } else {
              // 创建公司记录（写入数据库）
              const createResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'https://www.mdlooker.com'}/api/companies/create-from-nmpa`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ manufacturer, manufacturer_zh: manufacturer })
              });
              
              const created = await createResponse.json();
              
              if (created.id) {
                const fullInfo = await getCompanyFullInfo(supabase, created.id);
                allResults.push({
                  id: created.id,
                  name: manufacturer,
                  name_zh: manufacturer,
                  country: 'China',
                  resultType: 'company',
                  ...fullInfo,
                  matched_via: 'nmpa_registration',
                  newly_created: created.created
                });
              }
            }
          }
          
          totalCount += (count || 0);
        } else {
          console.log('[NMPA Search] No data found');
        }
      } catch (err) {
        console.error('NMPA search exception:', err);
      }
    }

    // 4. 搜索FDA注册
    if ((source === 'all' || source === 'fda') && !hasNMPA && !hasEUDAMED) {
      const { data: fdaData, error } = await supabase
        .from('fda_registrations')
        .select(`
          *,
          company:companies(*)
        `)
        .or(searchTerms.map(term => {
          const cleanTerm = term.replace(/[%_]/g, '\\$&');
          // FDA表没有company_name字段，使用关联查询
          return `device_name.ilike.%${cleanTerm}%,device_description.ilike.%${cleanTerm}%`;
        }).join(','))
        .limit(pageSize);

      if (!error && fdaData) {
        const companyMap = new Map();
        fdaData.forEach((f: any) => {
          // FDA通过company_id关联到companies表
          if (f.company && f.company.id) {
            if (!companyMap.has(f.company.id)) {
              companyMap.set(f.company.id, f.company);
            }
          }
        });

        const companyResults = await Promise.all(
          Array.from(companyMap.values()).map(async (company: any) => {
            const fullInfo = await getCompanyFullInfo(supabase, company.id);
            return {
              ...company,
              resultType: 'company',
              ...fullInfo,
              matched_via: 'fda_registration'
            };
          })
        );

        allResults = [...allResults, ...companyResults];
      }
    }

    // 去重 - 基于公司ID
    const uniqueResults = Array.from(new Map(allResults.map(item => [item.id, item])).values());

    // 计算匹配分数并排序
    if (query && uniqueResults.length > 0) {
      const queryLower = query.toLowerCase();
      
      const scoredResults = uniqueResults.map((item: any) => {
        let score = 0;
        const name = (item.name || '').toLowerCase();
        const nameZh = (item.name_zh || '').toLowerCase();
        const description = (item.description || '').toLowerCase();
        
        if (name === queryLower || nameZh === queryLower) {
          score += 100;
        } else if (name.startsWith(queryLower) || nameZh.startsWith(queryLower)) {
          score += 80;
        } else if (name.includes(queryLower) || nameZh.includes(queryLower)) {
          score += 60;
        } else if (description.includes(queryLower)) {
          score += 40;
        } else {
          const nameScore = similarityScore(name, queryLower);
          const nameZhScore = similarityScore(nameZh, queryLower);
          score += Math.max(nameScore, nameZhScore) * 50;
        }
        
        if (detectedType === 'product' && item.resultType === 'product') {
          score += 10;
        } else if (detectedType === 'company' && item.resultType === 'company') {
          score += 10;
        }
        
        return { ...item, matchScore: score };
      });
      
      scoredResults.sort((a: any, b: any) => b.matchScore - a.matchScore);
      allResults = scoredResults;
    } else {
      allResults = uniqueResults;
    }

    // 过滤有特定注册的公司
    if (hasFDA || hasNMPA || hasEUDAMED) {
      if (hasFDA) {
        allResults = allResults.filter((c: any) => 
          c.registration_summary?.fda > 0
        );
      }
      
      if (hasNMPA) {
        allResults = allResults.filter((c: any) => 
          c.registration_summary?.nmpa > 0
        );
      }
      
      if (hasEUDAMED) {
        allResults = allResults.filter((c: any) => 
          c.registration_summary?.eudamed > 0
        );
      }
    }

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
