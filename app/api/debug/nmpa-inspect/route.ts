import { NextResponse } from 'next/server';
import { getSupabaseClient } from '../../../lib/supabase';

export async function GET() {
  try {
    const supabase = getSupabaseClient();
    
    // 1. 检查NMPA表结构
    const { data: nmpaColumns } = await supabase.rpc('get_table_columns', { table_name: 'nmpa_registrations' });
    
    // 2. 获取NMPA样本数据（查看实际字段）
    const { data: nmpaSample, error: sampleError } = await supabase
      .from('nmpa_registrations')
      .select('*')
      .limit(3);
    
    // 3. 直接搜索"晶硕"（使用所有可能的字段）
    const { data: searchResult1, error: searchError1 } = await supabase
      .from('nmpa_registrations')
      .select('*')
      .ilike('product_name_zh', '%晶硕%')
      .limit(5);
    
    // 4. 搜索"创面修复"
    const { data: searchResult2, error: searchError2 } = await supabase
      .from('nmpa_registrations')
      .select('*')
      .ilike('product_name_zh', '%创面修复%')
      .limit(5);
    
    // 5. 检查是否有 manufacturer_zh 字段
    const { data: searchResult3, error: searchError3 } = await supabase
      .from('nmpa_registrations')
      .select('*')
      .ilike('manufacturer_zh', '%晶硕%')
      .limit(5);
    
    return NextResponse.json({
      columns: nmpaColumns,
      sample: nmpaSample,
      sampleError,
      searches: {
        product_name_zh_晶硕: { data: searchResult1, error: searchError1 },
        product_name_zh_创面修复: { data: searchResult2, error: searchError2 },
        manufacturer_zh_晶硕: { data: searchResult3, error: searchError3 }
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Debug error', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}
