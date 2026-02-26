/**
 * Distribution Tab
 * Main container for distribution features
 */

import React, { useState } from 'react';
import { Share2, Calendar, Repeat } from 'lucide-react';
import { ContentCalendar } from './ContentCalendar';
import { DistributionTools } from './DistributionTools';

type ViewType = 'tools' | 'calendar';

export const DistributionTab: React.FC = () => {
  const [selectedView, setSelectedView] = useState<ViewType>('tools');

  return (
    <div className="min-h-screen bg-theme-bg-primary p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
              <Share2 className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-theme-text-primary">
              Distribution
            </h1>
          </div>
          <p className="text-theme-text-secondary">
            Export, format, and schedule your content across platforms
          </p>
        </div>

        {/* View Selector */}
        <div className="flex bg-theme-surface rounded-lg p-1 shadow-sm border border-theme-border mb-6 w-fit">
          <button
            onClick={() => setSelectedView('tools')}
            className={`px-6 py-3 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
              selectedView === 'tools'
                ? 'bg-theme-primary text-white shadow-sm'
                : 'text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-hover'
            }`}
          >
            <Repeat className="w-4 h-4" />
            Distribution Tools
          </button>
          <button
            onClick={() => setSelectedView('calendar')}
            className={`px-6 py-3 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
              selectedView === 'calendar'
                ? 'bg-theme-primary text-white shadow-sm'
                : 'text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-hover'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Content Calendar
          </button>
        </div>

        {/* Content */}
        {selectedView === 'tools' ? (
          <DistributionTools />
        ) : (
          <ContentCalendar />
        )}
      </div>
    </div>
  );
};
