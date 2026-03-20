import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '../../../lib/supabase';

const supabase = getSupabaseClient();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const locale = searchParams.get('locale') || 'zh';
    const includeFaqs = searchParams.get('include_faqs') === 'true';

    let query = supabase
      .from('faq_categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    const { data: categories, error } = await query;

    if (error) {
      console.error('Category fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
    }

    let result = categories?.map(cat => ({
      id: cat.id,
      name: locale === 'zh' ? cat.name_zh : cat.name_en,
      description: locale === 'zh' ? cat.description_zh : cat.description_en,
      icon: cat.icon,
      sortOrder: cat.sort_order,
    })) || [];

    // Include FAQ count for each category
    if (includeFaqs && result.length > 0) {
      const categoryIds = result.map(c => c.id);
      
      const { data: faqCounts } = await supabase
        .from('faqs')
        .select('category_id')
        .eq('is_active', true)
        .in('category_id', categoryIds);

      const countsMap = new Map();
      faqCounts?.forEach(faq => {
        countsMap.set(faq.category_id, (countsMap.get(faq.category_id) || 0) + 1);
      });

      result = result.map(cat => ({
        ...cat,
        faqCount: countsMap.get(cat.id) || 0
      }));
    }

    return NextResponse.json({
      success: true,
      data: result,
      total: result.length
    });

  } catch (error) {
    console.error('Categories API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
