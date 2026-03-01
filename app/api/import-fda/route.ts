import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// FDA 数据（内嵌在代码中，避免文件读取问题）
const FDA_510K_DATA = [
  {
    "k_number": "K123456",
    "device_name": "Example Device 1",
    "applicant": "Example Company 1",
    "decision_code": "APPR",
    "decision_date": "2023-01-15",
    "product_code": "ABC",
    "device_class": "II",
    "summary": "Example summary",
    "source_type": "510k",
    "scraped_at": "2024-01-01T00:00:00Z"
  }
  // 实际数据需要从 JSON 文件读取
];

/**
 * POST /api/import-fda - 导入 FDA 数据
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const body = await request.json();
    const { table, data } = body;

    if (!table || !data || !Array.isArray(data)) {
      return NextResponse.json(
        { error: 'Missing table name or data array' },
        { status: 400 }
      );
    }

    // 批量插入
    const batchSize = 100;
    let totalInserted = 0;

    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      const { error } = await supabase
        .from(table)
        .upsert(batch, { onConflict: 'id' });

      if (error) {
        console.error(`Error inserting batch ${i}:`, error);
        return NextResponse.json(
          { error: `Failed to insert batch ${i}: ${error.message}` },
          { status: 500 }
        );
      }

      totalInserted += batch.length;
      console.log(`Inserted ${totalInserted}/${data.length} rows`);
    }

    return NextResponse.json({
      success: true,
      table,
      inserted: totalInserted,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/import-fda - 检查导入状态
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Use POST to import FDA data',
    format: {
      table: 'fda_510k | fda_pma | fda_registrations',
      data: 'Array of objects'
    }
  });
}
