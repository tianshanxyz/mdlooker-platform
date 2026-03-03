import { NextResponse } from 'next/server';
import { getSupabaseClient } from '../../lib/supabase';

// 健康检查，包含Supabase连接测试
export async function GET() {
  const healthCheck: any = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: {
      node_env: process.env.NODE_ENV,
      has_supabase_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      has_supabase_key: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    }
  };

  // 测试Supabase连接
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from('companies').select('count').limit(1);
    
    if (error) {
      healthCheck.supabase = { status: 'error', error: error.message };
      healthCheck.status = 'degraded';
    } else {
      healthCheck.supabase = { status: 'connected', data };
    }
  } catch (err) {
    healthCheck.supabase = { 
      status: 'error', 
      error: err instanceof Error ? err.message : 'Unknown error' 
    };
    healthCheck.status = 'degraded';
  }

  const statusCode = healthCheck.status === 'healthy' ? 200 : 503;
  return NextResponse.json(healthCheck, { status: statusCode });
}
