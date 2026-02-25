# Intelligence Layer Architecture

This directory contains the adaptive intelligence engines that wrap the immutable Core_Engine (PersonaService) to provide audience-aware, domain-specific, quality-scored content generation.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    Adaptive Wrapper                              │
│                  (Orchestration Layer)                           │
└───────────────────────┬─────────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   Audience   │ │    Domain    │ │  Engagement  │
│    Engine    │ │    Engine    │ │    Scorer    │
└──────────────┘ └──────────────┘ └──────────────┘
        │               │               │
        └───────────────┼───────────────┘
                        │
                        ▼
                ┌──────────────┐
                │ Core_Engine  │
                │ [IMMUTABLE]  │
                └──────────────┘
```

## Components

### 1. Adaptive Wrapper (`adaptiveWrapper.ts`)

**Purpose:** Orchestrates all intelligence engines around the immutable Core_Engine.

**Flow:**
1. Analyze Audience → infer communication preferences
2. Analyze Domain → apply domain-specific strategies
3. Enrich Context → merge intelligence into generation request
4. Generate Content → call Core_Engine with enriched context
5. Score Engagement → evaluate quality across 5 dimensions
6. Retry Loop → regenerate if score < threshold
7. Save Memory → update user profile for learning

**Key Methods:**
- `generateContentAdaptive()` - Main orchestration function
- `retryWithImprovement()` - Self-improvement loop
- `enrichRequest()` - Context enrichment with intelligence metadata

**Graceful Degradation:**
All engine failures are caught and default values are used, ensuring Core_Engine always receives valid input.

### 2. Audience Engine (`audienceEngine.ts`)

**Purpose:** Infers target audience communication preferences from prompt and context.

**Outputs:**
- `language_style`: english | hinglish | regional
- `literacy_level`: low | medium | high
- `communication_tone`: formal | friendly | motivational | authoritative
- `content_format_preference`: short | story | bullet | conversational
- `confidence`: 0.0-1.0

**Intelligence:**
- Detects Hinglish markers (yaar, arre, jugaad, etc.)
- Identifies formality indicators
- Recognizes regional/Tier-2 context
- Analyzes motivational and authoritative patterns

**Mock Implementation:**
Uses heuristic analysis of prompt text to detect patterns. Production version would use Claude 4.5 via Bedrock.

### 3. Domain Engine (`domainEngine.ts`)

**Purpose:** Provides domain-specific communication strategies for Bharat audiences.

**Supported Domains:**
- Education: analogy-based, high trust, informative
- Business: direct, medium trust, persuasive
- Finance: direct, high trust, informative
- Health: narrative, high trust, informative
- Creator: narrative, medium trust, storytelling
- Government: direct, high trust, informative

**Outputs:**
- `explanation_style`: analogy | direct | narrative
- `trust_level`: low | medium | high
- `engagement_style`: informative | persuasive | storytelling

**Cultural Context:**
All strategies are Bharat-centric, using cricket metaphors, jugaad philosophy, and regional communication patterns.

### 4. Engagement Scorer (`engagementEngine.ts`)

**Purpose:** Evaluates generated content quality across multiple dimensions.

**Scoring Dimensions:**
1. **Readability** (0-100): Sentence length appropriateness for literacy level
2. **Tone Match** (0-100): Alignment with audience's preferred tone
3. **Emoji Density** (0-100): Platform-appropriate emoji usage
4. **Call-to-Action** (0-100): Presence of clear engagement prompt
5. **Language Alignment** (0-100): Hinglish fluency and cultural markers

**Overall Score:** Average of all five dimensions

**Cultural Resonance:**
Special focus on Bharat-specific patterns:
- Hinglish marker detection (yaar, arre, jugaad)
- Cultural metaphor usage (cricket, chai, desi)
- Transcreation quality (not just translation)

**Retry Trigger:**
When overall_score < 70 (configurable), triggers retry loop with improvement suggestions.

## Non-Destructive Upgrade Pattern

**Core Principle:** Zero modifications to existing PersonaService code.

**Implementation:**
1. All intelligence engines are new files
2. Adaptive Wrapper wraps Core_Engine without modifying it
3. Legacy `/generate` endpoint routes directly to Core_Engine
4. New `/generate-adaptive` endpoint routes to Adaptive Wrapper
5. Graceful degradation ensures Core_Engine always works

**Benefits:**
- Complete backward compatibility
- Legacy frontend continues to work unchanged
- New features can be disabled via config flags
- Easy rollback if needed

## Configuration

All features are controlled via `/backend/config/adaptive.config.json`:

```json
{
  "features": {
    "enable_audience_engine": true,
    "enable_domain_engine": true,
    "enable_engagement_scoring": true,
    "enable_retry_loop": true,
    "enable_memory_system": true
  },
  "thresholds": {
    "engagement_score_threshold": 70,
    "max_retry_attempts": 2
  },
  "bedrock": {
    "use_mocks": true
  }
}
```

## Mock vs. Production

**Development (use_mocks: true):**
- All engines use heuristic analysis
- No AWS Bedrock API calls
- Preserves AWS credits (Credit Discipline)
- Fast iteration and testing

**Production (use_mocks: false):**
- Engines use Claude 4.5 via Bedrock Cross-Region Inference
- Structured JSON templates for all model interactions
- Bedrock Guardrails for PII masking and brand safety

## Observability

All intelligence decisions are logged and visible:
- Audience analysis results
- Domain strategy selection
- Engagement score breakdown
- Retry attempts and improvements
- Processing time per component

This implements "Explicit Traceability" - every decision is explainable.

## Performance

Typical processing times (mock mode):
- Audience Analysis: ~150ms
- Domain Analysis: ~100ms
- Content Generation: ~800ms
- Engagement Scoring: ~200ms
- **Total: ~1,250ms**

Production times will vary based on Bedrock latency.

## Error Handling

All engines implement graceful degradation:
- Audience Engine failure → use default Hinglish/medium/friendly profile
- Domain Engine failure → use default direct/medium/informative strategy
- Engagement Scorer failure → skip retry loop, return content
- Memory System failure → log error, continue generation

**Principle:** Intelligence layer failures never break core functionality.

## Testing

Run intelligence engines independently:
```bash
# Test audience engine
ts-node -e "import { AudienceEngine } from './audienceEngine'; const engine = new AudienceEngine({ useMocks: true }); engine.analyzeAudience('Yaar, we need to hustle').then(console.log);"

# Test domain engine
ts-node -e "import { DomainEngine } from './domainEngine'; const engine = new DomainEngine({ useMocks: true }); engine.analyzeDomain('business').then(console.log);"
```

## Future Enhancements

Potential improvements:
1. Real-time Bedrock integration (remove mocks)
2. A/B testing framework for strategies
3. Multi-language support beyond Hinglish
4. Advanced cultural resonance scoring
5. Persona-specific strategy overrides
6. Historical performance analytics

## References

- Design Document: `.kiro/specs/adaptive-intelligence-upgrade/design.md`
- Requirements: `.kiro/specs/adaptive-intelligence-upgrade/requirements.md`
- Steering Files: `.kiro/steering/localization-authority.md`, `world.md`
