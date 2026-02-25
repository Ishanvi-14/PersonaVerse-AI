import React, { useState } from 'react';
import { 
  generateAdaptive, 
  AdaptiveGenerationResponse, 
  SupportedDomain 
} from '../../services/adaptiveService';
import IntelligenceInsights from './IntelligenceInsights';
import UserMemoryPanel from './UserMemoryPanel';

/**
 * Adaptive Intelligence Dashboard
 * 
 * Main interface for demonstrating adaptive intelligence features.
 * Shows the complete flow: input → analysis → generation → insights → memory.
 */
export default function AdaptiveDashboard() {
  const [userId] = useState('demo_user_001');
  const [personaId] = useState('founder');
  const [platform, setPlatform] = useState('linkedin');
  const [domain, setDomain] = useState<SupportedDomain>('business');
  const [prompt, setPrompt] = useState('');
  const [userMessage, setUserMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AdaptiveGenerationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const domains: SupportedDomain[] = ['education', 'business', 'finance', 'health', 'creator', 'government'];
  const platforms = ['linkedin', 'whatsapp', 'twitter', 'instagram'];

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await generateAdaptive({
        userId,
        personaId,
        platform,
        prompt,
        domain,
        userMessage: userMessage.trim() || undefined,
      });

      setResult(response);
    } catch (err: any) {
      setError(err.message || 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Adaptive Intelligence Dashboard
          </h1>
          <p className="text-gray-600">
            Experience Bharat-first AI that adapts to your audience and domain
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Panel */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">
                Generate Content
              </h2>

              {/* Domain Selector */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Domain
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {domains.map((d) => (
                    <button
                      key={d}
                      onClick={() => setDomain(d)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        domain === d
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {d.charAt(0).toUpperCase() + d.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Platform Selector */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Platform
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {platforms.map((p) => (
                    <button
                      key={p}
                      onClick={() => setPlatform(p)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        platform === p
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Prompt Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content Prompt
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="What would you like to communicate?"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  rows={4}
                />
              </div>

              {/* User Message (Optional) */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Audience Context (Optional)
                </label>
                <input
                  type="text"
                  value={userMessage}
                  onChange={(e) => setUserMessage(e.target.value)}
                  placeholder="e.g., Targeting Tier-2 entrepreneurs"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? 'Generating...' : '✨ Generate with Adaptive Intelligence'}
              </button>

              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  {error}
                </div>
              )}
            </div>

            {/* Generated Content */}
            {result && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-semibold mb-4 text-gray-800">
                  Generated Content
                </h2>
                <div className="prose max-w-none">
                  <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                    {result.generatedContent}
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between text-sm text-gray-600">
                  <span>Persona Alignment: {(result.personaAlignmentScore * 100).toFixed(0)}%</span>
                  <span>Processing: {result.metadata.processingTimeMs}ms</span>
                  {result.improvementApplied && (
                    <span className="text-green-600 font-medium">
                      ✓ Improved ({result.retryCount} retries)
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Intelligence Insights */}
            {result && <IntelligenceInsights result={result} />}
          </div>

          {/* User Memory Panel */}
          <div className="lg:col-span-1">
            <UserMemoryPanel userId={userId} refreshTrigger={result?.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
