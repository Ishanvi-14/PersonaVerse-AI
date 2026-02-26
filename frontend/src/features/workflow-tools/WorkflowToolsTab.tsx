/**
 * Workflow Tools Tab
 * 
 * Main container for the three workflow intelligence tools:
 * - Content Simplifier
 * - Calendar Generator
 * - Gap Analyzer
 */

import React, { useState } from 'react';
import { ContentSimplifier } from './ContentSimplifier';
import { CalendarGenerator } from './CalendarGenerator';
import { GapAnalyzer } from './GapAnalyzer';

type ToolType = 'simplifier' | 'calendar' | 'gap-analyzer' | null;

export const WorkflowToolsTab: React.FC = () => {
  const [selectedTool, setSelectedTool] = useState<ToolType>(null);

  const tools = [
    {
      id: 'simplifier' as ToolType,
      title: 'Content Simplifier',
      description: 'Transform complex content into 5 accessibility formats for Bharat audiences',
      icon: '📝',
      color: 'bg-blue-50 hover:bg-blue-100 border-blue-200',
    },
    {
      id: 'calendar' as ToolType,
      title: 'Calendar Generator',
      description: 'Create weekly content plans with Indian cultural awareness and IST timing',
      icon: '📅',
      color: 'bg-green-50 hover:bg-green-100 border-green-200',
    },
    {
      id: 'gap-analyzer' as ToolType,
      title: 'Gap Analyzer',
      description: 'Identify content patterns, overused themes, and new opportunities',
      icon: '📊',
      color: 'bg-purple-50 hover:bg-purple-100 border-purple-200',
    },
  ];

  if (selectedTool) {
    return (
      <div className="min-h-screen bg-theme-bg-primary p-6">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => setSelectedTool(null)}
            className="mb-6 flex items-center gap-2 text-theme-text-secondary hover:text-theme-text-primary transition-colors"
          >
            <span>←</span>
            <span>Back to Tools</span>
          </button>

          {selectedTool === 'simplifier' && <ContentSimplifier />}
          {selectedTool === 'calendar' && <CalendarGenerator />}
          {selectedTool === 'gap-analyzer' && <GapAnalyzer />}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-theme-bg-primary p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-theme-text-primary mb-2">
            Workflow Intelligence Tools
          </h1>
          <p className="text-theme-text-secondary">
            Bharat-first content workflow utilities for creators
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => setSelectedTool(tool.id)}
              className={`${tool.color} border-2 rounded-lg p-6 text-left transition-all hover:shadow-md`}
            >
              <div className="text-4xl mb-4">{tool.icon}</div>
              <h3 className="text-xl font-bold text-theme-text-primary mb-2">
                {tool.title}
              </h3>
              <p className="text-theme-text-secondary text-sm">
                {tool.description}
              </p>
            </button>
          ))}
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <h4 className="font-semibold text-blue-900 mb-1">
                Bharat-First Design
              </h4>
              <p className="text-blue-800 text-sm">
                All tools include Hinglish support, Indian cultural references, 
                IST timezone awareness, and regional context for authentic content creation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
