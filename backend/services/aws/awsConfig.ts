/**
 * AWS Configuration & Client Initialization
 * 
 * Centralized AWS SDK configuration following best practices:
 * - Credential management
 * - Region configuration
 * - Client reuse for performance
 * - Error handling
 */

import { S3Client } from '@aws-sdk/client-s3';
import { TranscribeClient } from '@aws-sdk/client-transcribe';
import { TranslateClient } from '@aws-sdk/client-translate';
import { ComprehendClient } from '@aws-sdk/client-comprehend';
import { BedrockRuntimeClient } from '@aws-sdk/client-bedrock-runtime';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

// Validate required environment variables
const requiredEnvVars = [
  'AWS_REGION',
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.warn(`⚠️  Warning: ${envVar} not set. AWS services may not work.`);
  }
}

// AWS Configuration
export const awsConfig = {
  region: process.env.AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  }
};

// Bedrock uses a different region (us-east-1 for Claude 4.5)
const bedrockConfig = {
  region: process.env.BEDROCK_REGION || 'us-east-1',
  credentials: awsConfig.credentials
};

// Initialize AWS Clients (singleton pattern for reuse)
export const s3Client = new S3Client(awsConfig);
export const transcribeClient = new TranscribeClient(awsConfig);
export const translateClient = new TranslateClient(awsConfig);
export const comprehendClient = new ComprehendClient(awsConfig);
export const bedrockClient = new BedrockRuntimeClient(bedrockConfig);

// DynamoDB with Document Client for easier JSON handling
const dynamoClient = new DynamoDBClient(awsConfig);
export const dynamoDocClient = DynamoDBDocumentClient.from(dynamoClient, {
  marshallOptions: {
    removeUndefinedValues: true,
    convertClassInstanceToMap: true
  }
});

// Configuration constants
export const AWS_CONFIG = {
  s3: {
    bucketName: process.env.S3_BUCKET_NAME || 'personaverse-storage',
    audioPrefix: 'audio/',
    historyPrefix: 'history/',
    maxFileSize: 10 * 1024 * 1024 // 10MB
  },
  dynamodb: {
    historyTable: process.env.DYNAMODB_TABLE_HISTORY || 'personaverse-user-history',
    personasTable: process.env.DYNAMODB_TABLE_PERSONAS || 'personaverse-personas'
  },
  bedrock: {
    modelId: process.env.BEDROCK_MODEL_ID || 'anthropic.claude-3-5-sonnet-20241022-v2:0',
    maxTokens: 8192,
    temperature: 0.7
  },
  transcribe: {
    languageCode: 'hi-IN', // Default to Hindi
    mediaFormat: 'webm',
    sampleRate: 48000
  },
  translate: {
    supportedLanguages: (process.env.SUPPORTED_LANGUAGES || 'en,hi,ta,te,bn,mr,gu,kn,ml,pa').split(',')
  }
};

// Feature flags
export const FEATURES = {
  voiceToText: process.env.ENABLE_VOICE_TO_TEXT === 'true',
  multilingual: process.env.ENABLE_MULTILINGUAL === 'true',
  historyStorage: process.env.ENABLE_HISTORY_STORAGE === 'true',
  bedrock: process.env.ENABLE_BEDROCK === 'true'
};

console.log('🔧 AWS Configuration Loaded:');
console.log(`  - Region: ${awsConfig.region}`);
console.log(`  - Bedrock Region: ${bedrockConfig.region}`);
console.log(`  - S3 Bucket: ${AWS_CONFIG.s3.bucketName}`);
console.log(`  - DynamoDB Tables: ${AWS_CONFIG.dynamodb.historyTable}, ${AWS_CONFIG.dynamodb.personasTable}`);
console.log(`  - Bedrock Model: ${AWS_CONFIG.bedrock.modelId}`);
console.log(`  - Features: Voice=${FEATURES.voiceToText}, Multilingual=${FEATURES.multilingual}, History=${FEATURES.historyStorage}, Bedrock=${FEATURES.bedrock}`);
