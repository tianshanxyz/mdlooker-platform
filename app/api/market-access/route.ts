import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const product = searchParams.get('product')
    const country = searchParams.get('country')
    const keywords = searchParams.get('keywords')

    if (!product && !keywords) {
      return NextResponse.json({
        success: false,
        error: 'Please provide product category or keywords'
      }, { status: 400 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Build query
    let query = supabase
      .from('market_access_guides')
      .select(`
        *,
        product_categories (
          id,
          name,
          name_zh,
          code,
          level
        )
      `)
      .eq('is_active', true)

    // Filter by country
    if (country) {
      query = query.eq('country', country)
    }

    // Filter by product category or keywords
    if (product) {
      query = query.eq('product_category_id', product)
    }

    if (keywords) {
      // Search in product_keywords array
      query = query.contains('product_keywords', [keywords])
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching market access data:', error)
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 })
    }

    // Get all templates
    const { data: templates } = await supabase
      .from('document_templates')
      .select('*')
      .eq('is_active', true)
      .eq('is_free', true)
      .limit(10)

    return NextResponse.json({
      success: true,
      data: data || [],
      templates: templates || [],
      total: data?.length || 0
    })

  } catch (error) {
    console.error('Error in market-access API:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}
