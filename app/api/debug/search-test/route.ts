import { NextResponse } from 'next/server';
import { getSupabaseClient } from '../../../lib/supabase';

export async function GET(request: Request) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '晶硕';
    
    console.log('Testing search for:', query);
    
    // 测试1: 直接查询NMPA表
    const { data: nmpaData, error: nmpaError, count: nmpaCount } = await supabase
      .from('nmpa_registrations')
      .select('*', { count: 'exact' })
      .or(`product_name.ilike.%${query}%,company_name.ilike.%${query}%`)
      .limit(5);
    
    // 测试2: 直接查询EUDAMED表
    const { data: eudamedData, error: eudamedError, count: eudamedCount } = await supabase
      .from('eudamed_registrations')
      .select('*', { count: 'exact' })
      .or(`device_name.ilike.%${query}%,actor_name.ilike.%${query}%`)
      .limit(5);
    
    // 测试3: 查询NMPA总数量
    const { count: totalNmpa, error: totalNmpaError } = await supabase
      .from('nmpa_registrations')
      .select('*', { count: 'exact', head: true });
    
    // 测试4: 查询EUDAMED总数量
    const { count: totalEudamed, error: totalEudamedError } = await supabase
      .from('eudamed_registrations')
      .select('*', { count: 'exact', head: true });
    
    // 测试5: 获取NMPA样本
    const { data: nmpaSample, error: nmpaSampleError } = await supabase
      .from('nmpa_registrations')
      .select('id, product_name, company_name, company_id, registration_number')
      .limit(3);
    
    // 测试6: 获取EUDAMED样本
    const { data: eudamedSample, error: eudamedSampleError } = await supabase
      .from('eudamed_registrations')
      .select('id, device_name, actor_name, actor_id, company_id')
      .limit(3);
    
    return NextResponse.json({
      query,
      nmpa: {
        totalCount: totalNmpa,
        searchCount: nmpaCount,
        searchResults: nmpaData,
        sample: nmpaSample,
        errors: {
          total: totalNmpaError?.message,
          search: nmpaError?.message,
          sample: nmpaSampleError?.message
        }
      },
      eudamed: {
        totalCount: totalEudamed,
        searchCount: eudamedCount,
        searchResults: eudamedData,
        sample: eudamedSample,
        errors: {
          total: totalEudamedError?.message,
          search: eudamedError?.message,
          sample: eudamedSampleError?.message
        }
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
