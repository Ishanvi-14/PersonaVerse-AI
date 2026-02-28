/**
 * Amazon Bedrock Service - Claude Sonnet 4.5 Integration
 * 
 * The "Brain" of PersonaVerse:
 * - Identity-consistent content generation
 * - Cultural transcreation
 * - Persona-aware reasoning
 * - Structured JSON output
 */

import { InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { bedrockClient, AWS_CONFIG } from './awsConfig';
import { UserProfile } from './historyService';
import { generateWithBedrockMock } from './bedrockMockService';
import { generateWithGroqQualityCheck } from '../groq/groqService';

export interface BedrockGenerationRequest {
  prompt: string;
  personaId: string;
  platform: string;
  domain?: string;
  userProfile?: UserProfile;
  targetLanguage?: string;
  culturalContext?: 'urban' | 'tier2' | 'rural';
  temperature?: number;
  maxTokens?: number;
}

export interface BedrockGenerationResponse {
  content: string;
  reasoning: string;
  personaAlignment: {
    linguisticMatch: number;
    valueAlignment: number;
    emotionalConsistency: number;
    overallScore: number;
  };
  culturalAdaptations: Array<{
    type: 'metaphor' | 'idiom' | 'reference';
    original: string;
    adapted: string;
    reason: string;
  }>;
  metadata: {
    modelId: string;
    tokensUsed: number;
    latencyMs: number;
  };
}

/**
 * Build system prompt with persona context
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
- Preferred Idioms: ${profile.personaEvolution.linguisticDNA.preferredIdioms.join(', ') || 'None yet'}
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
 * Generate content using Claude 4.5, Groq, or mock
 */
export async function generateWithBedrock(
  request: BedrockGenerationRequest
): Promise<BedrockGenerationResponse> {
  const startTime = Date.now();

  // Priority: Groq (free) > Bedrock (paid) > Mock (fallback)
  const useGroq = process.env.USE_GROQ === 'true' && process.env.GROQ_API_KEY;
  const useMock = process.env.USE_BEDROCK_MOCKS === 'true';
  
  if (useGroq) {
    console.log('[AI] Using Groq (free tier)');
    return generateWithGroqQualityCheck(request);
  }
  
  if (useMock) {
    console.log('[AI] Using mock mode (Credit Discipline)');
    return generateWithBedrockMock(request);
  }

  try {
    console.log(`[Bedrock] Generating content for persona ${request.personaId} on ${request.platform}`);

    const systemPrompt = buildSystemPrompt(request);
    
    // Construct Claude Sonnet 4.5 request
    const payload = {
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: request.maxTokens || AWS_CONFIG.bedrock.maxTokens,
      temperature: request.temperature || AWS_CONFIG.bedrock.temperature,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: request.prompt
        }
      ]
    };

    // Invoke Bedrock
    const command = new InvokeModelCommand({
      modelId: AWS_CONFIG.bedrock.modelId,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(payload)
    });

    const response = await bedrockClient.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));

    // Parse Claude's response
    const content = responseBody.content[0].text;
    let parsedResponse: any;

    try {
      // Try to parse as JSON
      parsedResponse = JSON.parse(content);
    } catch {
      // If not JSON, wrap in default structure
      parsedResponse = {
        content: content,
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

    console.log(`[Bedrock] Generation complete in ${latencyMs}ms`);
    console.log(`[Bedrock] Persona alignment: ${(parsedResponse.personaAlignment.overallScore * 100).toFixed(1)}%`);

    return {
      content: parsedResponse.content,
      reasoning: parsedResponse.reasoning,
      personaAlignment: parsedResponse.personaAlignment,
      culturalAdaptations: parsedResponse.culturalAdaptations || [],
      metadata: {
        modelId: AWS_CONFIG.bedrock.modelId,
        tokensUsed: responseBody.usage?.total_tokens || 0,
        latencyMs
      }
    };

  } catch (error: any) {
    console.error('[Bedrock] Generation failed:', error);
    
    // Check for payment/subscription errors - automatically switch to Groq
    if (error.name === 'AccessDeniedException' && error.message?.includes('INVALID_PAYMENT_INSTRUMENT')) {
      console.log('[Bedrock] ⚠️  Payment required - trying Groq instead');
      if (process.env.GROQ_API_KEY) {
        return generateWithGroqQualityCheck(request);
      }
    }
    
    // For other errors, try Groq or fallback to mock
    console.log('[Bedrock] Error occurred - trying alternative');
    if (process.env.GROQ_API_KEY) {
      return generateWithGroqQualityCheck(request);
    }
    return generateWithBedrockMock(request);
  }
}

/**
 * Generate with retry logic for low-quality outputs
 */
export async function generateWithQualityCheck(
  request: BedrockGenerationRequest,
  minQualityScore: number = 0.7,
  maxRetries: number = 2
): Promise<BedrockGenerationResponse> {
  let attempt = 0;
  let bestResponse: BedrockGenerationResponse | null = null;
  let bestScore = 0;

  while (attempt < maxRetries) {
    const response = await generateWithBedrock(request);
    const score = response.personaAlignment.overallScore;

    if (score > bestScore) {
      bestResponse = response;
      bestScore = score;
    }

    if (score >= minQualityScore) {
      console.log(`[Bedrock] Quality check passed on attempt ${attempt + 1}`);
      return response;
    }

    attempt++;
    console.log(`[Bedrock] Quality check failed (${(score * 100).toFixed(1)}%), retrying... (${attempt}/${maxRetries})`);
  }

  console.log(`[Bedrock] Max retries reached, returning best response (${(bestScore * 100).toFixed(1)}%)`);
  return bestResponse!;
}
