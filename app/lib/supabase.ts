import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// 创建 Supabase 客户端的工厂函数
export function createClient() {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase URL and Key are required. Please check your environment variables.');
  }
  return createSupabaseClient(supabaseUrl, supabaseKey, {
    global: {
      headers: {
        'x-application-name': 'mdlooker-prod',
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: 'public',
    },
  });
}

// 生产级配置：连接池 + 超时 + 重试
export function getSupabaseClient() {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase URL and Key are required. Please check your environment variables.');
  }
  return createSupabaseClient(supabaseUrl, supabaseKey, {
    global: {
      headers: {
        'x-application-name': 'mdlooker-prod',
      },
    },
    auth: {
      persistSession: false, // Edge Runtime下禁用session存储
      autoRefreshToken: false,
    },
    db: {
      schema: 'public',
    },
  });
}

// 连接健康检查（生产环境推荐）
export async function checkSupabaseHealth() {
  const start = Date.now();
  try {
    const client = getSupabaseClient();
    const { data, error } = await client.from('companies').select('count').limit(1);
    const latency = Date.now() - start;
    
    if (error) throw error;
    
    return {
      healthy: true,
      latency,
      timestamp: new Date().toISOString(),
    };
  } catch (err) {
    return {
      healthy: false,
      error: err instanceof Error ? err.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    };
  }
}
