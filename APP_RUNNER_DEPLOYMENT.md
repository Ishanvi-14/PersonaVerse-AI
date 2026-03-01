# AWS App Runner Deployment Guide - PersonaVerse AI

## ⚡ 10-Minute Deployment (GitHub Source)

### Prerequisites
- ✅ GitHub repository: https://github.com/advika-khorgade/PersonaVerse_AIB
- ✅ AWS Account: 753923037943
- ✅ Region: ap-south-1

### Step 1: Push Latest Code to GitHub (1 minute)

```bash
git add .
git commit -m "feat: App Runner deployment ready"
git push origin main
```

### Step 2: Create App Runner Service (5 minutes)

1. **Open AWS App Runner Console**
   - Go to: https://ap-south-1.console.aws.amazon.com/apprunner/home?region=ap-south-1#/services

2. **Click "Create service"**

3. **Source Configuration**
   - Repository type: **Source code repository**
   - Click "Add new" under GitHub connection
   - Name: `personaverse-github`
   - Click "Install another" and authorize AWS Connector for GitHub
   - Select your repository: `advika-khorgade/PersonaVerse_AIB`
   - Branch: `main`
   - Click "Next"

4. **Build Configuration**
   - Deployment trigger: **Automatic**
   - Configuration file: **Use a configuration file**
   - Configuration file path: `apprunner.yaml`
   - Click "Next"

5. **Service Settings**
   - Service name: `personaverse-ai-prod`
   - Virtual CPU: **1 vCPU**
   - Memory: **2 GB**
   - Port: **8080**
   - Click "Next"

6. **Environment Variables** (CRITICAL)
   Add these one by one:
   
   ```
   AWS_REGION = ap-south-1
   AWS_ACCESS_KEY_ID = [your-access-key]
   AWS_SECRET_ACCESS_KEY = [your-secret-key]
   GROQ_API_KEY = [your-groq-key]
   JWT_SECRET = personaverse-secret-key-change-in-production
   S3_BUCKET_NAME = personaverse-storage
   DYNAMODB_TABLE_HISTORY = personaverse-user-history
   DYNAMODB_TABLE_PERSONAS = personaverse-personas
   DYNAMODB_TABLE_USERS = personaverse-users
   DYNAMODB_TABLE_CALENDAR = personaverse-calendar
   ENABLE_VOICE_TO_TEXT = true
   ENABLE_MULTILINGUAL = true
   ENABLE_HISTORY_STORAGE = true
   USE_GROQ = true
   NODE_ENV = production
   ```

7. **IAM Role** (Auto-created)
   - App Runner will create a service role automatically
   - This role needs permissions for:
     - DynamoDB (read/write)
     - Translate (translate text)
     - Transcribe (start/get jobs)
     - S3 (read/write)

8. **Review and Create**
   - Review all settings
   - Click "Create & deploy"

### Step 3: Wait for Deployment (3-5 minutes)

You'll see:
- ⏳ Creating service...
- ⏳ Building from source...
- ⏳ Deploying...
- ✅ Running

### Step 4: Get Your URL

Once deployed, you'll see:
```
Default domain: https://[random-id].ap-south-1.awsapprunner.com
```

**This is your live demo URL!**

### Step 5: Update IAM Permissions (1 minute)

The auto-created IAM role needs additional permissions:

1. Go to IAM Console: https://console.aws.amazon.com/iam/
2. Find role: `AppRunnerInstanceRole-personaverse-ai-prod`
3. Click "Add permissions" > "Attach policies"
4. Add these policies:
   - `AmazonDynamoDBFullAccess`
   - `TranslateFullAccess`
   - `AmazonTranscribeFullAccess`
   - `AmazonS3FullAccess`

### Step 6: Test Your Deployment

```bash
# Health check
curl https://[your-url].ap-south-1.awsapprunner.com/health

# Should return: {"status":"ok","timestamp":"..."}
```

## 🎯 Your Live URLs

- **Frontend**: https://[your-id].ap-south-1.awsapprunner.com
- **API**: https://[your-id].ap-south-1.awsapprunner.com/api
- **Health**: https://[your-id].ap-south-1.awsapprunner.com/health

## 💰 Cost Estimate

**AWS App Runner Pricing:**
- Compute: $0.007/vCPU-hour + $0.0008/GB-hour
- 1 vCPU + 2GB = ~$0.0086/hour
- **Monthly**: ~$6.20 (if running 24/7)
- **Free Tier**: 2,000 build minutes/month

**Total Monthly Cost**: $6-10

## 🔧 Troubleshooting

### Build Fails
- Check `apprunner.yaml` is in root directory
- Verify GitHub connection is active
- Check build logs in App Runner console

### App Doesn't Start
- Verify PORT environment variable is set to 8080
- Check environment variables are correct
- View application logs in App Runner console

### AWS Services Don't Work
- Verify IAM role has correct permissions
- Check AWS_REGION is set to ap-south-1
- Verify AWS credentials are correct

### Frontend Shows 404
- Ensure frontend build completed successfully
- Check that `public` folder contains built files
- Verify server.js serves static files from `public`

## 📊 Monitoring

### View Logs
1. Go to App Runner service
2. Click "Logs" tab
3. View application logs and deployment logs

### View Metrics
1. Click "Metrics" tab
2. Monitor:
   - Request count
   - Response time
   - CPU/Memory usage
   - Active instances

## 🚀 Update Deployment

Any push to `main` branch will automatically trigger a new deployment!

```bash
git add .
git commit -m "update: new feature"
git push origin main
```

App Runner will:
1. Pull latest code
2. Build application
3. Deploy new version
4. Zero-downtime rollout

## ✅ Verification Checklist

- [ ] Service status shows "Running"
- [ ] Health endpoint returns 200 OK
- [ ] Frontend loads at root URL
- [ ] Login/Register works
- [ ] Content generation works
- [ ] AWS Translate works
- [ ] History saves correctly

## 🎬 Demo Ready!

Your PersonaVerse AI is now live on AWS App Runner with:
- ✅ Public HTTPS URL
- ✅ Auto-scaling
- ✅ Zero-downtime deployments
- ✅ AWS services integrated
- ✅ Production-ready

**Share this URL with hackathon judges!**

## 📝 Alternative: Manual Docker Deployment

If GitHub source doesn't work, use ECR:

```bash
# Build and push to ECR
docker build -t personaverse-ai .
docker tag personaverse-ai:latest 753923037943.dkr.ecr.ap-south-1.amazonaws.com/personaverse-ai:latest
aws ecr get-login-password --region ap-south-1 | docker login --username AWS --password-stdin 753923037943.dkr.ecr.ap-south-1.amazonaws.com
docker push 753923037943.dkr.ecr.ap-south-1.amazonaws.com/personaverse-ai:latest

# Then in App Runner:
# - Source: Container registry
# - Provider: Amazon ECR
# - Image: personaverse-ai:latest
```

## 🏆 Success!

You now have a production-grade deployment on AWS App Runner!
