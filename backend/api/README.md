# API Routes Adapter

This directory implements the dual-endpoint API architecture that maintains backward compatibility while adding adaptive intelligence features.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    API Adapter                          │
│                  (Pure Routing Layer)                   │
└─────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│POST /generate│  │POST /generate│  │GET /memory/  │
│   (Legacy)   │  │  -adaptive   │  │   :userId    │
└──────────────┘  └──────────────┘  └──────────────┘
        │                 │                 │
        ▼                 ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Core_Engine  │  │   Adaptive   │  │    Memory    │
│ (Direct)     │  │   Wrapper    │  │   System     │
└──────────────┘  └──────────────┘  └──────────────┘
```

## Endpoints

### POST /api/generate (Legacy)

**Purpose:** Backward-compatible endpoint that routes directly to Core_Engine.

**Request:**
```json
{
  "userId": "user_123",
  "personaId": "founder",
  "platform": "linkedin",
  "content": "Share thoughts on quarterly goals",
  "emotionSliders": {
    "urgency": 7,
    "enthusiasm": 8,
    "formality": 7
  },
  "context": {
    "audienceType": "professionals",
    "contentType": "announcement"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "gen_1234567890_abc123",
    "generatedContent": "...",
    "personaAlignmentScore": 0.92,
    "metadata": {
      "generatedAt": "2024-01-15T10:30:00Z",
      "processingTimeMs": 850,
      "modelVersion": "mock-bedrock-v1.0"
    }
  }
}
```

**Behavior:**
- Routes directly to PersonaService.generateContent()
- No intelligence layer processing
- Maintains exact pre-upgrade behavior
- Used by legacy frontend

### POST /api/generate-adaptive (New)

**Purpose:** Enhanced endpoint with adaptive intelligence layers.

**Request:**
```json
{
  "userId": "user_123",
  "personaId": "founder",
  "platform": "linkedin",
  "prompt": "Share thoughts on quarterly goals",
  "domain": "business",
  "userMessage": "Targeting Tier-2 entrepreneurs"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "adaptive_1234567890_abc123",
    "generatedContent": "...",
    
    "audienceProfile": {
      "language_style": "hinglish",
      "literacy_level": "medium",
      "communication_tone": "motivational",
      "content_format_preference": "conversational",
      "inferred_at": "2024-01-15T10:30:00Z",
      "confidence": 0.89
    },
    
    "domainStrategy": {
      "domain": "business",
      "explanation_style": "direct",
      "trust_level": "medium",
      "engagement_style": "persuasive",
      "analyzed_at": "2024-01-15T10:30:00Z"
    },
    
    "engagementScore": {
      "overall_score": 85,
      "breakdown": {
        "readability": 90,
        "tone_match": 85,
        "emoji_density": 80,
        "call_to_action": 90,
        "language_alignment": 80
      },
      "improvement_suggestions": [],
      "scored_at": "2024-01-15T10:30:01Z"
    },
    
    "retryCount": 0,
    "improvementApplied": false,
    "personaAlignmentScore": 0.92,
    
    "metadata": {
      "generatedAt": "2024-01-15T10:30:01Z",
      "processingTimeMs": 1250,
      "modelVersion": "mock-bedrock-v1.0",
      "audienceAnalysisMs": 150,
      "domainAnalysisMs": 100,
      "generationMs": 800,
      "scoringMs": 200
    }
  }
}
```

**Behavior:**
- Routes to AdaptiveWrapper.generateContentAdaptive()
- Runs all intelligence layers
- Returns comprehensive analysis
- Updates user memory
- Used by adaptive frontend

### GET /api/memory/:userId

**Purpose:** Retrieve user's learning profile.

**Request:**
```
GET /api/memory/user_123
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "user_123",
    "preferred_language": "hinglish",
    "preferred_tone": "friendly",
    "domain_usage": {
      "education": 3,
      "business": 12,
      "finance": 5,
      "health": 1,
      "creator": 8,
      "government": 0
    },
    "previous_summaries": [
      {
        "timestamp": "2024-01-15T10:30:00Z",
        "domain": "business",
        "platform": "linkedin",
        "engagement_score": 85,
        "audience_profile": { ... }
      }
    ],
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

**Behavior:**
- Retrieves user profile from Memory System
- Creates default profile if doesn't exist
- Used by frontend to display learning progress

## Error Responses

All endpoints return consistent error format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": { ... }
  }
}
```

**Error Codes:**
- `INVALID_REQUEST` - Missing required fields
- `GENERATION_FAILED` - Core engine error
- `ADAPTIVE_GENERATION_FAILED` - Adaptive wrapper error
- `MEMORY_RETRIEVAL_FAILED` - Memory system error
- `AUDIENCE_ENGINE_FAILED` - Audience analysis error
- `DOMAIN_ENGINE_FAILED` - Domain analysis error
- `ENGAGEMENT_SCORER_FAILED` - Scoring error
- `INVALID_DOMAIN` - Unsupported domain
- `MAX_RETRIES_EXCEEDED` - Retry loop exhausted

## CORS Configuration

The API supports cross-origin requests for frontend access:

```typescript
res.header('Access-Control-Allow-Origin', '*');
res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
```

## Health Check

**Endpoint:** GET /health

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "service": "PersonaVerse Adaptive Intelligence"
}
```

## Non-Destructive Pattern

The API Adapter implements zero business logic:
- Pure routing to appropriate services
- No data transformation
- No decision making
- No state management

This ensures:
- Clear separation of concerns
- Easy testing and debugging
- Simple maintenance
- Backward compatibility

## Server Configuration

**Port:** 3001 (configurable via PORT env var)

**Startup:**
```bash
cd backend
npm run start:adaptive
```

**Development:**
```bash
cd backend
npm run dev:adaptive
```

## Request Validation

All endpoints validate required fields before routing:

**Legacy Generate:**
- userId (required)
- personaId (required)
- platform (required)
- content (required)

**Adaptive Generate:**
- userId (required)
- personaId (required)
- platform (required)
- prompt (required)
- domain (required)
- userMessage (optional)

**Memory Retrieval:**
- userId (required, from URL param)

## Performance

Typical response times (mock mode):
- Legacy Generate: ~850ms
- Adaptive Generate: ~1,250ms
- Memory Retrieval: ~5ms

## Testing

**Test Legacy Endpoint:**
```bash
curl -X POST http://localhost:3001/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test_user",
    "personaId": "founder",
    "platform": "linkedin",
    "content": "Test prompt"
  }'
```

**Test Adaptive Endpoint:**
```bash
curl -X POST http://localhost:3001/api/generate-adaptive \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test_user",
    "personaId": "founder",
    "platform": "linkedin",
    "prompt": "Test prompt",
    "domain": "business"
  }'
```

**Test Memory Endpoint:**
```bash
curl http://localhost:3001/api/memory/test_user
```

## Future Enhancements

Potential improvements:
1. Authentication and authorization
2. Rate limiting
3. Request/response caching
4. API versioning (v1, v2)
5. GraphQL endpoint
6. WebSocket support for real-time updates
7. Batch generation endpoint
8. Analytics and monitoring

## References

- Design Document: `.kiro/specs/adaptive-intelligence-upgrade/design.md`
- Requirements: `.kiro/specs/adaptive-intelligence-upgrade/requirements.md` (Section 8)
- Server Entry Point: `/backend/server.ts`
