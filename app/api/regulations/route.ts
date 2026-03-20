import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// 缓存机制
const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 分钟

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const country = searchParams.get('country')
    const importance = searchParams.get('importance')
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '20')

    // 生成缓存键
    const cacheKey = `regulations:${country || ''}:${importance || ''}:${category || ''}`
    
    // 检查缓存
    const cached = cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json(cached.data)
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    let query = supabase
      .from('regulation_updates')
      .select('*')
      .eq('is_active', true)
      .order('published_date', { ascending: false })
      .limit(limit)

    if (country) {
      query = query.eq('country', country)
    }

    if (importance) {
      query = query.eq('importance', importance)
    }

    if (category) {
      query = query.contains('product_categories', [category])
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching regulations:', error)
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
    console.error('Error in regulations API:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      user_email,
      countries = [],
      product_categories = [],
      importance_filter = ['high', 'critical'],
      frequency = 'immediate',
      notification_types = ['email']
    } = body

    if (!user_email) {
      return NextResponse.json({
        success: false,
        error: 'Email is required'
      }, { status: 400 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // 检查是否已存在订阅
    const { data: existing } = await supabase
      .from('user_subscriptions')
      .select('id')
      .eq('user_email', user_email)
      .single()

    let result

    if (existing) {
      // 更新订阅
      result = await supabase
        .from('user_subscriptions')
        .update({
          countries,
          product_categories,
          importance_filter,
          frequency,
          notification_types,
          is_active: true,
          updated_at: new Date().toISOString()
        })
        .eq('user_email', user_email)
        .select()
        .single()
    } else {
      // 新建订阅
      result = await supabase
        .from('user_subscriptions')
        .insert({
          user_email,
          countries,
          product_categories,
          importance_filter,
          frequency,
          notification_types,
          is_active: true
        })
        .select()
        .single()
    }

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Subscription successful'
    })

  } catch (error) {
    console.error('Error subscribing to regulations:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}
