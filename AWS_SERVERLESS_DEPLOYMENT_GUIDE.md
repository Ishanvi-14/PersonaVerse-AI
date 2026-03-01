# 🚀 AWS Serverless Deployment Guide - PersonaVerse AI

## Complete guide for deploying PersonaVerse AI to AWS using serverless architecture

---

## 📋 **Prerequisites**

### **1. AWS Account Setup**
- AWS Account with admin access
- AWS CLI installed and configured
- Node.js 20.x installed
- npm or yarn package manager

### **2. Install Required Tools**

```bash
# Install AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Install Serverless Framework
npm install -g serverless

# Install TypeScript
npm install -g typescript

# Verify installations
aws --version
serverless --version
node --version
```

### **3. Configure AWS Credentials**

```bash
# Configure AWS CLI
aws configure

# Enter your credentials:
AWS Access Key ID: YOUR_ACCESS_KEY
AWS Secret Access Key: YOUR_SECRET_KEY
Default region name: ap-south-1
Default output format: json

# Verify configuration
aws sts get-caller-identity
```

---

## 🔐 **Step 1: Store Secrets in AWS Parameter Store** (10 mins)

```bash
# Navigate to backend
cd backend

# Store JWT Secret
aws ssm put-parameter \
  --name "/personaverse/dev/jwt-secret" \
  --value "your-super-secret-jwt-key-change-in-production" \
  --type "SecureString" \
  --region ap-south-1

# Store Groq API Key
aws ssm put-parameter \
  --name "/personaverse/dev/groq-api-key" \
  --value "your-groq-api-key-here" \
  --type "SecureString" \
  --region ap-south-1

# Store Email credentials
aws ssm put-parameter \
  --name "/personaverse/dev/email-user" \
  --value "your-email@gmail.com" \
  --type "SecureString" \
  --region ap-south-1

aws ssm put-parameter \
  --name "/personaverse/dev/email-pass" \
  --value "your-app-password" \
  --type "SecureString" \
  --region ap-south-1

# Verify parameters
aws ssm get-parameters \
  --names "/personaverse/dev/jwt-secret" "/personaverse/dev/groq-api-key" \
  --with-decryption \
  --region ap-south-1
```

---

## 🛠️ **Step 2: Prepare Backend for Deployment** (15 mins)

```bash
# Install dependencies
cd backend
npm install

# Install Serverless plugins
npm install --save-dev serverless-offline serverless-plugin-typescript

# Build TypeScript
npm run build

# Test locally (optional)
serverless offline start
```

---

## 🚀 **Step 3: Deploy Backend to AWS Lambda** (30 mins)

```bash
# Deploy to dev stage
serverless deploy --stage dev --region ap-south-1

# Expected output:
# ✔ Service deployed to stack personaverse-ai-dev
# 
# endpoints:
#   GET - https://xxxxxxxxxx.execute-api.ap-south-1.amazonaws.com/dev/health
#   POST - https://xxxxxxxxxx.execute-api.ap-south-1.amazonaws.com/dev/api/auth/register
#   POST - https://xxxxxxxxxx.execute-api.ap-south-1.amazonaws.com/dev/api/auth/login
#   POST - https://xxxxxxxxxx.execute-api.ap-south-1.amazonaws.com/dev/api/generate
#   ... (all other endpoints)
# 
# functions:
#   health: personaverse-ai-dev-health
#   register: personaverse-ai-dev-register
#   login: personaverse-ai-dev-login
#   ... (all other functions)

# Save the API Gateway URL
export API_URL="https://xxxxxxxxxx.execute-api.ap-south-1.amazonaws.com/dev"
echo $API_URL
```

### **Verify Backend Deployment**

```bash
# Test health endpoint
curl $API_URL/health

# Expected response:
# {
#   "success": true,
#   "message": "PersonaVerse AI - Serverless Backend is running!",
#   "timestamp": "2026-03-01T10:00:00.000Z",
#   "stage": "dev",
#   "version": "1.0.0"
# }
```

---

## 🎨 **Step 4: Deploy Frontend to S3 + CloudFront** (30 mins)

### **4.1: Build Frontend**

```bash
cd ../frontend

# Update API URL in environment
echo "VITE_API_URL=$API_URL" > .env.production

# Build for production
npm run build

# Verify build
ls -la dist/
```

### **4.2: Deploy to S3**

```bash
# Get bucket name from serverless output
BUCKET_NAME="personaverse-ai-frontend-dev"

# Sync build to S3
aws s3 sync dist/ s3://$BUCKET_NAME/ \
  --delete \
  --region ap-south-1

# Verify upload
aws s3 ls s3://$BUCKET_NAME/
```

### **4.3: Get Frontend URL**

```bash
# Get S3 website URL
echo "http://$BUCKET_NAME.s3-website.ap-south-1.amazonaws.com"

# Test in browser
open "http://$BUCKET_NAME.s3-website.ap-south-1.amazonaws.com"
```

### **4.4: Setup CloudFront (Optional - for HTTPS and better performance)**

```bash
# Create CloudFront distribution
aws cloudfront create-distribution \
  --origin-domain-name "$BUCKET_NAME.s3-website.ap-south-1.amazonaws.com" \
  --default-root-object index.html \
  --region ap-south-1

# Get CloudFront URL from output
# Format: https://d111111abcdef8.cloudfront.net
```

---

## 🧪 **Step 5: Testing & Verification** (20 mins)

### **5.1: Test Backend APIs**

```bash
# Test registration
curl -X POST $API_URL/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "name": "Test User"
  }'

# Test login
curl -X POST $API_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!"
  }'

# Save the JWT token from response
export TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Test content generation
curl -X POST $API_URL/api/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "prompt": "Write a LinkedIn post about AI",
    "persona": "founder",
    "platform": "linkedin"
  }'
```

### **5.2: Test Frontend**

1. Open frontend URL in browser
2. Register a new account
3. Login
4. Generate content
5. Schedule calendar entry
6. Check history
7. Test voice input
8. Verify all features work

---

## 📊 **Step 6: Monitor & Debug** (10 mins)

### **View Lambda Logs**

```bash
# View logs for specific function
serverless logs -f generateContent --stage dev --tail

# View all logs
aws logs tail /aws/lambda/personaverse-ai-dev-generateContent --follow
```

### **Check DynamoDB Tables**

```bash
# List tables
aws dynamodb list-tables --region ap-south-1

# Scan users table
aws dynamodb scan \
  --table-name personaverse-ai-users-dev \
  --region ap-south-1
```

### **Monitor API Gateway**

```bash
# Get API Gateway metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/ApiGateway \
  --metric-name Count \
  --dimensions Name=ApiName,Value=personaverse-ai-dev \
  --start-time 2026-03-01T00:00:00Z \
  --end-time 2026-03-01T23:59:59Z \
  --period 3600 \
  --statistics Sum \
  --region ap-south-1
```

---

## 💰 **Cost Estimation**

### **Free Tier (First 12 months)**
- ✅ Lambda: 1M requests/month + 400,000 GB-seconds compute
- ✅ API Gateway: 1M requests/month
- ✅ DynamoDB: 25GB storage + 25 read/write capacity units
- ✅ S3: 5GB storage + 20,000 GET requests
- ✅ CloudFront: 1TB data transfer out

### **After Free Tier**
- Lambda: ~$0.20 per 1M requests
- API Gateway: ~$3.50 per 1M requests
- DynamoDB: ~$0.25 per GB/month
- S3: ~$0.023 per GB/month
- CloudFront: ~$0.085 per GB

**Estimated Monthly Cost:** $0-10 for moderate usage

---

## 🔄 **Update & Redeploy**

### **Update Backend**

```bash
cd backend

# Make code changes
# ...

# Rebuild
npm run build

# Deploy updates
serverless deploy --stage dev

# Deploy single function (faster)
serverless deploy function -f generateContent --stage dev
```

### **Update Frontend**

```bash
cd frontend

# Make code changes
# ...

# Rebuild
npm run build

# Sync to S3
aws s3 sync dist/ s3://personaverse-ai-frontend-dev/ --delete

# Invalidate CloudFront cache (if using CloudFront)
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*"
```

---

## 🗑️ **Cleanup / Remove Deployment**

```bash
# Remove all AWS resources
cd backend
serverless remove --stage dev

# Delete Parameter Store secrets
aws ssm delete-parameter --name "/personaverse/dev/jwt-secret"
aws ssm delete-parameter --name "/personaverse/dev/groq-api-key"
aws ssm delete-parameter --name "/personaverse/dev/email-user"
aws ssm delete-parameter --name "/personaverse/dev/email-pass"

# Empty and delete S3 buckets
aws s3 rm s3://personaverse-ai-frontend-dev --recursive
aws s3 rb s3://personaverse-ai-frontend-dev
```

---

## 🐛 **Common Issues & Solutions**

### **Issue 1: "Cannot find module" errors**

```bash
# Solution: Rebuild and redeploy
cd backend
rm -rf node_modules dist
npm install
npm run build
serverless deploy --stage dev
```

### **Issue 2: CORS errors in frontend**

```bash
# Solution: Update API Gateway CORS settings in serverless.yml
# Already configured in the provided serverless.yml
```

### **Issue 3: Lambda timeout errors**

```bash
# Solution: Increase timeout in serverless.yml
# For specific function:
functions:
  generateContent:
    timeout: 60  # Increase from 30 to 60 seconds
```

### **Issue 4: DynamoDB permission errors**

```bash
# Solution: Verify IAM role has correct permissions
# Check serverless.yml iam.role.statements section
```

### **Issue 5: Parameter Store access denied**

```bash
# Solution: Add SSM permissions to IAM role
# Already included in serverless.yml
```

---

## 🎯 **Production Deployment Checklist**

Before deploying to production:

- [ ] Change JWT_SECRET to strong random value
- [ ] Update all API keys in Parameter Store
- [ ] Enable CloudWatch alarms for errors
- [ ] Setup custom domain name
- [ ] Enable SSL/TLS (CloudFront handles this)
- [ ] Configure backup for DynamoDB tables
- [ ] Enable X-Ray tracing for debugging
- [ ] Set up CI/CD pipeline (GitHub Actions)
- [ ] Configure WAF rules for API Gateway
- [ ] Enable CloudTrail for audit logging

---

## 📚 **Additional Resources**

- [AWS Lambda Documentation](https://docs.aws.amazon.com/lambda/)
- [Serverless Framework Docs](https://www.serverless.com/framework/docs)
- [API Gateway Best Practices](https://docs.aws.amazon.com/apigateway/latest/developerguide/best-practices.html)
- [DynamoDB Best Practices](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/best-practices.html)

---

## 🏆 **Hackathon Demo Tips**

1. **Show the Architecture Diagram** - Explain serverless benefits
2. **Live API Testing** - Use Postman or curl to show endpoints
3. **CloudWatch Logs** - Show real-time logging
4. **Cost Optimization** - Explain pay-per-use model
5. **Scalability** - Mention auto-scaling capabilities
6. **AWS Services Integration** - Highlight Bedrock, Transcribe, Translate usage

---

## ✅ **Deployment Complete!**

Your PersonaVerse AI is now running on AWS serverless infrastructure:

- **Backend API**: https://your-api-gateway-url.amazonaws.com/dev
- **Frontend**: http://personaverse-ai-frontend-dev.s3-website.ap-south-1.amazonaws.com
- **CloudFront** (if configured): https://your-cloudfront-url.cloudfront.net

**Total Deployment Time:** 2-3 hours
**Monthly Cost:** $0-10 (mostly free tier)
**Scalability:** Automatic, handles millions of requests

🎉 **Ready for hackathon demo!**
