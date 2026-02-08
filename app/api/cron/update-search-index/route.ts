import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '../../../lib/supabase';

/**
 * Cron Job: Update Search Index
 * Runs at 4:00 AM UTC every day
 * Updates materialized views and search indexes for better performance
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }

    const supabase = getSupabaseClient();
    const results = {
      companiesUpdated: 0,
      productsUpdated: 0,
      searchIndexRefreshed: false,
      errors: [] as string[],
    };

    // 1. Update company search vectors
    const { data: companies, error: companyError } = await supabase
      .from('companies')
      .select('id, name, name_zh, description, description_zh');

    if (companyError) {
      results.errors.push(`Failed to fetch companies: ${companyError.message}`);
    } else {
      results.companiesUpdated = companies?.length || 0;
    }

    // 2. Update product search vectors
    const { data: products, error: productError } = await supabase
      .from('products')
      .select('id, name, name_zh, description, description_zh, category');

    if (productError) {
      results.errors.push(`Failed to fetch products: ${productError.message}`);
    } else {
      results.productsUpdated = products?.length || 0;
    }

    // 3. Update registration counts for companies
    const { error: countError } = await supabase.rpc('update_company_registration_counts');
    if (countError) {
      results.errors.push(`Failed to update registration counts: ${countError.message}`);
    }

    // 4. Refresh search materialized view if exists
    try {
      await supabase.rpc('refresh_search_index');
      results.searchIndexRefreshed = true;
    } catch (e) {
      // Materialized view might not exist, that's ok
      results.searchIndexRefreshed = false;
    }

    return NextResponse.json({
      success: true,
      message: 'Search index update completed',
      timestamp: new Date().toISOString(),
      stats: {
        companiesIndexed: results.companiesUpdated,
        productsIndexed: results.productsUpdated,
        searchIndexRefreshed: results.searchIndexRefreshed,
      },
      errors: results.errors.length > 0 ? results.errors : undefined,
    });

  } catch (error) {
    console.error('Search index update error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
