/**
 * Check S3 Bucket Configuration
 */

const { S3Client, HeadBucketCommand, CreateBucketCommand, ListObjectsV2Command } = require('@aws-sdk/client-s3');

// Load environment variables
require('dotenv').config();

const awsConfig = {
  region: process.env.AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  }
};

const bucketName = process.env.S3_BUCKET_NAME || 'personaverse-storage';

async function checkBucket() {
  const s3Client = new S3Client(awsConfig);
  
  try {
    console.log(`Checking S3 bucket: ${bucketName}`);
    console.log(`Region: ${awsConfig.region}`);
    
    // Check if bucket exists
    await s3Client.send(new HeadBucketCommand({ Bucket: bucketName }));
    console.log('✅ Bucket exists and is accessible');
    
    // List some objects
    const objects = await s3Client.send(new ListObjectsV2Command({ 
      Bucket: bucketName, 
      MaxKeys: 5 
    }));
    
    console.log(`📁 Bucket contains ${objects.KeyCount || 0} objects`);
    if (objects.Contents && objects.Contents.length > 0) {
      console.log('Recent objects:');
      objects.Contents.forEach(obj => {
        console.log(`  - ${obj.Key} (${obj.Size} bytes)`);
      });
    }
    
  } catch (error) {
    console.log('❌ Bucket check failed:');
    console.log(`Error: ${error.message}`);
    console.log(`Code: ${error.name}`);
    
    if (error.name === 'NoSuchBucket') {
      console.log('\n🔧 Bucket does not exist. Creating it...');
      try {
        await s3Client.send(new CreateBucketCommand({ 
          Bucket: bucketName,
          CreateBucketConfiguration: {
            LocationConstraint: awsConfig.region
          }
        }));
        console.log('✅ Bucket created successfully');
      } catch (createError) {
        console.log('❌ Failed to create bucket:');
        console.log(`Error: ${createError.message}`);
      }
    } else if (error.name === 'Forbidden') {
      console.log('\n🔧 Access denied. Check IAM permissions:');
      console.log('Required permissions: s3:HeadBucket, s3:ListBucket, s3:GetObject, s3:PutObject');
    }
  }
}

checkBucket();