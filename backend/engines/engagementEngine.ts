import { EngagementScore, AudienceProfile, AdaptiveError, AdaptiveErrorCode } from '../shared/adaptive.types';

/**
 * Engagement Scorer - Evaluates content quality for Bharat audiences
 * 
 * Scores content across multiple dimensions including cultural resonance,
 * Hinglish fluency, and platform-appropriate engagement patterns.
 */
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
        `Engagement scoring failed: ${error instanceof Error ? error.message : String(error)}`,
        { content: content.substring(0, 100), error }
      );
    }
  }

  /**
   * Mock scoring implementation with heuristic analysis
   * Evaluates cultural resonance and Bharat-specific patterns
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
    const sentenceCount = Math.max(1, content.split(/[.!?]+/).filter(s => s.trim()).length);
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
      formal: ['therefore', 'furthermore', 'consequently', 'professional', 'stakeholder'],
      friendly: ['hey', 'yaar', 'arre', 'let\'s', 'we', 'bhai', 'dost'],
      motivational: ['achieve', 'success', 'grow', 'win', 'hustle', 'dream', 'goal'],
      authoritative: ['must', 'should', 'will', 'ensure', 'require', 'mandate'],
    };

    const markers = toneMarkers[audience.communication_tone] || [];
    const matchCount = markers.filter(marker => lowerContent.includes(marker)).length;

    return Math.min(100, 60 + (matchCount * 10));
  }

  private scoreEmojiDensity(content: string, platform: string): number {
    const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]/gu;
    const emojiCount = (content.match(emojiRegex) || []).length;
    const wordCount = Math.max(1, content.split(/\s+/).length);
    const emojiRatio = emojiCount / wordCount;

    // Platform-specific expectations for Bharat audiences
    const idealRatio = {
      whatsapp: 0.05, // 1 emoji per 20 words
      linkedin: 0.01, // 1 emoji per 100 words
      twitter: 0.03,
      instagram: 0.07,
    }[platform.toLowerCase()] || 0.02;

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
      /batao/i, // Hinglish: "tell me"
      /kya\s+kehte\s+ho/i, // Hinglish: "what do you say"
    ];

    const hasCTA = ctaPatterns.some(pattern => pattern.test(content));
    return hasCTA ? 90 : 50;
  }

  /**
   * Score language alignment with Bharat cultural markers
   * Evaluates Hinglish fluency and cultural resonance
   */
  private scoreLanguageAlignment(content: string, audience: AudienceProfile): number {
    const lowerContent = content.toLowerCase();
    
    // Bharat-specific cultural markers
    const hinglishMarkers = ['yaar', 'arre', 'hai', 'na', 'kya', 'bas', 'jugaad', 'mehnat', 'bhai', 'dost'];
    const culturalMetaphors = ['sixer', 'cricket', 'chai', 'jugaad', 'desi'];
    
    const hinglishCount = hinglishMarkers.filter(marker => lowerContent.includes(marker)).length;
    const culturalCount = culturalMetaphors.filter(marker => lowerContent.includes(marker)).length;

    // Expected Hinglish markers based on language style
    const expectedHinglish = {
      english: 0,
      hinglish: 2,
      regional: 4,
    }[audience.language_style];

    const hinglishDiff = Math.abs(hinglishCount - expectedHinglish);
    const baseScore = Math.max(50, 100 - (hinglishDiff * 15));
    
    // Bonus for cultural metaphors (transcreation, not translation)
    const culturalBonus = Math.min(10, culturalCount * 5);

    return Math.min(100, baseScore + culturalBonus);
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
      suggestions.push('Use Bharat-centric metaphors (cricket, jugaad) instead of Western ones');
    }

    return suggestions;
  }

  private async callBedrock(systemPrompt: string, userPrompt: string): Promise<string> {
    // Bedrock API call implementation
    // Uses Claude 4.5 via Cross-Region Inference Profiles
    throw new Error('Bedrock integration not yet implemented');
  }
}
