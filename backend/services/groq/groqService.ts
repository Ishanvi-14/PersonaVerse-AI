/**
 * Groq LLM Service - Free Tier Alternative to Bedrock
 * 
 * Uses Groq's fast inference API with Llama models
 * Maintains same interface as Bedrock for easy switching
 */

import Groq from 'groq-sdk';
import { BedrockGenerationRequest, BedrockGenerationResponse } from '../aws/bedrockService';

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || ''
});

// Available Groq models (all free tier)
const GROQ_MODELS = {
  'llama-3.3-70b': 'llama-3.3-70b-versatile', // Best quality
  'llama-3.1-70b': 'llama-3.1-70b-versatile', // Fast and good
  'llama-3.1-8b': 'llama-3.1-8b-instant',     // Fastest
  'mixtral-8x7b': 'mixtral-8x7b-32768'        // Good for long context
};

const DEFAULT_MODEL = GROQ_MODELS['llama-3.3-70b'];

/**
 * Build system prompt with persona context (same as Bedrock)
 */
function buildSystemPrompt(request: BedrockGenerationRequest): string {
  const profile = request.userProfile;
  
  return `You are PersonaVerse AI, a Digital Identity System for Bharat (India).

## Core Mission
Generate content that sounds like a REAL PERSON, not generic AI. Maintain identity consistency across all outputs.

## Immutable Laws
1. Identity is Persistent - Reflect accumulated history, not just this prompt
2. Culture is Structural - Bharat authenticity is core logic, not a translation layer
3. Never produce generic "AI Slop" - Every output must be recognizably human
4. Transcreation > Translation - Adapt metaphors culturally (Home run → Sixer)

## Current Persona: ${request.personaId}
Platform: ${request.platform}
Domain: ${request.domain || 'general'}
Cultural Context: ${request.culturalContext || 'urban'}
Target Language: ${request.targetLanguage || 'en'}

${profile ? `
## User's Digital Soul (Historical Context)
- Total Generations: ${profile.statistics.totalGenerations}
- Hinglish Ratio: ${(profile.personaEvolution.linguisticDNA.hinglishRatio * 100).toFixed(0)}%
- Sentence Complexity: ${profile.personaEvolution.linguisticDNA.sentenceComplexity.toFixed(2)}
- Risk Tolerance: ${profile.personaEvolution.valueConstraints.riskTolerance}
- Optimism Score: ${profile.personaEvolution.emotionalBaseline.optimismScore.toFixed(2)}
- Authority Score: ${profile.personaEvolution.emotionalBaseline.authorityScore.toFixed(2)}
- Relatability Score: ${profile.personaEvolution.emotionalBaseline.relatabilityScore.toFixed(2)}
` : ''}

## Platform-Specific Guidelines
${getPlatformGuidelines(request.platform)}

## Cultural Transcreation Rules
1. Replace Western metaphors with Indian equivalents:
   - "home run" → "sixer"
   - "touchdown" → "century"
   - "slam dunk" → "perfect shot"
2. Use Hinglish naturally (${request.targetLanguage === 'hi' ? '70/30' : '30/70'} ratio)
3. Reference Indian cultural context (festivals, values, regional nuances)
4. Adapt formality to cultural context (Tier-2 = more relatable, Urban = more polished)

## Output Format
Respond with JSON:
{
  "content": "The generated content",
  "reasoning": "Why this matches the persona",
  "personaAlignment": {
    "linguisticMatch": 0.0-1.0,
    "valueAlignment": 0.0-1.0,
    "emotionalConsistency": 0.0-1.0,
    "overallScore": 0.0-1.0
  },
  "culturalAdaptations": [
    {
      "type": "metaphor|idiom|reference",
      "original": "western phrase",
      "adapted": "bharat equivalent",
      "reason": "why this works better"
    }
  ]
}`;
}

/**
 * Get platform-specific guidelines
 */
function getPlatformGuidelines(platform: string): string {
  const guidelines: Record<string, string> = {
    'linkedin': `
- Professional but personable tone
- Use industry-relevant examples
- Include actionable insights
- Length: 150-300 words
- Emoji usage: Minimal (1-2 max)`,
    
    'twitter': `
- Punchy, attention-grabbing
- Thread-friendly structure
- Hashtag-ready phrases
- Length: 240-280 characters per tweet
- Emoji usage: Moderate (2-3)`,
    
    'instagram': `
- Visual storytelling language
- Conversational and relatable
- Story-friendly format
- Length: 100-150 words
- Emoji usage: Liberal (4-6)`,
    
    'whatsapp': `
- Ultra-casual, friend-to-friend
- Short paragraphs, easy to read
- Voice message friendly
- Length: 50-100 words
- Emoji usage: Natural (3-5)`,
    
    'email': `
- Clear subject line implied
- Structured with greeting/body/closing
- Professional yet warm
- Length: 200-400 words
- Emoji usage: Rare (0-1)`
  };

  return guidelines[platform.toLowerCase()] || guidelines['linkedin'];
}

/**
 * Generate content using Groq (free tier)
 */
export async function generateWithGroq(
  request: BedrockGenerationRequest
): Promise<BedrockGenerationResponse> {
  const startTime = Date.now();

  try {
    console.log(`[Groq] Generating content for persona ${request.personaId} on ${request.platform}`);

    if (!process.env.GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY not set in environment variables');
    }

    const systemPrompt = buildSystemPrompt(request);
    
    // Call Groq API
    const completion = await groq.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: request.prompt
        }
      ],
      temperature: request.temperature || 0.7,
      max_tokens: request.maxTokens || 8192,
      response_format: { type: 'json_object' }
    });

    const responseText = completion.choices[0]?.message?.content || '{}';
    let parsedResponse: any;

    try {
      parsedResponse = JSON.parse(responseText);
    } catch {
      // If not JSON, wrap in default structure
      parsedResponse = {
        content: responseText,
        reasoning: 'Generated with persona awareness',
        personaAlignment: {
          linguisticMatch: 0.8,
          valueAlignment: 0.8,
          emotionalConsistency: 0.8,
          overallScore: 0.8
        },
        culturalAdaptations: []
      };
    }

    const latencyMs = Date.now() - startTime;
    const tokensUsed = completion.usage?.total_tokens || 0;

    console.log(`[Groq] Generation complete in ${latencyMs}ms`);
    console.log(`[Groq] Tokens used: ${tokensUsed}`);
    console.log(`[Groq] Persona alignment: ${(parsedResponse.personaAlignment.overallScore * 100).toFixed(1)}%`);

    return {
      content: parsedResponse.content,
      reasoning: parsedResponse.reasoning,
      personaAlignment: parsedResponse.personaAlignment,
      culturalAdaptations: parsedResponse.culturalAdaptations || [],
      metadata: {
        modelId: DEFAULT_MODEL,
        tokensUsed,
        latencyMs
      }
    };

  } catch (error: any) {
    console.error('[Groq] Generation failed:', error);
    
    // Provide helpful error message
    if (error.message?.includes('GROQ_API_KEY')) {
      throw new Error('Groq API key not configured. Get free key at: https://console.groq.com/keys');
    }
    
    throw error;
  }
}

/**
 * Generate with quality check and retry
 */
export async function generateWithGroqQualityCheck(
  request: BedrockGenerationRequest,
  minQualityScore: number = 0.7,
  maxRetries: number = 2
): Promise<BedrockGenerationResponse> {
  let attempt = 0;
  let bestResponse: BedrockGenerationResponse | null = null;
  let bestScore = 0;

  while (attempt < maxRetries) {
    const response = await generateWithGroq(request);
    const score = response.personaAlignment.overallScore;

    if (score > bestScore) {
      bestResponse = response;
      bestScore = score;
    }

    if (score >= minQualityScore) {
      console.log(`[Groq] Quality check passed on attempt ${attempt + 1}`);
      return response;
    }

    attempt++;
    console.log(`[Groq] Quality check failed (${(score * 100).toFixed(1)}%), retrying... (${attempt}/${maxRetries})`);
  }

  console.log(`[Groq] Max retries reached, returning best response (${(bestScore * 100).toFixed(1)}%)`);
  return bestResponse!;
}
