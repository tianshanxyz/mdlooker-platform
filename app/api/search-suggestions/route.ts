import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '../../lib/supabase';

/**
 * GET /api/search-suggestions?q={query}&type={type}
 * Returns search suggestions based on query prefix
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const type = searchParams.get('type') || 'all';
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    if (!query || query.length < 2) {
      return NextResponse.json({ suggestions: [] });
    }

    const supabase = getSupabaseClient();
    const suggestions: Array<{ text: string; type: string; id?: string }> = [];

    // Search companies
    if (type === 'all' || type === 'company') {
      const { data: companies } = await supabase
        .from('companies')
        .select('id, name, name_zh')
        .or(`name.ilike.%${query}%,name_zh.ilike.%${query}%`)
        .limit(limit);

      companies?.forEach(company => {
        suggestions.push({
          text: company.name_zh || company.name,
          type: 'company',
          id: company.id,
        });
      });
    }

    // Search products
    if (type === 'all' || type === 'product') {
      const { data: products } = await supabase
        .from('products')
        .select('id, name, name_zh, category')
        .or(`name.ilike.%${query}%,name_zh.ilike.%${query}%`)
        .limit(limit);

      products?.forEach(product => {
        suggestions.push({
          text: product.name_zh || product.name,
          type: 'product',
          id: product.id,
        });
      });
    }

    // Search categories
    if (type === 'all' || type === 'category') {
      const { data: categories } = await supabase
        .from('products')
        .select('category')
        .ilike('category', `%${query}%`)
        .limit(limit);

      const uniqueCategories = [...new Set(categories?.map(p => p.category))];
      uniqueCategories.forEach(category => {
        if (category) {
          suggestions.push({
            text: category,
            type: 'category',
          });
        }
      });
    }

    return NextResponse.json({
      suggestions: suggestions.slice(0, limit),
      query,
    });

  } catch (error) {
    console.error('Search suggestions error:', error);
    return NextResponse.json(
      { error: 'Failed to get suggestions' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/search-suggestions/popular
 * Returns popular search terms
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { locale = 'en', type = 'all' } = body;

    const isZh = locale === 'zh';

    // Popular search terms by category
    const popularTerms = {
      companies: isZh ? [
        { text: '美敦力', icon: '🏥' },
        { text: '强生', icon: '💊' },
        { text: '西门子', icon: '🔬' },
        { text: '迈瑞', icon: '📊' },
        { text: '3M', icon: '🛡️' },
        { text: 'BD', icon: '💉' },
        { text: '飞利浦', icon: '💡' },
        { text: 'GE医疗', icon: '🏥' },
      ] : [
        { text: 'Medtronic', icon: '🏥' },
        { text: 'Johnson & Johnson', icon: '💊' },
        { text: 'Siemens', icon: '🔬' },
        { text: 'Mindray', icon: '📊' },
        { text: '3M', icon: '🛡️' },
        { text: 'BD', icon: '💉' },
        { text: 'Philips', icon: '💡' },
        { text: 'GE Healthcare', icon: '🏥' },
      ],
      products: isZh ? [
        { text: '口罩', icon: '😷' },
        { text: '注射器', icon: '💉' },
        { text: '手套', icon: '🧤' },
        { text: '导管', icon: '🩺' },
        { text: '监护仪', icon: '📈' },
        { text: '血糖仪', icon: '🩸' },
        { text: '轮椅', icon: '♿' },
        { text: '助听器', icon: '👂' },
      ] : [
        { text: 'mask', icon: '😷' },
        { text: 'syringe', icon: '💉' },
        { text: 'gloves', icon: '🧤' },
        { text: 'catheter', icon: '🩺' },
        { text: 'monitor', icon: '📈' },
        { text: 'glucose meter', icon: '🩸' },
        { text: 'wheelchair', icon: '♿' },
        { text: 'hearing aid', icon: '👂' },
      ],
      categories: isZh ? [
        { text: '个人防护设备', icon: '🛡️' },
        { text: '注射输液', icon: '💉' },
        { text: '伤口护理', icon: '🩹' },
        { text: '监护设备', icon: '📊' },
        { text: '手术器械', icon: '🔪' },
        { text: '康复设备', icon: '♿' },
      ] : [
        { text: 'Personal Protective Equipment', icon: '🛡️' },
        { text: 'Injection & Infusion', icon: '💉' },
        { text: 'Wound Care', icon: '🩹' },
        { text: 'Patient Monitoring', icon: '📊' },
        { text: 'Surgical Instruments', icon: '🔪' },
        { text: 'Rehabilitation', icon: '♿' },
      ],
    };

    let results: Array<{ text: string; icon: string; type: string }> = [];

    if (type === 'all' || type === 'company') {
      results = [...results, ...popularTerms.companies.map(t => ({ ...t, type: 'company' }))];
    }
    if (type === 'all' || type === 'product') {
      results = [...results, ...popularTerms.products.map(t => ({ ...t, type: 'product' }))];
    }
    if (type === 'all' || type === 'category') {
      results = [...results, ...popularTerms.categories.map(t => ({ ...t, type: 'category' }))];
    }

    return NextResponse.json({
      popular: results,
      locale,
    });

  } catch (error) {
    console.error('Popular terms error:', error);
    return NextResponse.json(
      { error: 'Failed to get popular terms' },
      { status: 500 }
    );
  }
}
