#!/bin/bash

# PersonaVerse AI - Simple Deployment Script
# This script deploys the backend to AWS Lambda without needing AWS CLI

echo "🚀 PersonaVerse AI - AWS Lambda Deployment"
echo "=========================================="
echo ""

# Check if serverless is installed
if ! command -v serverless &> /dev/null; then
    echo "❌ Serverless Framework not found. Installing..."
    npm install -g serverless
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Install serverless plugins
echo "🔌 Installing Serverless plugins..."
npm install --save-dev serverless-offline serverless-plugin-typescript

# Set environment variables from .env file
if [ -f ".env" ]; then
    echo "📝 Loading environment variables from .env..."
    export $(cat .env | grep -v '^#' | xargs)
fi

# Deploy to AWS
echo ""
echo "🚀 Deploying to AWS Lambda..."
echo "Region: ap-south-1"
echo "Stage: prod"
echo ""

serverless deploy --stage prod --region ap-south-1

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📝 Next steps:"
echo "1. Copy the API Gateway URL from above"
echo "2. Update frontend/.env.production with: VITE_API_URL=<your-api-url>"
echo "3. Build and deploy frontend"
echo ""
