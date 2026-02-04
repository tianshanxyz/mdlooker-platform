// Data Synchronization Script for MDLooker
// Supports FDA, NMPA, EUDAMED, PMDA, Health Canada

import { supabase } from '../app/lib/supabase';

interface SyncConfig {
  source: string;
  enabled: boolean;
  apiEndpoint?: string;
  apiKey?: string;
  lastSync?: string;
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

// Sync configurations for different data sources
const syncConfigs: Record<string, SyncConfig> = {
  fda: {
    source: 'FDA',
    enabled: true,
    apiEndpoint: 'https://api.fda.gov/device/registrationlisting.json',
    apiKey: process.env.FDA_API_KEY,
  },
  nmpa: {
    source: 'NMPA',
    enabled: false, // Requires web scraping or manual import
    apiEndpoint: 'https://www.nmpa.gov.cn/datasearch/search-info.html',
  },
  eudamed: {
    source: 'EUDAMED',
    enabled: false, // Requires EUDAMED API access
    apiEndpoint: 'https://ec.europa.eu/tools/eudamed/api',
  },
  pmda: {
    source: 'PMDA',
    enabled: false, // Requires web scraping
    apiEndpoint: 'https://www.pmda.go.jp/PmdaSearch/iyakuSearch/',
  },
  health_canada: {
    source: 'Health Canada',
    enabled: false, // Requires MDALL API access
    apiEndpoint: 'https://health-products.canada.ca/api/',
  },
};

/**
 * Log sync operation to database
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
 * Sync FDA registration data
 */
async function syncFDAData(): Promise<SyncResult> {
  const startTime = Date.now();
  const config = syncConfigs.fda;
  
  if (!config.enabled) {
    return {
      source: config.source,
      recordsProcessed: 0,
      recordsInserted: 0,
      recordsUpdated: 0,
      recordsFailed: 0,
      status: 'success',
      duration: 0,
    };
  }

  try {
    console.log(`[${config.source}] Starting sync...`);
    
    // Example: Fetch recent FDA registrations
    // Note: In production, you would paginate through all results
    const url = new URL(config.apiEndpoint!);
    url.searchParams.append('limit', '100');
    url.searchParams.append('skip', '0');
    
    if (config.apiKey) {
      url.searchParams.append('api_key', config.apiKey);
    }

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const results = data.results || [];
    
    let inserted = 0;
    let updated = 0;
    let failed = 0;

    for (const item of results) {
      try {
        // Map FDA data to our schema
        const registration = {
          fei_number: item.fei_number,
          registration_number: item.registration_number,
          owner_operator_number: item.owner_operator_number,
          registration_status: item.registration_status,
          registration_date: item.registration_date,
          expiration_date: item.expiration_date,
          product_code: item.product_code,
          device_class: item.device_class,
          device_name: item.device_name,
          device_description: item.device_description,
          regulation_number: item.regulation_number,
          establishment_type: item.establishment_type,
          address: item.address,
          city: item.city,
          state: item.state,
          zip: item.zip,
          country: item.country,
          source_url: `https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfRL/rl.cfm?lid=${item.registration_number}`,
          raw_data: item,
        };

        // Upsert to database
        const { error } = await supabase
          .from('fda_registrations')
          .upsert(registration, {
            onConflict: 'registration_number',
          });

        if (error) {
          if (error.code === '23505') {
            updated++;
          } else {
            failed++;
            console.error(`[${config.source}] Error upserting ${item.registration_number}:`, error);
          }
        } else {
          inserted++;
        }
      } catch (error) {
        failed++;
        console.error(`[${config.source}] Error processing item:`, error);
      }
    }

    const duration = Date.now() - startTime;
    
    await logSync({
      data_source: config.source,
      sync_type: 'incremental',
      records_processed: results.length,
      records_inserted: inserted,
      records_updated: updated,
      records_failed: failed,
      status: failed > 0 ? (failed === results.length ? 'failed' : 'partial') : 'success',
    });

    console.log(`[${config.source}] Sync completed: ${inserted} inserted, ${updated} updated, ${failed} failed`);

    return {
      source: config.source,
      recordsProcessed: results.length,
      recordsInserted: inserted,
      recordsUpdated: updated,
      recordsFailed: failed,
      status: failed > 0 ? (failed === results.length ? 'failed' : 'partial') : 'success',
      duration,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    await logSync({
      data_source: config.source,
      sync_type: 'incremental',
      records_processed: 0,
      records_inserted: 0,
      records_updated: 0,
      records_failed: 0,
      status: 'failed',
      error_message: errorMessage,
    });

    console.error(`[${config.source}] Sync failed:`, errorMessage);

    return {
      source: config.source,
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
 * Sync all enabled data sources
 */
export async function syncAllData(): Promise<SyncResult[]> {
  console.log('Starting data synchronization for all sources...');
  console.log('================================================');
  
  const results: SyncResult[] = [];
  
  // Sync FDA data
  results.push(await syncFDAData());
  
  // Add other data sources here as they become available
  // results.push(await syncNMPAData());
  // results.push(await syncEUDAMEDData());
  // results.push(await syncPMDAData());
  // results.push(await syncHealthCanadaData());
  
  console.log('================================================');
  console.log('Data synchronization completed');
  
  return results;
}

/**
 * Get sync status and statistics
 */
export async function getSyncStatus() {
  const { data: logs, error } = await supabase
    .from('sync_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Error fetching sync status:', error);
    return null;
  }

  return logs;
}

// CLI usage
if (require.main === module) {
  console.log('MDLooker Data Synchronization Tool');
  console.log('===================================\n');
  
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'sync':
      syncAllData().then(results => {
        console.log('\nSync Results:');
        results.forEach(result => {
          console.log(`\n${result.source}:`);
          console.log(`  Status: ${result.status}`);
          console.log(`  Processed: ${result.recordsProcessed}`);
          console.log(`  Inserted: ${result.recordsInserted}`);
          console.log(`  Updated: ${result.recordsUpdated}`);
          console.log(`  Failed: ${result.recordsFailed}`);
          console.log(`  Duration: ${result.duration}ms`);
          if (result.error) {
            console.log(`  Error: ${result.error}`);
          }
        });
        process.exit(0);
      }).catch(error => {
        console.error('Sync failed:', error);
        process.exit(1);
      });
      break;
      
    case 'status':
      getSyncStatus().then(logs => {
        if (logs && logs.length > 0) {
          console.log('\nRecent Sync Logs:');
          logs.forEach((log: { data_source: string; status: string; records_processed: number; created_at: string }) => {
            console.log(`\n${log.data_source} - ${log.status}`);
            console.log(`  Records: ${log.records_processed}`);
            console.log(`  Time: ${new Date(log.created_at).toLocaleString()}`);
          });
        } else {
          console.log('No sync logs found');
        }
        process.exit(0);
      }).catch(error => {
        console.error('Failed to get status:', error);
        process.exit(1);
      });
      break;
      
    default:
      console.log('Usage:');
      console.log('  npx ts-node scripts/sync-data.ts sync    - Run full sync');
      console.log('  npx ts-node scripts/sync-data.ts status  - View sync status');
      console.log('\nEnvironment Variables:');
      console.log('  FDA_API_KEY     - FDA API key (optional)');
      console.log('  SUPABASE_URL    - Supabase URL');
      console.log('  SUPABASE_KEY    - Supabase service key');
      process.exit(0);
  }
}
