# Implementation Plan: Adaptive Intelligence Upgrade

## Overview

This plan implements the Adaptive Intelligence Upgrade for PersonaVerse AI using a non-destructive wrapper pattern. All new capabilities wrap the existing PersonaService without modifying it. The implementation uses TypeScript throughout, follows the existing project structure, and prioritizes mock-based development to preserve AWS credits during the hackathon.

## Tasks

- [x] 1. Foundation - Type Definitions and Configuration
  - [x] 1.1 Create adaptive type definitions file
    - Create `/backend/shared/adaptive.types.ts` with all interfaces from design
    - Include: AudienceProfile, DomainStrategy, EngagementScore, AdaptiveGenerationRequest/Response, UserProfile, AdaptiveConfig, AdaptiveError
    - _Requirements: 2.1-2.5, 3.1-3.5, 5.1-5.6, 7.2-7.5, 8.1-8.3_
  
  - [x] 1.2 Create configuration file
    - Create `/backend/config/adaptive.config.json` with feature flags and thresholds
    - Set `use_mocks: true` for development
    - _Requirements: 16.1, 16.2, 16.3_
  
  - [x] 1.3 Create directory structure
    - Create `/backend/engines/` directory for intelligence layers
    - Create `/backend/memory/` directory for user profiles
    - Create `/backend/api/` directory for routing adapter
    - _Requirements: 1.1_

- [x] 2. Intelligence Engines - Audience Analysis
  - [x] 2.1 Implement Audience Engine with mock support
    - Create `/backend/engines/audienceEngine.ts` with AudienceEngine class
    - Implement `analyzeAudience()` method with intelligent mock logic
    - Mock should detect Hinglish markers, formality, and regional context
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 13.1, 13.2_
  
  - [ ]* 2.2 Write property test for Audience Engine output validity
    - **Property 1: Audience Engine Output Validity**
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5**
  
  - [ ]* 2.3 Write property test for Hinglish pattern recognition
    - **Property 11: Hinglish Pattern Recognition**
    - **Validates: Requirements 13.1**

- [x] 3. Intelligence Engines - Domain Strategy
  - [x] 3.1 Implement Domain Engine with predefined strategies
    - Create `/backend/engines/domainEngine.ts` with DomainEngine class
    - Implement `analyzeDomain()` method with domain strategy mappings
    - Include all six domains: education, business, finance, health, creator, government
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 13.3_
  
  - [ ]* 3.2 Write property test for Domain Engine output validity
    - **Property 2: Domain Engine Output Validity**
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**
  
  - [ ]* 3.3 Write property test for Bharat metaphor application
    - **Property 13: Bharat Metaphor Application**
    - **Validates: Requirements 13.3**

- [x] 4. Intelligence Engines - Engagement Scoring
  - [x] 4.1 Implement Engagement Scorer with heuristic analysis
    - Create `/backend/engines/engagementEngine.ts` with EngagementScorer class
    - Implement `scoreContent()` method with five scoring dimensions
    - Implement heuristic scoring methods: readability, tone match, emoji density, CTA, language alignment
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 13.4_
  
  - [ ]* 4.2 Write property test for engagement score range and factors
    - **Property 4: Engagement Score Range and Factors**
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5, 5.6**
  
  - [ ]* 4.3 Write property test for cultural resonance scoring
    - **Property 14: Cultural Resonance Scoring**
    - **Validates: Requirements 13.4**

- [ ] 5. Checkpoint - Verify intelligence engines work independently
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Orchestration - Adaptive Wrapper
  - [x] 6.1 Implement Adaptive Wrapper core orchestration
    - Create `/backend/engines/adaptiveWrapper.ts` with AdaptiveWrapper class
    - Implement `generateContentAdaptive()` main orchestration method
    - Call intelligence engines in sequence: audience → domain → generation → scoring
    - Implement context enrichment with `enrichRequest()` method
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_
  
  - [x] 6.2 Implement retry loop with improvement prompts
    - Implement `retryWithImprovement()` method with bounded attempts
    - Implement `buildImprovementPrompt()` to include score and suggestions
    - Track retry count and best score across attempts
    - _Requirements: 6.1, 6.2, 6.3, 6.4_
  
  - [x] 6.3 Implement graceful degradation for all engines
    - Wrap each engine call in try-catch with default fallbacks
    - Implement `getDefaultAudienceProfile()`, `getDefaultDomainStrategy()`, `getDefaultEngagementScore()`
    - Log warnings but continue generation on failures
    - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.5_
  
  - [ ]* 6.4 Write property test for context enrichment preservation
    - **Property 3: Context Enrichment Preservation**
    - **Validates: Requirements 4.4**
  
  - [ ]* 6.5 Write property test for retry loop bounded attempts
    - **Property 5: Retry Loop Bounded Attempts**
    - **Validates: Requirements 6.2**
  
  - [ ]* 6.6 Write property test for retry prompt enrichment
    - **Property 6: Retry Prompt Enrichment**
    - **Validates: Requirements 6.4**
  
  - [ ]* 6.7 Write property tests for graceful degradation
    - **Property 15-19: Graceful Degradation Properties**
    - **Validates: Requirements 17.1, 17.2, 17.3, 17.4, 17.5**

- [x] 7. Memory System - User Profile Storage
  - [x] 7.1 Implement User Memory with file-based storage
    - Create `/backend/memory/userMemory.ts` with UserMemory class
    - Implement `getUserProfile()` with default profile creation
    - Implement `saveGeneration()` to update preferences and summaries
    - Implement `persistMemory()` for JSON file writes
    - Initialize empty `user_profiles.json` file
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_
  
  - [x] 7.2 Implement memory utility methods
    - Implement `getMostUsedDomain()` for analytics
    - Implement `getAverageEngagementScore()` for analytics
    - Implement `clearMemory()` for testing
    - _Requirements: 7.3, 7.4_
  
  - [ ]* 7.3 Write property test for memory profile completeness
    - **Property 7: Memory Profile Completeness**
    - **Validates: Requirements 7.2, 7.3, 7.4, 7.5**
  
  - [ ]* 7.4 Write property test for memory update round-trip
    - **Property 8: Memory Update Round-Trip**
    - **Validates: Requirements 7.6**
  
  - [ ]* 7.5 Write property test for memory failure isolation
    - **Property 9: Memory Failure Isolation**
    - **Validates: Requirements 7.7**

- [ ] 8. Checkpoint - Verify wrapper and memory integration
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. API Layer - Routes Adapter
  - [x] 9.1 Implement Routes Adapter with dual endpoints
    - Create `/backend/api/routesAdapter.ts` with RoutesAdapter class
    - Implement `handleLegacyGenerate()` routing to PersonaService directly
    - Implement `handleAdaptiveGenerate()` routing to AdaptiveWrapper
    - Implement `handleGetMemory()` for user profile retrieval
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_
  
  - [x] 9.2 Create Express app with CORS and health check
    - Implement `createApp()` function with Express setup
    - Add CORS middleware for frontend access
    - Add health check endpoint at `/health`
    - Mount routes at `/api` prefix
    - _Requirements: 8.1, 8.7_
  
  - [ ]* 9.3 Write property test for API memory round-trip
    - **Property 10: API Memory Round-Trip**
    - **Validates: Requirements 8.6**

- [x] 10. Backend Integration - Server Entry Point
  - [x] 10.1 Create backend server entry point
    - Create `/backend/server.ts` to initialize and start Express app
    - Load configuration from `adaptive.config.json`
    - Start server on port 3001 (avoid conflict with frontend)
    - Add graceful shutdown handling
    - _Requirements: 1.1, 8.7_
  
  - [x] 10.2 Update backend package.json scripts
    - Add `"start:adaptive"` script to run adaptive server
    - Add `"dev:adaptive"` script with nodemon for development
    - Ensure TypeScript compilation works
    - _Requirements: 1.1_

- [x] 11. Frontend - Adaptive Intelligence Dashboard
  - [x] 11.1 Create adaptive generation service
    - Create `/frontend/src/services/adaptiveService.ts`
    - Implement `generateAdaptive()` API call to `/api/generate-adaptive`
    - Implement `getUserMemory()` API call to `/api/memory/:userId`
    - Add TypeScript interfaces matching backend types
    - _Requirements: 9.1, 9.2, 9.3, 10.1_
  
  - [x] 11.2 Create Adaptive Intelligence Dashboard component
    - Create `/frontend/src/features/adaptive-intelligence/AdaptiveDashboard.tsx`
    - Add domain selector (6 domains)
    - Add platform selector (LinkedIn, WhatsApp, Twitter, Instagram)
    - Add prompt input textarea
    - Add optional user message input for audience context
    - _Requirements: 9.1, 9.2, 10.2, 10.3_
  
  - [x] 11.3 Create Intelligence Insights display component
    - Create `/frontend/src/features/adaptive-intelligence/IntelligenceInsights.tsx`
    - Display audience profile (language, literacy, tone, format)
    - Display domain strategy (explanation style, trust level, engagement style)
    - Display engagement score with breakdown visualization
    - Show retry count and improvement status
    - _Requirements: 10.4, 10.5, 10.6, 10.7_
  
  - [x] 11.4 Create User Memory display component
    - Create `/frontend/src/features/adaptive-intelligence/UserMemoryPanel.tsx`
    - Display preferred language and tone
    - Display domain usage chart (bar chart or pie chart)
    - Display recent generation history (last 10)
    - Show average engagement score
    - _Requirements: 11.1, 11.2, 11.3_
  
  - [x] 11.5 Wire Adaptive Dashboard into main App
    - Add route for `/adaptive` in App.tsx
    - Add navigation link to Adaptive Intelligence Dashboard
    - Ensure styling matches existing PersonaVerse design
    - _Requirements: 9.1, 10.1_

- [ ] 12. Checkpoint - Verify end-to-end adaptive flow
  - Ensure all tests pass, ask the user if questions arise.

- [x] 13. Demo Preparation - Mock Data and Examples
  - [x] 13.1 Create demo user profiles
    - Add 3 sample user profiles to `user_profiles.json`
    - Include varied domain usage patterns
    - Include Hinglish and regional preferences
    - _Requirements: 14.1, 14.2_
  
  - [x] 13.2 Create demo prompts for each domain
    - Create `/docs/demo-prompts.md` with example prompts
    - Include education, business, finance, health, creator, government examples
    - Include Hinglish and regional context examples
    - _Requirements: 14.1, 14.2, 14.3_
  
  - [x] 13.3 Update demo.md with adaptive intelligence showcase
    - Add section demonstrating audience inference
    - Add section demonstrating domain strategy application
    - Add section demonstrating engagement scoring and retry loop
    - Add section demonstrating memory learning
    - _Requirements: 14.1, 14.2, 14.3_

- [x] 14. Documentation - README and Architecture Docs
  - [x] 14.1 Create engines README
    - Create `/backend/engines/README.md` explaining wrapper architecture
    - Document each intelligence engine's purpose and interface
    - Include sequence diagrams from design
    - _Requirements: 1.1, 15.1_
  
  - [x] 14.2 Create memory README
    - Create `/backend/memory/README.md` explaining memory system
    - Document user profile schema and learning algorithm
    - Include file storage format
    - _Requirements: 15.1_
  
  - [x] 14.3 Create API README
    - Create `/backend/api/README.md` documenting all endpoints
    - Include request/response examples for legacy and adaptive endpoints
    - Document error codes and responses
    - _Requirements: 15.1_
  
  - [x] 14.4 Update main README with upgrade information
    - Add section on Adaptive Intelligence Upgrade
    - Document how to run adaptive server and frontend
    - Add architecture diagram showing wrapper pattern
    - _Requirements: 15.1, 15.2_

- [ ] 15. Testing - Integration and Validation
  - [ ]* 15.1 Write integration test for full adaptive flow
    - Test complete flow: request → audience → domain → generation → scoring → memory
    - Verify all metadata is present in response
    - Verify memory is updated correctly
    - _Requirements: 1.1, 4.5, 7.6, 8.6_
  
  - [ ]* 15.2 Write integration test for graceful degradation
    - Simulate each engine failure independently
    - Verify generation continues with defaults
    - Verify no exceptions propagate to caller
    - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.5_
  
  - [ ]* 15.3 Write integration test for retry loop
    - Simulate low engagement scores
    - Verify retry attempts are bounded
    - Verify best content is returned
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ] 16. Final Checkpoint - Demo Readiness Verification
  - Run full demo script from docs/demo.md
  - Verify all features work without AWS Bedrock (mocks only)
  - Verify frontend displays all intelligence insights correctly
  - Verify memory system persists across server restarts
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional property-based tests and can be skipped for faster MVP
- All backend code uses TypeScript for consistency with existing codebase
- Mock implementations preserve AWS credits during hackathon development
- Zero modifications to existing PersonaService or frontend components
- Feature flags allow disabling adaptive features if needed
- Graceful degradation ensures core functionality never breaks
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
