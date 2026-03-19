import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const countries = searchParams.get('countries') // Comma-separated country codes
    const product = searchParams.get('product')

    if (!countries) {
      return NextResponse.json({
        success: false,
        error: 'Please provide countries parameter'
      }, { status: 400 })
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

    return NextResponse.json({
      success: true,
      data: data || [],
      total: data?.length || 0
    })

  } catch (error) {
    console.error('Error in compare API:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}
