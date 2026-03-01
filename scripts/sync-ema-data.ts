// EMA/EUDAMED Data Synchronization Script
// 欧洲药品管理局医疗器械注册数据同步

import { createClient } from '../app/lib/supabase';

const supabase = createClient();

interface EMARegistrationData {
  actorId?: string;
  actorName?: string;
  actorNameEn?: string;
  actorAddress?: string;
  actorCountry?: string;
  srn?: string;
  deviceName?: string;
  deviceNameEn?: string;
  deviceDescription?: string;
  udiDi?: string;
  udiPi?: string;
  deviceRiskClass?: string;
  deviceNomenclatureCode?: string;
  registrationStatus?: string;
  registrationDate?: string;
  expirationDate?: string;
  notifiedBodyName?: string;
  notifiedBodyCode?: string;
  certificateNumber?: string;
  certificateType?: string;
  manufacturerName?: string;
  manufacturerAddress?: string;
  manufacturerCountry?: string;
  authorizedRepresentative?: string;
  arAddress?: string;
  arCountry?: string;
  sourceUrl?: string;
  eudamedUrl?: string;
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
 * Fetch EUDAMED data via public API
 * Note: EUDAMED provides public access to basic actor and device data
 */
async function fetchEUDAMEDData(): Promise<EMARegistrationData[]> {
  // EUDAMED API endpoints (public access)
  // Note: Full EUDAMED API requires registration
  const results: EMARegistrationData[] = [];
  
  try {
    // EUDAMED Public Search API
    // https://ec.europa.eu/tools/eudamed/api/
    
    // For now, we'll create a placeholder that can be replaced with actual API calls
    // when EUDAMED API credentials are obtained
    
    console.log('[EMA] EUDAMED API integration placeholder');
    console.log('[EMA] To enable full sync, obtain EUDAMED API credentials from:');
    console.log('[EMA] https://ec.europa.eu/tools/eudamed/landing-page/index.html');
    
    // Placeholder: Return empty array
    // In production, this would make actual API calls to EUDAMED
    return results;
  } catch (error) {
    console.error('[EMA] Error fetching EUDAMED data:', error);
    return [];
  }
}

/**
 * Import EMA registration data
 */
async function importEMARegistration(data: EMARegistrationData, companyId?: string) {
  try {
    const registration = {
      company_id: companyId,
      actor_id: data.actorId,
      actor_name: data.actorName,
      actor_name_en: data.actorNameEn,
      actor_address: data.actorAddress,
      actor_country: data.actorCountry,
      srn: data.srn,
      device_name: data.deviceName,
      device_name_en: data.deviceNameEn,
      device_description: data.deviceDescription,
      udi_di: data.udiDi,
      udi_pi: data.udiPi,
      device_risk_class: data.deviceRiskClass,
      device_nomenclature_code: data.deviceNomenclatureCode,
      registration_status: data.registrationStatus,
      registration_date: data.registrationDate,
      expiration_date: data.expirationDate,
      notified_body_name: data.notifiedBodyName,
      notified_body_code: data.notifiedBodyCode,
      certificate_number: data.certificateNumber,
      certificate_type: data.certificateType,
      manufacturer_name: data.manufacturerName,
      manufacturer_address: data.manufacturerAddress,
      manufacturer_country: data.manufacturerCountry,
      authorized_representative: data.authorizedRepresentative,
      ar_address: data.arAddress,
      ar_country: data.arCountry,
      source_url: data.sourceUrl,
      eudamed_url: data.eudamedUrl,
      raw_data: data,
    };

    const { error } = await supabase
      .from('ema_registrations')
      .upsert(registration, {
        onConflict: 'srn',
      });

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error('[EMA] Error importing registration:', error);
    throw error;
  }
}

/**
 * Sync EMA/EUDAMED data
 */
export async function syncEMAData(): Promise<SyncResult> {
  const startTime = Date.now();
  const source = 'EMA/EUDAMED';
  
  console.log(`[${source}] Starting sync...`);
  
  try {
    // Fetch data from EUDAMED
    const data = await fetchEUDAMEDData();
    
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

        await importEMARegistration(item, companyId);
        
        // Check if it was an insert or update
        const { data: existing } = await supabase
          .from('ema_registrations')
          .select('id')
          .eq('srn', item.srn)
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
 * Search EMA registrations by device name or company
 */
export async function searchEMARegistrations(query: string) {
  try {
    const { data, error } = await supabase
      .from('ema_registrations')
      .select(`
        *,
        company:companies(id, name, name_zh)
      `)
      .or(`device_name.ilike.%${query}%,device_name_en.ilike.%${query}%,manufacturer_name.ilike.%${query}%`)
      .limit(50);

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('[EMA] Error searching registrations:', error);
    return [];
  }
}

// CLI usage
if (require.main === module) {
  console.log('EMA/EUDAMED Data Synchronization Tool');
  console.log('=====================================\n');
  
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'sync':
      syncEMAData().then(result => {
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
        console.log('Usage: npx ts-node scripts/sync-ema-data.ts search <query>');
        process.exit(1);
      }
      searchEMARegistrations(searchQuery).then(results => {
        console.log(`\nFound ${results.length} results:`);
        results.forEach((r: any) => {
          console.log(`\n  Device: ${r.device_name || r.device_name_en}`);
          console.log(`  Manufacturer: ${r.manufacturer_name}`);
          console.log(`  SRN: ${r.srn}`);
          console.log(`  Class: ${r.device_risk_class}`);
          console.log(`  Status: ${r.registration_status}`);
        });
        process.exit(0);
      }).catch(error => {
        console.error('Search failed:', error);
        process.exit(1);
      });
      break;
      
    default:
      console.log('Usage:');
      console.log('  npx ts-node scripts/sync-ema-data.ts sync    - Run full sync');
      console.log('  npx ts-node scripts/sync-ema-data.ts search <query>  - Search registrations');
      console.log('\nEnvironment Variables:');
      console.log('  EUDAMED_API_KEY    - EUDAMED API key (optional)');
      console.log('  SUPABASE_URL       - Supabase URL');
      console.log('  SUPABASE_KEY       - Supabase service key');
      console.log('\nNote: EUDAMED API requires registration at:');
      console.log('  https://ec.europa.eu/tools/eudamed/landing-page/index.html');
      process.exit(0);
  }
}
