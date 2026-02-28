/**
 * Simple test to fetch existing transcript
 */

const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');

// Load environment variables
require('dotenv').config();

const awsConfig = {
  region: process.env.AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  }
};

async function testExistingTranscript() {
  const s3Client = new S3Client(awsConfig);
  const bucketName = 'personaverse-storage';
  
  // Try to fetch an existing transcript
  const transcriptKey = 'audio/transcripts/transcribe-b8cdd770-f368-49ea-a37a-2127dcb16170.json';
  
  try {
    console.log(`Fetching transcript: ${transcriptKey}`);
    
    const response = await s3Client.send(new GetObjectCommand({
      Bucket: bucketName,
      Key: transcriptKey
    }));

    const transcriptData = await response.Body?.transformToString();
    if (transcriptData) {
      const data = JSON.parse(transcriptData);
      console.log('\n✅ Successfully fetched transcript:');
      console.log(`Text: "${data.results?.transcripts?.[0]?.transcript || 'No text'}"`);
      console.log(`Language: ${data.results?.language_code || 'Unknown'}`);
      
      // Calculate confidence
      const items = data.results?.items || [];
      const confidences = items
        .filter(item => item.alternatives?.[0]?.confidence)
        .map(item => parseFloat(item.alternatives[0].confidence));
      
      const avgConfidence = confidences.length > 0
        ? confidences.reduce((a, b) => a + b, 0) / confidences.length
        : 0;
      
      console.log(`Confidence: ${avgConfidence.toFixed(3)}`);
    } else {
      console.log('❌ Empty transcript file');
    }
    
  } catch (error) {
    console.log('❌ Failed to fetch transcript:');
    console.log(`Error: ${error.message}`);
    console.log(`Code: ${error.name}`);
  }
}

testExistingTranscript();