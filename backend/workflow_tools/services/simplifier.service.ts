/**
 * Content Simplifier Service
 * 
 * Transforms complex content into multiple accessibility formats
 * with Bharat-first cultural awareness.
 */

import { GeminiClient } from '../providers/gemini.client';
import { MockProvider } from '../providers/mock.provider';
import { SimplifierRequest, SimplifierOutput, ToolsConfig } from '../types';

/**
 * Content Simplifier Service
 * 
 * Provides content simplification with cultural transcreation for Bharat audiences.
 * Generates 5 output formats: grade5, bullets, WhatsApp, voice, Hinglish.
 */
export class SimplifierService {
  constructor(
    private geminiClient: GeminiClient,
    private mockProvider: MockProvider,
    private config: ToolsConfig
  ) {}

  /**
   * Simplify content into multiple formats
   * 
   * @param request - Simplifier request with input text
   * @returns SimplifierOutput with 5 formatted versions
   */
  async simplify(request: SimplifierRequest): Promise<SimplifierOutput> {
    // Check if mock mode is enabled
    if (this.config.mock.enabled) {
      console.log('[MOCK MODE] Returning mock simplifier response');
      return await this.mockProvider.getSimplifierResponse(request.input);
    }

    // Real Gemini API call
    const prompt = this.buildSimplifierPrompt(request);
    return await this.geminiClient.generateStructured<SimplifierOutput>(
      prompt,
      this.config.gemini.timeouts.simplifier
    );
  }

  /**
   * Build Gemini prompt with Bharat cultural rules
   * 
   * @param request - Simplifier request
   * @returns Formatted prompt for Gemini API
   */
  private buildSimplifierPrompt(request: SimplifierRequest): string {
    const audienceContext = request.audienceContext 
      ? `\nTARGET AUDIENCE: ${request.audienceContext}` 
      : '';

    return `
You are a content assistant for Bharat (Indian) creators. Transform the following content into multiple accessibility formats.

CULTURAL RULES (MANDATORY):
- Replace Western metaphors with Indian equivalents:
  * "Home run" → "Sixer"
  * "Touchdown" → "Century"
  * "Slam dunk" → "Perfect shot"
- Use natural Hinglish (60-80% English, 20-40% Hindi words like yaar, dekho, samjhe, bas, achha, theek hai)
- Include Indian examples and references (cricket, chai, festivals, regional context)
- For WhatsApp version: use communication patterns familiar to Indian users
- Avoid literal Hindi-to-English translation patterns

INPUT CONTENT:
${request.input}
${audienceContext}

Respond with ONLY valid JSON matching this exact structure:
{
  "grade5_explanation": "Simple explanation using 5th grade vocabulary with Indian examples",
  "bullet_summary": ["Point 1", "Point 2", "Point 3"],
  "whatsapp_version": "Conversational text with emojis 😊 in Indian WhatsApp style",
  "voice_script": "Script formatted for audio narration with pauses and natural flow",
  "regional_version": "Hinglish version mixing English and Hindi naturally (yaar, dekho, samjhe)"
}

IMPORTANT REQUIREMENTS:
- bullet_summary must have 3-7 items
- whatsapp_version must include contextually appropriate emojis
- regional_version must include Hindi words (yaar, dekho, samjhe, bas, achha, theek hai)
- All outputs must preserve the core meaning of the original content
- Use Indian cultural context throughout
`;
  }
}
