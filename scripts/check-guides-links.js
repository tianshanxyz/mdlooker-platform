#!/usr/bin/env node
/**
 * Guides页面链接检查脚本
 * 检查所有指南页面的链接是否有效
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// 定义需要检查的链接
const linksToCheck = [
  // FDA相关链接
  { url: 'https://www.fda.gov/medical-devices', name: 'FDA Medical Devices' },
  { url: 'https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfpmn/pmn.cfm', name: 'FDA 510(k) Database' },
  { url: 'https://www.fda.gov/medical-devices/classify-your-medical-device', name: 'FDA Device Classification' },
  { url: 'https://www.fda.gov/medical-devices/premarket-submissions/premarket-notification-510k', name: 'FDA 510(k) Guidance' },
  
  // NMPA相关链接
  { url: 'https://www.nmpa.gov.cn/', name: 'NMPA官网' },
  { url: 'https://www.cmde.org.cn/', name: 'CMDE官网' },
  
  // EU相关链接
  { url: 'https://ec.europa.eu/growth/sectors/medical-devices_en', name: 'EU Medical Devices' },
  { url: 'https://ec.europa.eu/tools/eudamed', name: 'EUDAMED' },
  { url: 'https://ec.europa.eu/growth/tools-databases/nando/', name: 'NANDO Database' },
  
  // 其他监管机构
  { url: 'https://www.hsa.gov.sg/medical-devices', name: 'Singapore HSA' },
  { url: 'https://www.pmda.go.jp/english/', name: 'Japan PMDA' },
  { url: 'https://www.sfda.gov.sa/', name: 'Saudi SFDA' },
  { url: 'https://www.healthcanada.gc.ca/medical-devices', name: 'Health Canada' },
  { url: 'https://www.tga.gov.au/medical-devices', name: 'Australia TGA' },
  
  // 国际标准化组织
  { url: 'https://www.iso.org/standards.html', name: 'ISO Standards' },
  { url: 'https://www.imdrf.org/', name: 'IMDRF' },
  
  // 行业资源
  { url: 'https://www.advamed.org/', name: 'AdvaMed' },
  { url: 'https://www.medtecheurope.org/', name: 'MedTech Europe' },
];

// 检查单个链接
function checkLink(link) {
  return new Promise((resolve) => {
    const url = new URL(link.url);
    const client = url.protocol === 'https:' ? https : http;
    
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'HEAD',
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    };

    const req = client.request(options, (res) => {
      const status = res.statusCode;
      const isValid = status >= 200 && status < 400;
      
      resolve({
        ...link,
        status: status,
        valid: isValid,
        redirect: status >= 300 && status < 400
      });
    });

    req.on('error', (error) => {
      resolve({
        ...link,
        status: 'ERROR',
        valid: false,
        error: error.message
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        ...link,
        status: 'TIMEOUT',
        valid: false,
        error: 'Request timeout'
      });
    });

    req.end();
  });
}

// 主函数
async function main() {
  console.log('🔍 开始检查Guides页面外部链接...\n');
  
  const results = {
    valid: [],
    invalid: [],
    redirects: []
  };

  // 并发检查所有链接（限制并发数）
  const batchSize = 5;
  for (let i = 0; i < linksToCheck.length; i += batchSize) {
    const batch = linksToCheck.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(checkLink));
    
    batchResults.forEach(result => {
      if (result.valid) {
        if (result.redirect) {
          results.redirects.push(result);
        } else {
          results.valid.push(result);
        }
      } else {
        results.invalid.push(result);
      }
    });

    // 显示进度
    process.stdout.write(`\r⏳ 进度: ${Math.min(i + batchSize, linksToCheck.length)}/${linksToCheck.length}`);
  }

  console.log('\n\n📊 检查结果:\n');

  // 显示有效链接
  console.log(`✅ 有效链接 (${results.valid.length}):`);
  results.valid.forEach(link => {
    console.log(`   ✓ ${link.name} - ${link.url}`);
  });

  // 显示重定向链接
  if (results.redirects.length > 0) {
    console.log(`\n⚠️  重定向链接 (${results.redirects.length}):`);
    results.redirects.forEach(link => {
      console.log(`   → ${link.name} - ${link.url} (Status: ${link.status})`);
    });
  }

  // 显示无效链接
  if (results.invalid.length > 0) {
    console.log(`\n❌ 无效链接 (${results.invalid.length}):`);
    results.invalid.forEach(link => {
      console.log(`   ✗ ${link.name} - ${link.url}`);
      console.log(`     Status: ${link.status}${link.error ? `, Error: ${link.error}` : ''}`);
    });
  }

  // 生成报告
  const report = {
    timestamp: new Date().toISOString(),
    total: linksToCheck.length,
    valid: results.valid.length,
    invalid: results.invalid.length,
    redirects: results.redirects.length,
    invalidLinks: results.invalid,
    redirectLinks: results.redirects
  };

  const reportPath = path.join(__dirname, '..', 'docs', 'guides-links-check-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 详细报告已保存: ${reportPath}`);

  // 总结
  console.log('\n📈 总结:');
  console.log(`   总链接数: ${linksToCheck.length}`);
  console.log(`   有效: ${results.valid.length} (${((results.valid.length / linksToCheck.length) * 100).toFixed(1)}%)`);
  console.log(`   重定向: ${results.redirects.length}`);
  console.log(`   无效: ${results.invalid.length}`);

  if (results.invalid.length === 0) {
    console.log('\n🎉 所有链接检查通过！');
    process.exit(0);
  } else {
    console.log(`\n⚠️  发现 ${results.invalid.length} 个无效链接，需要修复`);
    process.exit(1);
  }
}

main().catch(console.error);
