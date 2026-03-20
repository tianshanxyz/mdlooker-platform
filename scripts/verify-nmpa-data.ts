/**
 * NMPA数据核实脚本
 * 验证中国医疗器械注册数据的准确性
 * 
 * 使用方法:
 * npx ts-node scripts/verify-nmpa-data.ts
 */

import { getSupabaseClient } from '../app/lib/supabase';

interface NMPAVerificationResult {
  totalCount: number;
  uniqueCompanies: number;
  dateRange: {
    earliest: string | null;
    latest: string | null;
  };
  classificationDistribution: Record<string, number>;
  sampleRecords: any[];
  issues: string[];
}

/**
 * 核实NMPA数据
 */
async function verifyNMPAData(): Promise<NMPAVerificationResult> {
  const supabase = getSupabaseClient();
  
  console.log('========================================');
  console.log('NMPA Data Verification');
  console.log('========================================\n');
  
  const result: NMPAVerificationResult = {
    totalCount: 0,
    uniqueCompanies: 0,
    dateRange: { earliest: null, latest: null },
    classificationDistribution: {},
    sampleRecords: [],
    issues: [],
  };

  try {
    // 1. 获取总记录数
    console.log('📊 Checking total record count...');
    const { count, error: countError } = await supabase
      .from('nmpa_registrations')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      throw new Error(`Failed to get count: ${countError.message}`);
    }
    
    result.totalCount = count || 0;
    console.log(`   Total records: ${result.totalCount.toLocaleString()}`);
    
    // 检查是否为整数异常
    if (result.totalCount === 72000) {
      result.issues.push('⚠️ Record count is exactly 72000, which may indicate an estimated value rather than actual count');
    }
    
    // 2. 获取唯一公司数
    console.log('\n🏢 Checking unique companies...');
    const { data: companyData, error: companyError } = await supabase
      .from('nmpa_registrations')
      .select('registration_holder');
    
    if (!companyError && companyData) {
      const uniqueCompanies = new Set(companyData.map(r => r.registration_holder).filter(Boolean));
      result.uniqueCompanies = uniqueCompanies.size;
      console.log(`   Unique companies: ${result.uniqueCompanies.toLocaleString()}`);
    }
    
    // 3. 获取日期范围
    console.log('\n📅 Checking date range...');
    const { data: dateData, error: dateError } = await supabase
      .from('nmpa_registrations')
      .select('approval_date')
      .order('approval_date', { ascending: true })
      .limit(1);
    
    if (!dateError && dateData && dateData.length > 0) {
      result.dateRange.earliest = dateData[0].approval_date;
    }
    
    const { data: latestDateData, error: latestDateError } = await supabase
      .from('nmpa_registrations')
      .select('approval_date')
      .order('approval_date', { ascending: false })
      .limit(1);
    
    if (!latestDateError && latestDateData && latestDateData.length > 0) {
      result.dateRange.latest = latestDateData[0].approval_date;
    }
    
    console.log(`   Earliest: ${result.dateRange.earliest || 'N/A'}`);
    console.log(`   Latest: ${result.dateRange.latest || 'N/A'}`);
    
    // 4. 获取分类分布
    console.log('\n📋 Checking classification distribution...');
    const { data: classData, error: classError } = await supabase
      .from('nmpa_registrations')
      .select('device_classification');
    
    if (!classError && classData) {
      const distribution: Record<string, number> = {};
      classData.forEach(r => {
        const classification = r.device_classification || 'Unknown';
        distribution[classification] = (distribution[classification] || 0) + 1;
      });
      result.classificationDistribution = distribution;
      
      Object.entries(distribution)
        .sort((a, b) => b[1] - a[1])
        .forEach(([className, count]) => {
          console.log(`   ${className}: ${count.toLocaleString()}`);
        });
    }
    
    // 5. 获取样本记录
    console.log('\n🔍 Fetching sample records...');
    const { data: samples, error: sampleError } = await supabase
      .from('nmpa_registrations')
      .select('id, registration_number, product_name, product_name_zh, manufacturer, manufacturer_zh, approval_date, device_classification')
      .limit(10);
    
    if (!sampleError && samples) {
      result.sampleRecords = samples;
      console.log('   Sample records:');
      samples.forEach((record, index) => {
        console.log(`   ${index + 1}. ${record.registration_number} - ${record.product_name_zh || record.product_name}`);
      });
    }
    
    // 6. 检查数据质量问题
    console.log('\n⚠️  Checking data quality issues...');
    
    // 检查空值
    const { count: nullProductNameCount, error: nullError } = await supabase
      .from('nmpa_registrations')
      .select('*', { count: 'exact', head: true })
      .is('product_name', null)
      .is('product_name_zh', null);
    
    if (nullProductNameCount && nullProductNameCount > 0) {
      result.issues.push(`Found ${nullProductNameCount} records with no product name`);
    }
    
    // 检查重复注册号
    const { data: duplicates, error: dupError } = await supabase
      .rpc('find_duplicate_nmpa_registrations');
    
    if (!dupError && duplicates && duplicates.length > 0) {
      result.issues.push(`Found ${duplicates.length} duplicate registration numbers`);
    }
    
    // 检查未来日期
    const { count: futureDateCount, error: futureError } = await supabase
      .from('nmpa_registrations')
      .select('*', { count: 'exact', head: true })
      .gt('approval_date', new Date().toISOString());
    
    if (futureDateCount && futureDateCount > 0) {
      result.issues.push(`Found ${futureDateCount} records with future approval dates`);
    }
    
    if (result.issues.length === 0) {
      console.log('   ✅ No major issues found');
    } else {
      result.issues.forEach(issue => console.log(`   ${issue}`));
    }
    
    // 7. 生成报告
    console.log('\n========================================');
    console.log('Verification Summary');
    console.log('========================================');
    console.log(`Total Records: ${result.totalCount.toLocaleString()}`);
    console.log(`Unique Companies: ${result.uniqueCompanies.toLocaleString()}`);
    console.log(`Date Range: ${result.dateRange.earliest} to ${result.dateRange.latest}`);
    console.log(`Issues Found: ${result.issues.length}`);
    
    return result;
    
  } catch (error) {
    console.error('❌ Verification failed:', error);
    throw error;
  }
}

/**
 * 生成数据质量评分
 */
function calculateQualityScore(result: NMPAVerificationResult): number {
  let score = 100;
  
  // 整数异常扣分
  if (result.totalCount === 72000) {
    score -= 20;
  }
  
  // 问题扣分
  score -= result.issues.length * 5;
  
  // 日期范围合理性
  if (!result.dateRange.earliest || !result.dateRange.latest) {
    score -= 10;
  }
  
  return Math.max(0, score);
}

// CLI入口
if (require.main === module) {
  verifyNMPAData()
    .then(result => {
      const qualityScore = calculateQualityScore(result);
      console.log(`\n📊 Data Quality Score: ${qualityScore}/100`);
      
      if (qualityScore >= 80) {
        console.log('✅ Data quality is good');
      } else if (qualityScore >= 60) {
        console.log('⚠️  Data quality needs improvement');
      } else {
        console.log('❌ Data quality is poor, re-import recommended');
      }
      
      process.exit(0);
    })
    .catch(error => {
      console.error('Verification failed:', error);
      process.exit(1);
    });
}

export { verifyNMPAData };
