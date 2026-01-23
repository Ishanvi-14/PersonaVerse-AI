# Kiro Enforcement Rules
- **Localization:** Before finalizing any generation logic, verify metaphors against `docs/localization.md`. 
- **Identity:** Reject any code that defaults to generic AI responses.
- **Credit-Saving:** ALWAYS prioritize using the `__mocks__/bedrockProvider.ts` for frontend integration tasks. 
- **Architecture:** Ensure all Lambdas follow the 29s timeout rule defined in `tech-stack.md`.