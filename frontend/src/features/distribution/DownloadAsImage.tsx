/**
 * Download as Image Component
 * Export content as styled images for social media
 */

import React, { useState } from 'react';
import { Download, Image as ImageIcon } from 'lucide-react';
import { exportAsImage, ExportFormat } from '../../utils/imageExport';

interface DownloadAsImageProps {
  content: string;
  personaName?: string;
}

export const DownloadAsImage: React.FC<DownloadAsImageProps> = ({ 
  content, 
  personaName = 'PersonaVerse' 
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const exportFormats: { id: ExportFormat; label: string; description: string }[] = [
    { id: 'instagram-square', label: 'Instagram Square', description: '1080x1080 px' },
    { id: 'quote-card', label: 'Quote Card', description: '1200x630 px' },
    { id: 'carousel', label: 'Carousel Slide', description: '1080x1080 px' },
  ];

  const handleExport = async (format: ExportFormat) => {
    setIsExporting(true);
    setShowDropdown(false);

    try {
      await exportAsImage({
        format,
        content,
        personaName,
        theme: document.documentElement.classList.contains('dark') ? 'dark' : 'light',
      });
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export image. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        disabled={isExporting || !content}
        className="btn-secondary flex items-center gap-2"
      >
        {isExporting ? (
          <>
            <div className="w-4 h-4 border-2 border-theme-text-primary border-t-transparent rounded-full animate-spin" />
            Exporting...
          </>
        ) : (
          <>
            <Download className="w-4 h-4" />
            Export
          </>
        )}
      </button>

      {showDropdown && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setShowDropdown(false)}
          />
          <div className="absolute right-0 mt-2 w-64 bg-theme-surface border border-theme-border rounded-lg shadow-lg z-20">
            <div className="p-2">
              <div className="px-3 py-2 text-sm font-medium text-theme-text-secondary">
                Export as Image
              </div>
              {exportFormats.map((format) => (
                <button
                  key={format.id}
                  onClick={() => handleExport(format.id)}
                  className="w-full px-3 py-2 text-left rounded-md hover:bg-theme-hover transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <ImageIcon className="w-4 h-4 text-theme-text-secondary" />
                    <div>
                      <div className="text-sm font-medium text-theme-text-primary">
                        {format.label}
                      </div>
                      <div className="text-xs text-theme-text-secondary">
                        {format.description}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
