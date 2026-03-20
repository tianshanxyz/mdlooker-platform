import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// 缓存机制
const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 分钟缓存

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const countries = searchParams.get('countries')
    const product = searchParams.get('product')

    if (!countries) {
      return NextResponse.json({
        success: false,
        error: 'Please provide countries parameter'
      }, { status: 400 })
    }

    // 生成缓存键
    const cacheKey = `compare:${countries}:${product || ''}`
    
    // 检查缓存
    const cached = cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json(cached.data)
    }

    const countryList = countries.split(',').map(c => c.trim())
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    let query = supabase
      .from('market_access_guides')
      .select(`
        *,
        product_categories (
          id,
          name,
          name_zh,
          code
        )
      `)
      .eq('is_active', true)
      .in('country', countryList)

    if (product) {
      query = query.eq('product_category_id', product)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching comparison data:', error)
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 })
    }

    const responseData = {
      success: true,
      data: data || [],
      total: data?.length || 0
    }

    // 写入缓存
    cache.set(cacheKey, {
      data: responseData,
      timestamp: Date.now()
    })

    return NextResponse.json(responseData)

  } catch (error) {
    console.error('Error in compare API:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}
