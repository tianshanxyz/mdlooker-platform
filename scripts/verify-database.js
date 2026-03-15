// 验证数据库中实际存在的数据
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('环境变量未设置');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyData() {
  console.log('=== 验证数据库中的实际数据 ===\n');

  // 测试用户提供的搜索词
  const testQueries = [
    '创面修复生物材料',
    '晶硕光学',
    '精华光学',
    '软性亲水接触镜',
    '一次性使用输液器',
    '江苏天眼医药'
  ];

  for (const query of testQueries) {
    console.log(`\n--- 搜索: "${query}" ---`);
    
    // 搜索NMPA
    const { data: nmpaData, error: nmpaError } = await supabase
      .from('nmpa_registrations')
      .select('*')
      .or(`product_name.ilike.%${query}%,company_name.ilike.%${query}%`)
      .limit(3);
    
    if (nmpaError) {
      console.log('NMPA错误:', nmpaError.message);
    } else if (nmpaData && nmpaData.length > 0) {
      console.log(`NMPA找到 ${nmpaData.length} 条记录:`);
      nmpaData.forEach((item, i) => {
        console.log(`  ${i+1}. ${item.product_name} - ${item.company_name}`);
      });
    } else {
      console.log('NMPA: 无结果');
    }

    // 搜索公司表
    const { data: companyData, error: companyError } = await supabase
      .from('companies')
      .select('*')
      .or(`name.ilike.%${query}%,name_zh.ilike.%${query}%`)
      .limit(3);
    
    if (companyError) {
      console.log('Company错误:', companyError.message);
    } else if (companyData && companyData.length > 0) {
      console.log(`Companies找到 ${companyData.length} 条记录:`);
      companyData.forEach((item, i) => {
        console.log(`  ${i+1}. ${item.name} (${item.name_zh})`);
      });
    } else {
      console.log('Companies: 无结果');
    }
  }

  // 统计各表数据量
  console.log('\n\n=== 各表数据统计 ===');
  const tables = [
    'companies',
    'products', 
    'fda_registrations',
    'nmpa_registrations',
    'eudamed_registrations',
    'hsa_registrations',
    'tga_registrations',
    'pmda_registrations'
  ];

  for (const table of tables) {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.log(`${table}: 错误 - ${error.message}`);
    } else {
      console.log(`${table}: ${count} 条记录`);
    }
  }
}

verifyData().catch(console.error);
