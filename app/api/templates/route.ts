import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category')
    const country = searchParams.get('country')
    const search = searchParams.get('search')

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    let query = supabase
      .from('document_templates')
      .select('*')
      .eq('is_active', true)
      .order('download_count', { ascending: false })

    if (category) {
      query = query.eq('category', category)
    }

    if (country) {
      query = query.eq('country', country)
    }

    if (search) {
      // Simple search in title and description
      query = query.or(`title.ilike.%${search}%,title_zh.ilike.%${search}%,description.ilike.%${search}%`)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching templates:', error)
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
    console.error('Error in templates API:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { template_id, user_email } = body

    if (!template_id || !user_email) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields'
      }, { status: 400 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Record download
    const { error } = await supabase
      .from('template_downloads')
      .insert({
        template_id,
        user_email,
        downloaded_at: new Date().toISOString()
      })

    if (error) {
      console.error('Error recording download:', error)
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 })
    }

    // Increment download count
    await supabase.rpc('increment_template_download', { template_id })

    return NextResponse.json({
      success: true,
      message: 'Download recorded'
    })

  } catch (error) {
    console.error('Error recording template download:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}
