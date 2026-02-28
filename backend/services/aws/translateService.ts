/**
 * Amazon Translate Service with Cultural Transcreation
 * 
 * NOT just translation - this is cultural transcreation that:
 * - Maintains persona consistency across languages
 * - Adapts metaphors (Home run → Sixer)
 * - Preserves Hinglish code-switching patterns
 * - Respects regional linguistic nuances
 */

import { TranslateTextCommand, TranslateClient } from '@aws-sdk/client-translate';
import { DetectDominantLanguageCommand } from '@aws-sdk/client-comprehend';
import { translateClient, comprehendClient, AWS_CONFIG } from './awsConfig';

export interface TranslateRequest {
  text: string;
  sourceLanguage?: string; // Auto-detect if not provided
  targetLanguage: string;
  preservePersona?: boolean; // Maintain persona markers
  culturalTranscreation?: boolean; // Apply metaphor mapping
}

export interface TranslateResponse {
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  confidence: number;
  transcreationApplied: boolean;
  metaphorsReplaced: Array<{ original: string; replacement: string }>;
}

// Cultural Metaphor Mapping (Western → Bharat)
const METAPHOR_MAP: Record<string, Record<string, string>> = {
  'en': {
    'home run': 'sixer',
    'touchdown': 'century',
    'slam dunk': 'perfect shot',
    'hit it out of the park': 'hit a sixer',
    'ballpark figure': 'rough estimate',
    'strike out': 'get out for a duck',
    'Monday morning quarterback': 'post-match expert',
    'move the goalposts': 'change the rules mid-game',
    'level playing field': 'fair chance for all',
    'throw in the towel': 'give up the fight'
  },
  'hi': {
    'home run': 'छक्का (chakka)',
    'touchdown': 'शतक (shatak)',
    'slam dunk': 'परफेक्ट शॉट',
    'hit it out of the park': 'छक्का मारना'
  }
};

// Hinglish preservation patterns
const HINGLISH_PATTERNS = [
  /\b(yaar|bhai|dost|boss|sir|ji)\b/gi,
  /\b(achha|theek|sahi|bilkul|ekdum)\b/gi,
  /\b(kya|kaise|kab|kahan|kyun)\b/gi,
  /\b(jugaad|timepass|fundas|gyaan)\b/gi
];

/**
 * Detect source language using Amazon Comprehend
 */
async function detectLanguage(text: string): Promise<{ language: string; confidence: number }> {
  try {
    const response = await comprehendClient.send(
      new DetectDominantLanguageCommand({ Text: text })
    );

    const dominant = response.Languages?.[0];
    
    return {
      language: dominant?.LanguageCode || 'en',
      confidence: dominant?.Score || 0
    };
  } catch (error) {
    console.error('[Translate] Language detection failed:', error);
    return { language: 'en', confidence: 0 };
  }
}

/**
 * Apply cultural transcreation (metaphor replacement)
 */
function applyTranscreation(
  text: string,
  targetLanguage: string
): { text: string; replacements: Array<{ original: string; replacement: string }> } {
  let transcreatedText = text;
  const replacements: Array<{ original: string; replacement: string }> = [];

  const metaphors = METAPHOR_MAP[targetLanguage] || METAPHOR_MAP['en'];

  for (const [western, bharat] of Object.entries(metaphors)) {
    const regex = new RegExp(`\\b${western}\\b`, 'gi');
    if (regex.test(transcreatedText)) {
      transcreatedText = transcreatedText.replace(regex, bharat);
      replacements.push({ original: western, replacement: bharat });
    }
  }

  return { text: transcreatedText, replacements };
}

/**
 * Preserve Hinglish patterns during translation
 */
function preserveHinglish(originalText: string, translatedText: string): string {
  let preserved = translatedText;

  // Extract Hinglish words from original
  const hinglishWords: string[] = [];
  
  HINGLISH_PATTERNS.forEach(pattern => {
    const matches = originalText.match(pattern);
    if (matches) {
      hinglishWords.push(...matches);
    }
  });

  // If original had Hinglish, ensure translation maintains some
  if (hinglishWords.length > 0) {
    // Add back key Hinglish markers
    preserved = preserved.replace(/\bfriend\b/gi, 'yaar');
    preserved = preserved.replace(/\bbrother\b/gi, 'bhai');
    preserved = preserved.replace(/\bokay\b/gi, 'achha');
    preserved = preserved.replace(/\bright\b/gi, 'sahi');
  }

  return preserved;
}

/**
 * Translate text with cultural awareness
 */
export async function translateText(request: TranslateRequest): Promise<TranslateResponse> {
  try {
    console.log(`[Translate] Translating to ${request.targetLanguage}`);

    // 1. Detect source language if not provided
    let sourceLanguage = request.sourceLanguage;
    let confidence = 1.0;

    if (!sourceLanguage) {
      const detected = await detectLanguage(request.text);
      sourceLanguage = detected.language;
      confidence = detected.confidence;
      console.log(`[Translate] Detected language: ${sourceLanguage} (${(confidence * 100).toFixed(1)}%)`);
    }

    // 2. Apply cultural transcreation BEFORE translation
    let textToTranslate = request.text;
    let transcreationApplied = false;
    let metaphorsReplaced: Array<{ original: string; replacement: string }> = [];

    if (request.culturalTranscreation !== false) {
      const transcreated = applyTranscreation(request.text, request.targetLanguage);
      textToTranslate = transcreated.text;
      metaphorsReplaced = transcreated.replacements;
      transcreationApplied = transcreated.replacements.length > 0;
    }

    // 3. Skip translation if source and target are the same
    if (sourceLanguage === request.targetLanguage) {
      return {
        translatedText: textToTranslate,
        sourceLanguage,
        targetLanguage: request.targetLanguage,
        confidence,
        transcreationApplied,
        metaphorsReplaced
      };
    }

    // 4. Translate using Amazon Translate
    const translateResponse = await translateClient.send(
      new TranslateTextCommand({
        Text: textToTranslate,
        SourceLanguageCode: sourceLanguage,
        TargetLanguageCode: request.targetLanguage
      })
    );

    let translatedText = translateResponse.TranslatedText || textToTranslate;

    // 5. Preserve Hinglish patterns if requested
    if (request.preservePersona !== false) {
      translatedText = preserveHinglish(request.text, translatedText);
    }

    console.log(`[Translate] Success: "${request.text.substring(0, 50)}..." → "${translatedText.substring(0, 50)}..."`);

    return {
      translatedText,
      sourceLanguage,
      targetLanguage: request.targetLanguage,
      confidence,
      transcreationApplied,
      metaphorsReplaced
    };

  } catch (error) {
    console.error('[Translate] Error:', error);
    
    // Fallback: return original text
    return {
      translatedText: request.text,
      sourceLanguage: request.sourceLanguage || 'en',
      targetLanguage: request.targetLanguage,
      confidence: 0,
      transcreationApplied: false,
      metaphorsReplaced: []
    };
  }
}

/**
 * Batch translate multiple texts
 */
export async function batchTranslate(
  texts: string[],
  targetLanguage: string,
  options?: Partial<TranslateRequest>
): Promise<TranslateResponse[]> {
  const promises = texts.map(text =>
    translateText({
      text,
      targetLanguage,
      ...options
    })
  );

  return Promise.all(promises);
}

/**
 * Get language name in native script
 */
export function getLanguageName(code: string): string {
  const names: Record<string, string> = {
    'en': 'English',
    'hi': 'हिन्दी',
    'ta': 'தமிழ்',
    'te': 'తెలుగు',
    'bn': 'বাংলা',
    'mr': 'मराठी',
    'gu': 'ગુજરાતી',
    'kn': 'ಕನ್ನಡ',
    'ml': 'മലയാളം',
    'pa': 'ਪੰਜਾਬੀ'
  };

  return names[code] || code.toUpperCase();
}
