# Implementation Plan: AI Mode Toggle

## Overview

This implementation plan breaks down the AI Mode Toggle feature into incremental coding tasks. Each task builds on previous work, with property-based tests integrated throughout to validate correctness early. The plan follows a bottom-up approach: core functionality first, then UI components, then integration.

## Tasks

- [x] 1. Set up mode state management and theme system foundation
  - Create TypeScript types for DrawingMode, ModeState, ThemeConfig
  - Implement useModeToggle hook with state management
  - Create DOODLE_THEME and AI_THEME configuration objects
  - Implement ThemeProvider component with CSS custom property application
  - _Requirements: 1.1, 1.2, 1.5, 8.1, 8.2_

- [ ]* 1.1 Write property test for mode toggle bidirectionality
  - **Property 1: Mode Toggle Bidirectionality**
  - **Validates: Requirements 1.2**

- [ ]* 1.2 Write property test for mode persistence
  - **Property 4: Mode Persistence**
  - **Validates: Requirements 1.5**

- [ ] 2. Implement ModeToggleSwitch component
  - Create ModeToggleSwitch component with toggle button
  - Add keyboard accessibility (Tab, Enter, Space)
  - Add ARIA attributes for screen readers
  - Implement visual state indication for current mode
  - Add transition animation trigger
  - _Requirements: 1.1, 1.2, 10.1, 10.2, 10.3_

- [ ]* 2.1 Write unit tests for ModeToggleSwitch
  - Test keyboard navigation
  - Test ARIA announcements
  - Test visual state changes
  - _Requirements: 10.1, 10.2, 10.3_

- [ ] 3. Implement theme CSS and animations
  - Create CSS classes for theme-doodle and theme-ai
  - Define Doodle Mode styles (white background, Pacifico font, gradients)
  - Define AI Mode styles (black background, neon green, monospace fonts, glow effects)
  - Implement smooth transition animations (1000ms duration)
  - Add optional scanline effects for AI Mode
  - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 3.4, 3.6, 8.3_

- [ ]* 3.1 Write property test for transition performance
  - **Property 3: Mode Transition Performance**
  - **Validates: Requirements 1.4**

- [ ]* 3.2 Write unit tests for theme application
  - Test CSS custom properties are set correctly
  - Test theme classes are applied to body
  - Test transition animations trigger
  - _Requirements: 8.1, 8.3_

- [ ] 4. Implement Analysis Engine core
  - Create AnalysisEngine class with StrokeMetrics interface
  - Implement analyzeStroke method
  - Implement pattern detection (linear, circular, zigzag, random, complex)
  - Implement repetition score calculation
  - Implement drawing speed calculation
  - Implement symmetry detection
  - Implement complexity score calculation
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ]* 4.1 Write property test for pattern detection consistency
  - **Property 5: Pattern Detection Consistency**
  - **Validates: Requirements 4.1**

- [ ]* 4.2 Write property test for metric bounds
  - **Property 6: Repetition Score Bounds**
  - **Property 8: Symmetry Score Bounds**
  - **Property 9: Complexity Score Bounds**
  - **Validates: Requirements 4.2, 4.4, 4.5**

- [ ]* 4.3 Write property test for speed calculation
  - **Property 7: Speed Calculation Non-Negativity**
  - **Validates: Requirements 4.3**

- [ ]* 4.4 Write unit tests for Analysis Engine edge cases
  - Test with empty strokes
  - Test with single-point strokes
  - Test with strokes missing timestamps
  - Test NaN/Infinity handling
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 5. Integrate Analysis Engine with canvas
  - Modify canvas engine to trigger analysis on stroke completion in AI Mode
  - Ensure analysis doesn't block rendering
  - Implement performance monitoring (frame rate tracking)
  - Add throttling if performance degrades below 30 FPS
  - _Requirements: 4.7, 7.1_

- [ ]* 5.1 Write property test for analysis performance
  - **Property 10: Analysis Performance**
  - **Validates: Requirements 4.7**

- [ ]* 5.2 Write property test for frame rate maintenance
  - **Property 13: Frame Rate Maintenance**
  - **Validates: Requirements 7.1**

- [ ] 6. Checkpoint - Ensure core functionality works
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Implement Terminal Panel components
  - Create TerminalPanel component with header and content areas
  - Create MetricsDisplay component with metrics grid
  - Create MetricRow component with label, value, and cursor
  - Apply monospace fonts and neon green styling
  - Add glowing green indicators for active analysis
  - _Requirements: 4.6, 6.1, 6.2, 6.3_

- [ ]* 7.1 Write unit tests for Terminal Panel components
  - Test TerminalPanel renders correctly
  - Test MetricsDisplay formats metrics properly
  - Test monospace font application
  - Test glow effects are applied
  - _Requirements: 6.1, 6.2, 6.3_

- [ ]* 7.2 Write property test for terminal panel performance
  - **Property 12: Terminal Panel Performance**
  - **Validates: Requirements 6.4**

- [ ] 8. Implement Gemini API integration
  - Create GeminiService class with API key configuration
  - Implement getSuggestion method with prompt building
  - Implement getExercise method with prompt building
  - Implement RateLimiter class (10 requests per minute)
  - Implement response caching (5 min for suggestions, 10 min for exercises)
  - Add error handling for network failures and invalid responses
  - _Requirements: 5.2, 5.3, 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

- [ ]* 8.1 Write property test for rate limiting
  - **Property 16: Rate Limiting Enforcement**
  - **Validates: Requirements 9.5**

- [ ]* 8.2 Write property test for cache efficiency
  - **Property 17: Cache Hit Efficiency**
  - **Validates: Requirements 9.6**

- [ ]* 8.3 Write property test for API error handling
  - **Property 11: API Error Handling**
  - **Validates: Requirements 5.6**

- [ ]* 8.4 Write property test for API response parsing
  - **Property 15: API Response Parsing**
  - **Validates: Requirements 9.4**

- [ ]* 8.5 Write unit tests for Gemini API integration
  - Test with mocked API responses
  - Test error scenarios (timeout, invalid response, rate limit)
  - Test cache behavior
  - Test prompt building
  - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [ ] 9. Create AI suggestions display components
  - Create SuggestionsPanel component for displaying AI suggestions
  - Create ExercisesPanel component for displaying drawing exercises
  - Integrate with GeminiService to fetch and display content
  - Add loading states and error messages
  - Format content in terminal style with "> " prefix
  - _Requirements: 5.2, 5.3, 5.5, 5.6_

- [ ]* 9.1 Write unit tests for suggestion components
  - Test loading states
  - Test error message display
  - Test content formatting
  - _Requirements: 5.6_

- [ ] 10. Integrate all components into main application
  - Add ModeToggleSwitch to main canvas view
  - Conditionally render Doodle Mode features (personality quotes)
  - Conditionally render AI Mode features (Terminal Panels, metrics, suggestions)
  - Connect Analysis Engine to canvas stroke events
  - Connect GeminiService to analysis metrics updates
  - Apply ThemeProvider at application root
  - _Requirements: 2.4, 2.5, 4.6, 5.2, 5.3, 5.5_

- [ ]* 10.1 Write property test for state preservation
  - **Property 2: State Preservation During Mode Switching**
  - **Validates: Requirements 1.3, 7.2, 7.3**

- [ ]* 10.2 Write property test for theme application completeness
  - **Property 14: Theme Application Completeness**
  - **Validates: Requirements 8.4**

- [ ]* 10.3 Write integration tests
  - Test complete mode switching flow with drawing
  - Test AI analysis pipeline from stroke to display
  - Test theme changes affect all components
  - _Requirements: 1.2, 1.3, 4.1, 4.6, 8.4_

- [ ] 11. Add accessibility features and polish
  - Ensure sufficient color contrast in AI Mode (WCAG AA: 4.5:1)
  - Add visual loading indicator during mode transitions
  - Test keyboard navigation throughout application
  - Verify screen reader compatibility
  - Add focus indicators for all interactive elements
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ]* 11.1 Write unit tests for accessibility
  - Test color contrast ratios
  - Test keyboard navigation paths
  - Test ARIA attributes
  - Test focus indicators
  - _Requirements: 10.1, 10.2, 10.3, 10.4_

- [ ] 12. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- Integration tests validate end-to-end flows
- The Gemini API key should be configured via environment variables
- Performance monitoring should be implemented to ensure smooth operation
- All UI components should be responsive and work on mobile devices
