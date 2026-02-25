import React from 'react';
import { AdaptiveGenerationResponse } from '../../services/adaptiveService';

interface Props {
  result: AdaptiveGenerationResponse;
}

/**
 * Intelligence Insights Component
 * 
 * Displays the complete intelligence analysis:
 * - Audience Profile (language, literacy, tone, format)
 * - Domain Strategy (explanation style, trust, engagement)
 * - Engagement Score (breakdown with visual indicators)
 * 
 * This demonstrates "Explicit Traceability" - making AI decisions visible.
 */
export default function IntelligenceInsights({ result }: Props) {
  const { audienceProfile, domainStrategy, engagementScore } = result;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 70) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getScoreBarColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Audience Profile */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
          <span className="mr-2">👥</span>
          Audience Intelligence
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Language Style</div>
            <div className="font-semibold text-blue-700 capitalize">
              {audienceProfile.language_style}
            </div>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Literacy Level</div>
            <div className="font-semibold text-purple-700 capitalize">
              {audienceProfile.literacy_level}
            </div>
          </div>
          <div className="p-3 bg-indigo-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Communication Tone</div>
            <div className="font-semibold text-indigo-700 capitalize">
              {audienceProfile.communication_tone}
            </div>
          </div>
          <div className="p-3 bg-pink-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Format Preference</div>
            <div className="font-semibold text-pink-700 capitalize">
              {audienceProfile.content_format_preference}
            </div>
          </div>
        </div>
        <div className="mt-3 text-sm text-gray-600">
          Confidence: {(audienceProfile.confidence * 100).toFixed(0)}%
        </div>
      </div>

      {/* Domain Strategy */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
          <span className="mr-2">🎯</span>
          Domain Strategy
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="p-3 bg-orange-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Explanation Style</div>
            <div className="font-semibold text-orange-700 capitalize">
              {domainStrategy.explanation_style}
            </div>
          </div>
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Trust Level</div>
            <div className="font-semibold text-green-700 capitalize">
              {domainStrategy.trust_level}
            </div>
          </div>
          <div className="p-3 bg-teal-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Engagement Style</div>
            <div className="font-semibold text-teal-700 capitalize">
              {domainStrategy.engagement_style}
            </div>
          </div>
        </div>
        <div className="mt-3 text-sm text-gray-600">
          Domain: <span className="font-medium capitalize">{domainStrategy.domain}</span>
        </div>
      </div>

      {/* Engagement Score */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
          <span className="mr-2">📊</span>
          Engagement Quality Score
        </h3>
        
        {/* Overall Score */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-lg font-medium text-gray-700">Overall Score</span>
            <span className={`text-3xl font-bold px-4 py-2 rounded-lg ${getScoreColor(engagementScore.overall_score)}`}>
              {engagementScore.overall_score}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all ${getScoreBarColor(engagementScore.overall_score)}`}
              style={{ width: `${engagementScore.overall_score}%` }}
            />
          </div>
        </div>

        {/* Breakdown */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-700 mb-3">Score Breakdown</h4>
          
          {Object.entries(engagementScore.breakdown).map(([key, value]) => (
            <div key={key}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600 capitalize">
                  {key.replace(/_/g, ' ')}
                </span>
                <span className="text-sm font-semibold text-gray-700">{value}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${getScoreBarColor(value)}`}
                  style={{ width: `${value}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Improvement Suggestions */}
        {engagementScore.improvement_suggestions.length > 0 && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-medium text-yellow-800 mb-2">💡 Improvement Suggestions</h4>
            <ul className="space-y-1">
              {engagementScore.improvement_suggestions.map((suggestion, idx) => (
                <li key={idx} className="text-sm text-yellow-700">
                  • {suggestion}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Bharat-Specific Insights */}
        <div className="mt-4 p-4 bg-gradient-to-r from-orange-50 to-green-50 border border-orange-200 rounded-lg">
          <h4 className="font-medium text-gray-800 mb-2">🇮🇳 Bharat Cultural Resonance</h4>
          <div className="text-sm text-gray-700">
            <p className="mb-1">
              <strong>Language Alignment:</strong> {engagementScore.breakdown.language_alignment}/100
            </p>
            <p className="text-xs text-gray-600 mt-2">
              This score reflects Hinglish fluency, cultural metaphors (cricket, jugaad), 
              and transcreation quality - not just translation.
            </p>
          </div>
        </div>
      </div>

      {/* Processing Metrics */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
          <span className="mr-2">⚡</span>
          Processing Metrics
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Audience Analysis:</span>
            <span className="ml-2 font-medium">{result.metadata.audienceAnalysisMs}ms</span>
          </div>
          <div>
            <span className="text-gray-600">Domain Analysis:</span>
            <span className="ml-2 font-medium">{result.metadata.domainAnalysisMs}ms</span>
          </div>
          <div>
            <span className="text-gray-600">Content Generation:</span>
            <span className="ml-2 font-medium">{result.metadata.generationMs}ms</span>
          </div>
          <div>
            <span className="text-gray-600">Quality Scoring:</span>
            <span className="ml-2 font-medium">{result.metadata.scoringMs}ms</span>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-200">
          <span className="text-gray-600">Total Processing Time:</span>
          <span className="ml-2 font-semibold text-gray-800">{result.metadata.processingTimeMs}ms</span>
        </div>
      </div>
    </div>
  );
}
