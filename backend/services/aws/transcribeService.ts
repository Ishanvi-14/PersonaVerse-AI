/**
 * Amazon Transcribe Service
 * 
 * Real-time voice-to-text transcription with:
 * - Multi-language support (10+ Indian languages)
 * - Automatic language detection
 * - S3 integration for audio storage
 * - Streaming and batch transcription
 */

import {
  StartTranscriptionJobCommand,
  GetTranscriptionJobCommand,
  TranscriptionJob
} from '@aws-sdk/client-transcribe';
import { PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { transcribeClient, s3Client, AWS_CONFIG, awsConfig } from './awsConfig';
import { v4 as uuidv4 } from 'uuid';

export interface TranscribeRequest {
  audioBuffer: Buffer;
  userId: string;
  languageCode?: string; // ISO 639-1 code (e.g., 'hi', 'en', 'ta')
  autoDetectLanguage?: boolean;
}

export interface TranscribeResponse {
  transcriptionId: string;
  text: string;
  languageCode: string;
  confidence: number;
  audioUrl: string;
  status: 'completed' | 'in_progress' | 'failed';
  timestamp: string;
}

// Language code mapping (ISO 639-1 to AWS Transcribe format)
const LANGUAGE_MAP: Record<string, string> = {
  'en': 'en-IN',  // English (India)
  'hi': 'hi-IN',  // Hindi
  'ta': 'ta-IN',  // Tamil
  'te': 'te-IN',  // Telugu
  'bn': 'bn-IN',  // Bengali
  'mr': 'mr-IN',  // Marathi
  'gu': 'gu-IN',  // Gujarati
  'kn': 'kn-IN',  // Kannada
  'ml': 'ml-IN',  // Malayalam
  'pa': 'pa-IN'   // Punjabi
};

/**
 * Upload audio file to S3
 */
async function uploadAudioToS3(
  audioBuffer: Buffer,
  userId: string,
  transcriptionId: string
): Promise<string> {
  const key = `${AWS_CONFIG.s3.audioPrefix}${userId}/${transcriptionId}.webm`;
  
  await s3Client.send(new PutObjectCommand({
    Bucket: AWS_CONFIG.s3.bucketName,
    Key: key,
    Body: audioBuffer,
    ContentType: 'audio/webm',
    Metadata: {
      userId,
      transcriptionId,
      uploadedAt: new Date().toISOString()
    }
  }));

  return `s3://${AWS_CONFIG.s3.bucketName}/${key}`;
}

/**
 * Get presigned URL for audio file
 */
async function getAudioPresignedUrl(s3Uri: string): Promise<string> {
  const key = s3Uri.replace(`s3://${AWS_CONFIG.s3.bucketName}/`, '');
  
  const command = new GetObjectCommand({
    Bucket: AWS_CONFIG.s3.bucketName,
    Key: key
  });

  return await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // 1 hour
}

/**
 * Start transcription job
 */
async function startTranscriptionJob(
  s3Uri: string,
  transcriptionId: string,
  languageCode: string,
  autoDetect: boolean
): Promise<void> {
  const params: any = {
    TranscriptionJobName: transcriptionId,
    Media: {
      MediaFileUri: s3Uri
    },
    MediaFormat: 'webm',
    OutputBucketName: AWS_CONFIG.s3.bucketName,
    OutputKey: `${AWS_CONFIG.s3.audioPrefix}transcripts/${transcriptionId}.json`
  };

  if (autoDetect) {
    // Auto-detect from supported Indian languages
    params.IdentifyLanguage = true;
    params.LanguageOptions = Object.values(LANGUAGE_MAP);
  } else {
    params.LanguageCode = languageCode;
  }

  await transcribeClient.send(new StartTranscriptionJobCommand(params));
}

/**
 * Poll transcription job status
 */
async function pollTranscriptionJob(
  transcriptionId: string,
  maxAttempts: number = 30,
  delayMs: number = 2000
): Promise<TranscriptionJob> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const response = await transcribeClient.send(
      new GetTranscriptionJobCommand({
        TranscriptionJobName: transcriptionId
      })
    );

    const job = response.TranscriptionJob;
    
    if (job?.TranscriptionJobStatus === 'COMPLETED') {
      return job;
    }
    
    if (job?.TranscriptionJobStatus === 'FAILED') {
      throw new Error(`Transcription failed: ${job.FailureReason}`);
    }

    // Wait before next poll
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }

  throw new Error('Transcription timeout');
}

/**
 * Extract transcript text from job result
 */
async function extractTranscript(job: TranscriptionJob): Promise<{
  text: string;
  confidence: number;
  languageCode: string;
}> {
  const transcriptUri = job.Transcript?.TranscriptFileUri;
  
  if (!transcriptUri) {
    throw new Error('No transcript URI found');
  }

  try {
    // Extract S3 key from URI
    const s3Key = transcriptUri.replace(`https://s3.${awsConfig.region}.amazonaws.com/${AWS_CONFIG.s3.bucketName}/`, '');
    
    console.log(`[Transcribe] Fetching transcript from S3: ${s3Key}`);
    
    // Fetch transcript using AWS SDK (not direct HTTP)
    const response = await s3Client.send(new GetObjectCommand({
      Bucket: AWS_CONFIG.s3.bucketName,
      Key: s3Key
    }));

    // Convert stream to string
    const transcriptData = await response.Body?.transformToString();
    if (!transcriptData) {
      throw new Error('Empty transcript file');
    }

    const data = JSON.parse(transcriptData);

    const transcript = data.results?.transcripts?.[0]?.transcript || '';
    const items = data.results?.items || [];
    
    // Calculate average confidence
    const confidences = items
      .filter((item: any) => item.alternatives?.[0]?.confidence)
      .map((item: any) => parseFloat(item.alternatives[0].confidence));
    
    const avgConfidence = confidences.length > 0
      ? confidences.reduce((a: number, b: number) => a + b, 0) / confidences.length
      : 0;

    const detectedLanguage = data.results?.language_code || job.LanguageCode || 'en-IN';

    console.log(`[Transcribe] Successfully extracted transcript: "${transcript.substring(0, 100)}..."`);

    return {
      text: transcript,
      confidence: avgConfidence,
      languageCode: detectedLanguage
    };
  } catch (error) {
    console.error(`[Transcribe] Failed to extract transcript:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to extract transcript: ${errorMessage}`);
  }
}

/**
 * Main transcription function
 */
export async function transcribeAudio(
  request: TranscribeRequest
): Promise<TranscribeResponse> {
  const transcriptionId = `transcribe-${uuidv4()}`;
  const timestamp = new Date().toISOString();

  try {
    console.log(`[Transcribe] Starting transcription ${transcriptionId} for user ${request.userId}`);

    // 1. Upload audio to S3
    const s3Uri = await uploadAudioToS3(
      request.audioBuffer,
      request.userId,
      transcriptionId
    );
    console.log(`[Transcribe] Audio uploaded to ${s3Uri}`);

    // 2. Determine language
    const autoDetect = request.autoDetectLanguage ?? true;
    const languageCode = request.languageCode
      ? LANGUAGE_MAP[request.languageCode] || 'en-IN'
      : 'en-IN';

    // 3. Start transcription job
    await startTranscriptionJob(s3Uri, transcriptionId, languageCode, autoDetect);
    console.log(`[Transcribe] Job started with language ${autoDetect ? 'auto-detect' : languageCode}`);

    // 4. Poll for completion
    const job = await pollTranscriptionJob(transcriptionId);
    console.log(`[Transcribe] Job completed`);

    // 5. Extract transcript
    const result = await extractTranscript(job);
    console.log(`[Transcribe] Extracted text: "${result.text.substring(0, 100)}..."`);

    // 6. Get presigned URL for audio
    const audioUrl = await getAudioPresignedUrl(s3Uri);

    return {
      transcriptionId,
      text: result.text,
      languageCode: result.languageCode,
      confidence: result.confidence,
      audioUrl,
      status: 'completed',
      timestamp
    };

  } catch (error) {
    console.error(`[Transcribe] Error:`, error);
    
    // Return error details for debugging
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`AWS Transcribe failed: ${errorMessage}`);
  }
}

/**
 * Get supported languages
 */
export function getSupportedLanguages(): Array<{ code: string; name: string; awsCode: string }> {
  return [
    { code: 'en', name: 'English', awsCode: 'en-IN' },
    { code: 'hi', name: 'हिन्दी (Hindi)', awsCode: 'hi-IN' },
    { code: 'ta', name: 'தமிழ் (Tamil)', awsCode: 'ta-IN' },
    { code: 'te', name: 'తెలుగు (Telugu)', awsCode: 'te-IN' },
    { code: 'bn', name: 'বাংলা (Bengali)', awsCode: 'bn-IN' },
    { code: 'mr', name: 'मराठी (Marathi)', awsCode: 'mr-IN' },
    { code: 'gu', name: 'ગુજરાતી (Gujarati)', awsCode: 'gu-IN' },
    { code: 'kn', name: 'ಕನ್ನಡ (Kannada)', awsCode: 'kn-IN' },
    { code: 'ml', name: 'മലയാളം (Malayalam)', awsCode: 'ml-IN' },
    { code: 'pa', name: 'ਪੰਜਾਬੀ (Punjabi)', awsCode: 'pa-IN' }
  ];
}
