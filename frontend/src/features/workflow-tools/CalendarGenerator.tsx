/**
 * Calendar Generator Component
 * 
 * Generates strategic weekly content plans with:
 * - 7-day content ideas
 * - Platform-specific strategies
 * - IST posting times
 * - Indian festival awareness
 */

import React, { useState } from 'react';
import { workflowToolsService, CalendarOutput } from '../../services/workflowTools.service';
import { ExportButtons } from './ExportButtons';

export const CalendarGenerator: React.FC = () => {
  const [niche, setNiche] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [frequency, setFrequency] = useState<'daily' | '3x-week' | 'weekly'>('daily');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CalendarOutput | null>(null);

  const isValid = niche.length > 0 && targetAudience.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isValid) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const output = await workflowToolsService.generateCalendar({
        niche,
        targetAudience,
        frequency,
      });
      setResult(output);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate calendar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Calendar Generator</h2>
        <p className="text-gray-600">
          Create weekly content plans with Indian cultural awareness
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Input Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
          {/* Niche Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Niche / Topic *
            </label>
            <input
              type="text"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              maxLength={200}
              placeholder="e.g., Personal finance for millennials, Fitness for working professionals..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <span className="text-xs text-gray-500 mt-1">
              {niche.length} / 200 characters
            </span>
          </div>

          {/* Target Audience */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Audience *
            </label>
            <textarea
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              maxLength={500}
              placeholder="Describe your audience: age, location, interests, pain points..."
              className="w-full h-24 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
            />
            <span className="text-xs text-gray-500 mt-1">
              {targetAudience.length} / 500 characters
            </span>
          </div>

          {/* Frequency Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Posting Frequency
            </label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="daily">Daily</option>
              <option value="3x-week">3x per week</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!isValid || loading}
          className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
            !isValid || loading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-green-600 text-white hover:bg-green-700'
          }`}
        >
          {loading ? 'Generating Calendar...' : 'Generate Weekly Plan'}
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
            <h3 className="text-xl font-bold text-gray-900">Your Weekly Content Plan</h3>
            <ExportButtons
              toolName="calendar"
              data={result}
            />
          </div>

          {/* Weekly Plan Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {result.weekly_plan.map((day, idx) => (
              <div key={idx} className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500">
                <h4 className="font-bold text-gray-900 mb-2">{day.day_name}</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-500">Type:</span>
                    <span className="ml-2 text-gray-700 font-medium">{day.content_type}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Idea:</span>
                    <p className="text-gray-700 mt-1">{day.post_idea}</p>
                  </div>
                  <div className="bg-blue-50 p-2 rounded">
                    <span className="text-blue-900 text-xs font-medium">Hook:</span>
                    <p className="text-blue-800 text-xs mt-1">{day.hook}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Platform Strategy */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span>📱</span>
              Platform Strategy
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-pink-50 to-purple-50 p-4 rounded-lg">
                <h5 className="font-bold text-gray-900 mb-2">Instagram</h5>
                <p className="text-sm text-gray-700">{result.platform_strategy.instagram}</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-lg">
                <h5 className="font-bold text-gray-900 mb-2">LinkedIn</h5>
                <p className="text-sm text-gray-700">{result.platform_strategy.linkedin}</p>
              </div>
              <div className="bg-gradient-to-br from-red-50 to-orange-50 p-4 rounded-lg">
                <h5 className="font-bold text-gray-900 mb-2">YouTube</h5>
                <p className="text-sm text-gray-700">{result.platform_strategy.youtube}</p>
              </div>
            </div>
          </div>

          {/* Best Posting Times */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span>⏰</span>
              Best Posting Times (IST)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {result.best_times.map((time, idx) => (
                <div key={idx} className="bg-blue-50 p-3 rounded-lg">
                  <div className="font-bold text-blue-900">{time.time}</div>
                  <div className="text-sm text-blue-700 mt-1">{time.reason}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Content Types & Hooks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Post Types */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span>📝</span>
                Content Formats
              </h4>
              <ul className="space-y-2">
                {result.post_types.map((type, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span className="text-gray-700">{type}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Hooks */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span>🎣</span>
                Attention Hooks
              </h4>
              <ul className="space-y-2">
                {result.hooks.slice(0, 5).map((hook, idx) => (
                  <li key={idx} className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                    "{hook}"
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Upcoming Festivals */}
          {result.upcoming_festivals && result.upcoming_festivals.length > 0 && (
            <div className="bg-gradient-to-r from-orange-50 to-pink-50 border border-orange-200 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span>🎉</span>
                Upcoming Festivals & Events
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.upcoming_festivals.map((festival, idx) => (
                  <div key={idx} className="bg-white p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-bold text-gray-900">{festival.festival_name}</h5>
                      <span className="text-sm text-gray-600">{new Date(festival.date).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-gray-700">{festival.content_angle}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
