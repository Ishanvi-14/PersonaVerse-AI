# Technical Design Document: Adaptive Intelligence Upgrade

## Overview

This design document specifies the technical implementation of the Adaptive Intelligence Upgrade for PersonaVerse AI. The upgrade transforms the existing working prototype into an Adaptive Communication AI Platform by adding intelligence layers that analyze audience context, apply domain-specific strategies, score engagement quality, and learn from user interactions.

### Design Philosophy

The core architectural principle is **non-destructive wrapping**: all new capabilities are implemented as wrapper layers around the immutable Core_Engine (PersonaService). This ensures:

- Zero breaking changes to existing functionality
- Complete backward compatibility with Legacy_Frontend
- Clear separation of concerns between core and adaptive features
- Ability to disable adaptive features via configuration flags

### Key Design Decisions

1. **Wrapper Pattern**: Intelligence layers wrap Core_Engine without modifying its internals
2. **TypeScript Consistency**: All backend code uses TypeScript for type safety and consistency
3. **File-Based Memory**: Simple JSON file storage for user profiles (no database dependencies)
4. **Mock-First Development**: AWS Bedrock mocks preserve credits during development
5. **Dual API Architecture**: Separate endpoints for legacy and adaptive generation
6. **Feature Flags**: Configuration-driven enablement of adaptive capabilities
7. **Graceful Degradation**: Intelligence layer failures never break core functionality


## Architecture

### High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         API Layer                                │
│  ┌──────────────────┐              ┌──────────────────────────┐ │
│  │ POST /generate   │              │ POST /generate-adaptive  │ │
│  │ (Legacy)         │              │ (New)                    │ │
│  └────────┬─────────┘              └──────────┬───────────────┘ │
│           │                                    │                 │
└───────────┼────────────────────────────────────┼─────────────────┘
            │                                    │
            │                                    ▼
            │                        ┌───────────────────────────┐
            │                        │   Adaptive_Wrapper        │
            │                        │  (Orchestration Layer)    │
            │                        └───────────┬───────────────┘
            │                                    │
            │                        ┌───────────┴───────────┐
            │                        │                       │
            │                        ▼                       ▼
            │              ┌──────────────────┐   ┌──────────────────┐
            │              │ Audience_Engine  │   │  Domain_Engine   │
            │              │ (Infer Context)  │   │ (Apply Strategy) │
            │              └──────────────────┘   └──────────────────┘
            │                        │                       │
            │                        └───────────┬───────────┘
            │                                    │
            ▼                                    ▼
    ┌───────────────────┐            ┌───────────────────────┐
    │   Core_Engine     │◄───────────│  Enriched Context     │
    │ (PersonaService)  │            │  Merged Metadata      │
    │   [IMMUTABLE]     │            └───────────────────────┘
    └─────────┬─────────┘                        │
              │                                  │
              │                                  ▼
              │                        ┌───────────────────────┐
              │                        │  Engagement_Scorer    │
              │                        │  (Quality Analysis)   │
              │                        └───────────┬───────────┘
              │                                    │
              │                                    ▼
              │                          ┌─────────────────┐
              │                          │   Retry_Loop    │
              │                          │ (Self-Improve)  │
              │                          └─────────┬───────┘
              │                                    │
              │                                    ▼
              │                          ┌─────────────────┐
              │                          │ Memory_System   │
              │                          │ (User Profiles) │
              │                          └─────────────────┘
              │
              └──────────► Response (Both Paths)
```

### Component Responsibilities

**API_Adapter** (`/backend/api/routesAdapter.ts`)
- Exposes REST endpoints for both legacy and adaptive generation
- Routes legacy requests directly to Core_Engine
- Routes adaptive requests to Adaptive_Wrapper
- Contains zero business logic (pure routing)

**Adaptive_Wrapper** (`/backend/engines/adaptiveWrapper.ts`)
- Orchestrates the complete adaptive generation flow
- Calls intelligence engines in sequence
- Merges metadata into enriched context
- Handles retry logic based on engagement scores
- Saves successful generations to memory
- Implements graceful degradation on failures

**Audience_Engine** (`/backend/engines/audienceEngine.ts`)
- Analyzes user input to infer communication preferences
- Returns structured audience profile (language, literacy, tone, format)
- Uses AWS Bedrock Claude 4.5 (or mock in development)
- Never calls Core_Engine directly

**Domain_Engine** (`/backend/engines/domainEngine.ts`)
- Provides domain-specific communication strategies
- Supports six domains: education, business, finance, health, creator, government
- Returns explanation style, trust level, engagement style
- Uses AWS Bedrock Claude 4.5 (or mock in development)
- Never calls Core_Engine directly

**Engagement_Scorer** (`/backend/engines/engagementEngine.ts`)
- Evaluates generated content quality (0-100 score)
- Considers readability, tone match, emoji density, CTA presence, language alignment
- Returns detailed scoring breakdown
- Triggers retry loop when score < 70

**Memory_System** (`/backend/memory/userMemory.ts`)
- Stores user profiles in `/backend/memory/user_profiles.json`
- Tracks preferred language, tone, domain usage, previous summaries
- Updates profiles after successful generations
- Creates new profiles with defaults for new users

**Core_Engine** (`/backend/services/persona-engine/personaService.ts`)
- Existing PersonaService [IMMUTABLE]
- Generates content using persona layers
- Remains unchanged in signature and behavior


### Sequence Diagram: Adaptive Generation Flow

```
User → API_Adapter: POST /generate-adaptive {prompt, domain, userId}
API_Adapter → Adaptive_Wrapper: generateContentAdaptive(request)

Adaptive_Wrapper → Audience_Engine: analyzeAudience(prompt, userMessage)
Audience_Engine → Bedrock: Infer language_style, literacy_level, tone, format
Bedrock → Audience_Engine: AudienceProfile
Audience_Engine → Adaptive_Wrapper: AudienceProfile

Adaptive_Wrapper → Domain_Engine: analyzeDomain(domain)
Domain_Engine → Bedrock: Get domain strategy
Bedrock → Domain_Engine: DomainStrategy
Domain_Engine → Adaptive_Wrapper: DomainStrategy

Adaptive_Wrapper → Adaptive_Wrapper: mergeContext(audience, domain)

Adaptive_Wrapper → Core_Engine: generateContent(enrichedRequest)
Core_Engine → Bedrock: Generate with persona + context
Bedrock → Core_Engine: GeneratedContent
Core_Engine → Adaptive_Wrapper: GenerationResponse

Adaptive_Wrapper → Engagement_Scorer: scoreContent(content, audience, domain)
Engagement_Scorer → Bedrock: Analyze quality
Bedrock → Engagement_Scorer: EngagementScore
Engagement_Scorer → Adaptive_Wrapper: score=65, breakdown

alt score < 70 AND retries < 2
    Adaptive_Wrapper → Adaptive_Wrapper: prepareRetryPrompt(score, breakdown)
    Adaptive_Wrapper → Core_Engine: generateContent(improvedRequest)
    Core_Engine → Adaptive_Wrapper: ImprovedContent
    Adaptive_Wrapper → Engagement_Scorer: scoreContent(improvedContent)
    Engagement_Scorer → Adaptive_Wrapper: score=82
end

Adaptive_Wrapper → Memory_System: saveGeneration(userId, result)
Memory_System → FileSystem: Write user_profiles.json
FileSystem → Memory_System: Success
Memory_System → Adaptive_Wrapper: Saved

Adaptive_Wrapper → API_Adapter: AdaptiveGenerationResponse
API_Adapter → User: {content, score, audience, domain, metadata}
```


## Components and Interfaces

### Type Definitions

**New File**: `/backend/shared/adaptive.types.ts`

```typescript
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
```


### Audience Engine Implementation

**File**: `/backend/engines/audienceEngine.ts`

```typescript
import { AudienceProfile, AdaptiveError, AdaptiveErrorCode } from '../shared/adaptive.types';

export class AudienceEngine {
  private bedrockClient: any; // AWS Bedrock client or mock
  private useMocks: boolean;

  constructor(config: { useMocks: boolean }) {
    this.useMocks = config.useMocks;
    if (!this.useMocks) {
      // Initialize real Bedrock client
      // this.bedrockClient = new BedrockRuntimeClient({ region: config.region });
    }
  }

  /**
   * Analyze user input to infer audience communication preferences
   * 
   * This method uses Claude 4.5 to analyze the prompt and optional user message
   * to determine the most appropriate communication style for the target audience.
   */
  async analyzeAudience(prompt: string, userMessage?: string): Promise<AudienceProfile> {
    const startTime = Date.now();

    try {
      if (this.useMocks) {
        return this.mockAnalyzeAudience(prompt, userMessage);
      }

      // Real Bedrock implementation
      const systemPrompt = `You are an audience analysis expert for Bharat (India).
Analyze the given content and infer the target audience's communication preferences.

Consider:
- Language mixing patterns (English, Hinglish, Regional)
- Literacy and comprehension level
- Preferred communication tone
- Content format preferences

Return ONLY a JSON object with this exact structure:
{
  "language_style": "english" | "hinglish" | "regional",
  "literacy_level": "low" | "medium" | "high",
  "communication_tone": "formal" | "friendly" | "motivational" | "authoritative",
  "content_format_preference": "short" | "story" | "bullet" | "conversational",
  "confidence": 0.0-1.0
}`;

      const userPrompt = `Prompt: ${prompt}\n${userMessage ? `User Context: ${userMessage}` : ''}`;

      // Call Bedrock with structured JSON output
      const response = await this.callBedrock(systemPrompt, userPrompt);
      const profile = JSON.parse(response);

      return {
        ...profile,
        inferred_at: new Date().toISOString(),
      };

    } catch (error) {
      throw new AdaptiveError(
        AdaptiveErrorCode.AUDIENCE_ENGINE_FAILED,
        `Audience analysis failed: ${error.message}`,
        { prompt, error }
      );
    }
  }

  /**
   * Mock implementation for development (preserves AWS credits)
   */
  private mockAnalyzeAudience(prompt: string, userMessage?: string): AudienceProfile {
    // Intelligent mock based on prompt analysis
    const lowerPrompt = prompt.toLowerCase();
    
    // Detect Hinglish patterns
    const hinglishMarkers = ['yaar', 'arre', 'hai', 'kya', 'bas', 'jugaad'];
    const hasHinglish = hinglishMarkers.some(marker => lowerPrompt.includes(marker));
    
    // Detect formality
    const formalMarkers = ['quarterly', 'strategy', 'professional', 'business'];
    const isFormal = formalMarkers.some(marker => lowerPrompt.includes(marker));
    
    // Detect regional context
    const regionalMarkers = ['tier-2', 'local', 'community', 'regional'];
    const isRegional = regionalMarkers.some(marker => lowerPrompt.includes(marker));

    return {
      language_style: isRegional ? 'regional' : (hasHinglish ? 'hinglish' : 'english'),
      literacy_level: isFormal ? 'high' : 'medium',
      communication_tone: isFormal ? 'formal' : 'friendly',
      content_format_preference: lowerPrompt.length < 50 ? 'short' : 'conversational',
      inferred_at: new Date().toISOString(),
      confidence: 0.85,
    };
  }

  private async callBedrock(systemPrompt: string, userPrompt: string): Promise<string> {
    // Bedrock API call implementation
    // Uses Claude 4.5 via Cross-Region Inference Profiles
    throw new Error('Bedrock integration not yet implemented');
  }
}
```


### Domain Engine Implementation

**File**: `/backend/engines/domainEngine.ts`

```typescript
import { DomainStrategy, SupportedDomain, AdaptiveError, AdaptiveErrorCode } from '../shared/adaptive.types';

export class DomainEngine {
  private bedrockClient: any;
  private useMocks: boolean;
  
  // Domain strategy mappings for Bharat context
  private readonly DOMAIN_STRATEGIES: Record<SupportedDomain, Partial<DomainStrategy>> = {
    education: {
      explanation_style: 'analogy',
      trust_level: 'high',
      engagement_style: 'informative',
    },
    business: {
      explanation_style: 'direct',
      trust_level: 'medium',
      engagement_style: 'persuasive',
    },
    finance: {
      explanation_style: 'direct',
      trust_level: 'high',
      engagement_style: 'informative',
    },
    health: {
      explanation_style: 'narrative',
      trust_level: 'high',
      engagement_style: 'informative',
    },
    creator: {
      explanation_style: 'narrative',
      trust_level: 'medium',
      engagement_style: 'storytelling',
    },
    government: {
      explanation_style: 'direct',
      trust_level: 'high',
      engagement_style: 'informative',
    },
  };

  constructor(config: { useMocks: boolean }) {
    this.useMocks = config.useMocks;
  }

  /**
   * Analyze domain to determine appropriate communication strategy
   * 
   * Returns domain-specific guidance for content generation that aligns
   * with Bharat cultural context and audience expectations.
   */
  async analyzeDomain(domain: SupportedDomain): Promise<DomainStrategy> {
    // Validate domain
    if (!this.DOMAIN_STRATEGIES[domain]) {
      throw new AdaptiveError(
        AdaptiveErrorCode.INVALID_DOMAIN,
        `Invalid domain: ${domain}. Must be one of: ${Object.keys(this.DOMAIN_STRATEGIES).join(', ')}`,
        { domain }
      );
    }

    try {
      if (this.useMocks) {
        return this.mockAnalyzeDomain(domain);
      }

      // Real Bedrock implementation for context-aware strategy refinement
      const systemPrompt = `You are a domain communication strategist for Bharat (India).
Given a domain, provide culturally appropriate communication strategies.

Consider:
- Bharat-specific cultural context and expectations
- Trust requirements for the domain
- Effective engagement patterns for Indian audiences
- Appropriate explanation styles (use cricket, jugaad, and local metaphors)

Return ONLY a JSON object with this exact structure:
{
  "explanation_style": "analogy" | "direct" | "narrative",
  "trust_level": "low" | "medium" | "high",
  "engagement_style": "informative" | "persuasive" | "storytelling"
}`;

      const userPrompt = `Domain: ${domain}`;
      const response = await this.callBedrock(systemPrompt, userPrompt);
      const strategy = JSON.parse(response);

      return {
        domain,
        ...strategy,
        analyzed_at: new Date().toISOString(),
      };

    } catch (error) {
      throw new AdaptiveError(
        AdaptiveErrorCode.DOMAIN_ENGINE_FAILED,
        `Domain analysis failed: ${error.message}`,
        { domain, error }
      );
    }
  }

  /**
   * Mock implementation using predefined strategies
   */
  private mockAnalyzeDomain(domain: SupportedDomain): DomainStrategy {
    const baseStrategy = this.DOMAIN_STRATEGIES[domain];
    
    return {
      domain,
      explanation_style: baseStrategy.explanation_style!,
      trust_level: baseStrategy.trust_level!,
      engagement_style: baseStrategy.engagement_style!,
      analyzed_at: new Date().toISOString(),
    };
  }

  private async callBedrock(systemPrompt: string, userPrompt: string): Promise<string> {
    // Bedrock API call implementation
    throw new Error('Bedrock integration not yet implemented');
  }
}
```


### Engagement Scorer Implementation

**File**: `/backend/engines/engagementEngine.ts`

```typescript
import { EngagementScore, AudienceProfile, AdaptiveError, AdaptiveErrorCode } from '../shared/adaptive.types';

export class EngagementScorer {
  private bedrockClient: any;
  private useMocks: boolean;

  constructor(config: { useMocks: boolean }) {
    this.useMocks = config.useMocks;
  }

  /**
   * Score generated content for engagement quality
   * 
   * Evaluates content across multiple dimensions:
   * - Readability and length appropriateness
   * - Tone match with audience preferences
   * - Emoji usage (platform-appropriate)
   * - Call-to-action presence and clarity
   * - Language alignment (Hinglish ratio, cultural markers)
   */
  async scoreContent(
    content: string,
    audienceProfile: AudienceProfile,
    platform: string
  ): Promise<EngagementScore> {
    try {
      if (this.useMocks) {
        return this.mockScoreContent(content, audienceProfile, platform);
      }

      // Real Bedrock implementation
      const systemPrompt = `You are a content quality analyst for Bharat (India).
Score the given content for engagement quality on a 0-100 scale.

Evaluate:
1. Readability: Is length appropriate? Is it easy to understand?
2. Tone Match: Does it match the audience's preferred tone?
3. Emoji Density: Appropriate emoji usage for platform and audience?
4. Call-to-Action: Clear next steps or engagement prompt?
5. Language Alignment: Correct Hinglish ratio and cultural markers?

Return ONLY a JSON object with this exact structure:
{
  "overall_score": 0-100,
  "breakdown": {
    "readability": 0-100,
    "tone_match": 0-100,
    "emoji_density": 0-100,
    "call_to_action": 0-100,
    "language_alignment": 0-100
  },
  "improvement_suggestions": ["suggestion1", "suggestion2"]
}`;

      const userPrompt = `Content: ${content}
Audience: ${JSON.stringify(audienceProfile)}
Platform: ${platform}`;

      const response = await this.callBedrock(systemPrompt, userPrompt);
      const score = JSON.parse(response);

      return {
        ...score,
        scored_at: new Date().toISOString(),
      };

    } catch (error) {
      throw new AdaptiveError(
        AdaptiveErrorCode.ENGAGEMENT_SCORER_FAILED,
        `Engagement scoring failed: ${error.message}`,
        { content: content.substring(0, 100), error }
      );
    }
  }

  /**
   * Mock scoring implementation with heuristic analysis
   */
  private mockScoreContent(
    content: string,
    audienceProfile: AudienceProfile,
    platform: string
  ): EngagementScore {
    const breakdown = {
      readability: this.scoreReadability(content, audienceProfile),
      tone_match: this.scoreToneMatch(content, audienceProfile),
      emoji_density: this.scoreEmojiDensity(content, platform),
      call_to_action: this.scoreCallToAction(content),
      language_alignment: this.scoreLanguageAlignment(content, audienceProfile),
    };

    const overall_score = Math.round(
      (breakdown.readability +
        breakdown.tone_match +
        breakdown.emoji_density +
        breakdown.call_to_action +
        breakdown.language_alignment) / 5
    );

    const improvement_suggestions = this.generateImprovementSuggestions(breakdown, audienceProfile);

    return {
      overall_score,
      breakdown,
      improvement_suggestions,
      scored_at: new Date().toISOString(),
    };
  }

  private scoreReadability(content: string, audience: AudienceProfile): number {
    const wordCount = content.split(/\s+/).length;
    const sentenceCount = content.split(/[.!?]+/).length;
    const avgWordsPerSentence = wordCount / sentenceCount;

    // Adjust expectations based on literacy level
    const idealRange = {
      low: { min: 5, max: 12 },
      medium: { min: 10, max: 20 },
      high: { min: 15, max: 30 },
    }[audience.literacy_level];

    if (avgWordsPerSentence >= idealRange.min && avgWordsPerSentence <= idealRange.max) {
      return 90;
    } else if (avgWordsPerSentence < idealRange.min) {
      return 70; // Too choppy
    } else {
      return 60; // Too complex
    }
  }

  private scoreToneMatch(content: string, audience: AudienceProfile): number {
    const lowerContent = content.toLowerCase();
    
    const toneMarkers = {
      formal: ['therefore', 'furthermore', 'consequently', 'professional'],
      friendly: ['hey', 'yaar', 'arre', 'let\'s', 'we'],
      motivational: ['achieve', 'success', 'grow', 'win', 'hustle'],
      authoritative: ['must', 'should', 'will', 'ensure', 'require'],
    };

    const markers = toneMarkers[audience.communication_tone] || [];
    const matchCount = markers.filter(marker => lowerContent.includes(marker)).length;

    return Math.min(100, 60 + (matchCount * 10));
  }

  private scoreEmojiDensity(content: string, platform: string): number {
    const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]/gu;
    const emojiCount = (content.match(emojiRegex) || []).length;
    const wordCount = content.split(/\s+/).length;
    const emojiRatio = emojiCount / wordCount;

    // Platform-specific expectations
    const idealRatio = {
      whatsapp: 0.05, // 1 emoji per 20 words
      linkedin: 0.01, // 1 emoji per 100 words
      twitter: 0.03,
      instagram: 0.07,
    }[platform] || 0.02;

    const diff = Math.abs(emojiRatio - idealRatio);
    return Math.max(50, 100 - (diff * 1000));
  }

  private scoreCallToAction(content: string): number {
    const ctaPatterns = [
      /let'?s\s+\w+/i,
      /join\s+(us|me)/i,
      /share\s+your/i,
      /comment\s+below/i,
      /what\s+do\s+you\s+think/i,
      /tell\s+me/i,
      /reach\s+out/i,
    ];

    const hasCTA = ctaPatterns.some(pattern => pattern.test(content));
    return hasCTA ? 90 : 50;
  }

  private scoreLanguageAlignment(content: string, audience: AudienceProfile): number {
    const hinglishMarkers = ['yaar', 'arre', 'hai', 'na', 'kya', 'bas', 'jugaad', 'mehnat'];
    const hinglishCount = hinglishMarkers.filter(marker => 
      content.toLowerCase().includes(marker)
    ).length;

    const expectedHinglish = {
      english: 0,
      hinglish: 2,
      regional: 4,
    }[audience.language_style];

    const diff = Math.abs(hinglishCount - expectedHinglish);
    return Math.max(50, 100 - (diff * 15));
  }

  private generateImprovementSuggestions(
    breakdown: EngagementScore['breakdown'],
    audience: AudienceProfile
  ): string[] {
    const suggestions: string[] = [];

    if (breakdown.readability < 70) {
      suggestions.push(`Adjust sentence length for ${audience.literacy_level} literacy level`);
    }
    if (breakdown.tone_match < 70) {
      suggestions.push(`Strengthen ${audience.communication_tone} tone markers`);
    }
    if (breakdown.emoji_density < 70) {
      suggestions.push('Adjust emoji usage to match platform expectations');
    }
    if (breakdown.call_to_action < 70) {
      suggestions.push('Add clear call-to-action to drive engagement');
    }
    if (breakdown.language_alignment < 70) {
      suggestions.push(`Increase Hinglish markers for ${audience.language_style} audience`);
    }

    return suggestions;
  }

  private async callBedrock(systemPrompt: string, userPrompt: string): Promise<string> {
    // Bedrock API call implementation
    throw new Error('Bedrock integration not yet implemented');
  }
}
```


### Adaptive Wrapper Implementation

**File**: `/backend/engines/adaptiveWrapper.ts`

```typescript
import { PersonaService } from '../services/persona-engine/personaService';
import { AudienceEngine } from './audienceEngine';
import { DomainEngine } from './domainEngine';
import { EngagementScorer } from './engagementEngine';
import { UserMemory } from '../memory/userMemory';
import {
  AdaptiveGenerationRequest,
  AdaptiveGenerationResponse,
  AdaptiveConfig,
  AdaptiveError,
  AdaptiveErrorCode,
} from '../shared/adaptive.types';
import { GenerationRequest } from '../shared/persona.types';

export class AdaptiveWrapper {
  private coreEngine: PersonaService;
  private audienceEngine: AudienceEngine;
  private domainEngine: DomainEngine;
  private engagementScorer: EngagementScorer;
  private userMemory: UserMemory;
  private config: AdaptiveConfig;

  constructor(config: AdaptiveConfig) {
    this.config = config;
    this.coreEngine = new PersonaService();
    this.audienceEngine = new AudienceEngine({ useMocks: config.bedrock.use_mocks });
    this.domainEngine = new DomainEngine({ useMocks: config.bedrock.use_mocks });
    this.engagementScorer = new EngagementScorer({ useMocks: config.bedrock.use_mocks });
    this.userMemory = new UserMemory();
  }

  /**
   * Generate content with adaptive intelligence layers
   * 
   * This is the main orchestration function that coordinates all intelligence
   * engines around the immutable Core_Engine.
   */
  async generateContentAdaptive(
    request: AdaptiveGenerationRequest
  ): Promise<AdaptiveGenerationResponse> {
    const startTime = Date.now();
    const timings = {
      audienceAnalysisMs: 0,
      domainAnalysisMs: 0,
      generationMs: 0,
      scoringMs: 0,
    };

    try {
      // Step 1: Analyze Audience (with graceful degradation)
      let audienceProfile;
      const audienceStart = Date.now();
      try {
        if (this.config.features.enable_audience_engine) {
          audienceProfile = await this.audienceEngine.analyzeAudience(
            request.prompt,
            request.userMessage
          );
        } else {
          audienceProfile = this.getDefaultAudienceProfile();
        }
      } catch (error) {
        console.warn('Audience engine failed, using defaults:', error.message);
        audienceProfile = this.getDefaultAudienceProfile();
      }
      timings.audienceAnalysisMs = Date.now() - audienceStart;

      // Step 2: Analyze Domain (with graceful degradation)
      let domainStrategy;
      const domainStart = Date.now();
      try {
        if (this.config.features.enable_domain_engine) {
          domainStrategy = await this.domainEngine.analyzeDomain(request.domain);
        } else {
          domainStrategy = this.getDefaultDomainStrategy(request.domain);
        }
      } catch (error) {
        console.warn('Domain engine failed, using defaults:', error.message);
        domainStrategy = this.getDefaultDomainStrategy(request.domain);
      }
      timings.domainAnalysisMs = Date.now() - domainStart;

      // Step 3: Merge context and generate content
      const enrichedRequest = this.enrichRequest(request, audienceProfile, domainStrategy);
      
      const genStart = Date.now();
      const coreResponse = await this.coreEngine.generateContent(enrichedRequest);
      timings.generationMs = Date.now() - genStart;

      if (!coreResponse.success || !coreResponse.data) {
        throw new Error('Core engine generation failed');
      }

      let generatedContent = coreResponse.data.generatedContent;
      let retryCount = 0;
      let improvementApplied = false;

      // Step 4: Score engagement and retry if needed
      let engagementScore;
      const scoreStart = Date.now();
      try {
        if (this.config.features.enable_engagement_scoring) {
          engagementScore = await this.engagementScorer.scoreContent(
            generatedContent,
            audienceProfile,
            request.platform
          );

          // Step 5: Retry loop for quality improvement
          if (
            this.config.features.enable_retry_loop &&
            engagementScore.overall_score < this.config.thresholds.engagement_score_threshold &&
            retryCount < this.config.thresholds.max_retry_attempts
          ) {
            const retryResult = await this.retryWithImprovement(
              enrichedRequest,
              generatedContent,
              engagementScore,
              audienceProfile,
              request.platform
            );
            
            generatedContent = retryResult.content;
            engagementScore = retryResult.score;
            retryCount = retryResult.retryCount;
            improvementApplied = true;
          }
        } else {
          engagementScore = this.getDefaultEngagementScore();
        }
      } catch (error) {
        console.warn('Engagement scoring failed, skipping retry:', error.message);
        engagementScore = this.getDefaultEngagementScore();
      }
      timings.scoringMs = Date.now() - scoreStart;

      // Step 6: Save to memory (with graceful degradation)
      if (this.config.features.enable_memory_system) {
        try {
          await this.userMemory.saveGeneration(request.userId, {
            timestamp: new Date().toISOString(),
            domain: request.domain,
            platform: request.platform,
            engagement_score: engagementScore.overall_score,
            audience_profile: audienceProfile,
          });
        } catch (error) {
          console.warn('Memory system save failed:', error.message);
          // Continue - memory failure doesn't break generation
        }
      }

      // Step 7: Return comprehensive response
      return {
        id: `adaptive_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        generatedContent,
        audienceProfile,
        domainStrategy,
        engagementScore,
        retryCount,
        improvementApplied,
        personaAlignmentScore: coreResponse.data.personaAlignmentScore,
        metadata: {
          generatedAt: new Date().toISOString(),
          processingTimeMs: Date.now() - startTime,
          modelVersion: coreResponse.data.metadata.modelVersion,
          ...timings,
        },
      };

    } catch (error) {
      throw new AdaptiveError(
        AdaptiveErrorCode.MAX_RETRIES_EXCEEDED,
        `Adaptive generation failed: ${error.message}`,
        { request, error }
      );
    }
  }

  /**
   * Retry generation with improvement instructions
   */
  private async retryWithImprovement(
    originalRequest: GenerationRequest,
    previousContent: string,
    previousScore: any,
    audienceProfile: any,
    platform: string
  ): Promise<{ content: string; score: any; retryCount: number }> {
    let bestContent = previousContent;
    let bestScore = previousScore;
    let retryCount = 0;

    while (
      retryCount < this.config.thresholds.max_retry_attempts &&
      bestScore.overall_score < this.config.thresholds.engagement_score_threshold
    ) {
      retryCount++;

      // Prepare improvement prompt
      const improvementPrompt = this.buildImprovementPrompt(
        originalRequest.content,
        previousScore
      );

      const retryRequest: GenerationRequest = {
        ...originalRequest,
        content: improvementPrompt,
      };

      const retryResponse = await this.coreEngine.generateContent(retryRequest);
      
      if (retryResponse.success && retryResponse.data) {
        const newContent = retryResponse.data.generatedContent;
        const newScore = await this.engagementScorer.scoreContent(
          newContent,
          audienceProfile,
          platform
        );

        if (newScore.overall_score > bestScore.overall_score) {
          bestContent = newContent;
          bestScore = newScore;
        }
      }
    }

    return { content: bestContent, score: bestScore, retryCount };
  }

  /**
   * Build improvement prompt with specific guidance
   */
  private buildImprovementPrompt(originalPrompt: string, score: any): string {
    const suggestions = score.improvement_suggestions.join('; ');
    return `${originalPrompt}

IMPROVEMENT NEEDED (Previous score: ${score.overall_score}/100):
${suggestions}

Please regenerate with these improvements while maintaining persona authenticity.`;
  }

  /**
   * Enrich request with intelligence layer metadata
   */
  private enrichRequest(
    request: AdaptiveGenerationRequest,
    audienceProfile: any,
    domainStrategy: any
  ): GenerationRequest {
    // Merge intelligence into context
    const enrichedContext = {
      audienceType: this.mapAudienceToType(audienceProfile),
      contentType: this.mapDomainToContentType(domainStrategy),
      previousMessages: [],
      // Add intelligence metadata as context hints
      _adaptive: {
        language_style: audienceProfile.language_style,
        literacy_level: audienceProfile.literacy_level,
        tone: audienceProfile.communication_tone,
        format: audienceProfile.content_format_preference,
        explanation_style: domainStrategy.explanation_style,
        engagement_style: domainStrategy.engagement_style,
      },
    };

    return {
      userId: request.userId,
      personaId: request.personaId,
      platform: request.platform as any,
      content: request.prompt,
      context: enrichedContext,
    };
  }

  private mapAudienceToType(profile: any): string {
    if (profile.literacy_level === 'low') return 'general';
    if (profile.communication_tone === 'formal') return 'professionals';
    return 'general';
  }

  private mapDomainToContentType(strategy: any): string {
    if (strategy.engagement_style === 'informative') return 'educational';
    if (strategy.engagement_style === 'persuasive') return 'promotional';
    return 'personal';
  }

  private getDefaultAudienceProfile(): any {
    return {
      language_style: 'hinglish',
      literacy_level: 'medium',
      communication_tone: 'friendly',
      content_format_preference: 'conversational',
      inferred_at: new Date().toISOString(),
      confidence: 0.5,
    };
  }

  private getDefaultDomainStrategy(domain: string): any {
    return {
      domain,
      explanation_style: 'direct',
      trust_level: 'medium',
      engagement_style: 'informative',
      analyzed_at: new Date().toISOString(),
    };
  }

  private getDefaultEngagementScore(): any {
    return {
      overall_score: 75,
      breakdown: {
        readability: 75,
        tone_match: 75,
        emoji_density: 75,
        call_to_action: 75,
        language_alignment: 75,
      },
      improvement_suggestions: [],
      scored_at: new Date().toISOString(),
    };
  }
}
```


### Memory System Implementation

**File**: `/backend/memory/userMemory.ts`

```typescript
import * as fs from 'fs/promises';
import * as path from 'path';
import { UserProfile, GenerationSummary, SupportedDomain, AdaptiveError, AdaptiveErrorCode } from '../shared/adaptive.types';

export class UserMemory {
  private readonly MEMORY_FILE = path.join(__dirname, 'user_profiles.json');
  private memoryCache: Map<string, UserProfile> = new Map();

  constructor() {
    this.initializeMemory();
  }

  /**
   * Initialize memory system and load existing profiles
   */
  private async initializeMemory(): Promise<void> {
    try {
      const data = await fs.readFile(this.MEMORY_FILE, 'utf-8');
      const profiles: UserProfile[] = JSON.parse(data);
      profiles.forEach(profile => {
        this.memoryCache.set(profile.userId, profile);
      });
    } catch (error) {
      // File doesn't exist yet, start with empty memory
      console.log('Initializing new memory system');
      await this.persistMemory();
    }
  }

  /**
   * Get user profile (creates default if doesn't exist)
   */
  async getUserProfile(userId: string): Promise<UserProfile> {
    if (this.memoryCache.has(userId)) {
      return this.memoryCache.get(userId)!;
    }

    // Create new profile with defaults
    const newProfile: UserProfile = {
      userId,
      preferred_language: 'hinglish',
      preferred_tone: 'friendly',
      domain_usage: {
        education: 0,
        business: 0,
        finance: 0,
        health: 0,
        creator: 0,
        government: 0,
      },
      previous_summaries: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.memoryCache.set(userId, newProfile);
    await this.persistMemory();
    
    return newProfile;
  }

  /**
   * Save generation to user's memory
   * 
   * This implements the learning system by tracking:
   * - Language preferences
   * - Tone preferences
   * - Domain usage patterns
   * - Historical summaries
   */
  async saveGeneration(userId: string, summary: GenerationSummary): Promise<void> {
    try {
      const profile = await this.getUserProfile(userId);

      // Update domain usage
      profile.domain_usage[summary.domain]++;

      // Update preferred language (weighted average)
      if (summary.audience_profile.language_style) {
        profile.preferred_language = summary.audience_profile.language_style;
      }

      // Update preferred tone (weighted average)
      if (summary.audience_profile.communication_tone) {
        profile.preferred_tone = summary.audience_profile.communication_tone;
      }

      // Add to summaries (keep last 50)
      profile.previous_summaries.unshift(summary);
      if (profile.previous_summaries.length > 50) {
        profile.previous_summaries = profile.previous_summaries.slice(0, 50);
      }

      profile.updated_at = new Date().toISOString();

      this.memoryCache.set(userId, profile);
      await this.persistMemory();

    } catch (error) {
      throw new AdaptiveError(
        AdaptiveErrorCode.MEMORY_SYSTEM_FAILED,
        `Failed to save generation: ${error.message}`,
        { userId, summary, error }
      );
    }
  }

  /**
   * Get user's most used domain
   */
  async getMostUsedDomain(userId: string): Promise<SupportedDomain> {
    const profile = await this.getUserProfile(userId);
    const entries = Object.entries(profile.domain_usage) as [SupportedDomain, number][];
    entries.sort((a, b) => b[1] - a[1]);
    return entries[0][0];
  }

  /**
   * Get user's average engagement score
   */
  async getAverageEngagementScore(userId: string): Promise<number> {
    const profile = await this.getUserProfile(userId);
    if (profile.previous_summaries.length === 0) return 0;

    const sum = profile.previous_summaries.reduce(
      (acc, summary) => acc + summary.engagement_score,
      0
    );
    return sum / profile.previous_summaries.length;
  }

  /**
   * Persist memory to disk
   */
  private async persistMemory(): Promise<void> {
    try {
      const profiles = Array.from(this.memoryCache.values());
      const data = JSON.stringify(profiles, null, 2);
      
      // Ensure directory exists
      await fs.mkdir(path.dirname(this.MEMORY_FILE), { recursive: true });
      await fs.writeFile(this.MEMORY_FILE, data, 'utf-8');
    } catch (error) {
      console.error('Failed to persist memory:', error);
      // Don't throw - memory persistence failure shouldn't break generation
    }
  }

  /**
   * Clear all memory (for testing)
   */
  async clearMemory(): Promise<void> {
    this.memoryCache.clear();
    await this.persistMemory();
  }
}
```


### API Adapter Implementation

**File**: `/backend/api/routesAdapter.ts`

```typescript
import express, { Request, Response } from 'express';
import { PersonaService } from '../services/persona-engine/personaService';
import { AdaptiveWrapper } from '../engines/adaptiveWrapper';
import { UserMemory } from '../memory/userMemory';
import { AdaptiveConfig } from '../shared/adaptive.types';
import { GenerationRequest } from '../shared/persona.types';

/**
 * API Adapter - Routing layer for legacy and adaptive endpoints
 * 
 * This adapter exposes both legacy and adaptive endpoints while maintaining
 * zero business logic (pure routing).
 */
export class RoutesAdapter {
  private router: express.Router;
  private coreEngine: PersonaService;
  private adaptiveWrapper: AdaptiveWrapper;
  private userMemory: UserMemory;

  constructor(config: AdaptiveConfig) {
    this.router = express.Router();
    this.coreEngine = new PersonaService();
    this.adaptiveWrapper = new AdaptiveWrapper(config);
    this.userMemory = new UserMemory();
    
    this.setupRoutes();
  }

  private setupRoutes(): void {
    // Legacy endpoint - routes directly to Core_Engine
    this.router.post('/generate', this.handleLegacyGenerate.bind(this));

    // Adaptive endpoint - routes to Adaptive_Wrapper
    this.router.post('/generate-adaptive', this.handleAdaptiveGenerate.bind(this));

    // Memory endpoint - retrieves user profile
    this.router.get('/memory/:userId', this.handleGetMemory.bind(this));
  }

  /**
   * POST /generate - Legacy generation endpoint
   * 
   * Routes directly to Core_Engine without any intelligence layer processing.
   * Maintains complete backward compatibility.
   */
  private async handleLegacyGenerate(req: Request, res: Response): Promise<void> {
    try {
      const request: GenerationRequest = req.body;
      
      // Validate required fields
      if (!request.userId || !request.personaId || !request.platform || !request.content) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'Missing required fields: userId, personaId, platform, content',
          },
        });
        return;
      }

      // Route directly to Core_Engine (no intelligence layers)
      const response = await this.coreEngine.generateContent(request);
      
      res.status(200).json(response);

    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: 'GENERATION_FAILED',
          message: error.message,
        },
      });
    }
  }

  /**
   * POST /generate-adaptive - Adaptive generation endpoint
   * 
   * Routes to Adaptive_Wrapper which orchestrates all intelligence layers.
   */
  private async handleAdaptiveGenerate(req: Request, res: Response): Promise<void> {
    try {
      const { userId, personaId, platform, prompt, domain, userMessage } = req.body;
      
      // Validate required fields
      if (!userId || !personaId || !platform || !prompt || !domain) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'Missing required fields: userId, personaId, platform, prompt, domain',
          },
        });
        return;
      }

      // Route to Adaptive_Wrapper
      const response = await this.adaptiveWrapper.generateContentAdaptive({
        userId,
        personaId,
        platform,
        prompt,
        domain,
        userMessage,
      });
      
      res.status(200).json({
        success: true,
        data: response,
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: error.code || 'ADAPTIVE_GENERATION_FAILED',
          message: error.message,
          details: error.details,
        },
      });
    }
  }

  /**
   * GET /memory/:userId - Retrieve user profile
   * 
   * Returns stored user profile including preferences and history.
   */
  private async handleGetMemory(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      
      if (!userId) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'Missing userId parameter',
          },
        });
        return;
      }

      const profile = await this.userMemory.getUserProfile(userId);
      
      res.status(200).json({
        success: true,
        data: profile,
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: 'MEMORY_RETRIEVAL_FAILED',
          message: error.message,
        },
      });
    }
  }

  public getRouter(): express.Router {
    return this.router;
  }
}

/**
 * Express app setup with routes
 */
export function createApp(config: AdaptiveConfig): express.Application {
  const app = express();
  
  app.use(express.json());
  
  // CORS for frontend
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
  });

  // Mount routes
  const routesAdapter = new RoutesAdapter(config);
  app.use('/api', routesAdapter.getRouter());

  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
  });

  return app;
}
```


## Data Models

### File System Structure

```
backend/
├── engines/                          # NEW: Intelligence Layer components
│   ├── README.md                     # Architecture documentation
│   ├── audienceEngine.ts             # Audience inference
│   ├── domainEngine.ts               # Domain strategy
│   ├── engagementEngine.ts           # Quality scoring
│   └── adaptiveWrapper.ts            # Orchestration
├── memory/                           # NEW: User profile storage
│   ├── README.md                     # Memory system documentation
│   ├── userMemory.ts                 # Memory management
│   └── user_profiles.json            # File-based storage
├── api/                              # NEW: API routing layer
│   ├── README.md                     # API documentation
│   └── routesAdapter.ts              # Endpoint routing
├── config/                           # NEW: Configuration
│   └── adaptive.config.json          # Feature flags and settings
├── services/                         # EXISTING: Core services
│   └── persona-engine/               # [IMMUTABLE]
│       ├── personaService.ts
│       └── __mocks__/
│           └── bedrockProvider.ts
└── shared/                           # EXISTING + NEW types
    ├── persona.types.ts              # [IMMUTABLE]
    └── adaptive.types.ts             # NEW: Adaptive types
```

### Configuration File

**File**: `/backend/config/adaptive.config.json`

```json
{
  "features": {
    "enable_audience_engine": true,
    "enable_domain_engine": true,
    "enable_engagement_scoring": true,
    "enable_retry_loop": true,
    "enable_memory_system": true
  },
  "thresholds": {
    "engagement_score_threshold": 70,
    "max_retry_attempts": 2
  },
  "bedrock": {
    "use_mocks": true,
    "model_id": "anthropic.claude-4-5",
    "region": "us-east-1"
  }
}
```

### User Profile Storage Schema

**File**: `/backend/memory/user_profiles.json`

```json
[
  {
    "userId": "user_123",
    "preferred_language": "hinglish",
    "preferred_tone": "friendly",
    "domain_usage": {
      "education": 5,
      "business": 12,
      "finance": 3,
      "health": 1,
      "creator": 8,
      "government": 0
    },
    "previous_summaries": [
      {
        "timestamp": "2024-01-15T10:30:00Z",
        "domain": "business",
        "platform": "linkedin",
        "engagement_score": 85,
        "audience_profile": {
          "language_style": "hinglish",
          "literacy_level": "high",
          "communication_tone": "formal",
          "content_format_preference": "bullet",
          "inferred_at": "2024-01-15T10:29:55Z",
          "confidence": 0.87
        }
      }
    ],
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
]
```

### API Request/Response Examples

**Legacy Generation Request** (POST /api/generate):
```json
{
  "userId": "user_123",
  "personaId": "founder",
  "platform": "linkedin",
  "content": "Share thoughts on quarterly goals",
  "emotionSliders": {
    "urgency": 7,
    "enthusiasm": 8,
    "formality": 7
  }
}
```

**Adaptive Generation Request** (POST /api/generate-adaptive):
```json
{
  "userId": "user_123",
  "personaId": "founder",
  "platform": "linkedin",
  "prompt": "Share thoughts on quarterly goals",
  "domain": "business",
  "userMessage": "Targeting Tier-2 entrepreneurs"
}
```

**Adaptive Generation Response**:
```json
{
  "success": true,
  "data": {
    "id": "adaptive_1705315800_abc123",
    "generatedContent": "Success in Bharat isn't about quarterly spreadsheets. It's about the daily hustle on the pitch. You don't win by playing safe; you win by hitting the Sixers others are too afraid to chase. Let's get to work.",
    "audienceProfile": {
      "language_style": "hinglish",
      "literacy_level": "high",
      "communication_tone": "formal",
      "content_format_preference": "short",
      "inferred_at": "2024-01-15T10:30:00Z",
      "confidence": 0.87
    },
    "domainStrategy": {
      "domain": "business",
      "explanation_style": "direct",
      "trust_level": "medium",
      "engagement_style": "persuasive",
      "analyzed_at": "2024-01-15T10:30:00Z"
    },
    "engagementScore": {
      "overall_score": 85,
      "breakdown": {
        "readability": 90,
        "tone_match": 85,
        "emoji_density": 80,
        "call_to_action": 90,
        "language_alignment": 80
      },
      "improvement_suggestions": [],
      "scored_at": "2024-01-15T10:30:01Z"
    },
    "retryCount": 0,
    "improvementApplied": false,
    "personaAlignmentScore": 0.92,
    "metadata": {
      "generatedAt": "2024-01-15T10:30:01Z",
      "processingTimeMs": 1250,
      "modelVersion": "mock-bedrock-v1.0",
      "audienceAnalysisMs": 150,
      "domainAnalysisMs": 100,
      "generationMs": 800,
      "scoringMs": 200
    }
  }
}
```

**Memory Retrieval Response** (GET /api/memory/user_123):
```json
{
  "success": true,
  "data": {
    "userId": "user_123",
    "preferred_language": "hinglish",
    "preferred_tone": "friendly",
    "domain_usage": {
      "education": 5,
      "business": 12,
      "finance": 3,
      "health": 1,
      "creator": 8,
      "government": 0
    },
    "previous_summaries": [...],
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all acceptance criteria, I identified the following redundancies and consolidations:

**Consolidations Made:**
1. Requirements 2.1-2.4 (Audience_Engine output validation) → Combined into Property 1
2. Requirements 3.2-3.4 (Domain_Engine output validation) → Combined into Property 2
3. Requirements 5.2-5.6 (Engagement scoring factors) → Combined into Property 4
4. Requirements 7.2-7.5 (Memory profile fields) → Combined into Property 7

**Redundancies Eliminated:**
- Requirement 2.5 is subsumed by Property 1 (output structure validation)
- Requirement 3.5 is subsumed by Property 2 (output structure validation)
- Requirement 4.4 is covered by Property 3 (context merging)

This reflection ensures each property provides unique validation value without logical overlap.

### Property 1: Audience Engine Output Validity

*For any* user input (prompt and optional message), the Audience_Engine SHALL return a structured JSON object where:
- `language_style` is one of: 'english', 'hinglish', or 'regional'
- `literacy_level` is one of: 'low', 'medium', or 'high'
- `communication_tone` is one of: 'formal', 'friendly', 'motivational', or 'authoritative'
- `content_format_preference` is one of: 'short', 'story', 'bullet', or 'conversational'
- All four fields are present and non-null

**Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5**

### Property 2: Domain Engine Output Validity

*For any* valid domain identifier (education, business, finance, health, creator, government), the Domain_Engine SHALL return a structured JSON object where:
- `domain` matches the input domain
- `explanation_style` is one of: 'analogy', 'direct', or 'narrative'
- `trust_level` is one of: 'low', 'medium', or 'high'
- `engagement_style` is one of: 'informative', 'persuasive', or 'storytelling'
- All four fields are present and non-null

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**

### Property 3: Context Enrichment Preservation

*For any* audience profile and domain strategy outputs, when the Adaptive_Wrapper merges them into enriched context, the resulting context SHALL contain all fields from both the audience profile and domain strategy without data loss.

**Validates: Requirements 4.4**

### Property 4: Engagement Score Range and Factors

*For any* generated content, audience profile, and platform combination, the Engagement_Scorer SHALL return a score where:
- `overall_score` is between 0 and 100 (inclusive)
- All breakdown scores (readability, tone_match, emoji_density, call_to_action, language_alignment) are between 0 and 100
- Varying any single factor (length, tone, emoji count, CTA presence, language markers) produces a different overall score

**Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5, 5.6**

### Property 5: Retry Loop Bounded Attempts

*For any* sequence of engagement scores below the threshold (70), the Retry_Loop SHALL attempt a maximum of 2 retries, regardless of how many consecutive low scores are returned.

**Validates: Requirements 6.2**

### Property 6: Retry Prompt Enrichment

*For any* retry attempt, the regeneration prompt SHALL include both the previous engagement score and specific improvement suggestions from the scorer's breakdown.

**Validates: Requirements 6.4**

### Property 7: Memory Profile Completeness

*For any* user, the stored profile in Memory_System SHALL contain all required fields:
- `preferred_language` (string)
- `preferred_tone` (string)
- `domain_usage` (object with all six domains)
- `previous_summaries` (array)
- `created_at` (timestamp)
- `updated_at` (timestamp)

**Validates: Requirements 7.2, 7.3, 7.4, 7.5**

### Property 8: Memory Update Round-Trip

*For any* successful generation, saving the generation summary to Memory_System and then retrieving the user profile SHALL return a profile where:
- The domain usage count for the generation's domain has increased by 1
- The previous_summaries array contains the new summary as the first element
- The updated_at timestamp is more recent than before the save

**Validates: Requirements 7.6**

### Property 9: Memory Failure Isolation

*For any* failed generation attempt, the user's profile in Memory_System SHALL remain unchanged (domain usage, summaries, and updated_at timestamp are identical to before the failed attempt).

**Validates: Requirements 7.7**

### Property 10: API Memory Round-Trip

*For any* user ID, saving a generation to memory via the Adaptive_Wrapper and then calling GET /memory/{userId} SHALL return a profile containing the saved generation in the previous_summaries array.

**Validates: Requirements 8.6**

### Property 11: Hinglish Pattern Recognition

*For any* input text containing Hinglish markers (yaar, arre, hai, kya, bas, jugaad, mehnat), the Audience_Engine SHALL identify the language_style as either 'hinglish' or 'regional' (never 'english').

**Validates: Requirements 13.1**

### Property 12: Regional Context Detection

*For any* input text containing regional markers (tier-2, local, community, regional slang), the Audience_Engine SHALL identify appropriate regional preferences in the audience profile.

**Validates: Requirements 13.2**

### Property 13: Bharat Metaphor Application

*For any* domain strategy where cultural context is appropriate, the Domain_Engine SHALL prefer Bharat-centric metaphors (cricket, jugaad, sixer) over Western equivalents (home run, touchdown) in its strategy guidance.

**Validates: Requirements 13.3**

### Property 14: Cultural Resonance Scoring

*For any* content containing Bharat-specific cultural markers, the Engagement_Scorer SHALL assign a higher language_alignment score than equivalent content without cultural markers, all else being equal.

**Validates: Requirements 13.4**

### Property 15: Graceful Degradation - Audience Engine

*For any* Audience_Engine failure (exception thrown), the Adaptive_Wrapper SHALL continue generation using default audience settings and SHALL NOT propagate the exception to the caller.

**Validates: Requirements 17.1**

### Property 16: Graceful Degradation - Domain Engine

*For any* Domain_Engine failure (exception thrown), the Adaptive_Wrapper SHALL continue generation using default domain strategy and SHALL NOT propagate the exception to the caller.

**Validates: Requirements 17.2**

### Property 17: Graceful Degradation - Engagement Scorer

*For any* Engagement_Scorer failure (exception thrown), the Adaptive_Wrapper SHALL skip the Retry_Loop, return the generated content, and SHALL NOT propagate the exception to the caller.

**Validates: Requirements 17.3**

### Property 18: Graceful Degradation - Memory System

*For any* Memory_System write failure (exception thrown), the Adaptive_Wrapper SHALL log the error, return the successful generation response, and SHALL NOT propagate the exception to the caller.

**Validates: Requirements 17.4**

### Property 19: Intelligence Layer Isolation

*For any* intelligence layer component failure (Audience_Engine, Domain_Engine, Engagement_Scorer, Memory_System), the Core_Engine SHALL execute successfully and return valid generated content.

**Validates: Requirements 17.5**


## Error Handling

### Error Hierarchy

```typescript
// Base adaptive error
class AdaptiveError extends Error {
  code: AdaptiveErrorCode;
  details?: any;
}

// Specific error codes
enum AdaptiveErrorCode {
  AUDIENCE_ENGINE_FAILED = 'AUDIENCE_ENGINE_FAILED',
  DOMAIN_ENGINE_FAILED = 'DOMAIN_ENGINE_FAILED',
  ENGAGEMENT_SCORER_FAILED = 'ENGAGEMENT_SCORER_FAILED',
  MEMORY_SYSTEM_FAILED = 'MEMORY_SYSTEM_FAILED',
  INVALID_DOMAIN = 'INVALID_DOMAIN',
  MAX_RETRIES_EXCEEDED = 'MAX_RETRIES_EXCEEDED',
}
```

### Graceful Degradation Strategy

The system implements a **fail-soft** approach where intelligence layer failures never break core functionality:

1. **Audience_Engine Failure**
   - Log warning with error details
   - Use default audience profile (hinglish, medium literacy, friendly tone)
   - Continue with generation

2. **Domain_Engine Failure**
   - Log warning with error details
   - Use default domain strategy (direct explanation, medium trust, informative style)
   - Continue with generation

3. **Engagement_Scorer Failure**
   - Log warning with error details
   - Skip retry loop entirely
   - Return generated content with default score (75)

4. **Memory_System Failure**
   - Log error with details
   - Continue with generation
   - Return successful response (memory is non-critical)

5. **Core_Engine Failure**
   - This is a critical failure
   - Return error response to client
   - Include error code and message

### Error Response Format

```typescript
{
  "success": false,
  "error": {
    "code": "AUDIENCE_ENGINE_FAILED",
    "message": "Audience analysis failed: Connection timeout",
    "details": {
      "prompt": "Share thoughts on...",
      "timestamp": "2024-01-15T10:30:00Z"
    }
  },
  "metadata": {
    "requestId": "req_1705315800",
    "timestamp": "2024-01-15T10:30:00Z",
    "processingTimeMs": 150
  }
}
```

### Retry Logic Error Handling

```typescript
// Retry loop handles errors internally
try {
  const retryResponse = await this.coreEngine.generateContent(retryRequest);
  if (retryResponse.success) {
    // Process retry result
  } else {
    // Keep best result so far, don't fail
    console.warn('Retry attempt failed, keeping previous best');
  }
} catch (error) {
  // Catch exceptions, keep best result
  console.warn('Retry attempt threw exception, keeping previous best');
}
```

### Logging Strategy

All components log at appropriate levels:

- **INFO**: Successful operations, timing metrics
- **WARN**: Graceful degradation events, fallback usage
- **ERROR**: Critical failures, Core_Engine errors

Example log output:
```
[INFO] Adaptive generation started: userId=user_123, domain=business
[INFO] Audience analysis completed: 150ms, confidence=0.87
[INFO] Domain analysis completed: 100ms
[WARN] Engagement scorer failed: Connection timeout, using default score
[INFO] Generation completed: 1250ms total, score=75 (default)
[WARN] Memory save failed: File write error, continuing with response
[INFO] Response sent: retryCount=0, improvementApplied=false
```


## Testing Strategy

### Dual Testing Approach

The system requires both **unit tests** and **property-based tests** for comprehensive coverage:

- **Unit Tests**: Validate specific examples, edge cases, integration points, and error conditions
- **Property Tests**: Verify universal properties across randomized inputs (minimum 100 iterations)

Together, these approaches ensure both concrete correctness (unit tests) and general correctness (property tests).

### Property-Based Testing Configuration

**Library Selection**: Use `fast-check` for TypeScript property-based testing

**Installation**:
```bash
npm install --save-dev fast-check @types/jest
```

**Test Structure**: Each correctness property from the design document MUST be implemented as a single property-based test with the following tag format:

```typescript
/**
 * Feature: adaptive-intelligence-upgrade, Property 1: Audience Engine Output Validity
 * 
 * For any user input, the Audience_Engine SHALL return a structured JSON object
 * with all required fields in valid enum ranges.
 */
test('Property 1: Audience Engine Output Validity', async () => {
  await fc.assert(
    fc.asyncProperty(
      fc.string({ minLength: 10, maxLength: 500 }), // prompt
      fc.option(fc.string({ minLength: 5, maxLength: 200 })), // optional userMessage
      async (prompt, userMessage) => {
        const engine = new AudienceEngine({ useMocks: true });
        const profile = await engine.analyzeAudience(prompt, userMessage);
        
        // Verify all fields present
        expect(profile.language_style).toBeDefined();
        expect(profile.literacy_level).toBeDefined();
        expect(profile.communication_tone).toBeDefined();
        expect(profile.content_format_preference).toBeDefined();
        
        // Verify valid enum values
        expect(['english', 'hinglish', 'regional']).toContain(profile.language_style);
        expect(['low', 'medium', 'high']).toContain(profile.literacy_level);
        expect(['formal', 'friendly', 'motivational', 'authoritative']).toContain(profile.communication_tone);
        expect(['short', 'story', 'bullet', 'conversational']).toContain(profile.content_format_preference);
      }
    ),
    { numRuns: 100 } // Minimum 100 iterations
  );
});
```

### Unit Test Examples

**Example 1: Legacy Endpoint Backward Compatibility**
```typescript
describe('API Adapter - Legacy Endpoint', () => {
  test('POST /generate routes directly to Core_Engine', async () => {
    const request = {
      userId: 'user_123',
      personaId: 'founder',
      platform: 'linkedin',
      content: 'Test prompt',
    };
    
    const response = await fetch('http://localhost:3000/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.generatedContent).toBeDefined();
    // Verify no intelligence layer metadata present
    expect(data.data.audienceProfile).toBeUndefined();
    expect(data.data.domainStrategy).toBeUndefined();
  });
});
```

**Example 2: Retry Loop Triggering**
```typescript
describe('Adaptive Wrapper - Retry Loop', () => {
  test('Triggers retry when score < 70', async () => {
    const mockScorer = {
      scoreContent: jest.fn()
        .mockResolvedValueOnce({ overall_score: 65, breakdown: {}, improvement_suggestions: ['Add CTA'] })
        .mockResolvedValueOnce({ overall_score: 82, breakdown: {}, improvement_suggestions: [] }),
    };
    
    const wrapper = new AdaptiveWrapper(config);
    wrapper['engagementScorer'] = mockScorer;
    
    const result = await wrapper.generateContentAdaptive({
      userId: 'user_123',
      personaId: 'founder',
      platform: 'linkedin',
      prompt: 'Test',
      domain: 'business',
    });
    
    expect(result.retryCount).toBe(1);
    expect(result.improvementApplied).toBe(true);
    expect(result.engagementScore.overall_score).toBe(82);
  });
});
```

**Example 3: Memory Round-Trip**
```typescript
describe('Memory System - Round Trip', () => {
  test('Saved generation appears in retrieved profile', async () => {
    const memory = new UserMemory();
    const userId = 'test_user_' + Date.now();
    
    const summary = {
      timestamp: new Date().toISOString(),
      domain: 'business' as SupportedDomain,
      platform: 'linkedin',
      engagement_score: 85,
      audience_profile: {
        language_style: 'hinglish' as const,
        literacy_level: 'high' as const,
        communication_tone: 'formal' as const,
        content_format_preference: 'bullet' as const,
        inferred_at: new Date().toISOString(),
        confidence: 0.87,
      },
    };
    
    await memory.saveGeneration(userId, summary);
    const profile = await memory.getUserProfile(userId);
    
    expect(profile.previous_summaries[0]).toEqual(summary);
    expect(profile.domain_usage.business).toBe(1);
  });
});
```

**Example 4: Graceful Degradation**
```typescript
describe('Adaptive Wrapper - Graceful Degradation', () => {
  test('Continues generation when Audience_Engine fails', async () => {
    const mockAudienceEngine = {
      analyzeAudience: jest.fn().mockRejectedValue(new Error('Connection timeout')),
    };
    
    const wrapper = new AdaptiveWrapper(config);
    wrapper['audienceEngine'] = mockAudienceEngine;
    
    const result = await wrapper.generateContentAdaptive({
      userId: 'user_123',
      personaId: 'founder',
      platform: 'linkedin',
      prompt: 'Test',
      domain: 'business',
    });
    
    // Should succeed with default audience profile
    expect(result.generatedContent).toBeDefined();
    expect(result.audienceProfile.language_style).toBe('hinglish'); // default
    expect(result.audienceProfile.confidence).toBe(0.5); // default confidence
  });
});
```

### Integration Test Strategy

**Test Scenario 1: Complete Adaptive Flow**
```typescript
describe('Integration - Complete Adaptive Flow', () => {
  test('Full adaptive generation with all intelligence layers', async () => {
    const request = {
      userId: 'integration_test_user',
      personaId: 'founder',
      platform: 'linkedin',
      prompt: 'Share thoughts on quarterly goals for Tier-2 entrepreneurs',
      domain: 'business',
      userMessage: 'Targeting Indore and Pune audiences',
    };
    
    const response = await fetch('http://localhost:3000/api/generate-adaptive', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    
    const data = await response.json();
    
    // Verify complete response structure
    expect(data.success).toBe(true);
    expect(data.data.generatedContent).toBeDefined();
    expect(data.data.audienceProfile).toBeDefined();
    expect(data.data.domainStrategy).toBeDefined();
    expect(data.data.engagementScore).toBeDefined();
    expect(data.data.metadata.audienceAnalysisMs).toBeGreaterThan(0);
    expect(data.data.metadata.domainAnalysisMs).toBeGreaterThan(0);
    expect(data.data.metadata.generationMs).toBeGreaterThan(0);
    expect(data.data.metadata.scoringMs).toBeGreaterThan(0);
    
    // Verify memory was updated
    const memoryResponse = await fetch(`http://localhost:3000/api/memory/${request.userId}`);
    const memoryData = await memoryResponse.json();
    
    expect(memoryData.success).toBe(true);
    expect(memoryData.data.domain_usage.business).toBeGreaterThan(0);
  });
});
```

### Test Coverage Requirements

- **Unit Test Coverage**: Minimum 80% line coverage for all new code
- **Property Test Coverage**: All 19 correctness properties must have corresponding property tests
- **Integration Test Coverage**: All API endpoints must have integration tests
- **Edge Case Coverage**: All error conditions and graceful degradation paths must be tested

### Mock Strategy for Development

All intelligence engines use mocks by default (controlled by `adaptive.config.json`):

```typescript
// Development configuration
{
  "bedrock": {
    "use_mocks": true  // Preserves AWS credits
  }
}

// Production configuration
{
  "bedrock": {
    "use_mocks": false  // Uses real Bedrock
  }
}
```

Mock implementations provide:
- Deterministic behavior for testing
- Fast execution (no network calls)
- Zero AWS costs during development
- Realistic response structures


## Frontend Architecture (Next.js)

### Overview

The Frontend_Next is a standalone Next.js application designed for hackathon demonstration. It showcases all adaptive intelligence features through a clean, three-panel interface optimized for judge evaluation.

### Directory Structure

```
frontend-next/
├── app/
│   ├── layout.tsx                    # Root layout with Tailwind
│   ├── page.tsx                      # Main demo page
│   └── globals.css                   # Global styles
├── components/
│   ├── AudienceInsightPanel.tsx      # Panel 1: Audience analysis display
│   ├── GeneratedContentPanel.tsx     # Panel 2: Content output display
│   ├── EngagementScorePanel.tsx      # Panel 3: Quality metrics display
│   ├── InputForm.tsx                 # User input form
│   └── LoadingSpinner.tsx            # Loading state component
├── lib/
│   ├── api.ts                        # API client functions
│   └── types.ts                      # Frontend type definitions
├── public/
│   └── assets/                       # SVG icons (low-bandwidth)
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── next.config.js
```

### Component Architecture

**Main Page** (`app/page.tsx`):
```typescript
'use client';

import { useState } from 'react';
import { InputForm } from '@/components/InputForm';
import { AudienceInsightPanel } from '@/components/AudienceInsightPanel';
import { GeneratedContentPanel } from '@/components/GeneratedContentPanel';
import { EngagementScorePanel } from '@/components/EngagementScorePanel';
import { generateAdaptive } from '@/lib/api';
import type { AdaptiveGenerationResponse } from '@/lib/types';

export default function DemoPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AdaptiveGenerationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (formData: {
    prompt: string;
    domain: string;
    platform: string;
    userMessage?: string;
  }) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await generateAdaptive({
        userId: 'demo_user',
        personaId: 'founder',
        ...formData,
      });
      
      setResult(response);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            PersonaVerse AI - Adaptive Intelligence
          </h1>
          <p className="text-lg text-gray-600">
            Identity-Consistent, Culturally Authentic AI for Bharat
          </p>
        </header>

        <InputForm onSubmit={handleGenerate} loading={loading} />

        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {result && (
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <AudienceInsightPanel profile={result.audienceProfile} />
            <GeneratedContentPanel 
              content={result.generatedContent}
              personaScore={result.personaAlignmentScore}
              retryInfo={{
                count: result.retryCount,
                improved: result.improvementApplied,
              }}
            />
            <EngagementScorePanel score={result.engagementScore} />
          </div>
        )}
      </div>
    </div>
  );
}
```

**Audience Insight Panel** (`components/AudienceInsightPanel.tsx`):
```typescript
import type { AudienceProfile } from '@/lib/types';

interface Props {
  profile: AudienceProfile;
}

export function AudienceInsightPanel({ profile }: Props) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-orange-500">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
        <span className="mr-2">👥</span>
        Audience Insights
      </h2>
      
      <div className="space-y-4">
        <InsightItem
          label="Language Style"
          value={profile.language_style}
          icon="🗣️"
          color="orange"
        />
        <InsightItem
          label="Literacy Level"
          value={profile.literacy_level}
          icon="📚"
          color="blue"
        />
        <InsightItem
          label="Communication Tone"
          value={profile.communication_tone}
          icon="🎭"
          color="green"
        />
        <InsightItem
          label="Format Preference"
          value={profile.content_format_preference}
          icon="📝"
          color="purple"
        />
        
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Confidence</span>
            <span className="font-semibold text-gray-900">
              {(profile.confidence * 100).toFixed(0)}%
            </span>
          </div>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-orange-500 h-2 rounded-full transition-all"
              style={{ width: `${profile.confidence * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function InsightItem({ label, value, icon, color }: {
  label: string;
  value: string;
  icon: string;
  color: string;
}) {
  const colorClasses = {
    orange: 'bg-orange-100 text-orange-800',
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
    purple: 'bg-purple-100 text-purple-800',
  };

  return (
    <div>
      <div className="text-sm text-gray-600 mb-1 flex items-center">
        <span className="mr-1">{icon}</span>
        {label}
      </div>
      <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${colorClasses[color]}`}>
        {value}
      </div>
    </div>
  );
}
```

**Generated Content Panel** (`components/GeneratedContentPanel.tsx`):
```typescript
interface Props {
  content: string;
  personaScore: number;
  retryInfo: {
    count: number;
    improved: boolean;
  };
}

export function GeneratedContentPanel({ content, personaScore, retryInfo }: Props) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-blue-500">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
        <span className="mr-2">✨</span>
        Generated Content
      </h2>
      
      <div className="prose prose-sm max-w-none mb-6">
        <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
          {content}
        </p>
      </div>
      
      <div className="space-y-3 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Persona Alignment</span>
          <span className="font-semibold text-blue-600">
            {(personaScore * 100).toFixed(0)}%
          </span>
        </div>
        
        {retryInfo.improved && (
          <div className="flex items-center text-sm text-green-600 bg-green-50 px-3 py-2 rounded">
            <span className="mr-2">🔄</span>
            Improved after {retryInfo.count} {retryInfo.count === 1 ? 'retry' : 'retries'}
          </div>
        )}
        
        <div className="flex items-center text-xs text-gray-500">
          <span className="mr-2">🏏</span>
          Bharat-first cultural transcreation applied
        </div>
      </div>
    </div>
  );
}
```

**Engagement Score Panel** (`components/EngagementScorePanel.tsx`):
```typescript
import type { EngagementScore } from '@/lib/types';

interface Props {
  score: EngagementScore;
}

export function EngagementScorePanel({ score }: Props) {
  const getScoreColor = (value: number) => {
    if (value >= 80) return 'text-green-600';
    if (value >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (value: number) => {
    if (value >= 80) return 'bg-green-500';
    if (value >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-green-500">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
        <span className="mr-2">📊</span>
        Engagement Score
      </h2>
      
      <div className="text-center mb-6">
        <div className={`text-5xl font-bold ${getScoreColor(score.overall_score)}`}>
          {score.overall_score}
        </div>
        <div className="text-sm text-gray-600 mt-1">Overall Quality</div>
      </div>
      
      <div className="space-y-3">
        <ScoreBar
          label="Readability"
          value={score.breakdown.readability}
          color={getScoreBgColor(score.breakdown.readability)}
        />
        <ScoreBar
          label="Tone Match"
          value={score.breakdown.tone_match}
          color={getScoreBgColor(score.breakdown.tone_match)}
        />
        <ScoreBar
          label="Emoji Density"
          value={score.breakdown.emoji_density}
          color={getScoreBgColor(score.breakdown.emoji_density)}
        />
        <ScoreBar
          label="Call-to-Action"
          value={score.breakdown.call_to_action}
          color={getScoreBgColor(score.breakdown.call_to_action)}
        />
        <ScoreBar
          label="Language Alignment"
          value={score.breakdown.language_alignment}
          color={getScoreBgColor(score.breakdown.language_alignment)}
        />
      </div>
      
      {score.improvement_suggestions.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">
            Improvement Suggestions
          </h3>
          <ul className="text-xs text-gray-600 space-y-1">
            {score.improvement_suggestions.map((suggestion, i) => (
              <li key={i} className="flex items-start">
                <span className="mr-2">•</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function ScoreBar({ label, value, color }: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div>
      <div className="flex justify-between text-xs text-gray-600 mb-1">
        <span>{label}</span>
        <span className="font-semibold">{value}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`${color} h-2 rounded-full transition-all`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
```

**API Client** (`lib/api.ts`):
```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export async function generateAdaptive(request: {
  userId: string;
  personaId: string;
  platform: string;
  prompt: string;
  domain: string;
  userMessage?: string;
}) {
  const response = await fetch(`${API_BASE_URL}/generate-adaptive`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Generation failed');
  }

  const data = await response.json();
  return data.data;
}

export async function getUserMemory(userId: string) {
  const response = await fetch(`${API_BASE_URL}/memory/${userId}`);

  if (!response.ok) {
    throw new Error('Failed to fetch user memory');
  }

  const data = await response.json();
  return data.data;
}
```

### Design Principles

1. **WhatsApp-Style Simplicity**: Clean, familiar UI patterns for Bharat users
2. **Low-Bandwidth Optimization**: SVG icons, minimal images, efficient rendering
3. **Mobile-First**: Responsive design that works on all devices
4. **Real-Time Feedback**: Loading states and progress indicators
5. **Cultural Authenticity**: Bharat-centric color palette (saffron, blue, green)
6. **Demo-Ready**: Optimized for live hackathon presentation

### Tailwind Configuration

```javascript
// tailwind.config.js
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'bharat-orange': '#FF6B35',
        'bharat-blue': '#004E89',
        'bharat-green': '#1A936F',
      },
    },
  },
  plugins: [],
};
```


## Implementation Roadmap

### Phase 1: Foundation (Days 1-2)

**Goal**: Set up project structure and type definitions

1. Create new directories:
   - `/backend/engines`
   - `/backend/memory`
   - `/backend/api`
   - `/backend/config`
   - `/frontend-next`

2. Create type definitions:
   - `/backend/shared/adaptive.types.ts`
   - Copy existing types for reference

3. Create configuration:
   - `/backend/config/adaptive.config.json`
   - Set `use_mocks: true` for development

4. Create README files:
   - `/backend/engines/README.md`
   - `/backend/memory/README.md`
   - `/backend/api/README.md`

**Validation**: All directories exist, types compile, config loads

### Phase 2: Intelligence Engines (Days 3-4)

**Goal**: Implement the three intelligence engines with mocks

1. Implement Audience Engine:
   - `/backend/engines/audienceEngine.ts`
   - Mock implementation with heuristic analysis
   - Unit tests for output validation

2. Implement Domain Engine:
   - `/backend/engines/domainEngine.ts`
   - Predefined strategy mappings
   - Unit tests for all six domains

3. Implement Engagement Scorer:
   - `/backend/engines/engagementEngine.ts`
   - Heuristic scoring algorithms
   - Unit tests for scoring factors

**Validation**: All engines return valid structured outputs, tests pass

### Phase 3: Orchestration Layer (Days 5-6)

**Goal**: Implement Adaptive Wrapper with retry logic

1. Implement Adaptive Wrapper:
   - `/backend/engines/adaptiveWrapper.ts`
   - Sequential engine calls
   - Context merging logic
   - Retry loop implementation
   - Graceful degradation

2. Implement Memory System:
   - `/backend/memory/userMemory.ts`
   - File-based storage
   - Profile CRUD operations
   - Unit tests for round-trip

**Validation**: Complete adaptive flow works end-to-end, graceful degradation tested

### Phase 4: API Layer (Day 7)

**Goal**: Expose both legacy and adaptive endpoints

1. Implement API Adapter:
   - `/backend/api/routesAdapter.ts`
   - Legacy endpoint (routes to Core_Engine)
   - Adaptive endpoint (routes to Adaptive_Wrapper)
   - Memory endpoint

2. Integration testing:
   - Test legacy endpoint unchanged
   - Test adaptive endpoint complete flow
   - Test memory persistence

**Validation**: All endpoints functional, integration tests pass

### Phase 5: Frontend (Days 8-9)

**Goal**: Build Next.js demo application

1. Initialize Next.js project:
   - `/frontend-next` with TypeScript
   - Tailwind CSS configuration
   - API client setup

2. Implement components:
   - Input form
   - Three display panels
   - Loading states

3. Styling and polish:
   - Bharat color palette
   - Mobile responsiveness
   - SVG icons

**Validation**: Frontend displays all adaptive features, works on mobile

### Phase 6: Testing & Documentation (Day 10)

**Goal**: Comprehensive testing and documentation

1. Property-based tests:
   - Implement all 19 correctness properties
   - Configure fast-check with 100 iterations
   - Verify all properties pass

2. Documentation:
   - Update root README.md
   - Add API documentation
   - Create demo script

3. Demo preparation:
   - Sample prompts for all domains
   - Test data for memory system
   - Performance optimization

**Validation**: All tests pass, documentation complete, demo ready

### Phase 7: AWS Integration (Optional - Post-Hackathon)

**Goal**: Replace mocks with real Bedrock integration

1. Implement Bedrock client:
   - Configure Cross-Region Inference Profiles
   - Implement structured JSON prompts
   - Add Bedrock Guardrails

2. Update configuration:
   - Set `use_mocks: false`
   - Configure model IDs and regions

3. Production testing:
   - Verify real Bedrock responses
   - Monitor costs and performance
   - Tune prompts for quality

**Validation**: Real Bedrock integration works, costs acceptable

## Deployment Architecture

### Development Environment

```
┌─────────────────────────────────────────────────────────────┐
│                    Developer Machine                         │
│                                                              │
│  ┌──────────────┐         ┌──────────────────────────────┐ │
│  │ Frontend     │         │ Backend (Express)            │ │
│  │ Next.js      │────────▶│ - API Adapter                │ │
│  │ Port: 3001   │         │ - Adaptive Wrapper           │ │
│  └──────────────┘         │ - Intelligence Engines       │ │
│                           │ - Memory System (File)       │ │
│                           │ Port: 3000                   │ │
│                           └──────────────────────────────┘ │
│                                                              │
│  Config: use_mocks = true (No AWS costs)                   │
└─────────────────────────────────────────────────────────────┘
```

### Production Architecture (AWS Lambda)

```
┌─────────────────────────────────────────────────────────────────┐
│                         AWS Cloud                                │
│                                                                  │
│  ┌──────────────┐         ┌────────────────────────────────┐   │
│  │ CloudFront   │         │ API Gateway                     │   │
│  │ (Frontend)   │         │ /api/generate                   │   │
│  └──────────────┘         │ /api/generate-adaptive          │   │
│                           │ /api/memory/{userId}            │   │
│                           └────────────┬───────────────────┘   │
│                                        │                        │
│                           ┌────────────▼───────────────────┐   │
│                           │ Lambda Functions (Stateless)   │   │
│                           │ - API Adapter                  │   │
│                           │ - Adaptive Wrapper             │   │
│                           │ - Intelligence Engines         │   │
│                           └────────────┬───────────────────┘   │
│                                        │                        │
│              ┌─────────────────────────┼─────────────────┐     │
│              │                         │                 │     │
│              ▼                         ▼                 ▼     │
│  ┌──────────────────┐    ┌──────────────────┐  ┌─────────────┐│
│  │ Amazon Bedrock   │    │ S3 (Memory)      │  │ DynamoDB    ││
│  │ Claude 4.5       │    │ user_profiles    │  │ (Optional)  ││
│  │ Guardrails       │    │                  │  │             ││
│  └──────────────────┘    └──────────────────┘  └─────────────┘│
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### CDK Stack Updates

**File**: `/backend/infrastructure/adaptive-stack.ts`

```typescript
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';

export class AdaptiveStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // S3 bucket for user profiles (replaces file-based storage)
    const memoryBucket = new s3.Bucket(this, 'UserMemoryBucket', {
      bucketName: 'personaverse-user-profiles',
      encryption: s3.BucketEncryption.S3_MANAGED,
      versioned: true,
    });

    // Lambda function for adaptive generation
    const adaptiveFunction = new lambda.Function(this, 'AdaptiveFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('dist/adaptive'),
      timeout: cdk.Duration.seconds(30),
      memorySize: 1024,
      environment: {
        MEMORY_BUCKET: memoryBucket.bucketName,
        USE_MOCKS: 'false',
        BEDROCK_MODEL_ID: 'anthropic.claude-4-5',
        BEDROCK_REGION: 'us-east-1',
      },
    });

    // Grant Bedrock permissions
    adaptiveFunction.addToRolePolicy(new iam.PolicyStatement({
      actions: [
        'bedrock:InvokeModel',
        'bedrock:InvokeModelWithResponseStream',
      ],
      resources: ['*'],
    }));

    // Grant S3 permissions
    memoryBucket.grantReadWrite(adaptiveFunction);

    // API Gateway
    const api = new apigateway.RestApi(this, 'AdaptiveApi', {
      restApiName: 'PersonaVerse Adaptive API',
      deployOptions: {
        stageName: 'prod',
      },
    });

    const integration = new apigateway.LambdaIntegration(adaptiveFunction);

    // Endpoints
    const apiResource = api.root.addResource('api');
    apiResource.addResource('generate').addMethod('POST', integration);
    apiResource.addResource('generate-adaptive').addMethod('POST', integration);
    apiResource.addResource('memory').addResource('{userId}').addMethod('GET', integration);

    // Outputs
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url,
      description: 'API Gateway URL',
    });
  }
}
```

## Summary

This design document provides a complete technical specification for implementing the Adaptive Intelligence Upgrade to PersonaVerse AI. The design follows these key principles:

1. **Non-Destructive**: Zero modifications to existing Core_Engine
2. **Wrapper Pattern**: Intelligence layers wrap core functionality
3. **Graceful Degradation**: Failures never break core features
4. **Mock-First**: Development preserves AWS credits
5. **Type-Safe**: Full TypeScript implementation
6. **Testable**: Comprehensive unit and property-based tests
7. **Demo-Ready**: Next.js frontend optimized for hackathon
8. **Bharat-First**: Cultural authenticity as system primitive

The implementation roadmap provides a clear 10-day path from foundation to demo-ready system, with optional AWS integration for production deployment.

