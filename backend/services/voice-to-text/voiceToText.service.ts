/**
 * Voice-to-Text Service
 * 
 * Handles audio transcription using AWS Transcribe:
 * 1. Upload audio to S3
 * 2. Start transcription job
 * 3. Poll until completion
 * 4. Extract transcript
 * 5. Clean up S3 file
 */

import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { 
  TranscribeClient, 
  StartTranscriptionJobCommand, 
  GetTranscriptionJobCommand,
  DeleteTranscriptionJobCommand,
  TranscriptionJob
} from '@aws-sdk/client-transcribe';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as https from 'https';

export interface TranscriptionResult {
  transcript: string;
  confidence?: number;
  duration?: number;
}

export class VoiceToTextService {
  private s3Client: S3Client;
  private transcribeClient: TranscribeClient;
  private bucketName: string;
  private region: string;

  constructor() {
    this.region = process.env.AWS_REGION || 'ap-south-1';
    
    // Trim credentials to remove any whitespace
    const accessKeyId = (process.env.AWS_ACCESS_KEY_ID || '').trim();
    const secretAccessKey = (process.env.AWS_SECRET_ACCESS_KEY || '').trim();
    
    // AWS SDK with explicit credentials (trimmed)
    this.s3Client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

    this.transcribeClient = new TranscribeClient({
      region: this.region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

    // Use existing bucket or default
    this.bucketName = process.env.S3_BUCKET_NAME || 'personaverse-voice-transcriptions';
  }

  /**
   * Validate AWS credentials
   */
  private validateCredentials(): void {
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      throw new Error('AWS credentials not configured. Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in .env file');
    }
  }

  /**
   * Main transcription method
   */
  async transcribeAudio(audioBuffer: Buffer, mimeType: string): Promise<TranscriptionResult> {
    // Validate credentials before processing
    this.validateCredentials();
    
    const jobName = `transcribe-${uuidv4()}`;
    const fileName = `${jobName}.${this.getFileExtension(mimeType)}`;
    const s3Key = `audio/${fileName}`;

    try {
      console.log(`[VoiceToText] Starting transcription job: ${jobName}`);

      // Step 1: Upload to S3
      await this.uploadToS3(s3Key, audioBuffer, mimeType);
      console.log(`[VoiceToText] Uploaded to S3: ${s3Key}`);

      // Step 2: Start transcription job
      const s3Uri = `s3://${this.bucketName}/${s3Key}`;
      await this.startTranscriptionJob(jobName, s3Uri, this.getMediaFormat(mimeType));
      console.log(`[VoiceToText] Started transcription job`);

      // Step 3: Poll for completion
      const job = await this.pollTranscriptionJob(jobName);
      console.log(`[VoiceToText] Transcription completed`);

      // Step 4: Extract transcript
      const transcript = await this.extractTranscript(job);
      console.log(`[VoiceToText] Extracted transcript: ${transcript.substring(0, 100)}...`);

      // Step 5: Cleanup
      await this.cleanup(s3Key, jobName);
      console.log(`[VoiceToText] Cleanup completed`);

      return {
        transcript: transcript.trim(),
      };
    } catch (error) {
      // Cleanup on error
      try {
        await this.cleanup(s3Key, jobName);
      } catch (cleanupError) {
        console.error('[VoiceToText] Cleanup error:', cleanupError);
      }
      throw error;
    }
  }

  /**
   * Upload audio file to S3
   */
  private async uploadToS3(key: string, buffer: Buffer, mimeType: string): Promise<void> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
    });

    await this.s3Client.send(command);
  }

  /**
   * Start AWS Transcribe job
   */
  private async startTranscriptionJob(
    jobName: string, 
    s3Uri: string, 
    mediaFormat: string
  ): Promise<void> {
    const command = new StartTranscriptionJobCommand({
      TranscriptionJobName: jobName,
      LanguageCode: 'en-IN', // English (India) for Bharat context
      MediaFormat: mediaFormat as any,
      Media: {
        MediaFileUri: s3Uri,
      },
      Settings: {
        ShowSpeakerLabels: false,
        MaxSpeakerLabels: undefined,
      },
    });

    await this.transcribeClient.send(command);
  }

  /**
   * Poll transcription job until completion
   */
  private async pollTranscriptionJob(jobName: string, maxAttempts = 60): Promise<TranscriptionJob> {
    const command = new GetTranscriptionJobCommand({
      TranscriptionJobName: jobName,
    });

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const response = await this.transcribeClient.send(command);
      const job = response.TranscriptionJob;

      if (!job) {
        throw new Error('Transcription job not found');
      }

      const status = job.TranscriptionJobStatus;

      if (status === 'COMPLETED') {
        return job;
      }

      if (status === 'FAILED') {
        throw new Error(`Transcription failed: ${job.FailureReason || 'Unknown error'}`);
      }

      // Wait 2 seconds before next poll
      await this.sleep(2000);
    }

    throw new Error('Transcription timeout - job did not complete in time');
  }

  /**
   * Extract transcript text from completed job
   */
  private async extractTranscript(job: TranscriptionJob): Promise<string> {
    const transcriptUri = job.Transcript?.TranscriptFileUri;
    
    if (!transcriptUri) {
      throw new Error('Transcript URI not found');
    }

    // Download transcript JSON
    const transcriptJson = await this.downloadTranscript(transcriptUri);
    
    // Extract text
    const transcript = transcriptJson.results?.transcripts?.[0]?.transcript;
    
    if (!transcript) {
      throw new Error('Transcript text not found in response');
    }

    return transcript;
  }

  /**
   * Download transcript JSON from URL
   */
  private async downloadTranscript(url: string): Promise<any> {
    return new Promise((resolve, reject) => {
      https.get(url, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (error) {
            reject(new Error('Failed to parse transcript JSON'));
          }
        });
      }).on('error', (error) => {
        reject(error);
      });
    });
  }

  /**
   * Cleanup S3 file and transcription job
   */
  private async cleanup(s3Key: string, jobName: string): Promise<void> {
    // Delete S3 file
    try {
      const deleteS3Command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: s3Key,
      });
      await this.s3Client.send(deleteS3Command);
    } catch (error) {
      console.error('[VoiceToText] Failed to delete S3 file:', error);
    }

    // Delete transcription job
    try {
      const deleteJobCommand = new DeleteTranscriptionJobCommand({
        TranscriptionJobName: jobName,
      });
      await this.transcribeClient.send(deleteJobCommand);
    } catch (error) {
      console.error('[VoiceToText] Failed to delete transcription job:', error);
    }
  }

  /**
   * Get file extension from MIME type
   */
  private getFileExtension(mimeType: string): string {
    const map: Record<string, string> = {
      'audio/webm': 'webm',
      'audio/webm;codecs=opus': 'webm',
      'audio/ogg': 'ogg',
      'audio/ogg;codecs=opus': 'ogg',
      'audio/wav': 'wav',
      'audio/mp4': 'mp4',
      'audio/mpeg': 'mp3',
      'audio/mp3': 'mp3',
    };

    return map[mimeType] || 'webm';
  }

  /**
   * Get media format for AWS Transcribe
   */
  private getMediaFormat(mimeType: string): string {
    if (mimeType.includes('webm')) return 'webm';
    if (mimeType.includes('ogg')) return 'ogg';
    if (mimeType.includes('wav')) return 'wav';
    if (mimeType.includes('mp4')) return 'mp4';
    if (mimeType.includes('mp3') || mimeType.includes('mpeg')) return 'mp3';
    return 'webm'; // default
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
