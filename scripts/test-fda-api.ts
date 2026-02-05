// FDA API Test Script
// Run with: npx ts-node scripts/test-fda-api.ts

import dotenv from 'dotenv';
import path from 'path';

// 从项目根目录加载 .env.local 文件
const envPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

const FDA_API_BASE = 'https://api.fda.gov/device/registrationlisting.json';

async function testFDAApi() {
  const apiKey = process.env.FDA_API_KEY;
  
  console.log('FDA API Connection Test');
  console.log('=======================\n');
  console.log(`Loading env from: ${envPath}\n`);
  
  if (!apiKey || apiKey === 'your_fda_api_key_here') {
    console.error('❌ Error: FDA_API_KEY not configured');
    console.log('\nPlease set your FDA API key in .env.local file:');
    console.log('FDA_API_KEY=your_actual_api_key_here');
    console.log('\nGet your API key from: https://open.fda.gov/apis/authentication/');
    console.log(`\nCurrent FDA_API_KEY value: ${apiKey || 'undefined'}`);
    process.exit(1);
  }
  
  console.log('✓ API Key found');
  console.log(`Key: ${apiKey.substring(0, 10)}...\n`);
  
  try {
    // Test: Basic connection with limit
    console.log('Test: Basic API connection...');
    const testUrl = new URL(FDA_API_BASE);
    testUrl.searchParams.append('limit', '5');
    testUrl.searchParams.append('api_key', apiKey);
    
    const response = await fetch(testUrl.toString());
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('✓ Connection successful!');
    console.log(`  Total records available: ${data.meta?.results?.total?.toLocaleString() || 'N/A'}`);
    console.log(`  Records returned: ${data.results?.length || 0}\n`);
    
    if (data.results && data.results.length > 0) {
      console.log('Sample records:');
      data.results.slice(0, 3).forEach((sample: any, index: number) => {
        console.log(`\n  Record ${index + 1}:`);
        console.log(`    Device Name: ${sample.device_name || 'N/A'}`);
        console.log(`    Registration Number: ${sample.registration_number || 'N/A'}`);
        console.log(`    Device Class: ${sample.device_class || 'N/A'}`);
        console.log(`    Product Code: ${sample.product_code || 'N/A'}`);
      });
    }
    
    console.log('\n✅ All tests passed! FDA API is ready to use.');
    console.log('\n📊 API Statistics:');
    console.log(`  Total device registrations: ${data.meta?.results?.total?.toLocaleString() || 'N/A'}`);
    console.log(`  API Key: ${apiKey.substring(0, 15)}...`);
    
  } catch (error) {
    console.error('\n❌ API Test Failed:');
    console.error(error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

testFDAApi();
