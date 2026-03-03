import { NextResponse } from 'next/server';
import { getSupabaseClient } from '../../../lib/supabase';

export async function GET() {
  try {
    const supabase = getSupabaseClient();
    
    // 检查NMPA表总数
    const { count: totalCount, error: countError } = await supabase
      .from('nmpa_registrations')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      return NextResponse.json({ error: 'Count error', details: countError }, { status: 500 });
    }
    
    // 获取样本数据
    const { data: samples, error: sampleError } = await supabase
      .from('nmpa_registrations')
      .select('id, product_name, company_name, company_id, registration_number')
      .limit(10);
    
    if (sampleError) {
      return NextResponse.json({ error: 'Sample error', details: sampleError }, { status: 500 });
    }
    
    // 测试搜索
    const { data: searchResults, error: searchError } = await supabase
      .from('nmpa_registrations')
      .select('*')
      .or('product_name.ilike.%晶硕%,company_name.ilike.%晶硕%')
      .limit(5);
    
    return NextResponse.json({
      totalCount,
      samples,
      searchTest: {
        query: '晶硕',
        results: searchResults,
        error: searchError
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Debug error', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}
