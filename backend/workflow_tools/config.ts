/**
 * Configuration loader for Workflow Intelligence Tools
 * 
 * Loads environment variables and provides typed configuration
 * for all three workflow tools.
 */

import { ToolsConfig } from './types';

/**
 * Load configuration from environment variables
 * 
 * @returns {ToolsConfig} Complete configuration object
 */
export function loadConfig(): ToolsConfig {
  // Default to mock mode if MOCK_MODE is not explicitly set to 'false'
  const mockMode = process.env.MOCK_MODE !== 'false';
  
  const config: ToolsConfig = {
    gemini: {
      apiKey: process.env.GEMINI_API_KEY || '',
      model: process.env.GEMINI_MODEL || 'gemini-pro',
      timeouts: {
        simplifier: 30000,  // 30 seconds
        calendar: 30000,    // 30 seconds
        gapAnalyzer: 45000, // 45 seconds
        export: 10000,      // 10 seconds
      },
      maxRetries: 2,
    },
    mock: {
      enabled: mockMode,
    },
    limits: {
      simplifier: {
        minChars: 50,
        maxChars: 10000,
        maxAudienceContextChars: 500,
        maxFileSizeMB: 5,
      },
      calendar: {
        maxNicheChars: 200,
        maxAudienceChars: 500,
      },
      gapAnalyzer: {
        minPosts: 3,
        maxPosts: 50,
        maxNicheContextChars: 200,
        maxFileSizeMB: 2,
      },
    },
  };

  console.log('[Workflow Tools] Configuration loaded:');
  console.log(`  - Mock Mode: ${config.mock.enabled ? '✓ ENABLED (Credit Discipline)' : '✗ DISABLED (Live API)'}`);
  console.log(`  - Gemini API Key: ${config.gemini.apiKey ? '✓ Configured' : '✗ Not Set'}`);

  return config;
}
