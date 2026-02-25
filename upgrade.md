# PersonaVerse-AI — Non‑Destructive Platform Upgrade Plan

> Purpose: Transform the existing project into an Adaptive Communication AI Platform while preserving every existing feature and behavior.
> Constraint: ZERO breaking changes. All upgrades must be wrapper‑based and additive.

---

## 1. Upgrade Philosophy (Must Follow)

This is NOT a refactor.
This is NOT a rewrite.
This is a layered augmentation.

### Core Rule

Existing code = **immutable core engine**
New code = **intelligence wrappers around it**

We do not modify internal generation logic. We only:

* intercept inputs
* enrich context
* post‑process outputs

---

## 2. Final Target Architecture

```
User Request
   ↓
API Adapter Layer (NEW)
   ↓
Audience Engine (NEW)
   ↓
Domain Strategy Engine (NEW)
   ↓
Adaptive Wrapper (NEW)
   ↓
Existing Generator (UNCHANGED)
   ↓
Engagement Scorer (NEW)
   ↓
Self‑Improvement Loop (NEW)
   ↓
Memory Writer (NEW)
   ↓
Response
```

The existing project becomes the "Content Engine".

---

## 3. Directory Additions (Do Not Modify Existing Folders)

Create the following folders:

```
/engines
   audience_engine.py
   domain_engine.py
   engagement_engine.py
   adaptive_wrapper.py

/memory
   user_memory.py
   user_profiles.json

/api
   routes_adapter.py

/frontend-next (new independent app)
```

---

## 4. Audience Engine

### Purpose

Infer how content should be communicated, not what content should be generated.

### Input

* topic
* optional user message

### Output JSON

```
{
  "language_style": "english | hinglish | regional",
  "literacy_level": "low | medium | high",
  "communication_tone": "formal | friendly | motivational | authoritative",
  "content_format_preference": "short | story | bullet | conversational"
}
```

### Rules

* Runs before generation
* Does not call existing generator
* Only produces metadata

---

## 5. Domain Strategy Engine

### Supported Domains

* education
* business
* finance
* health
* creator
* government

### Output JSON

```
{
  "domain": "...",
  "explanation_style": "analogy | direct | narrative",
  "trust_level": "low | medium | high",
  "engagement_style": "informative | persuasive | storytelling"
}
```

This is merged with audience profile before generation.

---

## 6. Adaptive Wrapper (Critical Component)

Create a wrapper function:

```
generate_content_adaptive(prompt, domain)
```

### Flow

1. Call audience engine
2. Call domain engine
3. Combine metadata into system context
4. Call original generator (unchanged)
5. Pass output to engagement scorer
6. Retry if needed
7. Save memory

### Important

The original generation function MUST remain untouched.
The wrapper only calls it.

---

## 7. Engagement Scoring Engine

Score range: 0–100

### Factors

* readability length
* tone match
* emoji density
* presence of CTA
* language alignment with audience

### Behavior

If score < 70:

* regenerate with improvement instruction
* max 2 retries

No edits to original generation function allowed.

---

## 8. Memory System

File: `/memory/user_profiles.json`

### Stored Fields

```
{
  user_id: {
    preferred_language: string,
    preferred_tone: string,
    domain_usage: {},
    previous_summaries: []
  }
}
```

### Rules

* Update only after successful generation
* File based only
* No database

---

## 9. API Adapter Layer

Create endpoints without moving logic.

### Endpoints

POST /generate
→ calls existing generator

POST /generate-adaptive
→ calls adaptive wrapper

GET /memory/{user}
→ returns stored profile

Routes must only call functions — no business logic inside routes.

---

## 10. Next.js Frontend Migration (Safe Method)

We DO NOT replace the old frontend.
We run a parallel frontend.

### Step 1 — Keep Current Frontend Working

No deletions allowed.

### Step 2 — Create new Next.js App

Location: `/frontend-next`

### Required Pages

#### Main Page

Panels:

1. Audience Insight Panel
2. Generated Content Panel
3. Engagement Score Panel

#### API Calls

Use fetch to call backend endpoints:

* /generate-adaptive
* /memory

### UI Rules

* Minimal UI
* No authentication
* No business logic in frontend
* Pure API consumption

---

## 11. Backward Compatibility Requirements

All original features must continue to work exactly the same:

* old generation endpoint
* old UI
* old prompts
* old outputs

Adaptive system must exist as optional enhancement, not replacement.

---

## 12. Testing Checklist

After implementation verify:

1. Old UI works
2. Old generation unchanged
3. Adaptive generation works
4. Retry loop triggers properly
5. Memory writes correctly
6. Next.js UI works independently

---

## 13. Definition of Success

The project now behaves as:

A communication intelligence system that adapts content based on audience, domain, and engagement feedback — while preserving every previous feature.

No feature loss = mandatory condition.
