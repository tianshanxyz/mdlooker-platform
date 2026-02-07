// MHRA Data Synchronization Script
// 英国药品和保健品管理局医疗器械注册数据同步

import { createClient } from '../app/lib/supabase';

const supabase = createClient();

interface MHRRegistrationData {
  registrationNumber?: string;
  deviceName?: string;
  deviceDescription?: string;
  deviceClass?: string;
  deviceCategory?: string;
  gmdnCode?: string;
  manufacturerName?: string;
  manufacturerAddress?: string;
  manufacturerCountry?: string;
  ukResponsiblePerson?: string;
  ukrpAddress?: string;
  ukrpCountry?: string;
  registrationStatus?: string;
  registrationDate?: string;
  expirationDate?: string;
  approvedBodyName?: string;
  approvedBodyNumber?: string;
  certificateNumber?: string;
  isNorthernIreland?: boolean;
  niNotifiedBody?: string;
  sourceUrl?: string;
  mhraUrl?: string;
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
 * Fetch MHRA data
 * Note: MHRA provides public access to registered devices through their website
 */
async function fetchMHRData(): Promise<MHRRegistrationData[]> {
  const results: MHRRegistrationData[] = [];
  
  try {
    // MHRA Public Search
    // https://www.gov.uk/guidance/register-medical-devices-to-place-them-on-the-uk-market
    // https://aic.mhra.gov.uk/era/pdr.nsf/regsearch?OpenView
    
    console.log('[MHRA] MHRA data integration placeholder');
    console.log('[MHRA] To enable full sync, use MHRA registered devices database:');
    console.log('[MHRA] https://aic.mhra.gov.uk/era/pdr.nsf/regsearch?OpenView');
    
    // Placeholder: Return empty array
    // In production, this would scrape or use MHRA API
    return results;
  } catch (error) {
    console.error('[MHRA] Error fetching MHRA data:', error);
    return [];
  }
}

/**
 * Import MHRA registration data
 */
async function importMHRRegistration(data: MHRRegistrationData, companyId?: string) {
  try {
    const registration = {
      company_id: companyId,
      registration_number: data.registrationNumber,
      device_name: data.deviceName,
      device_description: data.deviceDescription,
      device_class: data.deviceClass,
      device_category: data.deviceCategory,
      gmdn_code: data.gmdnCode,
      manufacturer_name: data.manufacturerName,
      manufacturer_address: data.manufacturerAddress,
      manufacturer_country: data.manufacturerCountry,
      uk_responsible_person: data.ukResponsiblePerson,
      ukrp_address: data.ukrpAddress,
      ukrp_country: data.ukrpCountry,
      registration_status: data.registrationStatus,
      registration_date: data.registrationDate,
      expiration_date: data.expirationDate,
      approved_body_name: data.approvedBodyName,
      approved_body_number: data.approvedBodyNumber,
      certificate_number: data.certificateNumber,
      is_northern_ireland: data.isNorthernIreland,
      ni_notified_body: data.niNotifiedBody,
      source_url: data.sourceUrl,
      mhra_url: data.mhraUrl,
      raw_data: data,
    };

    const { error } = await supabase
      .from('mhra_registrations')
      .upsert(registration, {
        onConflict: 'registration_number',
      });

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error('[MHRA] Error importing registration:', error);
    throw error;
  }
}

/**
 * Sync MHRA data
 */
export async function syncMHRData(): Promise<SyncResult> {
  const startTime = Date.now();
  const source = 'MHRA';
  
  console.log(`[${source}] Starting sync...`);
  
  try {
    // Fetch data from MHRA
    const data = await fetchMHRData();
    
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

        await importMHRRegistration(item, companyId);
        
        // Check if it was an insert or update
        const { data: existing } = await supabase
          .from('mhra_registrations')
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
 * Search MHRA registrations by device name or company
 */
export async function searchMHRRegistrations(query: string) {
  try {
    const { data, error } = await supabase
      .from('mhra_registrations')
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
    console.error('[MHRA] Error searching registrations:', error);
    return [];
  }
}

// CLI usage
if (require.main === module) {
  console.log('MHRA Data Synchronization Tool');
  console.log('================================\n');
  
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'sync':
      syncMHRData().then(result => {
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
        console.log('Usage: npx ts-node scripts/sync-mhra-data.ts search <query>');
        process.exit(1);
      }
      searchMHRRegistrations(searchQuery).then(results => {
        console.log(`\nFound ${results.length} results:`);
        results.forEach((r: any) => {
          console.log(`\n  Device: ${r.device_name}`);
          console.log(`  Manufacturer: ${r.manufacturer_name}`);
          console.log(`  Registration: ${r.registration_number}`);
          console.log(`  Class: ${r.device_class}`);
          console.log(`  Status: ${r.registration_status}`);
          console.log(`  UKRP: ${r.uk_responsible_person || 'N/A'}`);
        });
        process.exit(0);
      }).catch(error => {
        console.error('Search failed:', error);
        process.exit(1);
      });
      break;
      
    default:
      console.log('Usage:');
      console.log('  npx ts-node scripts/sync-mhra-data.ts sync    - Run full sync');
      console.log('  npx ts-node scripts/sync-mhra-data.ts search <query>  - Search registrations');
      console.log('\nEnvironment Variables:');
      console.log('  SUPABASE_URL       - Supabase URL');
      console.log('  SUPABASE_KEY       - Supabase service key');
      console.log('\nMHRA Data Sources:');
      console.log('  Public Database: https://aic.mhra.gov.uk/era/pdr.nsf/regsearch?OpenView');
      console.log('  Guidance: https://www.gov.uk/guidance/register-medical-devices-to-place-them-on-the-uk-market');
      process.exit(0);
  }
}
