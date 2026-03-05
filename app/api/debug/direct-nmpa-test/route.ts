import { NextResponse } from 'next/server';
import { getSupabaseClient } from '../../../lib/supabase';

export async function GET(request: Request) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '晶硕';
    
    console.log('=== 直接测试 NMPA 搜索 ===');
    console.log('Query:', query);
    
    // 测试 1: 直接使用 Supabase 客户端查询
    const test1 = await supabase
      .from('nmpa_registrations')
      .select('id, product_name_zh, manufacturer_zh, company_id')
      .ilike('product_name_zh', `%${query}%`)
      .limit(5);
    
    console.log('Test 1 (product_name_zh):', {
      count: test1.data?.length,
      error: test1.error?.message,
      data: test1.data?.slice(0, 2)
    });
    
    // 测试 2: 搜索 manufacturer_zh
    const test2 = await supabase
      .from('nmpa_registrations')
      .select('id, product_name_zh, manufacturer_zh, company_id')
      .ilike('manufacturer_zh', `%${query}%`)
      .limit(5);
    
    console.log('Test 2 (manufacturer_zh):', {
      count: test2.data?.length,
      error: test2.error?.message,
      data: test2.data?.slice(0, 2)
    });
    
    // 测试 3: 使用 OR 条件
    const test3 = await supabase
      .from('nmpa_registrations')
      .select('id, product_name_zh, manufacturer_zh, company_id')
      .or(`product_name_zh.ilike.%${query}%,manufacturer_zh.ilike.%${query}%`)
      .limit(5);
    
    console.log('Test 3 (OR condition):', {
      count: test3.data?.length,
      error: test3.error?.message,
      data: test3.data?.slice(0, 2)
    });
    
    // 测试 4: 获取随机样本
    const test4 = await supabase
      .from('nmpa_registrations')
      .select('id, product_name_zh, manufacturer_zh')
      .limit(3);
    
    return NextResponse.json({
      query,
      tests: {
        test1: {
          method: 'product_name_zh ILIKE',
          count: test1.data?.length || 0,
          error: test1.error?.message,
          data: test1.data
        },
        test2: {
          method: 'manufacturer_zh ILIKE',
          count: test2.data?.length || 0,
          error: test2.error?.message,
          data: test2.data
        },
        test3: {
          method: 'OR condition',
          count: test3.data?.length || 0,
          error: test3.error?.message,
          data: test3.data
        },
        test4: {
          method: 'Sample data',
          count: test4.data?.length || 0,
          data: test4.data
        }
      }
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Test failed', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}
