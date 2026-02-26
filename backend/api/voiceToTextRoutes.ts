/**
 * Voice-to-Text API Routes
 * 
 * Handles audio upload and transcription requests
 */

import express, { Request, Response } from 'express';
import multer from 'multer';
import { VoiceToTextService } from '../services/voice-to-text/voiceToText.service';

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
  fileFilter: (req, file, cb) => {
    // Accept audio files only
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'));
    }
  },
});

export function createVoiceToTextRouter(): express.Router {
  const router = express.Router();
  const voiceToTextService = new VoiceToTextService();

  /**
   * POST /transcribe
   * 
   * Transcribe audio file to text
   * 
   * Request: multipart/form-data with 'audio' field
   * Response: { success: true, transcript: string }
   */
  router.post('/transcribe', upload.single('audio'), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          error: 'No audio file provided',
        });
        return;
      }

      console.log(`[API] Transcription request - Size: ${req.file.size} bytes, Type: ${req.file.mimetype}`);

      // Validate file size (max 2 minutes of audio ~10MB)
      if (req.file.size > 10 * 1024 * 1024) {
        res.status(400).json({
          success: false,
          error: 'Audio file too large. Maximum size is 10MB (approximately 2 minutes)',
        });
        return;
      }

      // Transcribe audio
      const result = await voiceToTextService.transcribeAudio(
        req.file.buffer,
        req.file.mimetype
      );

      res.status(200).json({
        success: true,
        transcript: result.transcript,
      });

    } catch (error) {
      console.error('[API] Transcription error:', error);
      
      // Handle specific AWS errors
      let errorMessage = 'Transcription failed';
      
      if (error instanceof Error) {
        // Check for subscription error
        if (error.name === 'SubscriptionRequiredException' || error.message.includes('SubscriptionRequiredException')) {
          errorMessage = 'AWS Transcribe service is not enabled for your account. Please enable Amazon Transcribe in your AWS Console.';
        }
        // Check for credentials error
        else if (error.name === 'CredentialsError' || error.message.includes('credentials')) {
          errorMessage = 'AWS credentials are invalid. Please check your AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in .env file.';
        }
        // Check for access denied
        else if (error.name === 'AccessDeniedException' || error.message.includes('AccessDenied')) {
          errorMessage = 'Access denied. Please ensure your AWS credentials have permissions for S3 and Transcribe services.';
        }
        // Check for S3 bucket error
        else if (error.message.includes('bucket') || error.message.includes('S3')) {
          errorMessage = `S3 bucket error: ${error.message}. Please ensure the bucket '${process.env.S3_BUCKET_NAME}' exists and is accessible.`;
        }
        else {
          errorMessage = error.message;
        }
      }
      
      res.status(500).json({
        success: false,
        error: errorMessage,
      });
    }
  });

  /**
   * GET /health
   * 
   * Health check for voice-to-text service
   */
  router.get('/health', (req: Request, res: Response) => {
    res.json({
      success: true,
      service: 'voice-to-text',
      status: 'healthy',
    });
  });

  return router;
}
