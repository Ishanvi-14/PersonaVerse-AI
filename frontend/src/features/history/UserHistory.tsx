/**
 * User History Component
 * 
 * Displays user's content generation history with:
 * - Timeline view of all generations
 * - Persona and platform filters
 * - Alignment score tracking
 * - Export functionality
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, User, Target, TrendingUp, Download, Filter } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface HistoryEntry {
  entryId: string;
  userId: string;
  personaId?: string;
  platform?: string;
  type: string;
  input: {
    text: string;
    language: string;
    audioUrl?: string;
  };
  output: {
    text: string;
    language: string;
    confidence?: number;
  };
  timestamp: string;
  metadata?: any;
}

export function UserHistory() {
  const { user } = useAuth();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterPersona, setFilterPersona] = useState<string>('all');
  const [filterPlatform, setFilterPlatform] = useState<string>('all');

  useEffect(() => {
    if (user?.userId) {
      loadHistory();
    }
  }, [user?.userId]);

  const loadHistory = async () => {
    if (!user?.userId) {
      setError('User not authenticated');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`http://localhost:3001/aws/history/${user.userId}`);
      const data = await response.json();

      if (data.success) {
        setHistory(data.data.entries || []);
      } else {
        setError('Failed to load history');
      }
    } catch (err) {
      console.error('History load error:', err);
      setError('Could not connect to server');
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = history.filter(entry => {
    if (filterPersona !== 'all' && entry.personaId !== filterPersona) return false;
    if (filterPlatform !== 'all' && entry.platform !== filterPlatform) return false;
    return true;
  });

  const personas = Array.from(new Set(history.map(h => h.personaId).filter(Boolean)));
  const platforms = Array.from(new Set(history.map(h => h.platform).filter(Boolean)));

  const getAlignmentColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600 bg-green-50';
    if (score >= 0.6) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const exportHistory = () => {
    const dataStr = JSON.stringify(filteredHistory, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `personaverse-history-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-theme-text-secondary">Loading your Digital Soul history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card bg-red-50 border-red-200">
        <div className="flex items-start gap-3">
          <span className="text-red-600 text-xl">⚠️</span>
          <div>
            <h4 className="font-semibold text-red-900">Error Loading History</h4>
            <p className="text-red-800 text-sm mt-1">{error}</p>
            <button
              onClick={loadHistory}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-theme-text-primary">
            Your Digital Soul History
          </h2>
          <p className="text-theme-text-secondary mt-1">
            {filteredHistory.length} generation{filteredHistory.length !== 1 ? 's' : ''} tracked
          </p>
        </div>
        <button
          onClick={exportHistory}
          disabled={filteredHistory.length === 0}
          className="btn-secondary flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Export History
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-primary-500" />
          <h3 className="font-semibold text-theme-text-primary">Filters</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-theme-text-primary mb-2">
              Persona
            </label>
            <select
              value={filterPersona}
              onChange={(e) => setFilterPersona(e.target.value)}
              className="w-full px-3 py-2 border border-theme-border rounded-lg bg-theme-surface text-theme-text-primary"
            >
              <option value="all">All Personas</option>
              {personas.map(persona => (
                <option key={persona} value={persona}>
                  {persona.charAt(0).toUpperCase() + persona.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-theme-text-primary mb-2">
              Platform
            </label>
            <select
              value={filterPlatform}
              onChange={(e) => setFilterPlatform(e.target.value)}
              className="w-full px-3 py-2 border border-theme-border rounded-lg bg-theme-surface text-theme-text-primary"
            >
              <option value="all">All Platforms</option>
              {platforms.map(platform => (
                <option key={platform} value={platform}>
                  {platform.charAt(0).toUpperCase() + platform.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* History Timeline */}
      {filteredHistory.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-semibold text-theme-text-primary mb-2">
            No History Yet
          </h3>
          <p className="text-theme-text-secondary">
            Start generating content to build your Digital Soul history
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {filteredHistory.map((entry, index) => (
              <motion.div
                key={entry.entryId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                className="card hover:shadow-lg transition-shadow"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-theme-text-primary capitalize">
                          {entry.personaId || 'Unknown'}
                        </span>
                        <span className="text-theme-text-tertiary">•</span>
                        <span className="text-sm text-theme-text-secondary capitalize">
                          {entry.platform || 'Unknown'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-theme-text-tertiary mt-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(entry.timestamp)}
                      </div>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${getAlignmentColor(entry.output?.confidence || 0)}`}>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {Math.round((entry.output?.confidence || 0) * 100)}%
                    </div>
                  </div>
                </div>

                {/* Input */}
                {entry.input?.text && (
                  <div className="mb-3">
                    <div className="text-xs font-medium text-theme-text-tertiary mb-1 flex items-center gap-1">
                      <Target className="w-3 h-3" />
                      INPUT
                    </div>
                    <div className="p-3 bg-theme-bg-tertiary rounded-lg">
                      <p className="text-sm text-theme-text-secondary line-clamp-2">
                        {entry.input.text}
                      </p>
                    </div>
                  </div>
                )}

                {/* Generated Content */}
                <div>
                  <div className="text-xs font-medium text-theme-text-tertiary mb-1">
                    GENERATED
                  </div>
                  <div className="p-3 bg-primary-50 border border-primary-200 rounded-lg">
                    <p className="text-sm text-theme-text-primary">
                      {entry.output?.text || 'No content generated'}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
