import { getSupabaseClient } from '../app/lib/supabase';

async function checkData() {
  const supabase = getSupabaseClient();

  console.log('=== 数据库数据统计 ===\n');

  // 检查公司总数
  const { count: companyCount, error: companyError } = await supabase
    .from('companies')
    .select('*', { count: 'exact', head: true });

  console.log('Companies count:', companyCount);
  if (companyError) console.error('Company error:', companyError);

  // 检查NMPA注册数
  const { count: nmpaCount, error: nmpaError } = await supabase
    .from('nmpa_registrations')
    .select('*', { count: 'exact', head: true });

  console.log('NMPA registrations count:', nmpaCount);
  if (nmpaError) console.error('NMPA error:', nmpaError);

  // 检查FDA注册数
  const { count: fdaCount, error: fdaError } = await supabase
    .from('fda_registrations')
    .select('*', { count: 'exact', head: true });

  console.log('FDA registrations count:', fdaCount);
  if (fdaError) console.error('FDA error:', fdaError);

  // 检查产品数
  const { count: productCount, error: productError } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true });

  console.log('Products count:', productCount);
  if (productError) console.error('Product error:', productError);

  // 获取几个NMPA记录样本
  console.log('\n=== NMPA样本数据 ===');
  const { data: nmpaSamples, error: sampleError } = await supabase
    .from('nmpa_registrations')
    .select('id, company_id, registration_number, product_name, company_name, approval_date')
    .limit(10);

  if (sampleError) {
    console.error('Sample error:', sampleError);
  } else {
    console.log(JSON.stringify(nmpaSamples, null, 2));
  }

  // 获取对应的公司信息
  if (nmpaSamples && nmpaSamples.length > 0) {
    console.log('\n=== 相关公司信息 ===');
    const companyIds = nmpaSamples.map(n => n.company_id).filter(Boolean);
    if (companyIds.length > 0) {
      const { data: companies, error: compError } = await supabase
        .from('companies')
        .select('id, name, name_zh, country')
        .in('id', companyIds);

      if (compError) {
        console.error('Company fetch error:', compError);
      } else {
        console.log(JSON.stringify(companies, null, 2));
      }
    }
  }
}

checkData().catch(console.error);
