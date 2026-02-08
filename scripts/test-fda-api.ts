// 测试 FDA API 连接
// 运行: npx ts-node scripts/test-fda-api.ts

const FDA_API_BASE = 'https://api.fda.gov';
const FDA_API_KEY = process.env.FDA_API_KEY;

async function testFDAApi() {
  if (!FDA_API_KEY) {
    console.error('❌ FDA_API_KEY 环境变量未设置');
    console.log('请在 Vercel Dashboard 中设置 FDA_API_KEY 环境变量');
    process.exit(1);
  }

  console.log('🔄 测试 FDA API 连接...');
  console.log(`API Key: ${FDA_API_KEY.substring(0, 10)}...`);

  try {
    // 测试 1: 获取注册企业列表
    const url = `${FDA_API_BASE}/device/registrationlisting.json?api_key=${FDA_API_KEY}&limit=5`;
    console.log(`\n📡 请求: ${url.replace(FDA_API_KEY, '***')}`);

    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();

    console.log('\n✅ FDA API 连接成功！');
    console.log(`📊 获取到 ${data.results?.length || 0} 条记录`);
    console.log(`📊 总记录数: ${data.meta?.results?.total || 'N/A'}`);

    if (data.results && data.results.length > 0) {
      console.log('\n📋 第一条记录示例:');
      const first = data.results[0];
      console.log(`  - 注册号: ${first.registration_number}`);
      console.log(`  - FEI号: ${first.fei_number}`);
      console.log(`  - 状态: ${first.registration_status}`);
      console.log(`  - 企业类型: ${first.establishment_type}`);
      console.log(`  - 地址: ${first.address}, ${first.city}, ${first.state}`);
    }

    // 测试 2: 搜索特定产品
    console.log('\n🔄 测试搜索功能...');
    const searchUrl = `${FDA_API_BASE}/device/registrationlisting.json?api_key=${FDA_API_KEY}&search=product_code:LYZ&limit=3`;
    const searchResponse = await fetch(searchUrl);

    if (searchResponse.ok) {
      const searchData = await searchResponse.json();
      console.log(`✅ 搜索功能正常，找到 ${searchData.results?.length || 0} 条记录`);
    }

    console.log('\n🎉 所有测试通过！FDA API 配置正确。');

  } catch (error) {
    console.error('\n❌ FDA API 测试失败:');
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

testFDAApi();
