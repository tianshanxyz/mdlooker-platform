/**
 * FDA完整数据同步脚本
 * 从openFDA API获取所有医疗器械注册数据
 * 
 * 使用方法:
 * 1. 确保已设置 FDA_API_KEY 环境变量（可选，但推荐）
 * 2. 运行: npx ts-node scripts/sync-fda-full.ts
 * 
 * 注意: 完整同步可能需要数小时，取决于API速率限制
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { getSupabaseClient } from '../app/lib/supabase';

const FDA_API_BASE = 'https://api.fda.gov/device';
const BATCH_SIZE = 100; // FDA API最大限制
const MAX_RETRIES = 3;
const RATE_LIMIT_DELAY = 1000; // 1秒延迟

interface FDADeviceRegistration {
  registration_number: string;
  fei_number: string;
  owner_operator_number: string;
  registration_status: string;
  registration_initial_date: string;
  registration_expiration_date: string;
  owner_operator?: {
    name: string;
    address: string;
    owner_operator_number: string;
  };
  products?: Array<{
    product_code: string;
    device_class: string;
    device_name: string;
    device_description: string;
    regulation_number: string;
  }>;
  establishment_type: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  country_code: string;
}

interface SyncProgress {
  totalFetched: number;
  totalInserted: number;
  totalUpdated: number;
  totalFailed: number;
  startTime: Date;
  lastSkip: number;
  errors: string[];
}

/**
 * 延迟函数
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 从FDA API获取数据（带重试机制）
 */
async function fetchFDADataWithRetry(
  limit: number,
  skip: number,
  retryCount: number = 0
): Promise<FDADeviceRegistration[]> {
  const apiKey = process.env.FDA_API_KEY;
  
  try {
    const url = new URL(`${FDA_API_BASE}/registrationlisting.json`);
    url.searchParams.append('limit', limit.toString());
    url.searchParams.append('skip', skip.toString());
    
    if (apiKey) {
      url.searchParams.append('api_key', apiKey);
    }

    console.log(`[FDA] Fetching: skip=${skip}, limit=${limit}`);
    
    const response = await fetch(url.toString(), {
      headers: { 'Accept': 'application/json' },
    });

    if (response.status === 429) {
      // 速率限制，增加延迟后重试
      console.log('[FDA] Rate limited, waiting 5 seconds...');
      await delay(5000);
      if (retryCount < MAX_RETRIES) {
        return fetchFDADataWithRetry(limit, skip, retryCount + 1);
      }
      throw new Error('Rate limit exceeded after max retries');
    }

    if (!response.ok) {
      if (response.status === 404) {
        console.log('[FDA] No more data available');
        return [];
      }
      throw new Error(`FDA API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.results || [];
    
  } catch (error) {
    if (retryCount < MAX_RETRIES) {
      console.log(`[FDA] Retry ${retryCount + 1}/${MAX_RETRIES} after error: ${error}`);
      await delay(RATE_LIMIT_DELAY * (retryCount + 1));
      return fetchFDADataWithRetry(limit, skip, retryCount + 1);
    }
    throw error;
  }
}

/**
 * 压缩raw_data，只保留关键字段
 */
function compressRawData(rawData: any): any {
  if (!rawData || typeof rawData !== 'object') return rawData;
  
  return {
    registration_number: rawData.registration_number,
    fei_number: rawData.fei_number,
    registration_status: rawData.registration_status,
    registration_date: rawData.registration_initial_date,
    expiration_date: rawData.registration_expiration_date,
    device_name: rawData.products?.[0]?.device_name,
    device_class: rawData.products?.[0]?.device_class,
    product_code: rawData.products?.[0]?.product_code,
    establishment_type: rawData.establishment_type,
    owner_operator: rawData.owner_operator ? {
      name: rawData.owner_operator.name,
      number: rawData.owner_operator.owner_operator_number
    } : null
  };
}

/**
 * 导入单条FDA记录到Supabase
 */
async function importFDARegistration(
  supabase: any,
  data: FDADeviceRegistration,
  progress: SyncProgress
): Promise<{ inserted: boolean; updated: boolean }> {
  try {
    // 查找或创建公司
    let companyId: string | null = null;
    
    if (data.owner_operator?.name) {
      const { data: existingCompany } = await supabase
        .from('companies')
        .select('id')
        .ilike('name', data.owner_operator.name)
        .single();
      
      if (existingCompany) {
        companyId = existingCompany.id;
      }
    }

    // 如果没有找到公司，创建新公司
    if (!companyId && data.owner_operator?.name) {
      const { data: newCompany, error: companyError } = await supabase
        .from('companies')
        .insert({
          name: data.owner_operator.name,
          name_zh: null,
          country: data.country_code || 'USA',
          address: data.address,
          business_type: data.establishment_type || 'Manufacturer',
          description: `FDA registered medical device company`,
          fda_fei_number: data.fei_number,
        })
        .select('id')
        .single();

      if (!companyError && newCompany) {
        companyId = newCompany.id;
      }
    }

    // 检查记录是否已存在
    const { data: existingReg } = await supabase
      .from('fda_registrations')
      .select('id')
      .eq('registration_number', data.registration_number)
      .single();

    const isUpdate = !!existingReg;

    // 插入或更新注册记录
    const { error: regError } = await supabase
      .from('fda_registrations')
      .upsert({
        company_id: companyId,
        fei_number: data.fei_number,
        registration_number: data.registration_number,
        owner_operator_number: data.owner_operator_number,
        registration_status: data.registration_status,
        registration_date: data.registration_initial_date,
        expiration_date: data.registration_expiration_date,
        product_code: data.products?.[0]?.product_code,
        device_class: data.products?.[0]?.device_class,
        device_name: data.products?.[0]?.device_name,
        device_description: data.products?.[0]?.device_description,
        regulation_number: data.products?.[0]?.regulation_number,
        establishment_type: data.establishment_type,
        address: data.address,
        city: data.city,
        state: data.state,
        zip: data.zip_code,
        country: data.country_code || 'USA',
        source_url: `https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfRL/rl.cfm?lid=${data.registration_number}`,
        raw_data: compressRawData(data),
        last_synced_at: new Date().toISOString(),
      }, {
        onConflict: 'registration_number',
      });

    if (regError) {
      throw new Error(`Database error: ${regError.message}`);
    }

    return { inserted: !isUpdate, updated: isUpdate };
    
  } catch (error) {
    const errorMsg = `Failed to import ${data.registration_number}: ${error}`;
    progress.errors.push(errorMsg);
    if (progress.errors.length > 100) {
      progress.errors.shift(); // 保持错误列表在合理大小
    }
    return { inserted: false, updated: false };
  }
}

/**
 * 记录同步日志
 */
async function logSync(
  supabase: any,
  progress: SyncProgress,
  status: 'success' | 'partial' | 'failed'
) {
  const duration = Date.now() - progress.startTime.getTime();
  
  try {
    await supabase.from('sync_logs').insert({
      data_source: 'FDA_Full',
      sync_type: 'full',
      records_processed: progress.totalFetched,
      records_inserted: progress.totalInserted,
      records_updated: progress.totalUpdated,
      records_failed: progress.totalFailed,
      status,
      error_message: progress.errors.length > 0 ? progress.errors.slice(0, 5).join('; ') : null,
      completed_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[FDA] Failed to log sync:', error);
  }
  
  console.log('\n========================================');
  console.log('FDA Full Sync Completed');
  console.log('========================================');
  console.log(`Status: ${status}`);
  console.log(`Total Fetched: ${progress.totalFetched}`);
  console.log(`Inserted: ${progress.totalInserted}`);
  console.log(`Updated: ${progress.totalUpdated}`);
  console.log(`Failed: ${progress.totalFailed}`);
  console.log(`Duration: ${Math.round(duration / 1000)}s`);
  console.log(`Errors: ${progress.errors.length}`);
}

/**
 * 主同步函数
 */
async function syncFDAFull(options: {
  maxRecords?: number;
  startFrom?: number;
} = {}) {
  const supabase = getSupabaseClient();
  
  const progress: SyncProgress = {
    totalFetched: 0,
    totalInserted: 0,
    totalUpdated: 0,
    totalFailed: 0,
    startTime: new Date(),
    lastSkip: options.startFrom || 0,
    errors: [],
  };

  const maxRecords = options.maxRecords || Infinity;
  
  console.log('========================================');
  console.log('FDA Full Data Synchronization');
  console.log('========================================');
  console.log(`Start time: ${progress.startTime.toISOString()}`);
  console.log(`Max records: ${maxRecords === Infinity ? 'Unlimited' : maxRecords}`);
  console.log(`Starting from skip: ${progress.lastSkip}`);
  console.log('');

  try {
    let hasMoreData = true;
    let consecutiveErrors = 0;
    
    while (hasMoreData && progress.totalFetched < maxRecords) {
      try {
        // 获取数据
        const records = await fetchFDADataWithRetry(BATCH_SIZE, progress.lastSkip);
        
        if (records.length === 0) {
          hasMoreData = false;
          console.log('[FDA] No more data to fetch');
          break;
        }

        // 处理每条记录
        for (const record of records) {
          const result = await importFDARegistration(supabase, record, progress);
          
          if (result.inserted) {
            progress.totalInserted++;
          } else if (result.updated) {
            progress.totalUpdated++;
          } else {
            progress.totalFailed++;
          }
          
          progress.totalFetched++;
          
          // 每100条输出进度
          if (progress.totalFetched % 100 === 0) {
            const elapsed = (Date.now() - progress.startTime.getTime()) / 1000;
            const rate = progress.totalFetched / elapsed;
            console.log(
              `[FDA] Progress: ${progress.totalFetched} records ` +
              `(${progress.totalInserted} inserted, ${progress.totalUpdated} updated) ` +
              `@ ${rate.toFixed(1)} rec/s`
            );
          }
          
          // 检查是否达到最大记录数
          if (progress.totalFetched >= maxRecords) {
            console.log(`[FDA] Reached max records limit: ${maxRecords}`);
            break;
          }
        }

        // 更新skip位置
        progress.lastSkip += records.length;
        consecutiveErrors = 0;
        
        // 速率限制延迟
        await delay(RATE_LIMIT_DELAY);
        
      } catch (error) {
        consecutiveErrors++;
        console.error(`[FDA] Error batch at skip=${progress.lastSkip}:`, error);
        
        if (consecutiveErrors >= 3) {
          console.error('[FDA] Too many consecutive errors, stopping sync');
          break;
        }
        
        // 等待更长时间后重试
        await delay(RATE_LIMIT_DELAY * 5);
      }
    }

    // 记录同步结果
    const status = progress.totalFailed > 0 
      ? (progress.totalInserted + progress.totalUpdated > 0 ? 'partial' : 'failed')
      : 'success';
    
    await logSync(supabase, progress, status);
    
    return {
      success: status !== 'failed',
      status,
      ...progress,
      duration: Date.now() - progress.startTime.getTime(),
    };
    
  } catch (error) {
    console.error('[FDA] Fatal error:', error);
    await logSync(supabase, progress, 'failed');
    throw error;
  }
}

// CLI 入口
const args = process.argv.slice(2);
const maxRecords = args[0] ? parseInt(args[0]) : undefined;
const startFrom = args[1] ? parseInt(args[1]) : 0;

console.log('FDA Full Sync Tool');
console.log('==================\n');

if (args.includes('--help') || args.includes('-h')) {
  console.log('Usage:');
  console.log('  npx ts-node scripts/sync-fda-full.ts [maxRecords] [startFrom]');
  console.log('');
  console.log('Examples:');
  console.log('  npx ts-node scripts/sync-fda-full.ts           # Sync all records');
  console.log('  npx ts-node scripts/sync-fda-full.ts 10000     # Sync first 10,000 records');
  console.log('  npx ts-node scripts/sync-fda-full.ts 10000 50000 # Sync 10,000 records starting from 50,000');
  console.log('');
  console.log('Environment Variables:');
  console.log('  FDA_API_KEY      - FDA API key (optional but recommended)');
  console.log('  SUPABASE_URL     - Supabase URL');
  console.log('  SUPABASE_KEY     - Supabase service key');
  process.exit(0);
}

syncFDAFull({ maxRecords, startFrom })
  .then(result => {
    console.log('\nSync completed:', result.status);
    process.exit(result.success ? 0 : 1);
  })
  .catch(error => {
    console.error('\nSync failed:', error);
    process.exit(1);
  });

export { syncFDAFull };
