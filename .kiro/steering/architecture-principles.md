# Architecture Principles

1. **Statelessness:** All backend compute must be stateless Lambda functions.
2. **Managed > Custom:** Prefer AWS managed services (Bedrock Agents/Knowledge Bases).
3. **Credit Discipline:** Kiro must generate **Local Mocks** for Bedrock APIs during UI development.
4. **Explicit Traceability:** Multi-step identity decisions must be visible in the agent trace.
5. **Observability:** Persona alignment must be explainable after every generation.