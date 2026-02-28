# AWS Bedrock Configuration Fix

## Issue Resolved
Fixed the "on-demand throughput isn't supported" error when invoking Claude Sonnet 4.5 on Amazon Bedrock.

## Root Cause
AWS Bedrock changed its API in 2026 to require **inference profiles** instead of direct model IDs for newer Claude models (4.5+). Direct model IDs like `anthropic.claude-sonnet-4-5-20250929-v1:0` no longer work with on-demand throughput.

## Solution Applied
Updated `backend/.env` to use the **Global Cross-Region Inference Profile**:

```env
BEDROCK_MODEL_ID=global.anthropic.claude-sonnet-4-5-20250929-v1:0
```

### Why This Works
- Global inference profiles automatically route requests across multiple AWS regions
- Provides higher throughput and resilience
- Works from `ap-south-1` (your region) and routes to commercial AWS regions
- No additional configuration needed

## Additional Fixes
1. Added null-check error handling in `orchestrator.ts` to prevent crashes if Bedrock fails
2. Improved error messages to help debug future issues

## IAM Permissions Required
Ensure your IAM user has these permissions:
- `bedrock:InvokeModel`
- `bedrock:InvokeModelWithResponseStream`

You already added `AmazonBedrockFullAccess` policy, so you're good to go.

## Testing
To test the fix:
1. Restart backend: `cd backend && npm start`
2. Open frontend: `http://localhost:3000`
3. Try generating content with the "Generate Content" feature
4. Check backend logs for successful Bedrock invocation

## Reference
- [AWS Bedrock Inference Profiles Documentation](https://docs.aws.amazon.com/bedrock/latest/userguide/inference-profiles-support.html)
- Global inference profile supports Claude 4.5 from all commercial regions
