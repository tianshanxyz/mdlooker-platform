// FDA API Test Script
// Run with: npx ts-node scripts/test-fda-api.ts

import 'dotenv/config';

const FDA_API_BASE = 'https://api.fda.gov/device/registrationlisting.json';

async function testFDAApi() {
  const apiKey = process.env.FDA_API_KEY;
  
  console.log('FDA API Connection Test');
  console.log('=======================\n');
  
  if (!apiKey || apiKey === 'your_fda_api_key_here') {
    console.error('❌ Error: FDA_API_KEY not configured');
    console.log('\nPlease set your FDA API key in .env.local file:');
    console.log('FDA_API_KEY=your_actual_api_key_here');
    console.log('\nGet your API key from: https://open.fda.gov/apis/authentication/');
    process.exit(1);
  }
  
  console.log('✓ API Key found');
  console.log(`Key: ${apiKey.substring(0, 10)}...\n`);
  
  try {
    // Test 1: Basic connection with limit
    console.log('Test 1: Basic API connection...');
    const testUrl = new URL(FDA_API_BASE);
    testUrl.searchParams.append('limit', '1');
    testUrl.searchParams.append('api_key', apiKey);
    
    const response = await fetch(testUrl.toString());
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('✓ Connection successful!');
    console.log(`  Total records available: ${data.meta?.results?.total || 'N/A'}`);
    console.log(`  Records returned: ${data.results?.length || 0}\n`);
    
    // Test 2: Search by company name
    console.log('Test 2: Search by company name (Medtronic)...');
    const searchUrl = new URL(FDA_API_BASE);
    searchUrl.searchParams.append('search', 'device_name:"pacemaker"');
    searchUrl.searchParams.append('limit', '3');
    searchUrl.searchParams.append('api_key', apiKey);
    
    const searchResponse = await fetch(searchUrl.toString());
    
    if (!searchResponse.ok) {
      throw new Error(`HTTP ${searchResponse.status}: ${searchResponse.statusText}`);
    }
    
    const searchData = await searchResponse.json();
    console.log('✓ Search successful!');
    console.log(`  Found ${searchData.results?.length || 0} records\n`);
    
    if (searchData.results && searchData.results.length > 0) {
      console.log('Sample record:');
      const sample = searchData.results[0];
      console.log(`  Device Name: ${sample.device_name || 'N/A'}`);
      console.log(`  Registration Number: ${sample.registration_number || 'N/A'}`);
      console.log(`  Device Class: ${sample.device_class || 'N/A'}`);
      console.log(`  Product Code: ${sample.product_code || 'N/A'}`);
    }
    
    console.log('\n✅ All tests passed! FDA API is ready to use.');
    
  } catch (error) {
    console.error('\n❌ API Test Failed:');
    console.error(error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

testFDAApi();
