# Requirements: Persona Engine & Bharat Core

We have established the **Digital Soul** of PersonaVerse AI. Phase 2 translates this into explicit, actionable system requirements using EARS-style statements.

---

## 1. Persona Extraction (The "Digital Soul" Capture)
- **WHEN** a user uploads historical text or media,  
  **THE SYSTEM SHALL** generate an "Identity Vector" using Amazon Nova Multimodal Embeddings capturing:
  - Sentence cadence, rhythm, and syntax
  - Hinglish/English ratio (default 70/30)
  - Sentiment bias and tone
- **WHILE** extracting identity,  
  **THE SYSTEM SHALL** identify and store at least three canonical values (core opinions) to prevent future contradictions.
- **THE SYSTEM SHALL** store visual style fingerprints via Rekognition if a user uploads a profile image.

## 2. Dynamic Persona Switching
- **WHEN** a user selects a Persona Layer (Founder/Educator/Casual),  
  **THE SYSTEM SHALL** re-initialize the Bedrock Agent with a layer-specific system prompt.
- **WHERE** a platform is specified (LinkedIn, WhatsApp, etc.),  
  **THE SYSTEM SHALL** adjust formatting, length, and style (bullet points vs. emojis).

## 3. Intent & Emotion Processing
- **WHEN** emotion sliders are adjusted,  
  **THE SYSTEM SHALL** modify prompt temperature, lexical choice, and urgency indicators.
- **WHEN** Bold risk profile is selected,  
  **THE SYSTEM SHALL** relax politeness filters while keeping Brand Safety intact.

## 4. Bharat Localization (The "Sixer Rule")
- **THE SYSTEM SHALL** replace Western metaphors with Indian equivalents as defined in `localization-authority.md`.
- **THE SYSTEM SHALL** maintain user-specified Hinglish ratio (70/30 by default) for every output.

## 5. Audience Mirroring (Simulation)
- **WHEN** content is generated,  
  **THE SYSTEM SHALL** perform a secondary Bedrock pass simulating audience reaction per demographic (Tier-2 Student, Tier-1 Investor, etc.).
- **THE SYSTEM SHALL** flag any content that fails the "Persona Recognition Test."

## 6. Voice Drift & Historical Alignment
- **THE SYSTEM SHALL** compare generated content against stored historical vectors and canonical values.
- **THE SYSTEM SHALL** reject or regenerate output if Voice Drift exceeds defined thresholds.

## 7. Platform & Delivery Constraints
- **THE SYSTEM SHALL** adapt output formatting for the selected channel:
  - LinkedIn: professional, structured, bullet points
  - WhatsApp: casual, emojis, Hinglish
  - Email: formal, neutral tone

## 8. Safety, Guardrails & Reliability
- **THE SYSTEM SHALL** enforce Bedrock Guardrails for PII masking and Brand Safety.
- **THE SYSTEM SHALL** log every generation with metadata:
  - Persona ID
  - Persona Alignment Score
  - Audience Simulation Result
- **THE SYSTEM SHALL** maintain stateless Lambda compliance (max 29s timeout per function).

