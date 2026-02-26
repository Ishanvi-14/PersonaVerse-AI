/**
 * Type definitions for Workflow Intelligence Tools
 * 
 * This module provides TypeScript interfaces for all three workflow tools:
 * - Content Simplifier
 * - Calendar Generator
 * - Gap Analyzer
 */

// ============================================================================
// Request Types
// ============================================================================

/**
 * Content Simplifier Request
 */
export interface SimplifierRequest {
  input: string;                    // Text content (50-10,000 chars)
  audienceContext?: string;         // Optional context (max 500 chars)
  inputType: 'text' | 'file';
  fileName?: string;                // If inputType is 'file'
}

/**
 * Calendar Generator Request
 */
export interface CalendarRequest {
  niche: string;                    // Required (max 200 chars)
  targetAudience: string;           // Required (max 500 chars)
  frequency?: 'daily' | '3x-week' | 'weekly'; // Optional
}

/**
 * Gap Analyzer Request
 */
export interface GapAnalyzerRequest {
  posts: string[];                  // Array of 3-50 posts
  nicheContext?: string;            // Optional (max 200 chars)
}

// ============================================================================
// Response Types
// ============================================================================

/**
 * Content Simplifier Output
 */
export interface SimplifierOutput {
  grade5_explanation: string;       // 5th grade reading level
  bullet_summary: string[];         // 3-7 key points
  whatsapp_version: string;         // Conversational with emojis
  voice_script: string;             // Audio narration format
  regional_version: string;         // Hinglish (60-80% EN, 20-40% HI)
}

/**
 * Calendar Generator Output
 */
export interface CalendarOutput {
  weekly_plan: DayPlan[];           // Exactly 7 days
  post_types: string[];             // 3-5 content formats
  hooks: string[];                  // 5-10 attention grabbers
  platform_strategy: PlatformStrategy;
  best_times: PostingTime[];        // IST timezone
  upcoming_festivals?: FestivalSuggestion[];
}

export interface DayPlan {
  day_name: string;                 // e.g., "Monday"
  post_idea: string;
  content_type: string;             // e.g., "Educational", "Behind-the-scenes"
  hook: string;
}

export interface PlatformStrategy {
  instagram: string;                // Platform-specific recommendations
  linkedin: string;
  youtube: string;
}

export interface PostingTime {
  time: string;                     // IST format (e.g., "9:00 AM IST")
  reason: string;                   // Why this time is optimal
}

export interface FestivalSuggestion {
  festival_name: string;
  date: string;                     // ISO 8601 format
  content_angle: string;
}

/**
 * Gap Analyzer Output
 */
export interface GapAnalysisOutput {
  overused_themes: ThemeFrequency[];
  missing_topics: string[];         // 5-10 suggestions
  fatigue_risk: FatigueRisk;
  suggested_angles: string[];       // 5-10 opportunities
  diversity_score: number;          // 0-100
}

export interface ThemeFrequency {
  theme: string;
  frequency_percentage: number;     // e.g., 35 (appears in 35% of posts)
  example_posts: number[];          // Indices of posts with this theme
}

export interface FatigueRisk {
  level: 'low' | 'medium' | 'high';
  explanation: string;
  recommendation: string;
}

// ============================================================================
// Standard API Response Wrapper
// ============================================================================

/**
 * Success Response
 */
export interface ToolSuccessResponse<T> {
  success: true;
  data: T;
  metadata: {
    timestamp: string;              // ISO 8601
    processing_duration_ms: number;
    tool_name: string;
    mock_mode: boolean;
  };
}

/**
 * Error Response
 */
export interface ToolErrorResponse {
  success: false;
  error_code: string;
  message: string;
  details?: any;
  metadata: {
    timestamp: string;
    tool_name: string;
  };
}

export type ToolResponse<T> = ToolSuccessResponse<T> | ToolErrorResponse;

// ============================================================================
// Error Codes
// ============================================================================

export enum ToolErrorCode {
  // Input Validation Errors (400)
  INVALID_INPUT = 'INVALID_INPUT',
  INPUT_TOO_SHORT = 'INPUT_TOO_SHORT',
  INPUT_TOO_LONG = 'INPUT_TOO_LONG',
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  UNSUPPORTED_FILE_TYPE = 'UNSUPPORTED_FILE_TYPE',
  INSUFFICIENT_POSTS = 'INSUFFICIENT_POSTS',
  TOO_MANY_POSTS = 'TOO_MANY_POSTS',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  
  // Authentication Errors (401)
  MISSING_API_KEY = 'MISSING_API_KEY',
  INVALID_API_KEY = 'INVALID_API_KEY',
  
  // Rate Limiting (429)
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  
  // Processing Errors (500)
  GEMINI_API_ERROR = 'GEMINI_API_ERROR',
  PROCESSING_TIMEOUT = 'PROCESSING_TIMEOUT',
  EXPORT_GENERATION_FAILED = 'EXPORT_GENERATION_FAILED',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}

// ============================================================================
// Validation Types
// ============================================================================

export interface ValidationResult {
  valid: boolean;
  error?: {
    code: ToolErrorCode;
    message: string;
    details?: any;
  };
}

// ============================================================================
// Configuration Types
// ============================================================================

export interface ToolsConfig {
  gemini: {
    apiKey: string;
    model: string;
    timeouts: {
      simplifier: number;
      calendar: number;
      gapAnalyzer: number;
      export: number;
    };
    maxRetries: number;
  };
  mock: {
    enabled: boolean;
  };
  limits: {
    simplifier: {
      minChars: number;
      maxChars: number;
      maxAudienceContextChars: number;
      maxFileSizeMB: number;
    };
    calendar: {
      maxNicheChars: number;
      maxAudienceChars: number;
    };
    gapAnalyzer: {
      minPosts: number;
      maxPosts: number;
      maxNicheContextChars: number;
      maxFileSizeMB: number;
    };
  };
}

// ============================================================================
// Custom Error Class
// ============================================================================

export class ToolError extends Error {
  constructor(
    public code: ToolErrorCode,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ToolError';
  }
}
