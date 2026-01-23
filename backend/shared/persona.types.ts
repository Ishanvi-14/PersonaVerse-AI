/**
 * Shared TypeScript types for PersonaVerse AI
 * 
 * These types ensure consistent communication between frontend and backend
 * components while maintaining type safety across the entire system.
 */

// Core Persona Layer Definition
export interface PersonaLayer {
  id: string;
  name: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  
  // Linguistic DNA - How the persona speaks and writes
  linguisticDNA: {
    hinglishRatio: number; // 0.0 to 1.0 (0% to 100% Hinglish)
    cadence: 'low' | 'medium' | 'high';
    formalityLevel: number; // 1-10 scale (1=very casual, 10=very formal)
    preferredMetaphors: string[]; // e.g., ['cricket', 'business', 'family']
    sentenceStructure: 'simple' | 'complex' | 'mixed';
    vocabularyStyle: 'technical' | 'conversational' | 'academic' | 'street';
  };
  
  // Value Constraints - What the persona believes and avoids
  valueConstraints: {
    coreBeliefs: string[]; // Fundamental values that must be maintained
    avoidedTopics: string[]; // Topics to avoid or handle carefully
    riskTolerance: 'safe' | 'moderate' | 'bold';
    culturalAlignment: 'global' | 'bharat-first' | 'regional';
  };
  
  // Emotional Baseline - Default emotional settings
  emotionalBaseline: {
    optimismLevel: number; // 1-10 scale
    authorityLevel: number; // 1-10 scale (how authoritative vs. humble)
    enthusiasmLevel: number; // 1-10 scale
    empathyLevel: number; // 1-10 scale
  };
  
  // Platform-specific adaptations
  platformAdaptations?: {
    [platform in SupportedPlatform]?: {
      formalityAdjustment: number; // -3 to +3 adjustment to base formality
      lengthPreference: 'short' | 'medium' | 'long';
      emojiUsage: 'none' | 'minimal' | 'moderate' | 'heavy';
      hashtagStyle: 'none' | 'minimal' | 'strategic' | 'trending';
    };
  };
}

// Supported platforms for content generation
export type SupportedPlatform = 
  | 'linkedin' 
  | 'whatsapp' 
  | 'email' 
  | 'twitter' 
  | 'instagram' 
  | 'facebook'
  | 'blog';

// Content generation request
export interface GenerationRequest {
  userId: string;
  personaId: string;
  platform: SupportedPlatform;
  content: string; // Input content/prompt
  
  // Optional emotion sliders for fine-tuning
  emotionSliders?: {
    urgency?: number; // 1-10 (how urgent/time-sensitive)
    enthusiasm?: number; // 1-10 (how excited/passionate)
    formality?: number; // 1-10 (override persona's default formality)
    authority?: number; // 1-10 (how authoritative vs. humble)
  };
  
  // Optional context for better generation
  context?: {
    audienceType?: 'students' | 'professionals' | 'investors' | 'general';
    contentType?: 'announcement' | 'educational' | 'personal' | 'promotional';
    previousMessages?: string[]; // For conversation context
  };
}

// Content generation response
export interface GenerationResponse {
  id: string;
  generatedContent: string;
  personaAlignmentScore: number; // 0.0 to 1.0
  
  // Quality and safety checks
  voiceDriftAlert?: string; // Warning if content doesn't match persona
  guardrailsFlags?: string[]; // Any safety/brand issues detected
  
  // Audience simulation results
  audienceSimulation?: AudienceReaction[];
  
  // Metadata for tracking and improvement
  metadata: {
    generatedAt: string;
    processingTimeMs: number;
    modelVersion: string;
    personaVersion: string;
  };
}

// Audience simulation for the "Mirror" feature
export interface AudienceReaction {
  demographic: string; // e.g., "Tier-2 Student (Indore)"
  reaction: string; // Human-readable reaction
  sentiment: 'positive' | 'neutral' | 'negative';
  confidence: number; // 0.0 to 1.0
  culturalResonance: number; // 0.0 to 1.0 (how well it fits the culture)
}

// Identity extraction from uploaded content
export interface IdentityExtractionRequest {
  userId: string;
  content: string;
  mediaType: 'text' | 'audio' | 'image' | 'video';
  source?: string; // e.g., "linkedin_posts", "voice_note", "profile_image"
}

export interface IdentityExtractionResponse {
  extractionId: string;
  
  // Linguistic fingerprint extracted from content
  linguisticFingerprint: {
    cadence: string; // Descriptive analysis
    hinglishRatio: number;
    sentimentBias: string; // e.g., "Optimistic with strategic focus"
    preferredPhrases: string[];
    vocabularyComplexity: 'simple' | 'moderate' | 'complex';
    culturalMarkers: string[]; // Detected cultural references
  };
  
  // Core values and beliefs extracted
  canonicalValues: string[];
  
  // Visual style analysis (for images/videos)
  visualStyle?: {
    aestheticType: string; // e.g., "Vibrant/Urban Indian"
    colorPalette: string[];
    styleKeywords: string[];
  };
  
  // Confidence scores for extracted features
  confidence: {
    linguistic: number; // 0.0 to 1.0
    values: number; // 0.0 to 1.0
    visual?: number; // 0.0 to 1.0
  };
  
  metadata: {
    extractedAt: string;
    processingTimeMs: number;
    contentLength: number;
  };
}

// Persona state management
export interface PersonaState {
  userId: string;
  personaId: string;
  
  // Current state
  isActive: boolean;
  lastUsed: string;
  usageCount: number;
  
  // Performance metrics
  averageAlignmentScore: number;
  voiceDriftIncidents: number;
  audienceSatisfactionScore: number;
  
  // Evolution tracking
  evolutionHistory: PersonaEvolution[];
}

export interface PersonaEvolution {
  timestamp: string;
  changeType: 'linguistic_drift' | 'value_update' | 'platform_adaptation' | 'user_feedback';
  description: string;
  beforeSnapshot: Partial<PersonaLayer>;
  afterSnapshot: Partial<PersonaLayer>;
  confidence: number;
}

// API Response wrappers
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    requestId: string;
    timestamp: string;
    processingTimeMs: number;
  };
}

// Upload and file management
export interface UploadRequest {
  userId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  purpose: 'identity_extraction' | 'profile_image' | 'training_data';
}

export interface UploadResponse {
  uploadId: string;
  uploadUrl: string; // Pre-signed S3 URL
  expiresAt: string;
}

// Localization and cultural adaptation
export interface LocalizationRule {
  id: string;
  type: 'metaphor_replacement' | 'cultural_reference' | 'language_mixing';
  sourcePattern: string;
  targetReplacement: string;
  culturalContext: string;
  confidence: number;
  examples: string[];
}

// System configuration and feature flags
export interface SystemConfig {
  features: {
    audienceSimulation: boolean;
    voiceDriftDetection: boolean;
    realTimePersonaAdaptation: boolean;
    multimodalExtraction: boolean;
  };
  
  limits: {
    maxPersonasPerUser: number;
    maxGenerationsPerDay: number;
    maxUploadSizeMB: number;
  };
  
  models: {
    primaryGeneration: string; // e.g., "claude-4.5"
    identityExtraction: string; // e.g., "nova-multimodal"
    audienceSimulation: string;
  };
}

// Error types for better error handling
export enum PersonaErrorCode {
  PERSONA_NOT_FOUND = 'PERSONA_NOT_FOUND',
  INVALID_PERSONA_DATA = 'INVALID_PERSONA_DATA',
  VOICE_DRIFT_THRESHOLD_EXCEEDED = 'VOICE_DRIFT_THRESHOLD_EXCEEDED',
  GUARDRAILS_VIOLATION = 'GUARDRAILS_VIOLATION',
  PLATFORM_NOT_SUPPORTED = 'PLATFORM_NOT_SUPPORTED',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  IDENTITY_EXTRACTION_FAILED = 'IDENTITY_EXTRACTION_FAILED',
  INSUFFICIENT_TRAINING_DATA = 'INSUFFICIENT_TRAINING_DATA',
}

export class PersonaError extends Error {
  constructor(
    public code: PersonaErrorCode,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'PersonaError';
  }
}

// Utility types for frontend components
export type PersonaSummary = Pick<PersonaLayer, 'id' | 'name' | 'linguisticDNA' | 'emotionalBaseline'>;

export type GenerationPreview = Pick<GenerationResponse, 'generatedContent' | 'personaAlignmentScore' | 'voiceDriftAlert'>;

// Export all types for easy importing
export type {
  PersonaLayer,
  GenerationRequest,
  GenerationResponse,
  AudienceReaction,
  IdentityExtractionRequest,
  IdentityExtractionResponse,
  PersonaState,
  PersonaEvolution,
  ApiResponse,
  UploadRequest,
  UploadResponse,
  LocalizationRule,
  SystemConfig,
};