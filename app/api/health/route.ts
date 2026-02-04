import { NextResponse } from 'next/server';

// 简单的健康检查，不依赖Supabase（避免冷启动问题）
export async function GET() {
  return NextResponse.json(
    {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    },
    { status: 200 }
  );
}
