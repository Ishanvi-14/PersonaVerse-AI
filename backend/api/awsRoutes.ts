/**
 * AWS-Powered API Routes
 * 
 * Production-ready endpoints for:
 * - Voice-to-text transcription
 * - Multilingual translation
 * - Content generation with Bedrock
 * - User history management
 */

import express, { Request, Response } from 'express';
import multer from 'multer';
import { processVoiceToContent, processTextToContent } from '../services/aws/orchestrator';
import { getUserHistory, getUserProfile, getDigitalSoulSummary } from '../services/aws/historyService';
import { getSupportedLanguages } from '../services/aws/transcribeService';
import { getLanguageName } from '../services/aws/translateService';
import { FEATURES } from '../services/aws/awsConfig';

const router = express.Router();

// Configure multer for audio uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['audio/webm', 'audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/ogg'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid audio format. Supported: webm, wav, mp3, ogg'));
    }
  }
});

/**
 * POST /aws/voice-to-content
 * Complete voice-to-content workflow
 */
router.post('/voice-to-content', upload.single('audio'), async (req: Request, res: Response) => {
  try {
    if (!FEATURES.voiceToText) {
      return res.status(503).json({
        error: 'Voice-to-text feature is disabled',
        message: 'Set ENABLE_VOICE_TO_TEXT=true in .env'
      });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    const { userId, personaId, platform, targetLanguage, autoDetectLanguage } = req.body;

    if (!userId || !personaId || !platform) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['userId', 'personaId', 'platform']
      });
    }

    console.log(`[API] Voice-to-content request from user ${userId}`);

    const result = await processVoiceToContent({
      audioBuffer: req.file.buffer,
      userId,
      personaId,
      platform,
      targetLanguage,
      autoDetectLanguage: autoDetectLanguage === 'true'
    });

    res.json({
      success: true,
      data: {
        transcription: {
          text: result.transcription.text,
          language: result.transcription.languageCode,
          confidence: result.transcription.confidence,
          audioUrl: result.transcription.audioUrl
        },
        generation: {
          content: result.generation.content,
          reasoning: result.generation.reasoning,
          personaAlignment: result.generation.personaAlignment,
          culturalAdaptations: result.generation.culturalAdaptations
        },
        translation: result.translation ? {
          text: result.translation.translatedText,
          language: result.translation.targetLanguage,
          transcreationApplied: result.translation.transcreationApplied,
          metaphorsReplaced: result.translation.metaphorsReplaced
        } : null,
        historyId: result.historyId
      }
    });

  } catch (error: any) {
    console.error('[API] Voice-to-content error:', error);
    res.status(500).json({
      error: 'Voice-to-content processing failed',
      message: error.message
    });
  }
});

/**
 * POST /aws/generate
 * Text-to-content generation with Bedrock
 */
router.post('/generate', async (req: Request, res: Response) => {
  try {
    if (!FEATURES.bedrock) {
      return res.status(503).json({
        error: 'Bedrock feature is disabled',
        message: 'Set ENABLE_BEDROCK=true in .env'
      });
    }

    const { text, userId, personaId, platform, domain, targetLanguage, sourceLanguage } = req.body;

    if (!text || !userId || !personaId || !platform) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['text', 'userId', 'personaId', 'platform']
      });
    }

    console.log(`[API] Generate request from user ${userId}`);

    const result = await processTextToContent({
      text,
      userId,
      personaId,
      platform,
      domain,
      targetLanguage,
      sourceLanguage
    });

    res.json({
      success: true,
      data: {
        generation: {
          content: result.generation.content,
          reasoning: result.generation.reasoning,
          personaAlignment: result.generation.personaAlignment,
          culturalAdaptations: result.generation.culturalAdaptations,
          metadata: result.generation.metadata
        },
        translation: result.translation ? {
          text: result.translation.translatedText,
          language: result.translation.targetLanguage,
          transcreationApplied: result.translation.transcreationApplied,
          metaphorsReplaced: result.translation.metaphorsReplaced
        } : null,
        historyId: result.historyId
      }
    });

  } catch (error: any) {
    console.error('[API] Generate error:', error);
    res.status(500).json({
      error: 'Content generation failed',
      message: error.message
    });
  }
});

/**
 * POST /aws/transcribe
 * Transcribe audio using AWS Transcribe
 */
router.post('/transcribe', upload.single('audio'), async (req: Request, res: Response) => {
  try {
    if (!FEATURES.voiceToText) {
      return res.status(503).json({
        error: 'Voice-to-text feature is disabled',
        message: 'Set ENABLE_VOICE_TO_TEXT=true in .env'
      });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    const { language, userId } = req.body;

    console.log(`[API] AWS Transcribe request from user ${userId || 'unknown'}, language: ${language || 'en-IN'}`);

    const { transcribeAudio } = require('../services/aws/transcribeService');
    const result = await transcribeAudio({
      audioBuffer: req.file.buffer,
      languageCode: language || 'en-IN',
      userId: userId || 'demo-user'
    });

    res.json({
      success: true,
      data: {
        transcript: result.text, // Fixed: use 'text' not 'transcript'
        confidence: result.confidence,
        language: result.languageCode,
        audioUrl: result.audioUrl
      }
    });

  } catch (error: any) {
    console.error('[API] AWS Transcribe error:', error);
    res.status(500).json({
      error: 'AWS Transcribe failed',
      message: error.message
    });
  }
});

/**
 * POST /aws/translate
 * Translate text with cultural transcreation
 */
router.post('/translate', async (req: Request, res: Response) => {
  try {
    if (!FEATURES.multilingual) {
      return res.status(503).json({
        error: 'Translation feature is disabled',
        message: 'Set ENABLE_MULTILINGUAL=true in .env'
      });
    }

    const { text, targetLanguage, sourceLanguage } = req.body;

    if (!text || !targetLanguage) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['text', 'targetLanguage']
      });
    }

    console.log(`[API] Translate request: ${sourceLanguage || 'auto'} → ${targetLanguage}`);

    const { translateText } = require('../services/aws/translateService');
    const result = await translateText({
      text,
      sourceLanguage,
      targetLanguage,
      culturalTranscreation: true,
      preservePersona: true
    });

    res.json({
      success: true,
      data: result
    });

  } catch (error: any) {
    console.error('[API] Translate error:', error);
    res.status(500).json({
      error: 'Translation failed',
      message: error.message
    });
  }
});

/**
 * POST /aws/history
 * Save content generation to history
 */
router.post('/history', async (req: Request, res: Response) => {
  try {
    if (!FEATURES.historyStorage) {
      return res.status(503).json({
        error: 'History storage is disabled',
        message: 'Set ENABLE_HISTORY_STORAGE=true in .env'
      });
    }

    const { userId, personaId, platform, inputContent, generatedContent, personaAlignmentScore, metadata } = req.body;

    if (!userId || !personaId || !platform || !generatedContent) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['userId', 'personaId', 'platform', 'generatedContent']
      });
    }

    console.log(`[API] Saving history for user ${userId}`);

    const { saveToHistory } = require('../services/aws/historyService');
    const historyId = await saveToHistory({
      userId,
      personaId,
      platform,
      inputContent: inputContent || '',
      generatedContent,
      personaAlignmentScore: personaAlignmentScore || 0.8,
      metadata: metadata || {}
    });

    res.json({
      success: true,
      data: { historyId }
    });

  } catch (error: any) {
    console.error('[API] History save error:', error);
    res.status(500).json({
      error: 'Failed to save history',
      message: error.message
    });
  }
});

/**
 * GET /aws/history/:userId
 * Get user's content history
 */
router.get('/history/:userId', async (req: Request, res: Response) => {
  try {
    if (!FEATURES.historyStorage) {
      return res.status(503).json({
        error: 'History storage is disabled',
        message: 'Set ENABLE_HISTORY_STORAGE=true in .env'
      });
    }

    const { userId } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;

    const { entries, lastKey } = await getUserHistory(userId, limit);

    res.json({
      success: true,
      data: {
        entries,
        hasMore: !!lastKey,
        nextPageKey: lastKey
      }
    });

  } catch (error: any) {
    console.error('[API] History error:', error);
    res.status(500).json({
      error: 'Failed to retrieve history',
      message: error.message
    });
  }
});

/**
 * GET /aws/profile/:userId
 * Get user's profile and Digital Soul summary
 */
router.get('/profile/:userId', async (req: Request, res: Response) => {
  try {
    if (!FEATURES.historyStorage) {
      return res.status(503).json({
        error: 'History storage is disabled',
        message: 'Set ENABLE_HISTORY_STORAGE=true in .env'
      });
    }

    const { userId } = req.params;
    const summary = await getDigitalSoulSummary(userId);

    res.json({
      success: true,
      data: summary
    });

  } catch (error: any) {
    console.error('[API] Profile error:', error);
    res.status(500).json({
      error: 'Failed to retrieve profile',
      message: error.message
    });
  }
});

/**
 * GET /aws/languages
 * Get supported languages
 */
router.get('/languages', (req: Request, res: Response) => {
  const languages = getSupportedLanguages();
  
  res.json({
    success: true,
    data: {
      languages,
      count: languages.length
    }
  });
});

/**
 * GET /aws/health
 * Health check for AWS services
 */
router.get('/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    features: {
      voiceToText: FEATURES.voiceToText,
      multilingual: FEATURES.multilingual,
      historyStorage: FEATURES.historyStorage,
      bedrock: FEATURES.bedrock
    },
    timestamp: new Date().toISOString()
  });
});

export default router;
