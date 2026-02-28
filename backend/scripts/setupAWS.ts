/**
 * AWS Infrastructure Setup Script
 * 
 * Automates the creation of required AWS resources:
 * - S3 bucket for audio/history storage
 * - DynamoDB tables for user data
 * - IAM policies (guidance)
 * 
 * Run: npx ts-node scripts/setupAWS.ts
 */

import { S3Client, CreateBucketCommand, PutBucketCorsCommand, PutBucketEncryptionCommand } from '@aws-sdk/client-s3';
import { DynamoDBClient, CreateTableCommand, DescribeTableCommand } from '@aws-sdk/client-dynamodb';
import * as dotenv from 'dotenv';

dotenv.config();

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  }
});

const dynamoClient = new DynamoDBClient({
  region: process.env.AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  }
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'personaverse-storage';
const HISTORY_TABLE = process.env.DYNAMODB_TABLE_HISTORY || 'personaverse-user-history';
const PERSONAS_TABLE = process.env.DYNAMODB_TABLE_PERSONAS || 'personaverse-personas';

/**
 * Create S3 bucket with encryption and CORS
 */
async function createS3Bucket(): Promise<void> {
  try {
    console.log(`\n📦 Creating S3 bucket: ${BUCKET_NAME}...`);

    // Create bucket
    await s3Client.send(new CreateBucketCommand({
      Bucket: BUCKET_NAME,
      CreateBucketConfiguration: {
        LocationConstraint: process.env.AWS_REGION as any
      }
    }));

    console.log('✓ Bucket created');

    // Enable encryption
    await s3Client.send(new PutBucketEncryptionCommand({
      Bucket: BUCKET_NAME,
      ServerSideEncryptionConfiguration: {
        Rules: [{
          ApplyServerSideEncryptionByDefault: {
            SSEAlgorithm: 'AES256'
          }
        }]
      }
    }));

    console.log('✓ Encryption enabled');

    // Configure CORS
    await s3Client.send(new PutBucketCorsCommand({
      Bucket: BUCKET_NAME,
      CORSConfiguration: {
        CORSRules: [{
          AllowedHeaders: ['*'],
          AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE'],
          AllowedOrigins: ['*'],
          ExposeHeaders: ['ETag'],
          MaxAgeSeconds: 3000
        }]
      }
    }));

    console.log('✓ CORS configured');
    console.log(`✅ S3 bucket ${BUCKET_NAME} ready!`);

  } catch (error: any) {
    if (error.name === 'BucketAlreadyOwnedByYou') {
      console.log(`ℹ Bucket ${BUCKET_NAME} already exists`);
    } else {
      console.error('❌ Failed to create S3 bucket:', error.message);
      throw error;
    }
  }
}

/**
 * Create DynamoDB table for user history
 */
async function createHistoryTable(): Promise<void> {
  try {
    console.log(`\n📊 Creating DynamoDB table: ${HISTORY_TABLE}...`);

    await dynamoClient.send(new CreateTableCommand({
      TableName: HISTORY_TABLE,
      KeySchema: [
        { AttributeName: 'userId', KeyType: 'HASH' },
        { AttributeName: 'timestamp', KeyType: 'RANGE' }
      ],
      AttributeDefinitions: [
        { AttributeName: 'userId', AttributeType: 'S' },
        { AttributeName: 'timestamp', AttributeType: 'S' }
      ],
      BillingMode: 'PAY_PER_REQUEST', // On-demand pricing
      Tags: [
        { Key: 'Project', Value: 'PersonaVerse' },
        { Key: 'Environment', Value: 'Development' }
      ]
    }));

    // Wait for table to be active
    console.log('⏳ Waiting for table to be active...');
    await waitForTable(HISTORY_TABLE);

    console.log(`✅ DynamoDB table ${HISTORY_TABLE} ready!`);

  } catch (error: any) {
    if (error.name === 'ResourceInUseException') {
      console.log(`ℹ Table ${HISTORY_TABLE} already exists`);
    } else {
      console.error('❌ Failed to create history table:', error.message);
      throw error;
    }
  }
}

/**
 * Create DynamoDB table for user personas
 */
async function createPersonasTable(): Promise<void> {
  try {
    console.log(`\n📊 Creating DynamoDB table: ${PERSONAS_TABLE}...`);

    await dynamoClient.send(new CreateTableCommand({
      TableName: PERSONAS_TABLE,
      KeySchema: [
        { AttributeName: 'userId', KeyType: 'HASH' }
      ],
      AttributeDefinitions: [
        { AttributeName: 'userId', AttributeType: 'S' }
      ],
      BillingMode: 'PAY_PER_REQUEST',
      Tags: [
        { Key: 'Project', Value: 'PersonaVerse' },
        { Key: 'Environment', Value: 'Development' }
      ]
    }));

    console.log('⏳ Waiting for table to be active...');
    await waitForTable(PERSONAS_TABLE);

    console.log(`✅ DynamoDB table ${PERSONAS_TABLE} ready!`);

  } catch (error: any) {
    if (error.name === 'ResourceInUseException') {
      console.log(`ℹ Table ${PERSONAS_TABLE} already exists`);
    } else {
      console.error('❌ Failed to create personas table:', error.message);
      throw error;
    }
  }
}

/**
 * Wait for DynamoDB table to be active
 */
async function waitForTable(tableName: string, maxAttempts: number = 30): Promise<void> {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await dynamoClient.send(new DescribeTableCommand({ TableName: tableName }));
      if (response.Table?.TableStatus === 'ACTIVE') {
        return;
      }
    } catch (error) {
      // Table not ready yet
    }
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  throw new Error(`Table ${tableName} did not become active in time`);
}

/**
 * Print IAM policy guidance
 */
function printIAMGuidance(): void {
  console.log('\n🔐 IAM Policy Configuration');
  console.log('='.repeat(60));
  console.log('\nYour AWS user needs the following permissions:');
  console.log('\n1. S3 Permissions:');
  console.log('   - s3:CreateBucket');
  console.log('   - s3:PutObject');
  console.log('   - s3:GetObject');
  console.log('   - s3:DeleteObject');
  console.log('   - s3:PutBucketCors');
  console.log('   - s3:PutEncryptionConfiguration');
  
  console.log('\n2. DynamoDB Permissions:');
  console.log('   - dynamodb:CreateTable');
  console.log('   - dynamodb:PutItem');
  console.log('   - dynamodb:GetItem');
  console.log('   - dynamodb:Query');
  console.log('   - dynamodb:UpdateItem');
  
  console.log('\n3. Transcribe Permissions:');
  console.log('   - transcribe:StartTranscriptionJob');
  console.log('   - transcribe:GetTranscriptionJob');
  
  console.log('\n4. Translate Permissions:');
  console.log('   - translate:TranslateText');
  
  console.log('\n5. Comprehend Permissions:');
  console.log('   - comprehend:DetectDominantLanguage');
  console.log('   - comprehend:DetectSentiment');
  
  console.log('\n6. Bedrock Permissions:');
  console.log('   - bedrock:InvokeModel');
  console.log('   - bedrock:InvokeModelWithResponseStream');
  
  console.log('\n📝 To create an IAM policy:');
  console.log('1. Go to AWS Console → IAM → Policies → Create Policy');
  console.log('2. Use JSON editor and paste the policy from docs/aws-iam-policy.json');
  console.log('3. Attach the policy to your IAM user');
  console.log('='.repeat(60));
}

/**
 * Main setup function
 */
async function main(): Promise<void> {
  console.log('🚀 PersonaVerse AWS Infrastructure Setup');
  console.log('='.repeat(60));
  console.log(`Region: ${process.env.AWS_REGION || 'ap-south-1'}`);
  console.log(`S3 Bucket: ${BUCKET_NAME}`);
  console.log(`DynamoDB Tables: ${HISTORY_TABLE}, ${PERSONAS_TABLE}`);
  console.log('='.repeat(60));

  // Validate credentials
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    console.error('\n❌ AWS credentials not found!');
    console.error('Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in .env file');
    process.exit(1);
  }

  try {
    // Create resources
    await createS3Bucket();
    await createHistoryTable();
    await createPersonasTable();

    console.log('\n✅ AWS infrastructure setup complete!');
    console.log('\n📋 Next steps:');
    console.log('1. Enable Bedrock model access in AWS Console');
    console.log('2. Request access to Claude 4.5 Sonnet in Bedrock');
    console.log('3. Update .env with your AWS credentials');
    console.log('4. Run: npm run start:adaptive');
    
    printIAMGuidance();

  } catch (error) {
    console.error('\n❌ Setup failed:', error);
    process.exit(1);
  }
}

// Run setup
main();
