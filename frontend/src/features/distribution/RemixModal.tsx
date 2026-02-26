/**
 * Content Remix Modal
 * Transform content into different formats
 */

import React, { useState } from 'react';
import { X, Sparkles, FileText, Image, Zap, Linkedin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  remixToTwitterThread,
  remixToCarousel,
  remixToShortHook,
  remixToLinkedInLongform,
  RemixFormat,
  RemixedContent
} from '../../utils/contentRemixer';

interface RemixModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  onSave?: (remixedContent: string, format: RemixFormat) => void;
}

export const RemixModal: React.FC<RemixModalProps> = ({ 
  isOpen, 
  onClose, 
  content,
  onSave 
}) => {
  const [selectedFormat, setSelectedFormat] = useState<RemixFormat | null>(null);
  const [remixedContent, setRemixedContent] = useState<RemixedContent | null>(null);
  const [editableContent, setEditableContent] = useState('');

  const remixFormats: { 
    id: RemixFormat; 
    label: string; 
    description: string; 
    icon: React.ReactNode;
    color: string;
  }[] = [
    { 
      id: 'twitter-thread', 
      label: 'Twitter Thread', 
      description: 'Split into numbered tweets',
      icon: <FileText className="w-5 h-5" />,
      color: 'bg-sky-50 hover:bg-sky-100 border-sky-200'
    },
    { 
      id: 'carousel', 
      label: 'Carousel Slides', 
      description: 'Multiple slides with key points',
      icon: <Image className="w-5 h-5" />,
      color: 'bg-purple-50 hover:bg-purple-100 border-purple-200'
    },
    { 
      id: 'short-hook', 
      label: 'Short Hook', 
      description: 'Punchy attention-grabber',
      icon: <Zap className="w-5 h-5" />,
      color: 'bg-yellow-50 hover:bg-yellow-100 border-yellow-200'
    },
    { 
      id: 'linkedin-longform', 
      label: 'LinkedIn Longform', 
      description: 'Professional post with hashtags',
      icon: <Linkedin className="w-5 h-5" />,
      color: 'bg-blue-50 hover:bg-blue-100 border-blue-200'
    },
  ];

  const handleRemix = (format: RemixFormat) => {
    let remixed: RemixedContent;

    switch (format) {
      case 'twitter-thread':
        remixed = remixToTwitterThread(content);
        break;
      case 'carousel':
        remixed = remixToCarousel(content);
        break;
      case 'short-hook':
        remixed = remixToShortHook(content);
        break;
      case 'linkedin-longform':
        remixed = remixToLinkedInLongform(content);
        break;
    }

    setSelectedFormat(format);
    setRemixedContent(remixed);
    setEditableContent(remixed.content);
  };

  const handleSave = () => {
    if (selectedFormat && onSave) {
      onSave(editableContent, selectedFormat);
    }
    handleClose();
  };

  const handleClose = () => {
    setSelectedFormat(null);
    setRemixedContent(null);
    setEditableContent('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={handleClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative bg-theme-surface rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-theme-border"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-theme-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-theme-text-primary">
                  Remix Content
                </h2>
                <p className="text-sm text-theme-text-secondary">
                  Transform your content into different formats
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-theme-hover rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-theme-text-secondary" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
            {!selectedFormat ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {remixFormats.map((format) => (
                  <button
                    key={format.id}
                    onClick={() => handleRemix(format.id)}
                    className={`${format.color} border-2 rounded-lg p-6 text-left transition-all hover:shadow-md`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-white rounded-lg shadow-sm">
                        {format.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-theme-text-primary mb-1">
                          {format.label}
                        </h3>
                        <p className="text-sm text-theme-text-secondary">
                          {format.description}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => {
                      setSelectedFormat(null);
                      setRemixedContent(null);
                    }}
                    className="text-sm text-theme-text-secondary hover:text-theme-text-primary"
                  >
                    ← Back to formats
                  </button>
                  {remixedContent && (
                    <div className="text-sm text-theme-text-secondary">
                      {remixedContent.metadata.partsCount && (
                        <span>{remixedContent.metadata.partsCount} parts • </span>
                      )}
                      {remixedContent.metadata.remixedLength} characters
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-theme-text-primary mb-2">
                    Remixed Content (Editable)
                  </label>
                  <textarea
                    value={editableContent}
                    onChange={(e) => setEditableContent(e.target.value)}
                    className="w-full h-96 p-4 border border-theme-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 bg-theme-bg-tertiary text-theme-text-primary font-mono text-sm"
                  />
                </div>

                {remixedContent?.parts && remixedContent.parts.length > 1 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="text-sm text-blue-800">
                      <strong>Note:</strong> This content has {remixedContent.parts.length} parts. 
                      The separator "---" indicates where each part begins.
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          {selectedFormat && (
            <div className="flex items-center justify-end gap-3 p-6 border-t border-theme-border">
              <button
                onClick={handleClose}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="btn-primary"
              >
                Save Remixed Content
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
