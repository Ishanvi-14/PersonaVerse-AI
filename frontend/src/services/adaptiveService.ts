/**
 * Adaptive Intelligence Service
 * 
 * This service provides API calls for the adaptive intelligence features,
 * including adaptive generation and user memory retrieval.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Type definitions matching backend
export type SupportedDomain = 'education' | 'business' | 'finance' | 'health' | 'creator' | 'government';

export interface AudienceProfile {
  language_style: 'english' | 'hinglish' | 'regional';
  literacy_level: 'low' | 'medium' | 'high';
  communication_tone: 'formal' | 'friendly' | 'motivational' | 'authoritative';
  content_format_preference: 'short' | 'story' | 'bullet' | 'conversational';
  inferred_at: string;
  confidence: number;
}

export interface DomainStrategy {
  domain: SupportedDomain;
  explanation_style: 'analogy' | 'direct' | 'narrative';
  trust_level: 'low' | 'medium' | 'high';
  engagement_style: 'informative' | 'persuasive' | 'storytelling';
  analyzed_at: string;
}

export interface EngagementScore {
  overall_score: number;
  breakdown: {
    readability: number;
    tone_match: number;
    emoji_density: number;
    call_to_action: number;
    language_alignment: number;
  };
  improvement_suggestions: string[];
  scored_at: string;
}

export interface AdaptiveGenerationRequest {
  userId: string;
  personaId: string;
  platform: string;
  prompt: string;
  domain: SupportedDomain;
  userMessage?: string;
}

export interface AdaptiveGenerationResponse {
  id: string;
  generatedContent: string;
  audienceProfile: AudienceProfile;
  domainStrategy: DomainStrategy;
  engagementScore: EngagementScore;
  retryCount: number;
  improvementApplied: boolean;
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

export interface UserProfile {
  userId: string;
  preferred_language: 'english' | 'hinglish' | 'regional';
  preferred_tone: 'formal' | 'friendly' | 'motivational' | 'authoritative';
  domain_usage: {
    [key in SupportedDomain]: number;
  };
  previous_summaries: Array<{
    timestamp: string;
    domain: SupportedDomain;
    platform: string;
    engagement_score: number;
    audience_profile: AudienceProfile;
  }>;
  created_at: string;
  updated_at: string;
}

/**
 * Generate content with adaptive intelligence
 */
export async function generateAdaptive(
  request: AdaptiveGenerationRequest
): Promise<AdaptiveGenerationResponse> {
  const response = await fetch(`${API_BASE_URL}/generate-adaptive`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Adaptive generation failed');
  }

  const data = await response.json();
  return data.data;
}

/**
 * Get user memory profile
 */
export async function getUserMemory(userId: string): Promise<UserProfile> {
  const response = await fetch(`${API_BASE_URL}/memory/${userId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Memory retrieval failed');
  }

  const data = await response.json();
  return data.data;
}
