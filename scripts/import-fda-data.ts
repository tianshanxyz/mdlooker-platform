// FDA Data Import Script
// This script demonstrates how to import FDA registration data
// Note: FDA provides open data through their API and downloadable files

import { getSupabaseClient } from '../app/lib/supabase';

// FDA Open Data API endpoints
const FDA_API_BASE = 'https://api.fda.gov/device/registrationlisting.json';

interface FDADeviceData {
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
}

/**
 * Search FDA device registrations by company name or product
 * Note: This uses the openFDA API which has rate limits
 */
export async function searchFDARegistrations(query: string): Promise<FDADeviceData[]> {
  try {
    // openFDA API requires API key for production use
    // Get your key at: https://open.fda.gov/apis/authentication/
    const apiKey = process.env.FDA_API_KEY;
    
    const url = new URL(FDA_API_BASE);
    url.searchParams.append('search', `device_name:"${query}"`);
    url.searchParams.append('limit', '10');
    
    if (apiKey) {
      url.searchParams.append('api_key', apiKey);
    }

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`FDA API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error fetching FDA data:', error);
    return [];
  }
}

/**
 * Import FDA registration data to Supabase
 */
export async function importFDARegistration(fdaData: FDADeviceData, companyId: string) {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('fda_registrations')
      .upsert({
        company_id: companyId,
        fei_number: fdaData.fei_number,
        registration_number: fdaData.registration_number,
        owner_operator_number: fdaData.owner_operator_number,
        registration_status: fdaData.registration_status,
        registration_date: fdaData.registration_date,
        expiration_date: fdaData.expiration_date,
        product_code: fdaData.product_code,
        device_class: fdaData.device_class,
        device_name: fdaData.device_name,
        device_description: fdaData.device_description,
        regulation_number: fdaData.regulation_number,
        establishment_type: fdaData.establishment_type,
        address: fdaData.address,
        city: fdaData.city,
        state: fdaData.state,
        zip: fdaData.zip,
        country: fdaData.country,
        source_url: `https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfRL/rl.cfm?lid=${fdaData.registration_number}`,
        raw_data: fdaData
      }, {
        onConflict: 'registration_number'
      });

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error importing FDA registration:', error);
    throw error;
  }
}

/**
 * Bulk import FDA data from CSV or JSON file
 * Note: FDA provides downloadable files at:
 * https://www.fda.gov/medical-devices/registration-and-listing/downloadable-files
 */
export async function bulkImportFDAData(filePath: string) {
  // Implementation would read CSV/JSON file and import to database
  console.log('Bulk import from file:', filePath);
  console.log('Note: FDA provides downloadable registration files at:');
  console.log('https://www.fda.gov/medical-devices/registration-and-listing/downloadable-files');
}

// Example usage
if (require.main === module) {
  console.log('FDA Data Import Script');
  console.log('======================');
  console.log('');
  console.log('To use FDA API:');
  console.log('1. Get API key from https://open.fda.gov/apis/authentication/');
  console.log('2. Set FDA_API_KEY environment variable');
  console.log('');
  console.log('FDA Data Sources:');
  console.log('- API: https://api.fda.gov/device/registrationlisting.json');
  console.log('- Downloads: https://www.fda.gov/medical-devices/registration-and-listing/downloadable-files');
  console.log('- Search: https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfRL/rl.cfm');
}
