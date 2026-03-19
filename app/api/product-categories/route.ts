import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search')

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    let query = supabase
      .from('product_categories')
      .select('*')
      .order('level', { ascending: true })
      .order('name', { ascending: true })

    if (search) {
      // Search in name or name_zh
      query = query.or(`name.ilike.%${search}%,name_zh.ilike.%${search}%`)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching product categories:', error)
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 })
    }

    // Build category tree
    const buildTree = (categories: any[], parentId: string | null = null) => {
      return categories
        .filter(cat => cat.parent_id === parentId)
        .map(cat => ({
          ...cat,
          children: buildTree(categories, cat.id)
        }))
    }

    const tree = buildTree(data || [])

    return NextResponse.json({
      success: true,
      data: tree,
      total: data?.length || 0
    })

  } catch (error) {
    console.error('Error in product-categories API:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}
