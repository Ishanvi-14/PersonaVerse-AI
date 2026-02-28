/**
 * AWS Services Orchestrator
 * 
 * Coordinates all AWS services for end-to-end workflows:
 * 1. Voice → Text (Transcribe)
 * 2. Language Detection (Comprehend)
 * 3. Content Generation (Bedrock)
 * 4. Translation (Translate)
 * 5. History Storage (DynamoDB + S3)
 */

import { transcribeAudio, TranscribeRequest, TranscribeResponse } from './transcribeService';
import { translateText, TranslateRequest, TranslateResponse } from './translateService';
import { generateWithQualityCheck, BedrockGenerationRequest, BedrockGenerationResponse } from './bedrockService';
import {
  saveHistoryEntry,
  getUserProfile,
  updateUserStatistics,
  trackPersonaEvolution,
  HistoryEntry
} from './historyService';
import { v4 as uuidv4 } from 'uuid';

export interface VoiceToContentRequest {
  audioBuffer: Buffer;
  userId: string;
  personaId: string;
  platform: string;
  targetLanguage?: string;
  autoDetectLanguage?: boolean;
}

export interface VoiceToContentResponse {
  transcription: TranscribeResponse;
  generation: BedrockGenerationResponse;
  translation?: TranslateResponse;
  historyId: string;
}

export interface TextToContentRequest {
  text: string;
  userId: string;
  personaId: string;
  platform: string;
  domain?: string;
  targetLanguage?: string;
  sourceLanguage?: string;
}

export interface TextToContentResponse {
  generation: BedrockGenerationResponse;
  translation?: TranslateResponse;
  historyId: string;
}

/**
 * Complete voice-to-content workflow
 */
export async function processVoiceToContent(
  request: VoiceToContentRequest
): Promise<VoiceToContentResponse> {
  console.log(`[Orchestrator] Starting voice-to-content workflow for user ${request.userId}`);

  try {
    // Step 1: Transcribe audio
    const transcription = await transcribeAudio({
      audioBuffer: request.audioBuffer,
      userId: request.userId,
      autoDetectLanguage: request.autoDetectLanguage
    });

    if (transcription.status === 'failed') {
      throw new Error('Transcription failed');
    }

    console.log(`[Orchestrator] Transcription complete: "${transcription.text.substring(0, 100)}..."`);

    // Step 2: Get user profile for persona context
    const userProfile = await getUserProfile(request.userId);

    // Step 3: Generate content with Bedrock
    const generation = await generateWithQualityCheck({
      prompt: transcription.text,
      personaId: request.personaId,
      platform: request.platform,
      userProfile,
      targetLanguage: request.targetLanguage || transcription.languageCode,
      culturalContext: userProfile.preferences.culturalContext
    });

    if (!generation || !generation.personaAlignment) {
      throw new Error('Bedrock generation failed - no valid response received');
    }

    console.log(`[Orchestrator] Generation complete with ${(generation.personaAlignment.overallScore * 100).toFixed(1)}% alignment`);

    // Step 4: Translate if needed
    let translation: TranslateResponse | undefined;
    if (request.targetLanguage && request.targetLanguage !== transcription.languageCode) {
      translation = await translateText({
        text: generation.content,
        sourceLanguage: transcription.languageCode,
        targetLanguage: request.targetLanguage,
        culturalTranscreation: true,
        preservePersona: true
      });
      console.log(`[Orchestrator] Translation complete to ${request.targetLanguage}`);
    }

    // Step 5: Save to history
    const historyId = uuidv4();
    const historyEntry: HistoryEntry = {
      userId: request.userId,
      entryId: historyId,
      timestamp: new Date().toISOString(),
      type: 'generation',
      personaId: request.personaId,
      platform: request.platform,
      input: {
        text: transcription.text,
        language: transcription.languageCode,
        audioUrl: transcription.audioUrl
      },
      output: {
        text: translation?.translatedText || generation.content,
        language: request.targetLanguage || transcription.languageCode,
        confidence: generation.personaAlignment.overallScore
      },
      metadata: {
        engagementScore: generation.personaAlignment.overallScore * 100,
        transcreationApplied: translation?.transcreationApplied || false,
        metaphorsReplaced: translation?.metaphorsReplaced || []
      }
    };

    await saveHistoryEntry(historyEntry);

    // Step 6: Update user statistics
    await updateUserStatistics(request.userId, {
      type: 'generation',
      language: request.targetLanguage || transcription.languageCode,
      personaId: request.personaId,
      platform: request.platform,
      engagementScore: generation.personaAlignment.overallScore * 100
    });

    // Step 7: Track persona evolution
    await trackPersonaEvolution(request.userId, generation.content, {
      hinglishDetected: generation.content.match(/\b(yaar|bhai|achha|sahi)\b/i) !== null,
      complexityScore: generation.content.split(' ').length / 100,
      emotionalTone: generation.personaAlignment.emotionalConsistency > 0.8 ? 'optimistic' : 'neutral'
    });

    console.log(`[Orchestrator] Workflow complete, history saved as ${historyId}`);

    return {
      transcription,
      generation,
      translation,
      historyId
    };

  } catch (error) {
    console.error('[Orchestrator] Voice-to-content workflow failed:', error);
    throw error;
  }
}

/**
 * Text-to-content workflow (no transcription)
 */
export async function processTextToContent(
  request: TextToContentRequest
): Promise<TextToContentResponse> {
  console.log(`[Orchestrator] Starting text-to-content workflow for user ${request.userId}`);

  try {
    // Step 1: Get user profile
    const userProfile = await getUserProfile(request.userId);

    // Step 2: Generate content with Bedrock
    const generation = await generateWithQualityCheck({
      prompt: request.text,
      personaId: request.personaId,
      platform: request.platform,
      domain: request.domain,
      userProfile,
      targetLanguage: request.targetLanguage || request.sourceLanguage || 'en',
      culturalContext: userProfile.preferences.culturalContext
    });

    if (!generation || !generation.personaAlignment) {
      throw new Error('Bedrock generation failed - no valid response received');
    }

    console.log(`[Orchestrator] Generation complete with ${(generation.personaAlignment.overallScore * 100).toFixed(1)}% alignment`);

    // Step 3: Translate if needed
    let translation: TranslateResponse | undefined;
    if (request.targetLanguage && request.targetLanguage !== (request.sourceLanguage || 'en')) {
      translation = await translateText({
        text: generation.content,
        sourceLanguage: request.sourceLanguage,
        targetLanguage: request.targetLanguage,
        culturalTranscreation: true,
        preservePersona: true
      });
      console.log(`[Orchestrator] Translation complete to ${request.targetLanguage}`);
    }

    // Step 4: Save to history
    const historyId = uuidv4();
    const historyEntry: HistoryEntry = {
      userId: request.userId,
      entryId: historyId,
      timestamp: new Date().toISOString(),
      type: 'generation',
      personaId: request.personaId,
      platform: request.platform,
      domain: request.domain,
      input: {
        text: request.text,
        language: request.sourceLanguage || 'en'
      },
      output: {
        text: translation?.translatedText || generation.content,
        language: request.targetLanguage || request.sourceLanguage || 'en',
        confidence: generation.personaAlignment.overallScore
      },
      metadata: {
        engagementScore: generation.personaAlignment.overallScore * 100,
        transcreationApplied: translation?.transcreationApplied || false,
        metaphorsReplaced: translation?.metaphorsReplaced || generation.culturalAdaptations.map(a => ({
          original: a.original,
          replacement: a.adapted
        }))
      }
    };

    await saveHistoryEntry(historyEntry);

    // Step 5: Update statistics
    await updateUserStatistics(request.userId, {
      type: 'generation',
      language: request.targetLanguage || request.sourceLanguage || 'en',
      personaId: request.personaId,
      platform: request.platform,
      engagementScore: generation.personaAlignment.overallScore * 100
    });

    // Step 6: Track evolution
    await trackPersonaEvolution(request.userId, generation.content, {
      hinglishDetected: generation.content.match(/\b(yaar|bhai|achha|sahi)\b/i) !== null,
      complexityScore: generation.content.split(' ').length / 100,
      emotionalTone: generation.personaAlignment.emotionalConsistency > 0.8 ? 'optimistic' : 'neutral'
    });

    console.log(`[Orchestrator] Workflow complete, history saved as ${historyId}`);

    return {
      generation,
      translation,
      historyId
    };

  } catch (error) {
    console.error('[Orchestrator] Text-to-content workflow failed:', error);
    throw error;
  }
}
