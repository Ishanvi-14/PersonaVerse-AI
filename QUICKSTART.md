# 🚀 PersonaVerse - Quick Start Guide

Get PersonaVerse running in 5 minutes!

## ⚡ Super Quick Start (Without AWS)

Want to try it immediately? The project works with mock data!

```bash
# 1. Start Backend
cd backend
npm install
npm run start:adaptive

# 2. Start Frontend (new terminal)
cd frontend
npm install
npm run dev

# 3. Open Browser
# Visit: http://localhost:3000
```

✅ **You're ready!** Try the Content Editor, Adaptive Intelligence, and Workflow Tools tabs.

---

## 🌟 Full AWS-Powered Setup

Want voice-to-text, multilingual support, and user history? Follow these steps:

### Prerequisites
- Node.js 18+ installed
- AWS Account (free tier works!)
- 15 minutes

### Step 1: Get AWS Credentials

1. **Create AWS Account** (if you don't have one)
   - Go to [aws.amazon.com](https://aws.amazon.com)
   - Click "Create an AWS Account"
   - Follow the signup process

2. **Create IAM User**
   - Sign in to [AWS Console](https://console.aws.amazon.com)
   - Search for "IAM" → Users → Create user
   - Username: `personaverse-dev`
   - Attach policies:
     - `AmazonS3FullAccess`
     - `AmazonDynamoDBFullAccess`
     - `AmazonTranscribeFullAccess`
     - `TranslateFullAccess`
     - `ComprehendFullAccess`
   - Create access key → Save both keys!

3. **Enable Bedrock**
   - Search for "Bedrock" in AWS Console
   - Click "Model access" → "Manage model access"
   - Check "Claude Sonnet 4.5 v2"
   - Click "Request model access"
   - Wait 2-5 minutes for approval

### Step 2: Configure Project

Edit `backend/.env`:

```env
# Replace with your actual AWS credentials
AWS_ACCESS_KEY_ID=AKIA...your_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_REGION=ap-south-1

# Make bucket name unique (add your name)
S3_BUCKET_NAME=personaverse-storage-yourname

# Bedrock configuration
BEDROCK_REGION=us-east-1
BEDROCK_MODEL_ID=anthropic.claude-3-5-sonnet-20241022-v2:0

# Enable all features
ENABLE_VOICE_TO_TEXT=true
ENABLE_MULTILINGUAL=true
ENABLE_HISTORY_STORAGE=true
ENABLE_BEDROCK=true
```

### Step 3: Set Up AWS Infrastructure

```bash
cd backend
npm run setup:aws
```

This automatically creates:
- ✅ S3 bucket (encrypted)
- ✅ DynamoDB tables (2 tables)
- ✅ CORS configuration

### Step 4: Start Everything

```bash
# Terminal 1 - Backend
cd backend
npm run start:adaptive

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Step 5: Test AWS Features

1. Open http://localhost:3000
2. Click "🚀 AWS Powered" tab
3. Try:
   - **Voice Input**: Record audio in any Indian language
   - **Text Input**: Generate content with cultural transcreation
   - **History**: View your Digital Soul evolution

---

## 🎯 What Can You Do?

### 1. Voice-to-Text (10+ Languages)
- Record audio in Hindi, Tamil, Telugu, Bengali, etc.
- Automatic language detection
- Transcription with confidence scores

### 2. Cultural Transcreation
Try this prompt:
```
"We need to hit a home run this quarter"
```

Watch it transform to:
```
"हमें इस quarter में एक sixer मारना है yaar!"
```

### 3. Multi-Persona Content
- **Founder**: Professional, strategic, data-driven
- **Educator**: Clear, patient, example-rich
- **Friend**: Casual, supportive, relatable
- **Professional**: Formal, precise, authoritative
- **Creator**: Engaging, creative, trend-aware

### 4. Platform Adaptation
Same content, different platforms:
- **LinkedIn**: 150-300 words, professional tone
- **Twitter**: 240-280 chars, punchy
- **Instagram**: 100-150 words, visual language
- **WhatsApp**: 50-100 words, ultra-casual
- **Email**: 200-400 words, structured

### 5. Digital Soul Tracking
- See your language preferences evolve
- Track persona usage patterns
- Monitor engagement scores
- View Hinglish ratio changes

---

## 📱 Feature Tabs Explained

### 🚀 AWS Powered
- Voice input with transcription
- Text input with generation
- User history and profile
- Real AWS services

### ✍️ Content Editor
- Quick content generation
- Persona selection
- Platform targeting
- Real-time preview

### 🧠 Adaptive Intelligence
- Audience analysis
- Domain-specific strategies
- Engagement scoring
- Memory learning

### 🛠️ Workflow Tools
- Content simplifier
- Calendar generator
- Gap analyzer
- Export options

### 📤 Distribution
- Multi-platform publishing
- Format optimization
- Scheduling
- Analytics

### 🧬 DNA Analysis
- Linguistic fingerprints
- Cultural markers
- Persona visualization
- Identity metrics

---

## 💡 Demo Prompts to Try

### Business Domain
```
"Discuss the importance of teamwork in startups"
```
Expected: Professional tone with Indian business context

### Education Domain
```
"Explain the importance of consistent study habits"
```
Expected: Clear, patient explanation with relatable examples

### Creator Domain
```
"Share tips for growing on social media"
```
Expected: Engaging, trend-aware, actionable advice

### With Cultural Transcreation
```
"We need to work hard to achieve our quarterly goals"
```
Expected: "Home run" → "Sixer", Western → Indian metaphors

---

## 🐛 Common Issues & Fixes

### Backend won't start
```bash
# Check Node.js version (need 18+)
node --version

# Reinstall dependencies
cd backend
rm -rf node_modules package-lock.json
npm install
```

### Frontend won't start
```bash
# Reinstall dependencies
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### AWS Services not loading
1. Check `.env` file has correct credentials
2. Verify IAM permissions in AWS Console
3. Check Bedrock model access is approved
4. Ensure bucket name is unique

### "Bucket already exists" error
Change `S3_BUCKET_NAME` in `.env` to something unique:
```env
S3_BUCKET_NAME=personaverse-storage-yourname-12345
```

### Voice recording not working
- Allow microphone access in browser
- Use Chrome/Edge (best support)
- Check browser console for errors

---

## 💰 Cost Information

### Free Tier (First 12 Months)
- **Transcribe**: 60 minutes/month FREE
- **Translate**: 2 million characters/month FREE
- **Comprehend**: 50,000 units/month FREE
- **DynamoDB**: 25GB storage FREE
- **S3**: 5GB storage FREE
- **Bedrock**: Pay per use (~$0.003/1K tokens)

### Estimated Costs (After Free Tier)
For moderate usage (500 voice inputs, 1000 generations/month):
- **Total**: ~$50-100/month

### Cost Saving Tips
1. Use mock mode during development
2. Delete old audio files regularly
3. Set DynamoDB TTL for auto-cleanup
4. Monitor usage in AWS Cost Explorer
5. Set up billing alerts

---

## 📚 Documentation

- **Complete AWS Setup**: `docs/AWS_SETUP_GUIDE.md`
- **Integration Details**: `AWS_INTEGRATION_COMPLETE.md`
- **Architecture Plan**: `AWS_INTEGRATION_PLAN.md`
- **Main README**: `readme.md`
- **Demo Script**: `docs/demo.md`

---

## 🎓 Learning Path

### Beginner (Just Starting)
1. ✅ Run with mock data (no AWS needed)
2. ✅ Try different personas and platforms
3. ✅ Explore the "Sixer Rule" demo
4. ✅ Read `docs/AWS_SETUP_GUIDE.md`

### Intermediate (AWS Setup)
1. ✅ Create AWS account
2. ✅ Set up IAM user
3. ✅ Run `npm run setup:aws`
4. ✅ Test voice-to-text feature

### Advanced (Production Ready)
1. ✅ Deploy to AWS Lambda
2. ✅ Set up API Gateway
3. ✅ Configure CloudWatch monitoring
4. ✅ Implement CI/CD pipeline

---

## 🏆 Hackathon Demo Tips

### What to Show
1. **Voice Input**: Record in Hindi, show transcription
2. **Cultural Transcreation**: "Home run" → "Sixer" transformation
3. **Persona Consistency**: Same prompt, different personas
4. **Digital Soul**: Show user profile evolution
5. **Multi-Platform**: Same content adapted for LinkedIn vs WhatsApp

### Key Talking Points
- ✅ Identity as a system primitive (not just tone)
- ✅ Cultural transcreation (not translation)
- ✅ 10+ Indian languages supported
- ✅ AWS 2026 stack (Bedrock, Transcribe, Translate)
- ✅ Production-ready architecture

### Live Demo Script
```
1. "Let me show you voice input in Hindi..."
   [Record audio in Hindi]

2. "Watch how it transcribes and detects language..."
   [Show transcription result]

3. "Now let's generate content with the Founder persona..."
   [Show generated content]

4. "Notice the cultural transcreation - 'home run' became 'sixer'..."
   [Highlight metaphor mapping]

5. "And here's the persona alignment score..."
   [Show 85%+ alignment]

6. "Finally, let's see the user's Digital Soul evolution..."
   [Show history and profile]
```

---

## 🎉 You're All Set!

PersonaVerse is now running with:
- ✅ Voice-to-text in 10+ languages
- ✅ Cultural transcreation engine
- ✅ Multi-persona generation
- ✅ User history tracking
- ✅ AWS cloud integration

**Start creating authentic, scalable content that sounds like YOU!**

---

## 🆘 Need Help?

1. Check `docs/AWS_SETUP_GUIDE.md` for detailed AWS setup
2. Read `AWS_INTEGRATION_COMPLETE.md` for architecture details
3. Review error messages in terminal
4. Check AWS Console for service status
5. Verify credentials in `.env` file

**Built for AI for Bharat Hackathon - Track 2** 🇮🇳
