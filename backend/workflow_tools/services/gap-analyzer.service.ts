/**
 * Gap Analyzer Service
 * 
 * Identifies content patterns and opportunities from existing post collections.
 */

import { GeminiClient } from '../providers/gemini.client';
import { MockProvider } from '../providers/mock.provider';
import { GapAnalyzerRequest, GapAnalysisOutput, ToolsConfig } from '../types';

/**
 * Gap Analyzer Service
 * 
 * Analyzes content patterns to identify overused themes, missing topics,
 * fatigue risks, and new content opportunities.
 */
export class GapAnalyzerService {
  constructor(
    private geminiClient: GeminiClient,
    private mockProvider: MockProvider,
    private config: ToolsConfig
  ) {}

  /**
   * Analyze content gaps and patterns
   * 
   * @param request - Gap analyzer request with posts array
   * @returns GapAnalysisOutput with pattern analysis
   */
  async analyzeGaps(request: GapAnalyzerRequest): Promise<GapAnalysisOutput> {
    // Check if mock mode is enabled
    if (this.config.mock.enabled) {
      console.log('[MOCK MODE] Returning mock gap analysis response');
      return await this.mockProvider.getGapAnalysisResponse(request.posts);
    }

    // Real Gemini API call
    const prompt = this.buildGapAnalysisPrompt(request);
    return await this.geminiClient.generateStructured<GapAnalysisOutput>(
      prompt,
      this.config.gemini.timeouts.gapAnalyzer
    );
  }

  /**
   * Build Gemini prompt for pattern analysis
   * 
   * @param request - Gap analyzer request
   * @returns Formatted prompt for Gemini API
   */
  private buildGapAnalysisPrompt(request: GapAnalyzerRequest): string {
    const nicheContext = request.nicheContext 
      ? `\nNICHE CONTEXT: ${request.nicheContext}` 
      : '';

    // Format posts with indices
    const formattedPosts = request.posts
      .map((post, index) => `[Post ${index}]: ${post}`)
      .join('\n\n');

    return `
You are a content analyst for Bharat (Indian) creators. Analyze these posts to identify patterns and opportunities.

${nicheContext}

POSTS TO ANALYZE:
${formattedPosts}

ANALYSIS INSTRUCTIONS:
- Identify themes appearing in more than 30% of posts as "overused"
- Suggest 5-10 underexplored topics relevant to the niche
- Calculate diversity score (0-100) based on content variety
- Assess fatigue risk (low/medium/high) based on repetition patterns
- Provide 5-10 actionable new content angles

Respond with ONLY valid JSON matching this exact structure:
{
  "overused_themes": [
    {
      "theme": "Theme name",
      "frequency_percentage": 35,
      "example_posts": [0, 2, 5]
    }
  ],
  "missing_topics": ["Topic 1", "Topic 2", "Topic 3"],
  "fatigue_risk": {
    "level": "low|medium|high",
    "explanation": "Why this risk level based on actual patterns",
    "recommendation": "What to do about it"
  },
  "suggested_angles": ["Angle 1", "Angle 2", "Angle 3"],
  "diversity_score": 65
}

IMPORTANT REQUIREMENTS:
- overused_themes: identify themes appearing in >30% of posts
- missing_topics: must have 5-10 items
- fatigue_risk.level: must be exactly "low", "medium", or "high"
- suggested_angles: must have 5-10 items
- diversity_score: must be 0-100
- Base all conclusions on actual content patterns, not assumptions
- Use Indian cultural context in suggestions where relevant
`;
  }
}
