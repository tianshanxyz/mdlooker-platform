import { NextResponse } from 'next/server';
import { getSupabaseClient } from '../../../lib/supabase';

export async function GET(request: Request) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '测试';
    const hasChinese = /[\u4e00-\u9fa5]/.test(query);
    
    console.log('Testing search for:', query, 'hasChinese:', hasChinese);
    
    // 测试1: NMPA表 - 使用正确的字段名
    let nmpaQuery = supabase
      .from('nmpa_registrations')
      .select('id, product_name, product_name_zh, manufacturer, manufacturer_zh, registration_number, company_id', { count: 'exact' });

    if (hasChinese) {
      nmpaQuery = nmpaQuery.or(`product_name_zh.ilike.%${query}%,manufacturer_zh.ilike.%${query}%`);
    } else {
      nmpaQuery = nmpaQuery.or(`product_name.ilike.%${query}%,manufacturer.ilike.%${query}%`);
    }

    const { data: nmpaData, error: nmpaError, count: nmpaCount } = await nmpaQuery.limit(5);
    
    // 测试2: 获取NMPA样本
    const { data: nmpaSample } = await supabase
      .from('nmpa_registrations')
      .select('id, product_name, product_name_zh, manufacturer, manufacturer_zh, company_id')
      .limit(3);
    
    // 测试3: 获取companies表样本
    const { data: companiesSample } = await supabase
      .from('companies')
      .select('id, name, name_zh')
      .limit(5);
    
    return NextResponse.json({
      query,
      hasChinese,
      nmpa: {
        searchCount: nmpaCount,
        searchResults: nmpaData,
        sample: nmpaSample,
        error: nmpaError?.message
      },
      companies: {
        sample: companiesSample
      }
    });
  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json(
      { error: 'Debug error', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}
