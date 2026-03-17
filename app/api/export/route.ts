import { NextRequest, NextResponse } from 'next/server';

interface ExportData {
  type: 'company' | 'product' | 'search-results' | 'regulator';
  format: 'csv' | 'json';
  data: any;
  filename?: string;
}

function escapeCSV(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }
  const stringValue = String(value);
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

function convertToCSV(data: any[]): string {
  if (!data || data.length === 0) {
    return '';
  }

  const headers = Object.keys(data[0]);
  const headerRow = headers.map(escapeCSV).join(',');
  
  const rows = data.map(row => 
    headers.map(header => escapeCSV(row[header])).join(',')
  );
  
  return [headerRow, ...rows].join('\n');
}

function convertToJSON(data: any): string {
  return JSON.stringify(data, null, 2);
}

export async function POST(request: NextRequest) {
  try {
    const body: ExportData = await request.json();
    const { type, format, data, filename } = body;

    if (!type || !format || !data) {
      return NextResponse.json(
        { error: 'Missing required parameters: type, format, data' },
        { status: 400 }
      );
    }

    if (!['csv', 'json'].includes(format)) {
      return NextResponse.json(
        { error: 'Invalid format. Supported formats: csv, json' },
        { status: 400 }
      );
    }

    let content: string;
    let contentType: string;
    let fileExtension: string;

    if (format === 'csv') {
      const arrayData = Array.isArray(data) ? data : [data];
      content = convertToCSV(arrayData);
      contentType = 'text/csv;charset=utf-8';
      fileExtension = 'csv';
    } else {
      content = convertToJSON(data);
      contentType = 'application/json;charset=utf-8';
      fileExtension = 'json';
    }

    const defaultFilename = `${type}-export-${new Date().toISOString().split('T')[0]}`;
    const exportFilename = filename || defaultFilename;

    const headers = new Headers({
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${exportFilename}.${fileExtension}"`,
      'Cache-Control': 'no-cache',
    });

    return new NextResponse(content, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Failed to generate export file' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Export API',
    supportedFormats: ['csv', 'json'],
    supportedTypes: ['company', 'product', 'search-results', 'regulator'],
    usage: {
      method: 'POST',
      body: {
        type: 'company | product | search-results | regulator',
        format: 'csv | json',
        data: 'array | object',
        filename: 'optional string'
      }
    }
  });
}
