# PersonaVerse AI - Backend Skeleton

This directory contains the backend infrastructure and services for PersonaVerse AI, a Digital Identity System designed for authentic AI content generation with Bharat-first cultural alignment.

## 🏗️ Architecture Overview

```
backend/
├── infrastructure/          # AWS CDK infrastructure code
│   ├── persona-stack.ts    # Main CDK stack (S3, DynamoDB, API Gateway)
│   ├── app.ts             # CDK app entry point
│   └── package.json       # CDK dependencies
├── services/
│   └── persona-engine/    # Core persona processing service
│       ├── __mocks__/     # Mock implementations for development
│       └── personaService.ts # Main service orchestrator
└── shared/
    └── persona.types.ts   # Shared TypeScript types
```

## 🚀 Quick Start

### 1. Infrastructure Deployment

```bash
cd backend/infrastructure
npm install
npm run build
npm run deploy
```

This will create:
- **S3 Bucket**: For storing user uploads and media files
- **DynamoDB Table**: For persona state and metadata
- **API Gateway**: RESTful endpoints for frontend integration
- **Lambda Functions**: Placeholder functions (to be implemented)

### 2. Mock Persona Engine

The mock Persona Engine provides three pre-configured personas based on our demo script:

- **Founder**: Professional, strategic, cricket metaphors (20% Hinglish)
- **Educator**: Nurturing, explanatory, accessible (40% Hinglish)  
- **Casual**: Friendly, relatable, authentic (70% Hinglish)

### 3. API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/v1/personas` | List all personas |
| POST | `/v1/personas` | Create new persona |
| GET | `/v1/personas/{id}` | Get specific persona |
| PUT | `/v1/personas/{id}` | Update persona |
| DELETE | `/v1/personas/{id}` | Delete persona |
| POST | `/v1/generate` | Generate content |
| POST | `/v1/upload` | Upload media for identity extraction |
| POST | `/v1/mirror` | Simulate audience reaction |

## 🎭 Demo Script Integration

The mock implementation includes hard-coded responses that match our demo script:

### "Sixer Rule" Example (Founder + LinkedIn)
**Input**: "We need to work hard to achieve our quarterly goals"
**Output**: "Success in Bharat isn't about quarterly spreadsheets. It's about the daily hustle on the pitch. You don't win by playing safe; you win by hitting the Sixers others are too afraid to chase. Let's get to work."

### Casual Persona Example (WhatsApp)
**Input**: "quarterly results"
**Output**: "Arre, quarter results will come and go, but the mehnat must stay constant. 😉 One Jugaad at a time, we'll reach there. Stay strong, team! 💪"

## 🛡️ Credit Efficiency

- **Mock Provider**: All Bedrock API calls are mocked to save credits during development
- **Local Development**: No live AWS services required for testing
- **Structured Responses**: Consistent with real Bedrock response format for easy swapping

## 🔧 Key Features Implemented

### 1. Identity Extraction (Mock)
```typescript
const extraction = await personaService.extractIdentity({
  userId: 'user123',
  content: 'Sample LinkedIn posts...',
  mediaType: 'text'
});
```

### 2. Content Generation
```typescript
const response = await personaService.generateContent({
  userId: 'user123',
  personaId: 'founder',
  platform: 'linkedin',
  content: 'We need to work hard...'
});
```

### 3. Voice Drift Detection
Automatically flags generic AI language:
- "maximize synergy" → "Let's hustle together"
- Western metaphors → Cricket/local equivalents

### 4. Audience Simulation
Predicts reactions from different demographics:
- Tier-2 Student (Indore)
- Tier-1 VC (Bangalore)
- Tech Professional (Pune)

## 📊 Type Safety

All components use shared TypeScript types from `backend/shared/persona.types.ts`:

- `PersonaLayer`: Complete persona definition
- `GenerationRequest/Response`: Content generation flow
- `IdentityExtractionRequest/Response`: Identity extraction flow
- `ApiResponse<T>`: Consistent API response wrapper

## 🎯 Next Steps

1. **Replace Mocks**: Swap MockBedrockProvider with real AWS Bedrock integration
2. **Lambda Implementation**: Replace placeholder Lambda functions with PersonaService
3. **Database Integration**: Connect DynamoDB for persistent persona storage
4. **Authentication**: Add user authentication and authorization
5. **Monitoring**: Add CloudWatch logging and metrics

## 🔗 Integration Points

- **Frontend**: Uses shared types for type-safe API communication
- **Infrastructure**: CDK stack provides all necessary AWS resources
- **Steering Files**: Localization rules from `.kiro/steering/` directory
- **Demo Script**: Mock responses align with `docs/demo.md` scenarios

## 🚨 Important Notes

- This is a **development skeleton** optimized for the hackathon
- Mock responses are hard-coded based on demo script requirements
- Real Bedrock integration will require proper AWS credentials and permissions
- DynamoDB table uses PAY_PER_REQUEST billing for cost efficiency
- All resources have `DESTROY` removal policy for easy cleanup (change to `RETAIN` for production)

---

**Ready for Phase 4**: Frontend integration and UI development can now begin using the defined API contracts and shared types.