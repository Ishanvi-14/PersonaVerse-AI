# 🎭 PersonaVerse AI
**Not content generation. Personality resurrection.**

PersonaVerse AI is a strategic utility for India's creator economy. It prevents "AI Slop" by preserving the **Digital Soul**—the specific wit, values, and regional nuance of a human creator—and scaling it across platforms with identity consistency.

---

## 🚀 The 2026 "Bharat" Stack
- **Core Reasoning:** Amazon Bedrock (Claude 4.5 Sonnet)
- **Style Extraction:** Amazon Nova Multimodal Embeddings (Text + Visual DNA)
- **Orchestration:** Multi-Agentic Flow (Identity → Synthesis → Critic Agents)
- **Memory:** Knowledge Bases for Bedrock (Hierarchical RAG)
- **Regional Logic:** Transcreation Engine (Linguistic Code-Switching & Cultural Mapping)

## 🏗️ Project Architecture
The system is built on a strictly serverless, agent-driven architecture:
- **Backend:** AWS Lambda, OpenSearch Serverless, DynamoDB.
- **Frontend:** React 19, Tailwind CSS, Framer Motion.
- **Identity Layer:** Managed via `.kiro` steering for absolute brand safety.

## 🏏 The "Sixer" Rule (Localization)
We move beyond translation. PersonaVerse uses **Transcreation** to ensure cultural metaphors match the audience. "Home runs" become "Sixers," and generic corporate advice becomes localized "Jugaad" wisdom.

## 🛠️ Quick Start
1. `cd backend && npm install` (Infrastructure)
2. `cd frontend && npm install` (UI Dashboard)
3. Check `docs/demo.md` for the 90-second "Mic Drop" pitch script.


---

## 🧠 Adaptive Intelligence Upgrade

PersonaVerse has evolved from a Digital Identity System to an **Adaptive Communication AI Platform**. The upgrade adds intelligence layers that analyze audience context, apply domain-specific strategies, score engagement quality, and learn from user interactions—all while maintaining the immutable core identity engine.

### What's New

**Audience Intelligence**
- Automatically infers language style (English, Hinglish, Regional)
- Detects literacy levels and communication preferences
- Adapts tone and format to audience needs

**Domain Strategy**
- Six domain-specific communication strategies (Education, Business, Finance, Health, Creator, Government)
- Bharat-centric explanation styles and engagement patterns
- Cultural transcreation at the domain level

**Engagement Scoring**
- Quality evaluation across 5 dimensions (Readability, Tone Match, Emoji Density, CTA, Language Alignment)
- Cultural resonance tracking (Hinglish fluency, metaphor usage)
- Self-improvement retry loop for low-quality outputs

**Memory & Learning**
- User profiles that evolve over time
- Domain usage tracking and preference adaptation
- Historical context for improved future generations

### Non-Destructive Architecture

The upgrade wraps the existing PersonaService without modifying it:
- ✅ Legacy `/generate` endpoint unchanged
- ✅ Existing frontend fully functional
- ✅ New `/generate-adaptive` endpoint for enhanced features
- ✅ Graceful degradation ensures core always works

### Running the Adaptive Server

**Backend:**
```bash
cd backend
npm install
npm run start:adaptive
```

Server runs on `http://localhost:3001`

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

Navigate to the **Adaptive Intelligence** tab to experience the upgrade.

### API Endpoints

**Legacy Generation (Unchanged):**
```
POST /api/generate
```

**Adaptive Generation (New):**
```
POST /api/generate-adaptive
{
  "userId": "user_123",
  "personaId": "founder",
  "platform": "linkedin",
  "prompt": "Share thoughts on quarterly goals",
  "domain": "business",
  "userMessage": "Targeting Tier-2 entrepreneurs"
}
```

**User Memory (New):**
```
GET /api/memory/:userId
```

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    Adaptive Intelligence                         │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Audience   │  │    Domain    │  │  Engagement  │         │
│  │    Engine    │  │    Engine    │  │    Scorer    │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│         │                 │                 │                   │
│         └─────────────────┼─────────────────┘                   │
│                           │                                     │
│                           ▼                                     │
│                  ┌──────────────────┐                          │
│                  │   Core_Engine    │                          │
│                  │  [IMMUTABLE]     │                          │
│                  └──────────────────┘                          │
│                           │                                     │
│                           ▼                                     │
│                  ┌──────────────────┐                          │
│                  │  Memory System   │                          │
│                  │  (User Learning) │                          │
│                  └──────────────────┘                          │
└─────────────────────────────────────────────────────────────────┘
```

### Configuration

All adaptive features are controlled via `/backend/config/adaptive.config.json`:

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

### Demo Prompts

Try these prompts in the Adaptive Intelligence dashboard:

**Business Domain:**
- "We need to work hard to achieve our quarterly goals" (Watch the Sixer Rule in action!)
- "Discuss the importance of teamwork in startups"

**Education Domain:**
- "Explain the importance of consistent study habits" (Audience: Tier-2 students)
- "Share tips for learning new technical skills"

**Creator Domain:**
- "Share tips for growing on social media"
- "Explain how to connect with your audience"

See `/docs/demo-prompts.md` for comprehensive examples across all domains.

### Documentation

- **Intelligence Engines:** `/backend/engines/README.md`
- **Memory System:** `/backend/memory/README.md`
- **API Reference:** `/backend/api/README.md`
- **Demo Script:** `/docs/demo.md` (includes adaptive showcase)
- **Demo Prompts:** `/docs/demo-prompts.md`

### Key Principles

**Credit Discipline:** All engines use mocks by default (`use_mocks: true`) to preserve AWS credits during development.

**Explicit Traceability:** Every intelligence decision is logged and visible in the response metadata.

**Observability:** Engagement scores, audience profiles, and domain strategies are fully transparent.

**Identity is Persistent:** User memory enables learning and evolution over time.

**Culture is Structural:** Bharat authenticity is baked into every intelligence layer, not added as an afterthought.

---
