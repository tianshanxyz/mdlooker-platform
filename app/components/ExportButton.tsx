'use client';

import { useState } from 'react';
import { Download, Loader2, CheckCircle2, XCircle } from 'lucide-react';

interface ExportButtonProps {
  type: 'company' | 'product' | 'search-results' | 'regulator';
  data: any;
  filename?: string;
  format?: 'csv' | 'json';
  variant?: 'button' | 'icon';
  className?: string;
  disabled?: boolean;
}

export default function ExportButton({
  type,
  data,
  filename,
  format = 'csv',
  variant = 'button',
  className = '',
  disabled = false,
}: ExportButtonProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    if (!data) {
      setError('No data to export');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          format,
          data,
          filename,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Export failed');
      }

      const blob = await response.blob();
      const contentDisposition = response.headers.get('Content-Disposition');
      let exportFilename = filename || `${type}-export`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch && filenameMatch[1]) {
          exportFilename = filenameMatch[1];
        }
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = exportFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Export error:', err);
      setError(err instanceof Error ? err.message : 'Export failed');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  if (variant === 'icon') {
    return (
      <div className="relative">
        <button
          onClick={handleExport}
          disabled={loading || disabled}
          className={`
            p-2 rounded-lg transition-colors
            ${disabled 
              ? 'text-slate-300 cursor-not-allowed' 
              : 'text-slate-600 hover:text-[#339999] hover:bg-[#339999]/10'
            }
            ${className}
          `}
          title={`Export as ${format.toUpperCase()}`}
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : success ? (
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          ) : error ? (
            <XCircle className="w-5 h-5 text-red-600" />
          ) : (
            <Download className="w-5 h-5" />
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="relative inline-block">
      <button
        onClick={handleExport}
        disabled={loading || disabled}
        className={`
          inline-flex items-center gap-2 px-4 py-2
          rounded-lg font-medium text-sm
          transition-all duration-200
          ${disabled
            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
            : 'bg-[#339999] text-white hover:bg-[#2a7a7a] hover:shadow-lg'
          }
          ${className}
        `}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : success ? (
          <CheckCircle2 className="w-4 h-4" />
        ) : error ? (
          <XCircle className="w-4 h-4" />
        ) : (
          <Download className="w-4 h-4" />
        )}
        {success ? 'Exported!' : error ? 'Failed' : `Export ${format.toUpperCase()}`}
      </button>

      {(error || success) && (
        <div
          className={`
            absolute bottom-full left-1/2 -translate-x-1/2 mb-2
            px-3 py-1.5 rounded-lg text-xs font-medium
            whitespace-nowrap
            ${success 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
            }
          `}
        >
          {success ? 'Export successful!' : error}
        </div>
      )}
    </div>
  );
}
