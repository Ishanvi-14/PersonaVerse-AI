# 🚀 Simple Docker Deployment to AWS

## Option 1: Deploy Locally (Easiest - Test First)

### Step 1: Install Docker Desktop
Download from: https://www.docker.com/products/docker-desktop

### Step 2: Test Locally
```powershell
# Build the Docker image
docker build -t personaverse-ai .

# Run it locally to test
docker run -p 8080:8080 --env-file backend/.env personaverse-ai

# Open browser: http://localhost:8080
```

If this works, your app is ready for AWS!

---

## Option 2: Deploy to AWS Elastic Beanstalk (Simplest AWS Option)

### Prerequisites:
- Install EB CLI: `pip install awsebcli`

### Step 1: Initialize
```powershell
eb init -p docker personaverse-ai --region ap-south-1
```

### Step 2: Create Environment
```powershell
eb create personaverse-prod
```

### Step 3: Deploy
```powershell
eb deploy
```

### Step 4: Open
```powershell
eb open
```

**Done! Your app is live!**

---

## Option 3: Manual AWS Console Deployment (No CLI needed)

### Step 1: Create Dockerfile.simple (Already exists as Dockerfile)

### Step 2: Go to AWS Elastic Beanstalk Console
https://ap-south-1.console.aws.amazon.com/elasticbeanstalk/home?region=ap-south-1

### Step 3: Create Application
1. Click "Create Application"
2. Application name: `personaverse-ai`
3. Platform: **Docker**
4. Platform branch: **Docker running on 64bit Amazon Linux 2023**
5. Upload your code: **Upload Dockerfile**
6. Click "Create application"

### Step 4: Configure Environment Variables
1. Go to Configuration → Software
2. Add environment variables from backend/.env
3. Save

**Your app will be live at**: `http://personaverse-prod.ap-south-1.elasticbeanstalk.com`

---

## 🎯 RECOMMENDED: Test Docker Locally First

Before deploying to AWS, let's make sure Docker works:

```powershell
# 1. Build
docker build -t personaverse-ai .

# 2. Run
docker run -p 8080:8080 ^
  -e AWS_REGION=ap-south-1 ^
  -e AWS_ACCESS_KEY_ID=AKIA27CKQTL32J6VKTUI ^
  -e AWS_SECRET_ACCESS_KEY=FSc5sXEczySXnCcdfaCqOWIpap/CS0GJlzwR7QU8kKqDykQ1tXMDUFmlUN7PmbTaE9pu3jsnYhRAoNxf ^
  -e S3_BUCKET_NAME=aib-3-bucket ^
  -e JWT_SECRET=personaverse-secret ^
  personaverse-ai

# 3. Test: http://localhost:8080
```

If this works, we can deploy to AWS!

---

## 💡 Which Option Should You Choose?

1. **Test Docker Locally First** ← Start here!
2. **If Docker works locally** → Deploy to Elastic Beanstalk (easiest)
3. **If you want auto-deploy from GitHub** → Fix App Runner (we can debug together)

Let me know which option you want to try!
