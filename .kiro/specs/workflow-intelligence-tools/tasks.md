# Implementation Plan: Workflow Intelligence Tools

## Overview

This implementation plan breaks down the Workflow Intelligence Tools feature into discrete, actionable tasks. The feature adds three independent content workflow utilities (Content Simplifier, Calendar Generator, Gap Analyzer) to PersonaVerse AI using a completely isolated, non-destructive architecture.

Key principles:
- All code resides in `/backend/workflow_tools/` (isolated module)
- Uses Gemini API (not AWS Bedrock) for separation from existing persona engine
- New `/tools/*` API routes separate from existing `/api/*` routes
- New "Workflow Tools" frontend tab isolated from existing features
- Mock-first development for credit-saving during UI development
- TypeScript implementation throughout

## Tasks

- [x] 1. Backend module setup and configuration
  - Create `/backend/workflow_tools/` directory structure
  - Set up TypeScript configuration for the module
  - Create `types.ts` with all interfaces (SimplifierRequest, CalendarRequest, GapAnalyzerRequest, output types, error types)
  - Create environment configuration handler for GEMINI_API_KEY and MOCK_MODE
  - _Requirements: 16.1, 16.2, 16.3, 16.4, 17.1, 17.2_

- [ ] 2. Implement Gemini API client
  - [x] 2.1 Create `providers/gemini.client.ts` with GeminiClient class
    - Implement constructor with API key validation
    - Implement `generateStructured<T>()` method with timeout handling
    - Implement error mapping (401/403 → INVALID_API_KEY, 429 → RATE_LIMIT_EXCEEDED)
    - Add JSON schema validation for responses
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 9.1, 9.2, 9.3, 9.4, 13.1, 13.2, 13.3, 13.4_

  - [ ]* 2.2 Write property test for Gemini client error handling
    - **Property 9: Error Response Structure Invariant**
    - **Validates: Requirements 18.1, 18.2, 18.3, 18.4, 18.5, 18.6, 20.2**

  - [ ]* 2.3 Write property test for timeout enforcement
    - **Property 13: Timeout Enforcement**
    - **Validates: Requirements 5.5, 9.4, 13.4, 14.7, 16.5**

- [ ] 3. Implement mock provider system
  - [x] 3.1 Create `providers/mock.provider.ts` with MockProvider class
    - Implement `getSimplifierResponse()` with realistic Bharat-specific content
    - Implement `getCalendarResponse()` with 7-day plan, IST times, festival suggestions
    - Implement `getGapAnalysisResponse()` with theme analysis and diversity score
    - Add simulated delay (1000ms) to mimic API latency
    - _Requirements: 17.1, 17.2, 17.3, 17.4_

  - [ ]* 3.2 Write property test for mock mode schema consistency
    - **Property 7: Mock Mode Schema Consistency**
    - **Validates: Requirements 5.6, 9.5, 13.5, 17.1, 17.2**

  - [ ]* 3.3 Write unit tests for Hinglish content in mocks
    - Test that regional_version contains Hindi words (yaar, dekho, samjhe, bas, achha)
    - Test that WhatsApp version contains emojis
    - _Requirements: 3.3, 3.5, 4.3_

- [ ] 4. Implement input validators
  - [x] 4.1 Create `validators/input.validator.ts` with InputValidator class
    - Implement `validateSimplifierInput()` (50-10,000 chars, file size limits)
    - Implement `validateCalendarInput()` (niche max 200 chars, audience max 500 chars)
    - Implement `validateGapAnalyzerInput()` (3-50 posts array)
    - Return ValidationResult with error codes (INPUT_TOO_SHORT, INPUT_TOO_LONG, etc.)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 6.1, 6.2, 6.3, 6.4, 6.5, 10.1, 10.2, 10.3, 10.4, 10.5_

  - [ ]* 4.2 Write property test for input validation boundaries
    - **Property 1: Input Validation Boundaries**
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 6.1, 6.2, 6.3, 6.4, 6.5, 10.1, 10.2, 10.3, 10.4, 10.5**

- [ ] 5. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Implement Content Simplifier service
  - [x] 6.1 Create `services/simplifier.service.ts` with SimplifierService class
    - Implement constructor accepting GeminiClient, MockProvider, config
    - Implement `simplify()` method with mock mode check
    - Build Gemini prompt with Bharat cultural rules (metaphor mapping, Hinglish patterns)
    - Parse and validate response against SimplifierOutput schema
    - _Requirements: 1.1, 1.2, 1.3, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 4.1, 4.2, 4.3, 5.6_

  - [ ]* 6.2 Write property test for Simplifier output schema completeness
    - **Property 2: Simplifier Output Schema Completeness**
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6**

  - [ ]* 6.3 Write property test for Hinglish content presence
    - **Property 6: Hinglish Content Presence**
    - **Validates: Requirements 3.5, 4.3**

  - [ ]* 6.4 Write property test for emoji presence in WhatsApp version
    - **Property 15: Emoji Presence in WhatsApp Version**
    - **Validates: Requirements 3.3**

- [ ] 7. Implement Calendar Generator service
  - [x] 7.1 Create `services/calendar.service.ts` with CalendarService class
    - Implement constructor accepting GeminiClient, MockProvider, config
    - Implement `generateCalendar()` method with mock mode check
    - Build Gemini prompt with Indian festival awareness and IST timezone
    - Parse and validate response against CalendarOutput schema
    - _Requirements: 1.1, 1.2, 1.3, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 8.1, 8.2, 8.3, 9.5_

  - [ ]* 7.2 Write property test for Calendar output schema completeness
    - **Property 3: Calendar Output Schema Completeness**
    - **Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7**

  - [ ]* 7.3 Write property test for IST timezone consistency
    - **Property 5: IST Timezone Consistency**
    - **Validates: Requirements 7.6, 8.3**

- [ ] 8. Implement Gap Analyzer service
  - [x] 8.1 Create `services/gap-analyzer.service.ts` with GapAnalyzerService class
    - Implement constructor accepting GeminiClient, MockProvider, config
    - Implement `analyzeGaps()` method with mock mode check
    - Build Gemini prompt for pattern analysis and diversity scoring
    - Parse and validate response against GapAnalysisOutput schema
    - _Requirements: 1.1, 1.2, 1.3, 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 12.1, 12.2, 12.3, 13.5_

  - [ ]* 8.2 Write property test for Gap Analyzer output schema completeness
    - **Property 4: Gap Analyzer Output Schema Completeness**
    - **Validates: Requirements 11.1, 11.2, 11.3, 11.4, 11.5, 11.6**

- [ ] 9. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 10. Implement export system
  - [x] 10.1 Create `exporters/json.exporter.ts` with JSONExporter class
    - Implement `export()` method returning formatted JSON Buffer
    - Add metadata (tool name, generation timestamp)
    - Generate filename: `{tool-name}-{timestamp}.json`
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.6_

  - [x] 10.2 Create `exporters/txt.exporter.ts` with TXTExporter class
    - Implement `export()` method returning formatted text Buffer
    - Format output for readability (sections, bullet points)
    - Generate filename: `{tool-name}-{timestamp}.txt`
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.6_

  - [x] 10.3 Create `exporters/pdf.exporter.ts` with PDFExporter class
    - Implement `export()` method using PDF generation library (e.g., pdfkit)
    - Format output with proper typography and sections
    - Generate filename: `{tool-name}-{timestamp}.pdf`
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.6_

  - [ ]* 10.4 Write property test for export filename format
    - **Property 12: Export Filename Format**
    - **Validates: Requirements 14.1, 14.2, 14.3, 14.4**

  - [ ]* 10.5 Write unit tests for all three export formats
    - Test JSON export produces valid JSON
    - Test TXT export produces readable text
    - Test PDF export produces valid PDF buffer
    - _Requirements: 14.1, 14.2, 14.3_

- [x] 11. Implement API routes and request handlers
  - [x] 11.1 Create `index.ts` as main entry point
    - Initialize GeminiClient, MockProvider, and all services
    - Set up error handling middleware
    - Add request logging with metadata
    - _Requirements: 16.1, 16.2, 16.3, 16.4, 19.1, 19.2_

  - [x] 11.2 Implement POST /tools/simplify endpoint
    - Validate request body using InputValidator
    - Call SimplifierService.simplify()
    - Wrap response in ToolSuccessResponse format with metadata
    - Handle errors and return ToolErrorResponse format
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 2.4, 2.5, 20.1, 20.2, 20.3, 20.4, 20.5_

  - [x] 11.3 Implement POST /tools/calendar endpoint
    - Validate request body using InputValidator
    - Call CalendarService.generateCalendar()
    - Wrap response in ToolSuccessResponse format with metadata
    - Handle errors and return ToolErrorResponse format
    - _Requirements: 1.1, 1.2, 1.3, 6.1, 6.2, 6.3, 6.4, 6.5, 20.1, 20.2, 20.3, 20.4, 20.5_

  - [x] 11.4 Implement POST /tools/gap-analysis endpoint
    - Validate request body using InputValidator
    - Call GapAnalyzerService.analyzeGaps()
    - Wrap response in ToolSuccessResponse format with metadata
    - Handle errors and return ToolErrorResponse format
    - _Requirements: 1.1, 1.2, 1.3, 10.1, 10.2, 10.3, 10.4, 10.5, 20.1, 20.2, 20.3, 20.4, 20.5_

  - [x] 11.5 Implement GET /tools/export/:format endpoint
    - Parse format parameter (json, txt, pdf)
    - Decode base64 tool data from query parameter
    - Call appropriate exporter based on format
    - Set Content-Type and Content-Disposition headers
    - Return file buffer with 10-second timeout
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.6, 14.7_

  - [ ]* 11.6 Write property test for success response structure
    - **Property 10: Success Response Structure Invariant**
    - **Validates: Requirements 20.1, 20.3, 20.4**

  - [ ]* 11.7 Write property test for response schema validation
    - **Property 11: Response Schema Validation**
    - **Validates: Requirements 20.5**

  - [ ]* 11.8 Write property test for stateless request processing
    - **Property 8: Stateless Request Processing**
    - **Validates: Requirements 16.1, 16.2**

- [x] 12. Register routes in backend server
  - [x] 12.1 Update `backend/server.ts` to import workflow tools routes
    - Import workflow tools index module
    - Register `/tools/*` routes without modifying existing `/api/*` routes
    - Ensure non-destructive integration (no changes to existing route handlers)
    - _Requirements: 1.1, 1.2, 1.3, 19.1, 19.2_

- [ ] 13. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 14. Implement frontend service layer
  - [x] 14.1 Create `frontend/src/services/workflowTools.service.ts`
    - Implement `simplifyContent()` method calling POST /tools/simplify
    - Implement `generateCalendar()` method calling POST /tools/calendar
    - Implement `analyzeGaps()` method calling POST /tools/gap-analysis
    - Implement `exportResults()` method calling GET /tools/export/:format
    - Add error handling with user-friendly messages
    - Map error codes to readable messages
    - _Requirements: 1.1, 1.2, 1.3, 14.1, 14.2, 14.3, 18.1, 18.2, 18.3, 18.4, 18.5, 18.6_

  - [ ]* 14.2 Write property test for error message descriptiveness
    - **Property 14: Error Message Descriptiveness**
    - **Validates: Requirements 5.4, 9.3, 13.3**

- [x] 15. Implement frontend components
  - [x] 15.1 Create `frontend/src/features/workflow-tools/WorkflowToolsTab.tsx`
    - Create main container component with tool selection state
    - Display three tool cards (Simplifier, Calendar, Gap Analyzer)
    - Handle navigation between tools
    - Use Tailwind CSS for mobile-first styling
    - _Requirements: 1.1, 1.2, 1.3, 15.1, 15.2_

  - [x] 15.2 Create `frontend/src/features/workflow-tools/ContentSimplifier.tsx`
    - Add text input area (50-10,000 chars) with character counter
    - Add file upload option with 5MB limit indicator
    - Add optional audience context field (max 500 chars)
    - Add submit button with loading state
    - Display results in 5 sections (grade5, bullets, whatsapp, voice, hinglish)
    - Add export buttons (JSON, TXT, PDF)
    - _Requirements: 1.1, 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 14.1, 14.2, 14.3, 15.1, 15.2_

  - [x] 15.3 Create `frontend/src/features/workflow-tools/CalendarGenerator.tsx`
    - Add niche/topic input field (max 200 chars)
    - Add target audience description field (max 500 chars)
    - Add frequency selector dropdown (daily, 3x/week, weekly)
    - Add generate button with loading state
    - Display weekly plan in 7-day grid layout
    - Display platform strategy cards (Instagram, LinkedIn, YouTube)
    - Display best posting times with IST indicator
    - Display upcoming festivals if present
    - Add export buttons (JSON, TXT, PDF)
    - _Requirements: 1.1, 6.1, 6.2, 6.3, 6.4, 6.5, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 8.1, 8.2, 8.3, 14.1, 14.2, 14.3, 15.1, 15.2_

  - [x] 15.4 Create `frontend/src/features/workflow-tools/GapAnalyzer.tsx`
    - Add dynamic post entry list with add/remove buttons
    - Add file upload for multiple posts
    - Add optional niche context field (max 200 chars)
    - Add analyze button with loading state
    - Display diversity score gauge (0-100)
    - Display overused themes with color-coded percentages
    - Display missing topics as suggestion cards
    - Display fatigue risk indicator (low/medium/high with colors)
    - Display suggested angles as actionable items
    - Add re-analyze button
    - Add export buttons (JSON, TXT, PDF)
    - _Requirements: 1.1, 10.1, 10.2, 10.3, 10.4, 10.5, 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 12.1, 12.2, 12.3, 14.1, 14.2, 14.3, 15.1, 15.2_

  - [x] 15.5 Create `frontend/src/features/workflow-tools/ExportButtons.tsx`
    - Create reusable export button component
    - Support JSON, TXT, PDF formats
    - Show loading state during export generation
    - Trigger browser download on success
    - Display error toast on failure
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.6_

- [x] 16. Integrate Workflow Tools tab into main app
  - [x] 16.1 Update `frontend/src/App.tsx` to add "Workflow Tools" navigation tab
    - Add new tab to navigation without modifying existing tabs
    - Route to WorkflowToolsTab component
    - Ensure non-destructive integration (no changes to existing routes)
    - _Requirements: 1.1, 1.2, 1.3, 15.1, 15.2_

- [ ] 17. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 18. Create documentation
  - [ ] 18.1 Create `backend/workflow_tools/README.md`
    - Document module architecture and isolation principles
    - Document environment variables (GEMINI_API_KEY, MOCK_MODE)
    - Document API endpoints with request/response examples
    - Document error codes and handling
    - Document Bharat-specific cultural rules
    - _Requirements: 1.1, 1.2, 1.3, 4.1, 4.2, 4.3, 8.1, 8.2, 8.3_

  - [ ] 18.2 Update main `README.md` with Workflow Tools feature
    - Add section describing the three tools
    - Add setup instructions for Gemini API key
    - Add mock mode usage instructions
    - Add screenshots or usage examples
    - _Requirements: 1.1, 1.2, 1.3, 17.1, 17.2_

## Notes

- Tasks marked with `*` are optional property-based and unit tests that can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation and allow for user feedback
- Property tests validate universal correctness properties across all inputs
- Unit tests validate specific examples, edge cases, and error conditions
- All implementation follows non-destructive architecture principles
- Mock mode enables credit-saving development without Gemini API calls
- TypeScript is used throughout for type safety
- Bharat-first cultural awareness is embedded in all content generation
