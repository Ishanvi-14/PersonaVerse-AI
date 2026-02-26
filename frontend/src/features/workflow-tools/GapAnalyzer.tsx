/**
 * Gap Analyzer Component
 * 
 * Analyzes content patterns to identify:
 * - Overused themes
 * - Missing topics
 * - Fatigue risk
 * - Diversity score
 * - Suggested angles
 */

import React, { useState } from 'react';
import { workflowToolsService, GapAnalysisOutput } from '../../services/workflowTools.service';
import { ExportButtons } from './ExportButtons';

export const GapAnalyzer: React.FC = () => {
  const [posts, setPosts] = useState<string[]>(['', '', '']);
  const [nicheContext, setNicheContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GapAnalysisOutput | null>(null);

  const validPosts = posts.filter(p => p.trim().length > 0);
  const isValid = validPosts.length >= 3;

  const addPost = () => {
    if (posts.length < 50) {
      setPosts([...posts, '']);
    }
  };

  const removePost = (index: number) => {
    if (posts.length > 3) {
      setPosts(posts.filter((_, i) => i !== index));
    }
  };

  const updatePost = (index: number, value: string) => {
    const newPosts = [...posts];
    newPosts[index] = value;
    setPosts(newPosts);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim().length > 0);
      setPosts(lines.slice(0, 50));
    };
    reader.readAsText(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isValid) {
      setError('Please provide at least 3 posts for analysis');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const output = await workflowToolsService.analyzeGaps({
        posts: validPosts,
        nicheContext: nicheContext || undefined,
      });
      setResult(output);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze content gaps');
    } finally {
      setLoading(false);
    }
  };

  const getFatigueColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-700 bg-green-100';
      case 'medium': return 'text-yellow-700 bg-yellow-100';
      case 'high': return 'text-red-700 bg-red-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Gap Analyzer</h2>
        <p className="text-gray-600">
          Identify patterns, overused themes, and new opportunities
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Input Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Your Posts ({validPosts.length} / 50) *
            </label>
            <label className="text-sm text-blue-600 hover:text-blue-700 cursor-pointer">
              <input
                type="file"
                accept=".txt,.md"
                onChange={handleFileUpload}
                className="hidden"
              />
              📎 Upload file (one post per line)
            </label>
          </div>

          {/* Post Entries */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {posts.map((post, idx) => (
              <div key={idx} className="flex gap-2">
                <textarea
                  value={post}
                  onChange={(e) => updatePost(idx, e.target.value)}
                  placeholder={`Post ${idx + 1}...`}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none h-20"
                />
                {posts.length > 3 && (
                  <button
                    type="button"
                    onClick={() => removePost(idx)}
                    className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>

          {posts.length < 50 && (
            <button
              type="button"
              onClick={addPost}
              className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-purple-400 hover:text-purple-600 transition-colors"
            >
              + Add Another Post
            </button>
          )}

          {/* Niche Context */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Niche Context (Optional)
            </label>
            <input
              type="text"
              value={nicheContext}
              onChange={(e) => setNicheContext(e.target.value)}
              maxLength={200}
              placeholder="e.g., Personal finance, Tech tutorials, Fitness coaching..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <span className="text-xs text-gray-500 mt-1">
              {nicheContext.length} / 200 characters
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
              : 'bg-purple-600 text-white hover:bg-purple-700'
          }`}
        >
          {loading ? 'Analyzing...' : 'Analyze Content Gaps'}
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
            <h3 className="text-xl font-bold text-gray-900">Analysis Results</h3>
            <ExportButtons
              toolName="gap-analyzer"
              data={result}
            />
          </div>

          {/* Diversity Score */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span>📊</span>
              Content Diversity Score
            </h4>
            <div className="flex items-center gap-6">
              <div className={`text-6xl font-bold ${getScoreColor(result.diversity_score)}`}>
                {result.diversity_score}
              </div>
              <div className="flex-1">
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className={`h-4 rounded-full transition-all ${
                      result.diversity_score >= 70 ? 'bg-green-500' :
                      result.diversity_score >= 40 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${result.diversity_score}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {result.diversity_score >= 70 ? 'Excellent variety!' :
                   result.diversity_score >= 40 ? 'Good, but room for improvement' :
                   'Low diversity - consider mixing up your content'}
                </p>
              </div>
            </div>
          </div>

          {/* Fatigue Risk */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span>⚡</span>
              Audience Fatigue Risk
            </h4>
            <div className={`inline-block px-4 py-2 rounded-full font-bold ${getFatigueColor(result.fatigue_risk.level)}`}>
              {result.fatigue_risk.level.toUpperCase()} RISK
            </div>
            <p className="text-gray-700 mt-3">{result.fatigue_risk.explanation}</p>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mt-4">
              <p className="text-sm text-blue-900">
                <span className="font-semibold">Recommendation:</span> {result.fatigue_risk.recommendation}
              </p>
            </div>
          </div>

          {/* Overused Themes */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span>🔁</span>
              Overused Themes
            </h4>
            <div className="space-y-3">
              {result.overused_themes.map((theme, idx) => (
                <div key={idx} className="border-l-4 border-orange-500 bg-orange-50 p-4 rounded">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-bold text-gray-900">{theme.theme}</h5>
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                      theme.frequency_percentage > 40 ? 'bg-red-100 text-red-700' :
                      theme.frequency_percentage > 25 ? 'bg-orange-100 text-orange-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {theme.frequency_percentage}%
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Appears in posts: {theme.example_posts.map(p => `#${p + 1}`).join(', ')}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Missing Topics */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span>💡</span>
              Missing Topics & Opportunities
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {result.missing_topics.map((topic, idx) => (
                <div key={idx} className="bg-green-50 border border-green-200 p-3 rounded-lg">
                  <div className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span className="text-gray-700">{topic}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Suggested Angles */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span>🎯</span>
              Suggested Content Angles
            </h4>
            <div className="space-y-2">
              {result.suggested_angles.map((angle, idx) => (
                <div key={idx} className="bg-white p-3 rounded-lg shadow-sm">
                  <div className="flex items-start gap-3">
                    <span className="text-purple-600 font-bold">{idx + 1}.</span>
                    <span className="text-gray-700">{angle}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Re-analyze Button */}
          <button
            onClick={() => setResult(null)}
            className="w-full py-3 px-6 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            ← Analyze Different Posts
          </button>
        </div>
      )}
    </div>
  );
};
