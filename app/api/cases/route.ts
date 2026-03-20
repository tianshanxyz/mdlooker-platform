import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '../../lib/supabase';

const supabase = getSupabaseClient();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const locale = searchParams.get('locale') || 'zh';
    const featured = searchParams.get('featured') === 'true';
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    let query = supabase
      .from('customer_cases')
      .select('*')
      .eq('is_published', true);

    if (featured) {
      query = query.eq('is_featured', true);
    }

    const { data: cases, error } = await query
      .order('sort_order', { ascending: true })
      .limit(limit);

    if (error) {
      console.error('Customer cases fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch customer cases' }, { status: 500 });
    }

    const transformedCases = cases?.map(c => ({
      id: c.id,
      companyName: locale === 'zh' && c.company_name_zh ? c.company_name_zh : c.company_name,
      description: locale === 'zh' && c.description_zh ? c.description_zh : c.description_en,
      challenge: locale === 'zh' && c.challenge_zh ? c.challenge_zh : c.challenge_en,
      solution: locale === 'zh' && c.solution_zh ? c.solution_zh : c.solution_en,
      results: c.results,
      targetCountries: c.target_countries,
      targetProducts: c.target_products,
      timeline: c.timeline,
      testimonial: locale === 'zh' && c.testimonial_zh ? c.testimonial_zh : c.testimonial_en,
      testimonialAuthor: c.testimonial_author,
      testimonialTitle: c.testimonial_title,
      logoUrl: c.logo_url,
      isFeatured: c.is_featured,
    })) || [];

    return NextResponse.json({
      success: true,
      data: transformedCases,
      total: transformedCases.length
    });

  } catch (error) {
    console.error('Customer cases API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
