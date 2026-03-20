import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '../../lib/supabase';

const supabase = getSupabaseClient();

export async function GET(request: NextRequest) {
  try {
    const { data: stats, error } = await supabase
      .from('platform_stats')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Stats fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: stats || []
    });

  } catch (error) {
    console.error('Stats API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
