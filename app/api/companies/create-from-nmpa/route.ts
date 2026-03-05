import { NextResponse } from 'next/server';
import { getSupabaseClient } from '../../../lib/supabase';

export async function POST(request: Request) {
  try {
    const supabase = getSupabaseClient();
    const { manufacturer, manufacturer_zh } = await request.json();
    
    if (!manufacturer_zh && !manufacturer) {
      return NextResponse.json(
        { error: 'Manufacturer name required' },
        { status: 400 }
      );
    }
    
    // 先查找是否已存在
    const { data: existing } = await supabase
      .from('companies')
      .select('id')
      .or(`name_zh.eq.${manufacturer_zh || manufacturer},name.eq.${manufacturer}`)
      .limit(1)
      .single();
    
    if (existing) {
      return NextResponse.json({ id: existing.id, created: false });
    }
    
    // 创建新公司记录
    const { data: company, error } = await supabase
      .from('companies')
      .insert({
        name: manufacturer || manufacturer_zh,
        name_zh: manufacturer_zh || manufacturer,
        country: 'China',
        business_type: 'Manufacturer',
        description: `NMPA 注册企业 - ${manufacturer_zh || manufacturer}`,
        description_zh: `NMPA 注册企业 - ${manufacturer_zh || manufacturer}`
      })
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return NextResponse.json({ id: company.id, created: true });
  } catch (error) {
    console.error('Create company error:', error);
    return NextResponse.json(
      { error: 'Failed to create company', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}
