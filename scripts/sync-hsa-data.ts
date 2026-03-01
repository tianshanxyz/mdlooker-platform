// HSA (Health Sciences Authority) Data Synchronization Script
// 新加坡医疗器械注册数据同步

import { createClient } from '../app/lib/supabase';

const supabase = createClient();

interface HSARegistrationData {
  registrationNumber?: string;
  deviceName?: string;
  deviceDescription?: string;
  deviceClass?: string;
  deviceCategory?: string;
  manufacturerName?: string;
  manufacturerAddress?: string;
  manufacturerCountry?: string;
  registrantName?: string;
  registrantAddress?: string;
  registrationStatus?: string;
  registrationDate?: string;
  expiryDate?: string;
  sourceUrl?: string;
  hsaUrl?: string;
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
 * Fetch HSA data
 * Note: HSA provides public access to MEDICS database
 */
async function fetchHSAData(): Promise<HSARegistrationData[]> {
  const results: HSARegistrationData[] = [];

  try {
    // HSA MEDICS Public Search
    // https://www.hsa.gov.sg/medical-devices
    // https://crm.hsa.gov.sg/MEDICS/

    console.log('[HSA] HSA MEDICS data integration placeholder');
    console.log('[HSA] To enable full sync, use HSA MEDICS database:');
    console.log('[HSA] https://www.hsa.gov.sg/medical-devices');

    // Placeholder: Return empty array
    // In production, this would scrape or use HSA API
    return results;
  } catch (error) {
    console.error('[HSA] Error fetching HSA data:', error);
    return [];
  }
}

/**
 * Import HSA registration data
 */
async function importHSARegistration(data: HSARegistrationData, companyId?: string) {
  try {
    const registration = {
      company_id: companyId,
      registration_number: data.registrationNumber,
      device_name: data.deviceName,
      device_description: data.deviceDescription,
      device_class: data.deviceClass,
      device_category: data.deviceCategory,
      manufacturer_name: data.manufacturerName,
      manufacturer_address: data.manufacturerAddress,
      manufacturer_country: data.manufacturerCountry,
      registrant_name: data.registrantName,
      registrant_address: data.registrantAddress,
      registration_status: data.registrationStatus,
      registration_date: data.registrationDate,
      expiry_date: data.expiryDate,
      source_url: data.sourceUrl,
      hsa_url: data.hsaUrl,
      raw_data: data,
    };

    const { error } = await supabase
      .from('hsa_registrations')
      .upsert(registration, {
        onConflict: 'registration_number',
      });

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error('[HSA] Error importing registration:', error);
    throw error;
  }
}

/**
 * Sync HSA data
 */
export async function syncHSAData(): Promise<SyncResult> {
  const startTime = Date.now();
  const source = 'HSA';

  console.log(`[${source}] Starting sync...`);

  try {
    // Fetch data from HSA
    const data = await fetchHSAData();

    let inserted = 0;
    let updated = 0;
    let failed = 0;

    for (const item of data) {
      try {
        // Try to find matching company
        let companyId = undefined;
        if (item.manufacturerName) {
          const { data: company } = await supabase
            .from('companies')
            .select('id')
            .ilike('name', item.manufacturerName)
            .single();

          if (company) {
            companyId = company.id;
          }
        }

        await importHSARegistration(item, companyId);

        // Check if it was an insert or update
        const { data: existing } = await supabase
          .from('hsa_registrations')
          .select('id')
          .eq('registration_number', item.registrationNumber)
          .single();

        if (existing) {
          updated++;
        } else {
          inserted++;
        }
      } catch (error) {
        failed++;
        console.error(`[${source}] Error processing item:`, error);
      }
    }

    const duration = Date.now() - startTime;

    await logSync({
      data_source: source,
      sync_type: 'incremental',
      records_processed: data.length,
      records_inserted: inserted,
      records_updated: updated,
      records_failed: failed,
      status: failed > 0 ? (failed === data.length ? 'failed' : 'partial') : 'success',
    });

    console.log(`[${source}] Sync completed: ${inserted} inserted, ${updated} updated, ${failed} failed`);

    return {
      source,
      recordsProcessed: data.length,
      recordsInserted: inserted,
      recordsUpdated: updated,
      recordsFailed: failed,
      status: failed > 0 ? (failed === data.length ? 'failed' : 'partial') : 'success',
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
 * Search HSA registrations by device name or company
 */
export async function searchHSARegistrations(query: string) {
  try {
    const { data, error } = await supabase
      .from('hsa_registrations')
      .select(`
        *,
        company:companies(id, name, name_zh)
      `)
      .or(`device_name.ilike.%${query}%,manufacturer_name.ilike.%${query}%`)
      .limit(50);

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('[HSA] Error searching registrations:', error);
    return [];
  }
}

// CLI usage
if (require.main === module) {
  console.log('HSA Data Synchronization Tool');
  console.log('===============================\n');

  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'sync':
      syncHSAData().then(result => {
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
        console.log('Usage: npx ts-node scripts/sync-hsa-data.ts search <query>');
        process.exit(1);
      }
      searchHSARegistrations(searchQuery).then(results => {
        console.log(`\nFound ${results.length} results:`);
        results.forEach((r: any) => {
          console.log(`\n  Device: ${r.device_name}`);
          console.log(`  Manufacturer: ${r.manufacturer_name}`);
          console.log(`  Registration: ${r.registration_number}`);
          console.log(`  Class: ${r.device_class}`);
          console.log(`  Status: ${r.registration_status}`);
          console.log(`  Registrant: ${r.registrant_name || 'N/A'}`);
        });
        process.exit(0);
      }).catch(error => {
        console.error('Search failed:', error);
        process.exit(1);
      });
      break;

    default:
      console.log('Usage:');
      console.log('  npx ts-node scripts/sync-hsa-data.ts sync    - Run full sync');
      console.log('  npx ts-node scripts/sync-hsa-data.ts search <query>  - Search registrations');
      console.log('\nEnvironment Variables:');
      console.log('  SUPABASE_URL       - Supabase URL');
      console.log('  SUPABASE_KEY       - Supabase service key');
      console.log('\nHSA Data Sources:');
      console.log('  MEDICS Database: https://www.hsa.gov.sg/medical-devices');
      console.log('  Search: https://crm.hsa.gov.sg/MEDICS/');
      process.exit(0);
  }
}
