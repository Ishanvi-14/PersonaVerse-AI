import React, { useState } from 'react';
import { 
  generateAdaptive, 
  AdaptiveGenerationResponse, 
  SupportedDomain 
} from '../../services/adaptiveService';
import IntelligenceInsights from './IntelligenceInsights';
import UserMemoryPanel from './UserMemoryPanel';
import { VoiceInput } from '../../components/VoiceInput';

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
  const [voiceError, setVoiceError] = useState<string | null>(null);

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

  const handlePromptVoiceTranscript = (transcript: string) => {
    const newContent = prompt ? `${prompt} ${transcript}` : transcript;
    setPrompt(newContent);
    setVoiceError(null);
  };

  const handleUserMessageVoiceTranscript = (transcript: string) => {
    const newContent = userMessage ? `${userMessage} ${transcript}` : transcript;
    setUserMessage(newContent);
    setVoiceError(null);
  };

  const handleVoiceError = (error: string) => {
    setVoiceError(error);
    setTimeout(() => setVoiceError(null), 5000);
  };

  return (
    <div className="min-h-screen bg-theme-bg-primary p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-theme-text-primary mb-2">
            Adaptive Intelligence Dashboard
          </h1>
          <p className="text-theme-text-secondary">
            Experience Bharat-first AI that adapts to your audience and domain
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Panel */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-theme-card-bg rounded-lg shadow-md p-6 border border-theme-border">
              <h2 className="text-2xl font-semibold mb-4 text-theme-text-primary">
                Generate Content
              </h2>

              {/* Domain Selector */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-theme-text-primary mb-2">
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
                          : 'bg-theme-bg-tertiary text-theme-text-primary hover:bg-theme-hover'
                      }`}
                    >
                      {d.charAt(0).toUpperCase() + d.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Platform Selector */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-theme-text-primary mb-2">
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
                          : 'bg-theme-bg-tertiary text-theme-text-primary hover:bg-theme-hover'
                      }`}
                    >
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Prompt Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-theme-text-primary mb-2">
                  Content Prompt
                </label>
                <div className="relative">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="What would you like to communicate?"
                    className="w-full px-4 py-3 border border-theme-border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-theme-surface text-theme-text-primary placeholder-theme-text-tertiary"
                    rows={4}
                  />
                  <div className="absolute top-2 right-2">
                    <VoiceInput
                      onTranscript={handlePromptVoiceTranscript}
                      onError={handleVoiceError}
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              {/* User Message (Optional) */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-theme-text-primary mb-2">
                  Audience Context (Optional)
                </label>
                <div className="relative flex items-start gap-2">
                  <input
                    type="text"
                    value={userMessage}
                    onChange={(e) => setUserMessage(e.target.value)}
                    placeholder="e.g., Targeting Tier-2 entrepreneurs"
                    className="flex-1 px-4 py-2 border border-theme-border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-theme-surface text-theme-text-primary placeholder-theme-text-tertiary"
                  />
                  <div className="flex-shrink-0">
                    <VoiceInput
                      onTranscript={handleUserMessageVoiceTranscript}
                      onError={handleVoiceError}
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              {voiceError && (
                <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
                  {voiceError}
                </div>
              )}

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
              <div className="bg-theme-card-bg rounded-lg shadow-md p-6 border border-theme-border">
                <h2 className="text-2xl font-semibold mb-4 text-theme-text-primary">
                  Generated Content
                </h2>
                <div className="prose max-w-none">
                  <p className="text-theme-text-primary whitespace-pre-wrap leading-relaxed">
                    {result.generatedContent}
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-theme-border flex items-center justify-between text-sm text-theme-text-secondary">
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
