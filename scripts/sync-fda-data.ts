// FDA Data Synchronization Script
// 使用 openFDA API 同步医疗器械注册数据
// API文档: https://open.fda.gov/apis/device/

import { createClient } from '../app/lib/supabase';

const supabase = createClient();

// FDA Open API 基础URL
const FDA_API_BASE = 'https://api.fda.gov/device';

interface FDADeviceRegistration {
  fei_number: string;
  registration_number: string;
  owner_operator_number: string;
  registration_status: string;
  registration_date: string;
  expiration_date: string;
  product_code: string;
  device_class: string;
  device_name: string;
  device_description: string;
  regulation_number: string;
  establishment_type: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  owner_operator: {
    name: string;
    address: string;
  };
}

interface SyncResult {
  source: string;
  recordsProcessed: number;
  recordsInserted: number;
  recordsUpdated: number;
  recordsFailed: number;
  status: 'success' | 'partial' | 'failed';
  error?: string;
  duration: number;
}

/**
 * 记录同步日志
 */
async function logSync(logData: {
  data_source: string;
  sync_type: string;
  records_processed: number;
  records_inserted: number;
  records_updated: number;
  records_failed: number;
  status: string;
  error_message?: string;
}) {
  try {
    await supabase.from('sync_logs').insert({
      ...logData,
      completed_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to log sync:', error);
  }
}

/**
 * 从openFDA API获取注册数据
 * 注意: openFDA有速率限制，建议添加API key
 */
async function fetchFDARegistrations(
  searchQuery?: string,
  limit: number = 100,
  skip: number = 0
): Promise<FDADeviceRegistration[]> {
  const apiKey = process.env.FDA_API_KEY;
  
  try {
    const url = new URL(`${FDA_API_BASE}/registrationlisting.json`);
    
    // 添加搜索条件
    if (searchQuery) {
      url.searchParams.append('search', searchQuery);
    }
    
    url.searchParams.append('limit', limit.toString());
    url.searchParams.append('skip', skip.toString());
    
    if (apiKey) {
      url.searchParams.append('api_key', apiKey);
    }

    console.log(`[FDA] Fetching: ${url.toString()}`);
    
    const response = await fetch(url.toString(), {
      headers: {
        'Accept': 'application/json',
      },
    });

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
    console.error('[FDA] Error fetching data:', error);
    return [];
  }
}

/**
 * 获取FDA召回数据
 */
async function fetchFDARecalls(
  limit: number = 100,
  skip: number = 0
): Promise<any[]> {
  const apiKey = process.env.FDA_API_KEY;
  
  try {
    const url = new URL(`${FDA_API_BASE}/recall.json`);
    url.searchParams.append('limit', limit.toString());
    url.searchParams.append('skip', skip.toString());
    
    if (apiKey) {
      url.searchParams.append('api_key', apiKey);
    }

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`FDA API error: ${response.status}`);
    }

    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('[FDA] Error fetching recalls:', error);
    return [];
  }
}

/**
 * 导入单个FDA注册记录
 */
async function importFDARegistration(data: FDADeviceRegistration): Promise<boolean> {
  try {
    // 尝试查找匹配的公司
    let companyId = null;
    if (data.owner_operator?.name) {
      const { data: company } = await supabase
        .from('companies')
        .select('id')
        .ilike('name', data.owner_operator.name)
        .single();
      
      if (company) {
        companyId = company.id;
      }
    }

    const registration = {
      company_id: companyId,
      fei_number: data.fei_number,
      registration_number: data.registration_number,
      owner_operator_number: data.owner_operator_number,
      registration_status: data.registration_status,
      registration_date: data.registration_date,
      expiration_date: data.expiration_date,
      product_code: data.product_code,
      device_class: data.device_class,
      device_name: data.device_name,
      device_description: data.device_description,
      regulation_number: data.regulation_number,
      establishment_type: data.establishment_type,
      address: data.address,
      city: data.city,
      state: data.state,
      zip: data.zip,
      country: data.country,
      source_url: `https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfRL/rl.cfm?lid=${data.registration_number}`,
      raw_data: data,
    };

    const { error } = await supabase
      .from('fda_registrations')
      .upsert(registration, {
        onConflict: 'registration_number',
      });

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error('[FDA] Error importing registration:', error);
    return false;
  }
}

/**
 * 同步FDA注册数据
 */
export async function syncFDAData(options?: {
  searchQuery?: string;
  maxRecords?: number;
}): Promise<SyncResult> {
  const startTime = Date.now();
  const source = 'FDA';
  
  console.log(`[${source}] Starting sync...`);
  console.log(`[${source}] Note: FDA API has rate limits. Consider getting an API key at https://open.fda.gov/apis/authentication/`);
  
  try {
    let allRecords: FDADeviceRegistration[] = [];
    let skip = 0;
    const limit = 100;
    const maxRecords = options?.maxRecords || 1000;
    
    // 分页获取数据
    while (allRecords.length < maxRecords) {
      const records = await fetchFDARegistrations(options?.searchQuery, limit, skip);
      
      if (records.length === 0) {
        break;
      }
      
      allRecords = allRecords.concat(records);
      skip += limit;
      
      console.log(`[${source}] Fetched ${allRecords.length} records so far...`);
      
      // 避免触发速率限制
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`[${source}] Total records to process: ${allRecords.length}`);
    
    let inserted = 0;
    let updated = 0;
    let failed = 0;

    for (const record of allRecords) {
      try {
        const success = await importFDARegistration(record);
        
        if (success) {
          // 检查是插入还是更新
          const { data: existing } = await supabase
            .from('fda_registrations')
            .select('id')
            .eq('registration_number', record.registration_number)
            .single();
            
          if (existing) {
            updated++;
          } else {
            inserted++;
          }
        } else {
          failed++;
        }
      } catch (error) {
        failed++;
        console.error(`[${source}] Error processing record:`, error);
      }
    }

    const duration = Date.now() - startTime;
    
    await logSync({
      data_source: source,
      sync_type: 'incremental',
      records_processed: allRecords.length,
      records_inserted: inserted,
      records_updated: updated,
      records_failed: failed,
      status: failed > 0 ? (failed === allRecords.length ? 'failed' : 'partial') : 'success',
    });

    console.log(`[${source}] Sync completed: ${inserted} inserted, ${updated} updated, ${failed} failed`);

    return {
      source,
      recordsProcessed: allRecords.length,
      recordsInserted: inserted,
      recordsUpdated: updated,
      recordsFailed: failed,
      status: failed > 0 ? (failed === allRecords.length ? 'failed' : 'partial') : 'success',
      duration,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    await logSync({
      data_source: source,
      sync_type: 'incremental',
      records_processed: 0,
      records_inserted: 0,
      records_updated: 0,
      records_failed: 0,
      status: 'failed',
      error_message: errorMessage,
    });

    return {
      source,
      recordsProcessed: 0,
      recordsInserted: 0,
      recordsUpdated: 0,
      recordsFailed: 0,
      status: 'failed',
      error: errorMessage,
      duration,
    };
  }
}

/**
 * 搜索FDA注册记录
 */
export async function searchFDARegistrations(query: string) {
  try {
    const { data, error } = await supabase
      .from('fda_registrations')
      .select(`
        *,
        company:companies(id, name, name_zh)
      `)
      .or(`device_name.ilike.%${query}%,device_description.ilike.%${query}%`)
      .limit(50);

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('[FDA] Error searching registrations:', error);
    return [];
  }
}

// CLI usage
if (require.main === module) {
  console.log('FDA Data Synchronization Tool');
  console.log('===============================\n');
  
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'sync':
      const maxRecords = args[1] ? parseInt(args[1]) : 1000;
      syncFDAData({ maxRecords }).then(result => {
        console.log('\nSync Results:');
        console.log(`  Source: ${result.source}`);
        console.log(`  Status: ${result.status}`);
        console.log(`  Processed: ${result.recordsProcessed}`);
        console.log(`  Inserted: ${result.recordsInserted}`);
        console.log(`  Updated: ${result.recordsUpdated}`);
        console.log(`  Failed: ${result.recordsFailed}`);
        console.log(`  Duration: ${result.duration}ms`);
        if (result.error) {
          console.log(`  Error: ${result.error}`);
        }
        process.exit(0);
      }).catch(error => {
        console.error('Sync failed:', error);
        process.exit(1);
      });
      break;
      
    case 'search':
      const searchQuery = args[1];
      if (!searchQuery) {
        console.log('Usage: npx ts-node scripts/sync-fda-data.ts search <query>');
        process.exit(1);
      }
      searchFDARegistrations(searchQuery).then(results => {
        console.log(`\nFound ${results.length} results:`);
        results.forEach((r: any) => {
          console.log(`\n  Device: ${r.device_name}`);
          console.log(`  Registration: ${r.registration_number}`);
          console.log(`  Class: ${r.device_class}`);
          console.log(`  Status: ${r.registration_status}`);
          console.log(`  Company: ${r.company?.name || 'N/A'}`);
        });
        process.exit(0);
      }).catch(error => {
        console.error('Search failed:', error);
        process.exit(1);
      });
      break;
      
    default:
      console.log('Usage:');
      console.log('  npx ts-node scripts/sync-fda-data.ts sync [maxRecords]  - Run full sync');
      console.log('  npx ts-node scripts/sync-fda-data.ts search <query>     - Search registrations');
      console.log('\nEnvironment Variables:');
      console.log('  FDA_API_KEY        - FDA API key (optional, increases rate limits)');
      console.log('  SUPABASE_URL       - Supabase URL');
      console.log('  SUPABASE_KEY       - Supabase service key');
      console.log('\nFDA Data Sources:');
      console.log('  API: https://api.fda.gov/device/registrationlisting.json');
      console.log('  Docs: https://open.fda.gov/apis/device/');
      console.log('  Authentication: https://open.fda.gov/apis/authentication/');
      process.exit(0);
  }
}
