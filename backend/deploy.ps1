# PersonaVerse AI - Simple Deployment Script for Windows
# This script deploys the backend to AWS Lambda without needing AWS CLI

Write-Host "🚀 PersonaVerse AI - AWS Lambda Deployment" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""

# Check if serverless is installed
$serverlessInstalled = Get-Command serverless -ErrorAction SilentlyContinue
if (-not $serverlessInstalled) {
    Write-Host "❌ Serverless Framework not found. Installing..." -ForegroundColor Yellow
    npm install -g serverless
}

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Cyan
    npm install
}

# Install serverless plugins
Write-Host "🔌 Installing Serverless plugins..." -ForegroundColor Cyan
npm install --save-dev serverless-offline serverless-plugin-typescript

# Load environment variables from .env file
if (Test-Path ".env") {
    Write-Host "📝 Loading environment variables from .env..." -ForegroundColor Cyan
    Get-Content .env | ForEach-Object {
        if ($_ -match '^([^#][^=]+)=(.*)$') {
            $name = $matches[1].Trim()
            $value = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($name, $value, "Process")
        }
    }
}

# Deploy to AWS
Write-Host ""
Write-Host "🚀 Deploying to AWS Lambda..." -ForegroundColor Green
Write-Host "Region: ap-south-1" -ForegroundColor Cyan
Write-Host "Stage: prod" -ForegroundColor Cyan
Write-Host ""

serverless deploy --stage prod --region ap-south-1

Write-Host ""
Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Yellow
Write-Host "1. Copy the API Gateway URL from above"
Write-Host "2. Update frontend/.env.production with: VITE_API_URL=<your-api-url>"
Write-Host "3. Build and deploy frontend"
Write-Host ""
