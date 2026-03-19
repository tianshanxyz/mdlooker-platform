import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// 预设国家列表（如果数据库没有数据时使用）
const DEFAULT_COUNTRIES = [
  { code: 'SG', name: 'Singapore', name_zh: '新加坡', region: '东南亚' },
  { code: 'MY', name: 'Malaysia', name_zh: '马来西亚', region: '东南亚' },
  { code: 'TH', name: 'Thailand', name_zh: '泰国', region: '东南亚' },
  { code: 'ID', name: 'Indonesia', name_zh: '印度尼西亚', region: '东南亚' },
  { code: 'VN', name: 'Vietnam', name_zh: '越南', region: '东南亚' },
  { code: 'PH', name: 'Philippines', name_zh: '菲律宾', region: '东南亚' },
  { code: 'CN', name: 'China', name_zh: '中国', region: '东亚' },
  { code: 'JP', name: 'Japan', name_zh: '日本', region: '东亚' },
  { code: 'KR', name: 'South Korea', name_zh: '韩国', region: '东亚' },
  { code: 'IN', name: 'India', name_zh: '印度', region: '南亚' },
  { code: 'US', name: 'United States', name_zh: '美国', region: '北美' },
  { code: 'CA', name: 'Canada', name_zh: '加拿大', region: '北美' },
  { code: 'GB', name: 'United Kingdom', name_zh: '英国', region: '欧洲' },
  { code: 'DE', name: 'Germany', name_zh: '德国', region: '欧洲' },
  { code: 'FR', name: 'France', name_zh: '法国', region: '欧洲' },
  { code: 'IT', name: 'Italy', name_zh: '意大利', region: '欧洲' },
  { code: 'ES', name: 'Spain', name_zh: '西班牙', region: '欧洲' },
  { code: 'AU', name: 'Australia', name_zh: '澳大利亚', region: '大洋洲' },
  { code: 'NZ', name: 'New Zealand', name_zh: '新西兰', region: '大洋洲' },
  { code: 'BR', name: 'Brazil', name_zh: '巴西', region: '南美' },
  { code: 'MX', name: 'Mexico', name_zh: '墨西哥', region: '北美' },
  { code: 'AE', name: 'United Arab Emirates', name_zh: '阿联酋', region: '中东' },
  { code: 'SA', name: 'Saudi Arabia', name_zh: '沙特阿拉伯', region: '中东' },
  { code: 'ZA', name: 'South Africa', name_zh: '南非', region: '非洲' },
]

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search')
    const region = searchParams.get('region')

    // 如果数据库有国家表，从数据库查询
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // 尝试从 market_access_guides 表获取国家列表
    const { data: guidesData } = await supabase
      .from('market_access_guides')
      .select('country, country_name')
      .eq('is_active', true)

    let countries = DEFAULT_COUNTRIES

    if (guidesData && guidesData.length > 0) {
      // 从指南数据中提取国家
      const countryMap = new Map()
      guidesData.forEach(guide => {
        if (!countryMap.has(guide.country)) {
          const defaultCountry = DEFAULT_COUNTRIES.find(c => c.code === guide.country)
          countryMap.set(guide.country, {
            code: guide.country,
            name: guide.country_name || defaultCountry?.name || guide.country,
            name_zh: defaultCountry?.name_zh || guide.country_name || guide.country,
            region: defaultCountry?.region || '其他'
          })
        }
      })
      countries = Array.from(countryMap.values())
    }

    // 过滤
    if (search) {
      countries = countries.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.name_zh.includes(search) ||
        c.code.toLowerCase().includes(search.toLowerCase())
      )
    }

    if (region) {
      countries = countries.filter(c => c.region === region)
    }

    // 按地区排序
    countries.sort((a, b) => a.region.localeCompare(b.region) || a.name.localeCompare(b.name))

    return NextResponse.json({
      success: true,
      data: countries,
      total: countries.length
    })

  } catch (error) {
    console.error('Error in countries API:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}
