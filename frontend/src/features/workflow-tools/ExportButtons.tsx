/**
 * Export Buttons Component
 * 
 * Reusable export button component for downloading tool results
 * in JSON, TXT, or PDF formats.
 */

import React, { useState } from 'react';
import { workflowToolsService } from '../../services/workflowTools.service';

interface ExportButtonsProps {
  toolName: string;
  data: any;
}

export const ExportButtons: React.FC<ExportButtonsProps> = ({ toolName, data }) => {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async (format: 'json' | 'txt' | 'pdf') => {
    setLoading(format);
    setError(null);

    try {
      await workflowToolsService.exportResults(toolName, data, format);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600 mr-2">Export:</span>
      
      <button
        onClick={() => handleExport('json')}
        disabled={loading !== null}
        className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading === 'json' ? '...' : 'JSON'}
      </button>
      
      <button
        onClick={() => handleExport('txt')}
        disabled={loading !== null}
        className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading === 'txt' ? '...' : 'TXT'}
      </button>
      
      <button
        onClick={() => handleExport('pdf')}
        disabled={loading !== null}
        className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading === 'pdf' ? '...' : 'PDF'}
      </button>

      {error && (
        <span className="text-xs text-red-600 ml-2">
          {error}
        </span>
      )}
    </div>
  );
};
