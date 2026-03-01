// TGA (Therapeutic Goods Administration) Data Synchronization Script
// 澳大利亚医疗器械注册数据同步

import { createClient } from '../app/lib/supabase';

const supabase = createClient();

interface TGARegistrationData {
  artgId?: string;
  artgNumber?: string;
  productName?: string;
  deviceDescription?: string;
  deviceClass?: string;
  gmdnCode?: string;
  manufacturerName?: string;
  manufacturerAddress?: string;
  manufacturerCountry?: string;
  sponsorName?: string;
  sponsorAddress?: string;
  registrationStatus?: string;
  registrationDate?: string;
  expiryDate?: string;
  conformityAssessmentBody?: string;
  sourceUrl?: string;
  tgaUrl?: string;
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
 * Fetch TGA ARTG data
 * Note: TGA provides public access to ARTG database
 */
async function fetchTGAData(): Promise<TGARegistrationData[]> {
  const results: TGARegistrationData[] = [];
  
  try {
    // TGA ARTG Public Search
    // https://www.tga.gov.au/resources/artg
    // https://tga-search.clients.funnelback.com/s/search.html?collection=tga-artg
    
    console.log('[TGA] TGA ARTG data integration placeholder');
    console.log('[TGA] To enable full sync, use TGA ARTG database:');
    console.log('[TGA] https://www.tga.gov.au/resources/artg');
    
    // Placeholder: Return empty array
    // In production, this would scrape or use TGA API
    return results;
  } catch (error) {
    console.error('[TGA] Error fetching TGA data:', error);
    return [];
  }
}

/**
 * Import TGA registration data
 */
async function importTGARegistration(data: TGARegistrationData, companyId?: string) {
  try {
    const registration = {
      company_id: companyId,
      artg_id: data.artgId,
      artg_number: data.artgNumber,
      product_name: data.productName,
      device_description: data.deviceDescription,
      device_class: data.deviceClass,
      gmdn_code: data.gmdnCode,
      manufacturer_name: data.manufacturerName,
      manufacturer_address: data.manufacturerAddress,
      manufacturer_country: data.manufacturerCountry,
      sponsor_name: data.sponsorName,
      sponsor_address: data.sponsorAddress,
      registration_status: data.registrationStatus,
      registration_date: data.registrationDate,
      expiry_date: data.expiryDate,
      conformity_assessment_body: data.conformityAssessmentBody,
      source_url: data.sourceUrl,
      tga_url: data.tgaUrl,
      raw_data: data,
    };

    const { error } = await supabase
      .from('tga_registrations')
      .upsert(registration, {
        onConflict: 'artg_number',
      });

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error('[TGA] Error importing registration:', error);
    throw error;
  }
}

/**
 * Sync TGA data
 */
export async function syncTGAData(): Promise<SyncResult> {
  const startTime = Date.now();
  const source = 'TGA';
  
  console.log(`[${source}] Starting sync...`);
  
  try {
    // Fetch data from TGA
    const data = await fetchTGAData();
    
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

        await importTGARegistration(item, companyId);
        
        // Check if it was an insert or update
        const { data: existing } = await supabase
          .from('tga_registrations')
          .select('id')
          .eq('artg_number', item.artgNumber)
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
 * Search TGA registrations by device name or company
 */
export async function searchTGARegistrations(query: string) {
  try {
    const { data, error } = await supabase
      .from('tga_registrations')
      .select(`
        *,
        company:companies(id, name, name_zh)
      `)
      .or(`product_name.ilike.%${query}%,manufacturer_name.ilike.%${query}%`)
      .limit(50);

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('[TGA] Error searching registrations:', error);
    return [];
  }
}

// CLI usage
if (require.main === module) {
  console.log('TGA Data Synchronization Tool');
  console.log('===============================\n');
  
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'sync':
      syncTGAData().then(result => {
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
        console.log('Usage: npx ts-node scripts/sync-tga-data.ts search <query>');
        process.exit(1);
      }
      searchTGARegistrations(searchQuery).then(results => {
        console.log(`\nFound ${results.length} results:`);
        results.forEach((r: any) => {
          console.log(`\n  Product: ${r.product_name}`);
          console.log(`  Manufacturer: ${r.manufacturer_name}`);
          console.log(`  ARTG: ${r.artg_number}`);
          console.log(`  Class: ${r.device_class}`);
          console.log(`  Status: ${r.registration_status}`);
          console.log(`  Sponsor: ${r.sponsor_name || 'N/A'}`);
        });
        process.exit(0);
      }).catch(error => {
        console.error('Search failed:', error);
        process.exit(1);
      });
      break;
      
    default:
      console.log('Usage:');
      console.log('  npx ts-node scripts/sync-tga-data.ts sync    - Run full sync');
      console.log('  npx ts-node scripts/sync-tga-data.ts search <query>  - Search registrations');
      console.log('\nEnvironment Variables:');
      console.log('  SUPABASE_URL       - Supabase URL');
      console.log('  SUPABASE_KEY       - Supabase service key');
      console.log('\nTGA Data Sources:');
      console.log('  ARTG Database: https://www.tga.gov.au/resources/artg');
      console.log('  Search: https://tga-search.clients.funnelback.com/s/search.html?collection=tga-artg');
      process.exit(0);
  }
}
