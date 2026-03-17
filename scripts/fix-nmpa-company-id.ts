#!/usr/bin/env tsx
/**
 * NMPA 数据修复脚本
 * 
 * 功能：
 * 1. 提取所有唯一的 manufacturer 名称
 * 2. 在 companies 表中查找或创建对应记录
 * 3. 批量更新 nmpa_registrations.company_id
 */

import { createClient } from '@supabase/supabase-js';

// 从环境变量读取配置
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

async function fixNMPAData() {
  console.log('🚀 开始 NMPA 数据修复...\n');
  
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // 步骤 1: 提取所有唯一的制造商名称
    console.log('📊 步骤 1: 提取唯一制造商名称...');
    const { data: uniqueManufacturers, error: extractError } = await supabase
      .from('nmpa_registrations')
      .select('manufacturer_zh, manufacturer')
      .is('company_id', null)
      .not('manufacturer_zh', 'is', null);
    
    if (extractError) throw extractError;
    
    if (!uniqueManufacturers || uniqueManufacturers.length === 0) {
      console.log('✅ 所有 NMPA 记录已有 company_id，无需修复');
      return;
    }
    
    // 去重
    const manufacturerSet = new Set<string>();
    const manufacturers: { manufacturer_zh: string | null; manufacturer: string | null }[] = [];
    
    uniqueManufacturers.forEach(item => {
      const name = item.manufacturer_zh || item.manufacturer;
      if (name && !manufacturerSet.has(name)) {
        manufacturerSet.add(name);
        manufacturers.push({ manufacturer_zh: item.manufacturer_zh, manufacturer: item.manufacturer });
      }
    });
    
    console.log(`   找到 ${manufacturers.length} 个唯一制造商\n`);
    
    // 步骤 2: 批量创建/查找 companies 记录
    console.log('🏢 步骤 2: 创建/查找公司记录...');
    const companyMap = new Map();
    let createdCount = 0;
    let foundCount = 0;
    
    for (let i = 0; i < manufacturers.length; i++) {
      const mfr = manufacturers[i];
      const name = mfr.manufacturer_zh || mfr.manufacturer;
      
      const { data: existingCompanies } = await supabase
        .from('companies')
        .select('id')
        .or(`name_zh.eq.${name},name.eq.${name}`)
        .limit(1);
      
      if (existingCompanies && existingCompanies.length > 0) {
        companyMap.set(name, existingCompanies[0].id);
        foundCount++;
      } else {
        const { data: newCompany, error: createError } = await supabase
          .from('companies')
          .insert({
            name: mfr.manufacturer || mfr.manufacturer_zh,
            name_zh: mfr.manufacturer_zh || mfr.manufacturer,
            country: 'China',
            business_type: 'Manufacturer',
            description: `NMPA 注册企业 - ${name}`,
            description_zh: `NMPA 注册企业 - ${name}`
          })
          .select('id')
          .single();
        
        if (createError) {
          console.error(`   ❌ 创建公司失败 "${name}":`, createError.message);
          continue;
        }
        
        companyMap.set(name, newCompany.id);
        createdCount++;
      }
      
      if ((i + 1) % 100 === 0) {
        console.log(`   进度：${i + 1}/${manufacturers.length} (${Math.round((i + 1) / manufacturers.length * 100)}%)`);
      }
    }
    
    console.log(`   ✅ 找到 ${foundCount} 个现有公司，创建 ${createdCount} 个新公司\n`);
    
    // 步骤 3: 批量更新 NMPA 记录的 company_id
    console.log('🔗 步骤 3: 更新 NMPA 记录的 company_id...');
    let updateCount = 0;
    let errorCount = 0;
    
    for (const [manufacturerName, companyId] of companyMap.entries()) {
      const { error: updateError } = await supabase
        .from('nmpa_registrations')
        .update({ company_id: companyId })
        .eq('manufacturer_zh', manufacturerName)
        .is('company_id', null);
      
      if (updateError) {
        console.error(`   ❌ 更新失败 "${manufacturerName}":`, updateError.message);
        errorCount++;
      } else {
        updateCount++;
      }
    }
    
    console.log(`   ✅ 成功更新 ${updateCount} 个制造商的 NMPA 记录`);
    console.log(`   ❌ 失败 ${errorCount} 个\n`);
    
    // 步骤 4: 验证结果
    console.log('✅ 步骤 4: 验证修复结果...');
    const { count: remainingNulls } = await supabase
      .from('nmpa_registrations')
      .select('*', { count: 'exact', head: true })
      .is('company_id', null);
    
    console.log(`   剩余 NULL company_id: ${remainingNulls || 0}`);
    
    const { count: totalRecords } = await supabase
      .from('nmpa_registrations')
      .select('*', { count: 'exact', head: true });
    
    const fixedCount = (totalRecords || 0) - (remainingNulls || 0);
    const percentage = totalRecords ? Math.round(fixedCount / totalRecords * 100) : 0;
    
    console.log(`\n📊 修复完成统计：`);
    console.log(`   - NMPA 总记录数：${totalRecords}`);
    console.log(`   - 已修复记录数：${fixedCount}`);
    console.log(`   - 修复比例：${percentage}%`);
    console.log(`   - 创建公司数：${createdCount}`);
    console.log(`   - 找到现有公司数：${foundCount}`);
    
    if (percentage >= 95) {
      console.log('\n✅ 修复成功！关联率达到 95% 以上');
    } else {
      console.log(`\n⚠️  修复比例 ${percentage}%，建议检查剩余 ${remainingNulls} 条记录`);
    }
    
  } catch (error) {
    console.error('\n❌ 修复过程中发生错误:', error);
    process.exit(1);
  }
}

fixNMPAData();
