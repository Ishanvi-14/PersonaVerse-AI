# PersonaVerse AWS Setup Guide

Complete guide for beginners to set up AWS services for PersonaVerse.

## 🎯 What You'll Set Up

1. **AWS Account** - Your cloud platform account
2. **IAM User** - Secure access credentials
3. **S3 Bucket** - Storage for audio files and history
4. **DynamoDB Tables** - User data and personas
5. **Bedrock Access** - AI model (Claude 4.5)
6. **Transcribe** - Voice-to-text service
7. **Translate** - Multilingual support

## 📋 Prerequisites

- AWS Account (free tier available)
- Credit/debit card for AWS verification
- Email address
- 30 minutes of time

---

## Step 1: Create AWS Account

1. Go to [aws.amazon.com](https://aws.amazon.com)
2. Click "Create an AWS Account"
3. Enter your email and choose account name
4. Verify email and set password
5. Choose "Personal" account type
6. Enter payment information (won't be charged immediately)
7. Verify phone number
8. Choose "Basic Support - Free" plan
9. Complete sign-up

✅ You now have an AWS account!

---

## Step 2: Create IAM User (Security Best Practice)

**Why?** Never use root account credentials in your code.

1. Sign in to [AWS Console](https://console.aws.amazon.com)
2. Search for "IAM" in the top search bar
3. Click "Users" in left sidebar
4. Click "Create user"
5. Enter username: `personaverse-dev`
6. Click "Next"
7. Select "Attach policies directly"
8. Search and select these policies:
   - `AmazonS3FullAccess`
   - `AmazonDynamoDBFullAccess`
   - `AmazonTranscribeFullAccess`
   - `TranslateFullAccess`
   - `ComprehendFullAccess`
   - `AmazonBedrockFullAccess` ⭐ Required for Claude 4.5
9. Click "Next" → "Create user"

### Get Access Keys

1. Click on the user you just created
2. Go to "Security credentials" tab
3. Scroll to "Access keys"
4. Click "Create access key"
5. Choose "Application running outside AWS"
6. Click "Next" → "Create access key"
7. **IMPORTANT:** Copy both:
   - Access key ID (starts with AKIA...)
   - Secret access key (long random string)
8. Save these securely - you'll need them!

✅ You now have secure credentials!

---

## Step 3: Enable Amazon Bedrock

**Why?** Bedrock provides Claude Sonnet 4.5 for AI generation.

**IMPORTANT UPDATE (2026):** AWS Bedrock now automatically enables models on first invocation. No manual model access request needed!

### Model Configuration
PersonaVerse uses **Claude Sonnet 4.5** via Global Cross-Region Inference Profile:
- Model ID: `global.anthropic.claude-sonnet-4-5-20250929-v1:0`
- This is an inference profile, not a direct model ID
- Automatically routes requests across AWS regions for higher throughput
- Works from any commercial AWS region including `ap-south-1`

### Why Inference Profiles?
AWS requires inference profiles for Claude 4.5+ models with on-demand throughput. Direct model IDs will fail with "on-demand throughput isn't supported" error.

**Note:** Bedrock is available in most commercial regions. The inference profile handles cross-region routing automatically.

✅ You can now use Claude 4.5!

---

## Step 4: Configure Your Project

1. Open your project's `backend/.env` file
2. Update with your credentials:

```env
# AWS Configuration
AWS_ACCESS_KEY_ID=AKIA... # Your access key from Step 2
AWS_SECRET_ACCESS_KEY=your_secret_key_here # Your secret key from Step 2
AWS_REGION=ap-south-1 # Your preferred region

# AWS Service Configuration
S3_BUCKET_NAME=personaverse-storage-YOUR_NAME # Make it unique!
DYNAMODB_TABLE_HISTORY=personaverse-user-history
DYNAMODB_TABLE_PERSONAS=personaverse-personas

# Bedrock configuration
BEDROCK_MODEL_ID=global.anthropic.claude-sonnet-4-5-20250929-v1:0
BEDROCK_REGION=us-east-1 # Bedrock region (different from main region)

# Feature Flags
ENABLE_VOICE_TO_TEXT=true
ENABLE_MULTILINGUAL=true
ENABLE_HISTORY_STORAGE=true
ENABLE_BEDROCK=true
```

3. Save the file

✅ Project configured!

---

## Step 5: Run AWS Setup Script

This script automatically creates your S3 bucket and DynamoDB tables.

```bash
cd backend
npm install
npx ts-node scripts/setupAWS.ts
```

You should see:
```
🚀 PersonaVerse AWS Infrastructure Setup
============================================================
📦 Creating S3 bucket: personaverse-storage...
✓ Bucket created
✓ Encryption enabled
✓ CORS configured
✅ S3 bucket personaverse-storage ready!

📊 Creating DynamoDB table: personaverse-user-history...
⏳ Waiting for table to be active...
✅ DynamoDB table personaverse-user-history ready!

📊 Creating DynamoDB table: personaverse-personas...
⏳ Waiting for table to be active...
✅ DynamoDB table personaverse-personas ready!

✅ AWS infrastructure setup complete!
```

✅ Infrastructure created!

---

## Step 6: Test Your Setup

Start the backend server:

```bash
npm run start:adaptive
```

You should see:
```
🔧 AWS Configuration Loaded:
  - Region: ap-south-1
  - Bedrock Region: us-east-1
  - S3 Bucket: personaverse-storage
  - DynamoDB Tables: personaverse-user-history, personaverse-personas
  - Bedrock Model: global.anthropic.claude-sonnet-4-5-20250929-v1:0
  - Features: Voice=true, Multilingual=true, History=true, Bedrock=true

✓ AWS Services loaded successfully
🚀 Server running on port 3001
```

Test the health endpoint:
```bash
curl http://localhost:3001/aws/health
```

Expected response:
```json
{
  "success": true,
  "features": {
    "voiceToText": true,
    "multilingual": true,
    "historyStorage": true,
    "bedrock": true
  },
  "timestamp": "2024-..."
}
```

✅ Everything works!

---

## 💰 Cost Estimation

### Free Tier (First 12 Months)
- **S3:** 5GB storage, 20,000 GET requests, 2,000 PUT requests/month
- **DynamoDB:** 25GB storage, 25 read/write capacity units
- **Transcribe:** 60 minutes/month
- **Translate:** 2 million characters/month
- **Comprehend:** 50,000 units/month

### After Free Tier (Approximate)
- **Transcribe:** $0.024/minute (~$50 for 2000 minutes)
- **Translate:** $15/million characters (~$30 for 2M chars)
- **Bedrock (Claude 4.5):** ~$0.003/1K tokens (~$100 for 33M tokens)
- **DynamoDB:** ~$1.25/GB (~$5 for 4GB)
- **S3:** ~$0.023/GB (~$10 for 400GB)

**Total:** ~$200/month for moderate usage

### Cost Optimization Tips
1. Use mock mode during development (`MOCK_MODE=true`)
2. Delete old audio files from S3 regularly
3. Set DynamoDB TTL for automatic data expiration
4. Use Bedrock's batch processing for multiple requests
5. Monitor usage in AWS Cost Explorer

---

## 🔒 Security Best Practices

### 1. Never Commit Credentials
```bash
# .gitignore should include:
.env
*.pem
*.key
```

### 2. Rotate Access Keys Regularly
- Every 90 days, create new keys
- Delete old keys after updating .env

### 3. Use IAM Roles for Production
- For EC2/Lambda deployment, use IAM roles instead of access keys
- Roles are more secure and don't require credential management

### 4. Enable MFA
- Add Multi-Factor Authentication to your AWS account
- Protects against unauthorized access

### 5. Monitor Usage
- Set up AWS Budgets to alert on unexpected costs
- Review CloudWatch logs regularly

---

## 🐛 Troubleshooting

### Error: "Access Denied"
**Solution:** Check IAM permissions. User needs policies listed in Step 2.

### Error: "Bucket already exists"
**Solution:** S3 bucket names are globally unique. Change `S3_BUCKET_NAME` in .env to something unique like `personaverse-storage-yourname123`.

### Error: "Model not found" or "on-demand throughput isn't supported"
**Solution:** 
1. Ensure you're using the inference profile ID: `global.anthropic.claude-sonnet-4-5-20250929-v1:0`
2. Verify `BEDROCK_REGION=us-east-1` in .env
3. Check IAM permissions include `bedrock:InvokeModel`
4. Models are auto-enabled on first invocation (no manual access request needed)

### Error: "Invalid credentials"
**Solution:**
1. Verify access keys in .env match AWS Console
2. Check for extra spaces or quotes in .env
3. Regenerate access keys if needed

### Error: "Rate limit exceeded"
**Solution:** You're making too many requests. Wait a few minutes or upgrade to higher limits.

---

## 📚 Additional Resources

- [AWS Free Tier](https://aws.amazon.com/free/)
- [Bedrock Documentation](https://docs.aws.amazon.com/bedrock/)
- [Transcribe Languages](https://docs.aws.amazon.com/transcribe/latest/dg/supported-languages.html)
- [AWS Cost Calculator](https://calculator.aws/)
- [PersonaVerse Documentation](../readme.md)

---

## 🎉 You're Ready!

Your PersonaVerse is now powered by AWS! You can:

✅ Transcribe voice in 10+ Indian languages
✅ Generate persona-consistent content with Claude 4.5
✅ Translate with cultural transcreation
✅ Store user history and track evolution
✅ Scale to production workloads

Start the frontend and backend, then test the features!

```bash
# Terminal 1 - Backend
cd backend
npm run start:adaptive

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Visit http://localhost:3000 and start creating!
