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

// 模糊匹配函数
function fuzzyMatch(text: string, query: string): boolean {
  const textLower = text.toLowerCase();
  const queryLower = query.toLowerCase();
  
  // 直接包含
  if (textLower.includes(queryLower)) return true;
  
  // 相似度匹配
  const words = textLower.split(/\s+/);
  for (const word of words) {
    if (similarityScore(word, queryLower) > 0.6) return true;
  }
  
  return false;
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

  try {
    const supabase = getSupabaseClient();
    let dbQuery = supabase
      .from('companies')
      .select('*', { count: 'exact' });

    if (query) {
      // 使用 PostgreSQL 的模糊搜索
      // 1. 首先尝试精确匹配
      // 2. 然后尝试相似度匹配
      const searchTerms = query.split(/\s+/).filter(term => term.length > 0);
      
      if (searchTerms.length > 0) {
        // 构建 OR 条件，支持多个关键词
        const orConditions = searchTerms.map(term => {
          const cleanTerm = term.replace(/[%_]/g, '\\$&');
          return `name.ilike.%${cleanTerm}%,name_zh.ilike.%${cleanTerm}%,description.ilike.%${cleanTerm}%`;
        }).join(',');
        
        dbQuery = dbQuery.or(orConditions);
      }
    }

    if (country) {
      dbQuery = dbQuery.eq('country', country);
    }

    const { data: companies, error, count } = await dbQuery
      .range((page - 1) * pageSize, page * pageSize - 1)
      .order('name', { ascending: true });

    if (error) {
      throw error;
    }

    let filteredCompanies = companies || [];

    // 如果有查询词，进行客户端模糊匹配排序
    if (query && filteredCompanies.length > 0) {
      const queryLower = query.toLowerCase();
      
      // 计算每个公司的匹配分数
      const scoredCompanies = filteredCompanies.map((company: any) => {
        let score = 0;
        const name = (company.name || '').toLowerCase();
        const nameZh = (company.name_zh || '').toLowerCase();
        const description = (company.description || '').toLowerCase();
        
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
        
        return { ...company, matchScore: score };
      });
      
      // 按匹配分数排序
      scoredCompanies.sort((a: any, b: any) => b.matchScore - a.matchScore);
      filteredCompanies = scoredCompanies;
    }

    // 过滤有特定注册的公司
    if (hasFDA || hasNMPA || hasEUDAMED) {
      const companyIds = filteredCompanies.map((c: any) => c.id);
      
      if (hasFDA && companyIds.length > 0) {
        const { data: fdaData } = await supabase
          .from('fda_registrations')
          .select('company_id')
          .in('company_id', companyIds);
        const fdaCompanyIds = new Set(fdaData?.map((r: any) => r.company_id) || []);
        filteredCompanies = filteredCompanies.filter((c: any) => fdaCompanyIds.has(c.id));
      }
      
      if (hasNMPA && filteredCompanies.length > 0) {
        const companyIds = filteredCompanies.map((c: any) => c.id);
        const { data: nmpaData } = await supabase
          .from('nmpa_registrations')
          .select('company_id')
          .in('company_id', companyIds);
        const nmpaCompanyIds = new Set(nmpaData?.map((r: any) => r.company_id) || []);
        filteredCompanies = filteredCompanies.filter((c: any) => nmpaCompanyIds.has(c.id));
      }
      
      if (hasEUDAMED && filteredCompanies.length > 0) {
        const companyIds = filteredCompanies.map((c: any) => c.id);
        const { data: eudamedData } = await supabase
          .from('eudamed_registrations')
          .select('company_id')
          .in('company_id', companyIds);
        const eudamedCompanyIds = new Set(eudamedData?.map((r: any) => r.company_id) || []);
        filteredCompanies = filteredCompanies.filter((c: any) => eudamedCompanyIds.has(c.id));
      }
    }

    return NextResponse.json({
      companies: filteredCompanies,
      total: count || 0,
      page,
      pageSize,
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Search failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
