import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '../../lib/supabase';

// [保持所有其他函数不变：levenshteinDistance, similarityScore, generateSuggestions, detectSearchType, calculateComplianceScore, getCompanyFullInfo]

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

    // 3. 搜索 NMPA 注册（修复版本：不依赖 company_id）
    if ((hasChinese || detectedType === 'general' || detectedType === 'company' || source === 'nmpa') && (source === 'all' || source === 'nmpa')) {
      try {
        console.log('[NMPA Search] Starting search for:', query);
        
        // 直接搜索 NMPA 数据，不关联 companies 表（因为 company_id 都是 NULL）
        let nmpaQuery = supabase
          .from('nmpa_registrations')
          .select('*', { count: 'exact' });

        if (searchTerms.length > 0) {
          const orConditions = searchTerms.map(term => {
            const cleanTerm = term.replace(/[%_]/g, '\\$&');
            return `product_name.ilike.%${cleanTerm}%,product_name_zh.ilike.%${cleanTerm}%,manufacturer.ilike.%${cleanTerm}%,manufacturer_zh.ilike.%${cleanTerm}%,registration_holder.ilike.%${cleanTerm}%,registration_holder_zh.ilike.%${cleanTerm}%,registration_number.ilike.%${cleanTerm}%`;
          }).join(',');
          nmpaQuery = nmpaQuery.or(orConditions);
        }

        const { data: nmpaData, error, count } = await nmpaQuery
          .range(0, pageSize * 3 - 1)
          .order('approval_date', { ascending: false });

        if (error) {
          console.error('[NMPA Search] Error:', error);
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
              // 创建虚拟公司记录
              const nmpaCount = nmpaData.filter(n => 
                (n.manufacturer_zh || n.manufacturer) === manufacturer
              ).length;
              
              allResults.push({
                id: `nmpa_${manufacturer}`,
                name: manufacturer,
                name_zh: manufacturer,
                country: 'China',
                resultType: 'company',
                registration_count: nmpaCount,
                compliance_score: 50 + Math.min(nmpaCount * 2, 30),
                markets: ['China'],
                device_classes: ['Class II', 'Class III'],
                regulatory_history: [],
                registration_summary: {
                  fda: 0, nmpa: nmpaCount, eudamed: 0, pmda: 0, hsa: 0, tga: 0,
                  health_canada: 0, mhra: 0, ema: 0, swissmedic: 0, mfds: 0, anvisa: 0
                },
                matched_via: 'nmpa_registration'
              });
            }
          }
          
          totalCount += (count || 0);
        }
      } catch (err) {
        console.error('[NMPA Search] Exception:', err);
      }
    }

    // 去重
    const uniqueResults = Array.from(new Map(allResults.map(item => [item.id, item])).values());

    // 计算匹配分数并排序
    if (query && uniqueResults.length > 0) {
      const queryLower = query.toLowerCase();
      const scoredResults = uniqueResults.map((item: any) => {
        let score = 0;
        const name = (item.name || '').toLowerCase();
        const nameZh = (item.name_zh || '').toLowerCase();
        
        if (name === queryLower || nameZh === queryLower) score += 100;
        else if (name.startsWith(queryLower) || nameZh.startsWith(queryLower)) score += 80;
        else if (name.includes(queryLower) || nameZh.includes(queryLower)) score += 60;
        else {
          score += Math.max(similarityScore(name, queryLower), similarityScore(nameZh, queryLower)) * 50;
        }
        
        return { ...item, matchScore: score };
      });
      
      scoredResults.sort((a: any, b: any) => b.matchScore - a.matchScore);
      allResults = scoredResults;
    } else {
      allResults = uniqueResults;
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
      { error: 'Search failed', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}
