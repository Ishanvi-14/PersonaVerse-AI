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
  AudienceProfile,
  DomainStrategy,
  EngagementScore,
} from '../shared/adaptive.types';
import { GenerationRequest, SupportedPlatform } from '../shared/persona.types';

/**
 * Adaptive Wrapper - Orchestrates intelligence layers around Core_Engine
 * 
 * This wrapper implements the non-destructive upgrade pattern by coordinating
 * all adaptive intelligence engines around the immutable PersonaService.
 * 
 * Flow: Audience Analysis → Domain Strategy → Core Generation → Engagement Scoring → Retry Loop → Memory
 */
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
      // Step 1: Analyze Audience
      let audienceProfile: AudienceProfile;
      const audienceStart = Date.now();
      try {
        if (this.config.features.enable_audience_engine) {
          audienceProfile = await this.audienceEngine.analyzeAudience(
            request.prompt,
            request.userMessage
          );
          console.log('[Adaptive] Audience analysis complete:', audienceProfile.language_style);
        } else {
          audienceProfile = this.getDefaultAudienceProfile();
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.warn('[Adaptive] Audience engine failed, using defaults:', errorMessage);
        audienceProfile = this.getDefaultAudienceProfile();
      }
      timings.audienceAnalysisMs = Date.now() - audienceStart;

      // Step 2: Analyze Domain
      let domainStrategy: DomainStrategy;
      const domainStart = Date.now();
      try {
        if (this.config.features.enable_domain_engine) {
          domainStrategy = await this.domainEngine.analyzeDomain(request.domain);
          console.log('[Adaptive] Domain strategy complete:', domainStrategy.engagement_style);
        } else {
          domainStrategy = this.getDefaultDomainStrategy(request.domain);
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.warn('[Adaptive] Domain engine failed, using defaults:', errorMessage);
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
      let engagementScore: EngagementScore;
      const scoreStart = Date.now();
      try {
        if (this.config.features.enable_engagement_scoring) {
          engagementScore = await this.engagementScorer.scoreContent(
            generatedContent,
            audienceProfile,
            request.platform
          );
          console.log('[Adaptive] Engagement score:', engagementScore.overall_score);

          if (
            this.config.features.enable_retry_loop &&
            engagementScore.overall_score < this.config.thresholds.engagement_score_threshold &&
            retryCount < this.config.thresholds.max_retry_attempts
          ) {
            console.log('[Adaptive] Score below threshold, initiating retry loop');
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
            console.log('[Adaptive] Retry complete. New score:', engagementScore.overall_score);
          }
        } else {
          engagementScore = this.getDefaultEngagementScore();
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.warn('[Adaptive] Engagement scoring failed, skipping retry:', errorMessage);
        engagementScore = this.getDefaultEngagementScore();
      }
      timings.scoringMs = Date.now() - scoreStart;

      // Step 6: Save to memory
      if (this.config.features.enable_memory_system) {
        try {
          await this.userMemory.saveGeneration(request.userId, {
            timestamp: new Date().toISOString(),
            domain: request.domain,
            platform: request.platform,
            engagement_score: engagementScore.overall_score,
            audience_profile: audienceProfile,
          });
          console.log('[Adaptive] Memory updated for user:', request.userId);
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.warn('[Adaptive] Memory system save failed:', errorMessage);
        }
      }

      // Step 7: Return response
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

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new AdaptiveError(
        AdaptiveErrorCode.MAX_RETRIES_EXCEEDED,
        `Adaptive generation failed: ${errorMessage}`,
        { request, error }
      );
    }
  }

  private async retryWithImprovement(
    originalRequest: GenerationRequest,
    previousContent: string,
    previousScore: EngagementScore,
    audienceProfile: AudienceProfile,
    platform: string
  ): Promise<{ content: string; score: EngagementScore; retryCount: number }> {
    let bestContent = previousContent;
    let bestScore = previousScore;
    let retryCount = 0;

    while (
      retryCount < this.config.thresholds.max_retry_attempts &&
      bestScore.overall_score < this.config.thresholds.engagement_score_threshold
    ) {
      retryCount++;
      console.log(`[Adaptive] Retry attempt ${retryCount}/${this.config.thresholds.max_retry_attempts}`);

      const improvementPrompt = this.buildImprovementPrompt(
        originalRequest.content,
        previousScore
      );

      const retryRequest: GenerationRequest = {
        ...originalRequest,
        content: improvementPrompt,
      };

      try {
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
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.warn(`[Adaptive] Retry attempt ${retryCount} failed:`, errorMessage);
      }
    }

    return { content: bestContent, score: bestScore, retryCount };
  }

  private buildImprovementPrompt(originalPrompt: string, score: EngagementScore): string {
    const suggestions = score.improvement_suggestions.join('; ');
    return `${originalPrompt}

IMPROVEMENT NEEDED (Previous score: ${score.overall_score}/100):
${suggestions}

Please regenerate with these improvements while maintaining persona authenticity and Bharat cultural resonance.`;
  }

  private enrichRequest(
    request: AdaptiveGenerationRequest,
    audienceProfile: AudienceProfile,
    domainStrategy: DomainStrategy
  ): GenerationRequest {
    const enrichedContext: any = {
      audienceType: this.mapAudienceToType(audienceProfile),
      contentType: this.mapDomainToContentType(domainStrategy),
      previousMessages: [],
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
      platform: request.platform as SupportedPlatform,
      content: request.prompt,
      context: enrichedContext,
    };
  }

  private mapAudienceToType(profile: AudienceProfile): 'students' | 'professionals' | 'investors' | 'general' {
    if (profile.literacy_level === 'low') return 'general';
    if (profile.communication_tone === 'formal') return 'professionals';
    return 'general';
  }

  private mapDomainToContentType(strategy: DomainStrategy): 'announcement' | 'educational' | 'personal' | 'promotional' {
    if (strategy.engagement_style === 'informative') return 'educational';
    if (strategy.engagement_style === 'persuasive') return 'promotional';
    return 'personal';
  }

  private getDefaultAudienceProfile(): AudienceProfile {
    return {
      language_style: 'hinglish',
      literacy_level: 'medium',
      communication_tone: 'friendly',
      content_format_preference: 'conversational',
      inferred_at: new Date().toISOString(),
      confidence: 0.5,
    };
  }

  private getDefaultDomainStrategy(domain: string): DomainStrategy {
    return {
      domain: domain as any,
      explanation_style: 'direct',
      trust_level: 'medium',
      engagement_style: 'informative',
      analyzed_at: new Date().toISOString(),
    };
  }

  private getDefaultEngagementScore(): EngagementScore {
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