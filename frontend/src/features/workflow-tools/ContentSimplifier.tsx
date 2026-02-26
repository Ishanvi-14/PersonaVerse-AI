/**
 * Content Simplifier Component
 * 
 * Transforms complex content into 5 accessibility formats:
 * - 5th grade explanation
 * - Bullet summary
 * - WhatsApp version
 * - Voice script
 * - Hinglish regional version
 */

import React, { useState } from 'react';
import { workflowToolsService, SimplifierOutput } from '../../services/workflowTools.service';
import { ExportButtons } from './ExportButtons';

export const ContentSimplifier: React.FC = () => {
  const [input, setInput] = useState('');
  const [audienceContext, setAudienceContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SimplifierOutput | null>(null);

  const charCount = input.length;
  const isValid = charCount >= 50 && charCount <= 10000;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isValid) {
      setError('Please enter between 50 and 10,000 characters');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const output = await workflowToolsService.simplifyContent({
        input,
        audienceContext: audienceContext || undefined,
        inputType: 'text',
      });
      setResult(output);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to simplify content');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setInput(text);
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-theme-text-primary mb-2">Content Simplifier</h2>
        <p className="text-theme-text-secondary">
          Transform complex content into 5 formats for Bharat audiences
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Input Section */}
        <div className="bg-theme-card-bg rounded-lg shadow-sm p-6 border border-theme-border">
          <label className="block text-sm font-medium text-theme-text-primary mb-2">
            Content to Simplify *
          </label>
          
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your content here (50-10,000 characters)..."
            className="w-full h-48 px-4 py-3 bg-theme-surface border border-theme-border text-theme-text-primary placeholder-theme-text-tertiary rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
          
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-4">
              <span className={`text-sm ${
                charCount < 50 ? 'text-red-600' :
                charCount > 10000 ? 'text-red-600' :
                'text-theme-text-secondary'
              }`}>
                {charCount.toLocaleString()} / 10,000 characters
                {charCount < 50 && ' (minimum 50)'}
              </span>
              
              <label className="text-sm text-blue-600 hover:text-blue-700 cursor-pointer">
                <input
                  type="file"
                  accept=".txt,.md"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                📎 Upload file (max 5MB)
              </label>
            </div>
          </div>

          {/* Audience Context */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-theme-text-primary mb-2">
              Audience Context (Optional)
            </label>
            <input
              type="text"
              value={audienceContext}
              onChange={(e) => setAudienceContext(e.target.value)}
              maxLength={500}
              placeholder="e.g., Tier-2 city entrepreneurs, college students..."
              className="w-full px-4 py-2 bg-theme-surface border border-theme-border text-theme-text-primary placeholder-theme-text-tertiary rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <span className="text-xs text-theme-text-tertiary mt-1">
              {audienceContext.length} / 500 characters
            </span>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!isValid || loading}
          className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
            !isValid || loading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {loading ? 'Simplifying...' : 'Simplify Content'}
        </button>
      </form>

      {/* Error Display */}
      {error && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="text-red-600 text-xl">⚠️</span>
            <div>
              <h4 className="font-semibold text-red-900">Error</h4>
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Results Display */}
      {result && (
        <div className="mt-8 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-theme-text-primary">Simplified Versions</h3>
            <ExportButtons
              toolName="simplifier"
              data={result}
            />
          </div>

          {/* 5th Grade Explanation */}
          <div className="bg-theme-card-bg border border-theme-border rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🎓</span>
              <h4 className="text-lg font-semibold text-theme-text-primary">5th Grade Explanation</h4>
            </div>
            <p className="text-theme-text-secondary leading-relaxed">{result.grade5_explanation}</p>
          </div>

          {/* Bullet Summary */}
          <div className="bg-theme-card-bg border border-theme-border rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">📋</span>
              <h4 className="text-lg font-semibold text-theme-text-primary">Bullet Summary</h4>
            </div>
            <ul className="space-y-2">
              {result.bullet_summary.map((point, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span className="text-theme-text-secondary">{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* WhatsApp Version */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">💬</span>
              <h4 className="text-lg font-semibold text-theme-text-primary">WhatsApp Version</h4>
            </div>
            <p className="text-theme-text-secondary leading-relaxed whitespace-pre-wrap">{result.whatsapp_version}</p>
          </div>

          {/* Voice Script */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🎙️</span>
              <h4 className="text-lg font-semibold text-theme-text-primary">Voice Script</h4>
            </div>
            <p className="text-theme-text-secondary leading-relaxed whitespace-pre-wrap font-mono text-sm">
              {result.voice_script}
            </p>
          </div>

          {/* Hinglish Regional Version */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🇮🇳</span>
              <h4 className="text-lg font-semibold text-theme-text-primary">Hinglish Regional Version</h4>
            </div>
            <p className="text-theme-text-secondary leading-relaxed">{result.regional_version}</p>
          </div>
        </div>
      )}
    </div>
  );
};
