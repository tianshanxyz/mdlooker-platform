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

// 获取公司完整信息（包括注册统计）
async function getCompanyFullInfo(supabase: any, companyId: string) {
  // 并行获取所有注册信息
  const [
    { count: fdaCount },
    { count: nmpaCount },
    { count: eudamedCount },
    { count: pmdaCount },
    { count: hsaCount },
    { count: tgaCount },
    { count: healthCanadaCount },
    { count: mhraCount },
    { count: emaCount },
    { count: swissmedicCount },
    { count: mfdsCount },
    { count: anvisaCount },
    { data: warningLetters },
    { data: recalls }
  ] = await Promise.all([
    supabase.from('fda_registrations').select('*', { count: 'exact', head: true }).eq('company_id', companyId),
    supabase.from('nmpa_registrations').select('*', { count: 'exact', head: true }).eq('company_id', companyId),
    supabase.from('eudamed_registrations').select('*', { count: 'exact', head: true }).eq('company_id', companyId),
    supabase.from('pmda_registrations').select('*', { count: 'exact', head: true }).eq('company_id', companyId),
    supabase.from('hsa_registrations').select('*', { count: 'exact', head: true }).eq('company_id', companyId),
    supabase.from('tga_registrations').select('*', { count: 'exact', head: true }).eq('company_id', companyId),
    supabase.from('health_canada_registrations').select('*', { count: 'exact', head: true }).eq('company_id', companyId),
    supabase.from('mhra_registrations').select('*', { count: 'exact', head: true }).eq('company_id', companyId),
    supabase.from('ema_registrations').select('*', { count: 'exact', head: true }).eq('company_id', companyId),
    supabase.from('swissmedic_registrations').select('*', { count: 'exact', head: true }).eq('company_id', companyId),
    supabase.from('mfds_registrations').select('*', { count: 'exact', head: true }).eq('company_id', companyId),
    supabase.from('anvisa_registrations').select('*', { count: 'exact', head: true }).eq('company_id', companyId),
    supabase.from('regulatory_warning_letters').select('*').eq('company_id', companyId),
    supabase.from('regulatory_recalls').select('*').eq('company_id', companyId)
  ]);

  const totalRegistrations = 
    (fdaCount || 0) + 
    (nmpaCount || 0) + 
    (eudamedCount || 0) + 
    (pmdaCount || 0) + 
    (hsaCount || 0) + 
    (tgaCount || 0) + 
    (healthCanadaCount || 0) + 
    (mhraCount || 0) + 
    (emaCount || 0) + 
    (swissmedicCount || 0) + 
    (mfdsCount || 0) + 
    (anvisaCount || 0);

  const markets: string[] = [];
  if (fdaCount && fdaCount > 0) markets.push('USA');
  if (nmpaCount && nmpaCount > 0) markets.push('China');
  if (eudamedCount && eudamedCount > 0) markets.push('EU');
  if (pmdaCount && pmdaCount > 0) markets.push('Japan');
  if (hsaCount && hsaCount > 0) markets.push('Singapore');
  if (tgaCount && tgaCount > 0) markets.push('Australia');
  if (healthCanadaCount && healthCanadaCount > 0) markets.push('Canada');
  if (mhraCount && mhraCount > 0) markets.push('UK');

  const complianceScore = calculateComplianceScore(
    fdaCount || 0,
    nmpaCount || 0,
    eudamedCount || 0,
    (pmdaCount || 0) + (hsaCount || 0) + (tgaCount || 0),
    warningLetters?.length || 0,
    recalls?.length || 0
  );

  return {
    registration_count: totalRegistrations,
    compliance_score: complianceScore,
    markets: markets,
    device_classes: ['Class II', 'Class III'], // 简化处理
    regulatory_history: [
      ...(warningLetters || []).map((w: any) => ({
        type: 'alert',
        date: w.letter_date,
        description: w.subject || 'Warning Letter'
      })),
      ...(recalls || []).map((r: any) => ({
        type: 'recall',
        date: r.recall_initiation_date,
        description: r.product_description || 'Product Recall'
      }))
    ].slice(0, 5),
    registration_summary: {
      fda: fdaCount || 0,
      nmpa: nmpaCount || 0,
      eudamed: eudamedCount || 0,
      pmda: pmdaCount || 0,
      hsa: hsaCount || 0,
      tga: tgaCount || 0,
      health_canada: healthCanadaCount || 0,
      mhra: mhraCount || 0,
      ema: emaCount || 0,
      swissmedic: swissmedicCount || 0,
      mfds: mfdsCount || 0,
      anvisa: anvisaCount || 0
    }
  };
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
        
        let nmpaQuery = supabase
          .from('nmpa_registrations')
          .select(`
            *,
            company:companies(*)
          `, { count: 'exact' });

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
          console.log('[NMPA Search] Found:', nmpaData.length, 'records, sample:', nmpaData.slice(0, 2));
          console.log(`NMPA found ${nmpaData.length} records`);
          
          // 提取唯一的公司（包括通过company_name查找的）
          const companyMap = new Map();
          const companiesToFetch: string[] = [];
          
          nmpaData.forEach((n: any) => {
            if (n.company && n.company.id) {
              if (!companyMap.has(n.company.id)) {
                companyMap.set(n.company.id, n.company);
              }
            } else if (n.manufacturer || n.manufacturer_zh || n.registration_holder || n.registration_holder_zh) {
              // 如果没有关联公司，尝试通过制造商或注册持有人名称查找公司
              const companyName = n.manufacturer_zh || n.manufacturer || n.registration_holder_zh || n.registration_holder;
              if (companyName && !companiesToFetch.includes(companyName)) {
                companiesToFetch.push(companyName);
              }
            }
          });

          // 尝试通过名称查找未关联的公司
          if (companiesToFetch.length > 0) {
            for (const companyName of companiesToFetch) {
              const { data: foundCompanies } = await supabase
                .from('companies')
                .select('*')
                .or(`name.ilike.%${companyName}%,name_zh.ilike.%${companyName}%`)
                .limit(1);
              
              if (foundCompanies && foundCompanies.length > 0) {
                const foundCompany = foundCompanies[0];
                if (!companyMap.has(foundCompany.id)) {
                  companyMap.set(foundCompany.id, foundCompany);
                }
              }
            }
          }

          // 为每个公司获取完整信息
          const companyResults = await Promise.all(
            Array.from(companyMap.values()).map(async (company: any) => {
              const fullInfo = await getCompanyFullInfo(supabase, company.id);
              return {
                ...company,
                resultType: 'company',
                ...fullInfo,
                matched_via: 'nmpa_registration'
              };
            })
          );

          allResults = [...allResults, ...companyResults];
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
