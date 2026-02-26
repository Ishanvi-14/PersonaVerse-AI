/**
 * Distribution Tools Component
 * Container for export, format, and remix tools
 */

import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { DownloadAsImage } from './DownloadAsImage';
import { PlatformFormatter } from './PlatformFormatter';
import { RemixModal } from './RemixModal';
import { TextInputWithVoice } from '../../components/TextInputWithVoice';

export const DistributionTools: React.FC = () => {
  const [content, setContent] = useState('');
  const [isRemixModalOpen, setIsRemixModalOpen] = useState(false);

  const handleSaveRemix = (remixedContent: string) => {
    setContent(remixedContent);
  };

  return (
    <div className="space-y-6">
      {/* Content Input */}
      <div className="card">
        <h3 className="font-semibold text-theme-text-primary mb-4">
          Your Content
        </h3>
        <p className="text-sm text-theme-text-secondary mb-4">
          Enter or paste your content to use distribution tools
        </p>
        <TextInputWithVoice
          value={content}
          onChange={setContent}
          placeholder="Enter your content here..."
          rows={8}
        />
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-theme-text-secondary">
            {content.length} characters
          </div>
          <button
            onClick={() => setIsRemixModalOpen(true)}
            disabled={!content}
            className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Sparkles className="w-4 h-4" />
            Remix Content
          </button>
        </div>
      </div>

      {/* Distribution Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Export Section */}
        <div className="card">
          <h3 className="font-semibold text-theme-text-primary mb-4">
            Export as Image
          </h3>
          <p className="text-sm text-theme-text-secondary mb-4">
            Download your content as styled images for social media
          </p>
          <DownloadAsImage content={content} personaName="PersonaVerse" />
          
          <div className="mt-4 bg-purple-50 border border-purple-200 rounded-lg p-3">
            <div className="text-sm text-purple-800">
              <strong>Available formats:</strong> Instagram Square (1080x1080), 
              Quote Card (1200x630), Carousel Slide (1080x1080)
            </div>
          </div>
        </div>

        {/* Remix Section */}
        <div className="card">
          <h3 className="font-semibold text-theme-text-primary mb-4">
            Content Remix
          </h3>
          <p className="text-sm text-theme-text-secondary mb-4">
            Transform your content into different formats
          </p>
          <button
            onClick={() => setIsRemixModalOpen(true)}
            disabled={!content}
            className="btn-secondary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Open Remix Options
          </button>
          
          <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="text-sm text-green-800">
              <strong>Available formats:</strong> Twitter Thread, Carousel Slides, 
              Short Hook, LinkedIn Longform
            </div>
          </div>
        </div>
      </div>

      {/* Platform Formatter */}
      <PlatformFormatter content={content} />

      {/* Info Box */}
      <div className="bg-gradient-to-r from-saffron/10 via-primary-100/50 to-emerald/10 rounded-2xl p-6 border border-theme-border">
        <h3 className="text-lg font-semibold text-theme-text-primary mb-3">
          🚀 Distribution Made Easy
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-theme-text-secondary">
          <div>
            <strong className="text-theme-text-primary">Export:</strong> Download 
            content as styled images for Instagram, Twitter, and more
          </div>
          <div>
            <strong className="text-theme-text-primary">Format:</strong> Auto-format 
            content for LinkedIn, Twitter, and Instagram with one click
          </div>
          <div>
            <strong className="text-theme-text-primary">Remix:</strong> Transform 
            content into threads, carousels, hooks, and longform posts
          </div>
        </div>
      </div>

      {/* Remix Modal */}
      <RemixModal
        isOpen={isRemixModalOpen}
        onClose={() => setIsRemixModalOpen(false)}
        content={content}
        onSave={handleSaveRemix}
      />
    </div>
  );
};
