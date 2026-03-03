import { getSupabaseClient } from '../app/lib/supabase';

async function checkAllData() {
  const supabase = getSupabaseClient();

  console.log('=== 数据库全面数据统计 ===\n');

  // 定义所有相关表
  const tables = [
    { name: 'companies', label: '公司' },
    { name: 'products', label: '产品' },
    { name: 'fda_registrations', label: 'FDA注册' },
    { name: 'nmpa_registrations', label: 'NMPA注册' },
    { name: 'eudamed_registrations', label: 'EUDAMED注册' },
    { name: 'pmda_registrations', label: 'PMDA(日本)注册' },
    { name: 'health_canada_registrations', label: 'Health Canada注册' },
    { name: 'ema_registrations', label: 'EMA注册' },
    { name: 'mhra_registrations', label: 'MHRA(英国)注册' },
    { name: 'tga_registrations', label: 'TGA(澳大利亚)注册' },
    { name: 'hsa_registrations', label: 'HSA(新加坡)注册' },
    { name: 'swissmedic_registrations', label: 'Swissmedic(瑞士)注册' },
    { name: 'mfds_registrations', label: 'MFDS(韩国)注册' },
    { name: 'anvisa_registrations', label: 'ANVISA(巴西)注册' },
    { name: 'company_branches', label: '公司分支机构' },
    { name: 'company_patents', label: '专利' },
    { name: 'company_trademarks', label: '商标' },
    { name: 'regulatory_warning_letters', label: 'FDA警告信' },
    { name: 'regulatory_recalls', label: '产品召回' },
  ];

  const stats: any = {};

  for (const table of tables) {
    try {
      const { count, error } = await supabase
        .from(table.name)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.log(`${table.label} (${table.name}): 错误 - ${error.message}`);
        stats[table.name] = { count: 0, error: error.message };
      } else {
        console.log(`${table.label} (${table.name}): ${count} 条记录`);
        stats[table.name] = { count: count || 0 };
      }
    } catch (err) {
      console.log(`${table.label} (${table.name}): 异常 - ${err}`);
      stats[table.name] = { count: 0, error: String(err) };
    }
  }

  // 获取各注册表的样本数据
  console.log('\n=== 各注册表样本数据 ===');

  const registrationTables = [
    { name: 'fda_registrations', label: 'FDA' },
    { name: 'nmpa_registrations', label: 'NMPA' },
    { name: 'eudamed_registrations', label: 'EUDAMED' },
    { name: 'pmda_registrations', label: 'PMDA(日本)' },
    { name: 'hsa_registrations', label: 'HSA(新加坡)' },
    { name: 'tga_registrations', label: 'TGA(澳大利亚)' },
  ];

  for (const table of registrationTables) {
    try {
      const { data, error } = await supabase
        .from(table.name)
        .select('*')
        .limit(2);

      if (error) {
        console.log(`\n${table.label}: 查询错误 - ${error.message}`);
      } else if (data && data.length > 0) {
        console.log(`\n${table.label} 样本:`);
        console.log(JSON.stringify(data[0], null, 2).substring(0, 500));
      } else {
        console.log(`\n${table.label}: 无数据`);
      }
    } catch (err) {
      console.log(`\n${table.label}: 异常 - ${err}`);
    }
  }

  console.log('\n=== 统计汇总 ===');
  console.log(JSON.stringify(stats, null, 2));
}

checkAllData().catch(console.error);
