/**
 * Adaptive Intelligence Type Definitions
 * 
 * These types extend the existing persona.types.ts without modifying it.
 */

// Audience Intelligence Types
export interface AudienceProfile {
  language_style: 'english' | 'hinglish' | 'regional';
  literacy_level: 'low' | 'medium' | 'high';
  communication_tone: 'formal' | 'friendly' | 'motivational' | 'authoritative';
  content_format_preference: 'short' | 'story' | 'bullet' | 'conversational';
  inferred_at: string;
  confidence: number; // 0.0 to 1.0
}

// Domain Strategy Types
export type SupportedDomain = 'education' | 'business' | 'finance' | 'health' | 'creator' | 'government';

export interface DomainStrategy {
  domain: SupportedDomain;
  explanation_style: 'analogy' | 'direct' | 'narrative';
  trust_level: 'low' | 'medium' | 'high';
  engagement_style: 'informative' | 'persuasive' | 'storytelling';
  analyzed_at: string;
}

// Engagement Scoring Types
export interface EngagementScore {
  overall_score: number; // 0-100
  breakdown: {
    readability: number; // 0-100
    tone_match: number; // 0-100
    emoji_density: number; // 0-100
    call_to_action: number; // 0-100
    language_alignment: number; // 0-100
  };
  improvement_suggestions: string[];
  scored_at: string;
}

// Adaptive Generation Request
export interface AdaptiveGenerationRequest {
  userId: string;
  personaId: string;
  platform: string;
  prompt: string;
  domain: SupportedDomain;
  userMessage?: string; // Optional context for audience inference
}

// Adaptive Generation Response
export interface AdaptiveGenerationResponse {
  id: string;
  generatedContent: string;
  
  // Intelligence Layer Results
  audienceProfile: AudienceProfile;
  domainStrategy: DomainStrategy;
  engagementScore: EngagementScore;
  
  // Retry Information
  retryCount: number;
  improvementApplied: boolean;
  
  // Standard Metadata
  personaAlignmentScore: number;
  metadata: {
    generatedAt: string;
    processingTimeMs: number;
    modelVersion: string;
    audienceAnalysisMs: number;
    domainAnalysisMs: number;
    generationMs: number;
    scoringMs: number;
  };
}

// User Memory Types
export interface UserProfile {
  userId: string;
  preferred_language: 'english' | 'hinglish' | 'regional';
  preferred_tone: 'formal' | 'friendly' | 'motivational' | 'authoritative';
  domain_usage: {
    [key in SupportedDomain]: number; // Usage count per domain
  };
  previous_summaries: GenerationSummary[];
  created_at: string;
  updated_at: string;
}

export interface GenerationSummary {
  timestamp: string;
  domain: SupportedDomain;
  platform: string;
  engagement_score: number;
  audience_profile: AudienceProfile;
}

// Configuration Types
export interface AdaptiveConfig {
  features: {
    enable_audience_engine: boolean;
    enable_domain_engine: boolean;
    enable_engagement_scoring: boolean;
    enable_retry_loop: boolean;
    enable_memory_system: boolean;
  };
  thresholds: {
    engagement_score_threshold: number; // Default: 70
    max_retry_attempts: number; // Default: 2
  };
  bedrock: {
    use_mocks: boolean; // true for development, false for production
    model_id: string; // e.g., "anthropic.claude-4-5"
    region: string; // e.g., "us-east-1"
  };
}

// Error Types
export enum AdaptiveErrorCode {
  AUDIENCE_ENGINE_FAILED = 'AUDIENCE_ENGINE_FAILED',
  DOMAIN_ENGINE_FAILED = 'DOMAIN_ENGINE_FAILED',
  ENGAGEMENT_SCORER_FAILED = 'ENGAGEMENT_SCORER_FAILED',
  MEMORY_SYSTEM_FAILED = 'MEMORY_SYSTEM_FAILED',
  INVALID_DOMAIN = 'INVALID_DOMAIN',
  MAX_RETRIES_EXCEEDED = 'MAX_RETRIES_EXCEEDED',
}

export class AdaptiveError extends Error {
  constructor(
    public code: AdaptiveErrorCode,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AdaptiveError';
  }
}
