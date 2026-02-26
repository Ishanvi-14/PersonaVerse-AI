/**
 * Platform Formatter Component
 * Format and copy content for different social media platforms
 */

import React, { useState } from 'react';
import { Copy, Check, Linkedin, Twitter, Instagram } from 'lucide-react';
import { 
  formatForLinkedIn, 
  formatForTwitter, 
  formatForInstagram,
  copyToClipboard,
  Platform,
  FormattedContent
} from '../../utils/platformFormatters';

interface PlatformFormatterProps {
  content: string;
}

export const PlatformFormatter: React.FC<PlatformFormatterProps> = ({ content }) => {
  const [copiedPlatform, setCopiedPlatform] = useState<Platform | null>(null);
  const [formattedContent, setFormattedContent] = useState<FormattedContent | null>(null);

  const platforms: { id: Platform; name: string; icon: React.ReactNode; color: string }[] = [
    { 
      id: 'linkedin', 
      name: 'LinkedIn', 
      icon: <Linkedin className="w-5 h-5" />,
      color: 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700'
    },
    { 
      id: 'twitter', 
      name: 'Twitter', 
      icon: <Twitter className="w-5 h-5" />,
      color: 'bg-sky-50 hover:bg-sky-100 border-sky-200 text-sky-700'
    },
    { 
      id: 'instagram', 
      name: 'Instagram', 
      icon: <Instagram className="w-5 h-5" />,
      color: 'bg-pink-50 hover:bg-pink-100 border-pink-200 text-pink-700'
    },
  ];

  const handleCopy = async (platform: Platform) => {
    let formatted: FormattedContent;

    switch (platform) {
      case 'linkedin':
        formatted = formatForLinkedIn(content);
        break;
      case 'twitter':
        formatted = formatForTwitter(content);
        break;
      case 'instagram':
        formatted = formatForInstagram(content);
        break;
    }

    try {
      await copyToClipboard(formatted.text);
      setCopiedPlatform(platform);
      setFormattedContent(formatted);
      
      setTimeout(() => {
        setCopiedPlatform(null);
      }, 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      alert('Failed to copy to clipboard');
    }
  };

  return (
    <div className="card">
      <h3 className="font-semibold text-theme-text-primary mb-4">
        Platform Formatting
      </h3>
      <p className="text-sm text-theme-text-secondary mb-4">
        Copy your content formatted for different platforms
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        {platforms.map((platform) => (
          <button
            key={platform.id}
            onClick={() => handleCopy(platform.id)}
            disabled={!content}
            className={`${platform.color} border-2 rounded-lg p-4 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <div className="flex items-center justify-between mb-2">
              {platform.icon}
              {copiedPlatform === platform.id ? (
                <Check className="w-5 h-5 text-green-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </div>
            <div className="text-sm font-medium">
              Copy for {platform.name}
            </div>
          </button>
        ))}
      </div>

      {formattedContent && (
        <div className="bg-theme-bg-tertiary rounded-lg p-4 border border-theme-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-theme-text-primary">
              Preview ({formattedContent.platform})
            </span>
            <span className="text-xs text-theme-text-secondary">
              {formattedContent.characterCount} characters
            </span>
          </div>
          
          {formattedContent.isThread && formattedContent.threadParts && (
            <div className="mb-2 text-xs text-theme-text-secondary">
              Thread with {formattedContent.threadParts.length} tweets
            </div>
          )}

          <div className="text-sm text-theme-text-primary whitespace-pre-wrap max-h-48 overflow-y-auto">
            {formattedContent.text}
          </div>
        </div>
      )}

      <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <span className="text-lg">💡</span>
          <div className="text-sm text-blue-800">
            <strong>LinkedIn:</strong> Adds paragraph spacing and hashtags<br />
            <strong>Twitter:</strong> Auto-splits into numbered threads<br />
            <strong>Instagram:</strong> Adds emojis and hashtag formatting
          </div>
        </div>
      </div>
    </div>
  );
};
