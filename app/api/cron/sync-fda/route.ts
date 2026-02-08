import { NextRequest, NextResponse } from 'next/server';

/**
 * Cron Job: Daily FDA Data Sync
 * Runs at 2:00 AM UTC every day
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret to ensure this is called by Vercel Cron
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      // In development, allow without auth
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }

    // Call the FDA sync API
    const syncUrl = new URL('/api/fda-sync', request.url);
    syncUrl.searchParams.set('limit', '1000');
    syncUrl.searchParams.set('skip', '0');

    const response = await fetch(syncUrl.toString(), {
      headers: {
        'Authorization': `Bearer ${process.env.SYNC_TOKEN || ''}`,
      },
    });

    if (!response.ok) {
      throw new Error(`FDA sync failed: ${response.status}`);
    }

    const result = await response.json();

    return NextResponse.json({
      success: true,
      message: 'FDA data sync completed via cron',
      timestamp: new Date().toISOString(),
      result,
    });

  } catch (error) {
    console.error('Cron job error:', error);
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
