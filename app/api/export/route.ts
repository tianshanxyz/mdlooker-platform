import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { data, format = 'csv' } = body

    if (!data || !Array.isArray(data)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid data format'
      }, { status: 400 })
    }

    let content: string
    let contentType: string
    let fileExtension: string

    if (format === 'csv') {
      // 生成 CSV
      const headers = Object.keys(data[0])
      const rows = data.map((row: any) => 
        headers.map(header => {
          const value = row[header]
          // 处理包含逗号或引号的字段
          if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
            return `"${value.replace(/"/g, '""')}"`
          }
          return value
        }).join(',')
      )
      
      content = [headers.join(','), ...rows].join('\n')
      contentType = 'text/csv'
      fileExtension = 'csv'
    } else if (format === 'json') {
      // 生成 JSON
      content = JSON.stringify(data, null, 2)
      contentType = 'application/json'
      fileExtension = 'json'
    } else {
      return NextResponse.json({
        success: false,
        error: 'Unsupported format'
      }, { status: 400 })
    }

    return new NextResponse(content, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="market_comparison.${fileExtension}"`,
      },
    })

  } catch (error) {
    console.error('Error generating export:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}
