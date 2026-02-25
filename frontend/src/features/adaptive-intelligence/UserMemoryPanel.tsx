import React, { useEffect, useState } from 'react';
import { getUserMemory, UserProfile, SupportedDomain } from '../../services/adaptiveService';

interface Props {
  userId: string;
  refreshTrigger?: string; // Trigger refresh when this changes
}

/**
 * User Memory Panel
 * 
 * Displays user's learning profile showing:
 * - Preferred language and tone (evolves over time)
 * - Domain usage patterns (identifies focus areas)
 * - Recent generation history
 * - Average engagement score
 * 
 * This demonstrates "Identity is Persistent" - the system learns and remembers.
 */
export default function UserMemoryPanel({ userId, refreshTrigger }: Props) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, [userId, refreshTrigger]);

  const loadProfile = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getUserMemory(userId);
      setProfile(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load memory');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-red-600">
          {error || 'No profile data'}
        </div>
      </div>
    );
  }

  const totalGenerations = profile.previous_summaries.length;
  const avgScore = totalGenerations > 0
    ? Math.round(
        profile.previous_summaries.reduce((sum, s) => sum + s.engagement_score, 0) / totalGenerations
      )
    : 0;

  const domainEntries = Object.entries(profile.domain_usage) as [SupportedDomain, number][];
  const sortedDomains = domainEntries.sort((a, b) => b[1] - a[1]);
  const maxUsage = Math.max(...domainEntries.map(([, count]) => count), 1);

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-orange-500 to-green-500 rounded-lg shadow-md p-6 text-white">
        <h3 className="text-xl font-semibold mb-2 flex items-center">
          <span className="mr-2">🧠</span>
          User Memory
        </h3>
        <p className="text-sm opacity-90">
          Learning from {totalGenerations} generations
        </p>
      </div>

      {/* Preferences */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h4 className="font-semibold text-gray-800 mb-4">Learned Preferences</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <span className="text-sm text-gray-600">Language</span>
            <span className="font-medium text-blue-700 capitalize">
              {profile.preferred_language}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
            <span className="text-sm text-gray-600">Tone</span>
            <span className="font-medium text-purple-700 capitalize">
              {profile.preferred_tone}
            </span>
          </div>
        </div>
      </div>

      {/* Domain Usage */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h4 className="font-semibold text-gray-800 mb-4">Domain Focus</h4>
        <div className="space-y-3">
          {sortedDomains.map(([domain, count]) => (
            <div key={domain}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600 capitalize">{domain}</span>
                <span className="text-sm font-medium text-gray-700">{count}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-orange-400 to-orange-600"
                  style={{ width: `${(count / maxUsage) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Stats */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h4 className="font-semibold text-gray-800 mb-4">Performance</h4>
        <div className="space-y-3">
          <div className="p-4 bg-green-50 rounded-lg text-center">
            <div className="text-3xl font-bold text-green-600">{avgScore}</div>
            <div className="text-sm text-gray-600 mt-1">Avg Engagement Score</div>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg text-center">
            <div className="text-3xl font-bold text-blue-600">{totalGenerations}</div>
            <div className="text-sm text-gray-600 mt-1">Total Generations</div>
          </div>
        </div>
      </div>

      {/* Recent History */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h4 className="font-semibold text-gray-800 mb-4">Recent Activity</h4>
        <div className="space-y-2">
          {profile.previous_summaries.slice(0, 5).map((summary, idx) => (
            <div key={idx} className="p-3 bg-gray-50 rounded-lg text-sm">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-gray-700 capitalize">{summary.domain}</span>
                <span className="text-xs text-gray-500">{summary.platform}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">
                  {new Date(summary.timestamp).toLocaleDateString()}
                </span>
                <span className={`text-xs font-medium ${
                  summary.engagement_score >= 80 ? 'text-green-600' :
                  summary.engagement_score >= 70 ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  Score: {summary.engagement_score}
                </span>
              </div>
            </div>
          ))}
          {totalGenerations === 0 && (
            <div className="text-center text-gray-500 py-4">
              No generations yet
            </div>
          )}
        </div>
      </div>

      {/* Identity Evolution Note */}
      <div className="bg-gradient-to-r from-orange-50 to-green-50 border border-orange-200 rounded-lg p-4">
        <p className="text-xs text-gray-700">
          <strong>🌱 Identity Evolution:</strong> Your preferences adapt over time based on 
          successful generations. This ensures "Identity is Persistent" - the system learns 
          your Digital Soul.
        </p>
      </div>
    </div>
  );
}
