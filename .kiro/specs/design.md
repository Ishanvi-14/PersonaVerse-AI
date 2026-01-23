# Technical Design: Persona Engine Architecture

Phase 2 maps the **requirements** into an explicit technical blueprint using AWS 2026 standards.

---

## 1. Multi-Agent Orchestration (Plan-and-Execute)
We use **Amazon Bedrock Agents** to implement a multi-step, traceable generation workflow:

1. **Identity Agent**  
   - Retrieves relevant past memories from the Knowledge Base (Hierarchical Chunking, OpenSearch Serverless).
   - Computes "Digital Soul" vectors from uploaded text/media.

2. **Synthesis Agent (Claude 4.5)**  
   - Merges Past Memory + Current Intent + Selected Persona Layer.
   - Generates first draft content.

3. **Critic Agent**  
   - Compares draft against:
     - `localization-authority.md`
     - Stored canonical values
     - Voice Drift thresholds
   - Flags non-compliance and proposes regeneration.

---

## 2. Data Flow

```text
User Upload (Text / Media)
        ↓
       S3
        ↓
Lambda (Ingestion & Nova Embedding)
        ↓
Bedrock Knowledge Base (OpenSearch Serverless)
        ↓
Bedrock Agent Orchestration (Identity → Synthesis → Critic)
        ↓
Bedrock Guardrails (PII / Brand Safety)
        ↓
Frontend / Platform (LinkedIn, WhatsApp, Email)
