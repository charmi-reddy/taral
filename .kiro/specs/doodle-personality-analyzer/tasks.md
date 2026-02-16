# Implementation Plan: Doodle Personality Analyzer

## Overview

This implementation plan breaks down the Doodle Personality Analyzer feature into discrete coding tasks. The feature will analyze drawing patterns from stroke data and generate fun personality insights displayed in an attractive modal interface.

## Tasks

- [x] 1. Create core types and interfaces
  - Create `lib/personality-analyzer/types.ts` with all TypeScript interfaces
  - Define `DrawingMetrics`, `PersonalityInsight`, `PersonalityType`, `AnalysisResult` types
  - Ensure compatibility with existing `Point` and `Stroke` types from `lib/types.ts`
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 3.1, 3.2, 3.3, 3.4_

- [ ] 2. Implement MetricsCalculator module
  - [ ] 2.1 Create `lib/personality-analyzer/metrics-calculator.ts`
    - Implement `calculateSpeed()` method for average drawing speed calculation
    - Implement `calculatePressureVariance()` for pressure analysis
    - Implement `calculateSmoothness()` for stroke smoothness measurement
    - Implement `calculateDirectionChanges()` for angle change detection
    - Implement `calculateBrushVariety()` for unique brush counting
    - Implement `calculateColorDiversity()` for unique color counting
    - Implement `calculateMetrics()` to orchestrate all calculations
    - Implement `aggregateMetrics()` for multi-doodle weighted averaging
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3_

  - [ ] 2.2 Write property test for speed calculation
    - **Property 1: Metric Calculation Correctness**
    - **Validates: Requirements 1.1**
    - Generate random stroke data with timestamps, verify speed = distance / time

  - [ ] 2.3 Write property test for pressure variance
    - **Property 2: Pressure Variance Calculation**
    - **Validates: Requirements 1.2**
    - Generate random pressure values, verify variance calculation

  - [ ] 2.4 Write property test for direction changes
    - **Property 3: Direction Change Detection**
    - **Validates: Requirements 1.3**
    - Generate strokes with known angles, verify direction change count

  - [ ] 2.5 Write property test for smoothness
    - **Property 4: Smoothness Calculation**
    - **Validates: Requirements 1.4**
    - Verify smoothness is inversely proportional to direction changes

  - [ ] 2.6 Write property test for multi-stroke aggregation
    - **Property 5: Multi-Stroke Aggregation**
    - **Validates: Requirements 1.5**
    - Generate multiple strokes, verify weighted average calculation

  - [ ] 2.7 Write property tests for brush and color counting
    - **Property 6: Brush Variety Counting**
    - **Property 7: Color Diversity Counting**
    - **Validates: Requirements 2.1, 2.2, 2.3**
    - Generate strokes with known brushes/colors, verify counts

  - [ ] 2.8 Write unit tests for edge cases
    - Test empty stroke data handling
    - Test single-point stroke handling
    - Test missing pressure data handling
    - Test missing timestamp data handling
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 3. Implement InsightGenerator module
  - [ ] 3.1 Create `lib/personality-analyzer/insight-generator.ts`
    - Define insight rules array with threshold-based conditions
    - Implement `generateInsights()` method to evaluate rules against metrics
    - Define personality type definitions with trait combinations
    - Implement `determinePersonalityType()` to match insights to types
    - Ensure minimum 3 insights are generated for valid analyses
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

  - [ ] 3.2 Write property test for threshold-based insight generation
    - **Property 8: Threshold-Based Insight Generation**
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.4**
    - Generate metrics exceeding thresholds, verify corresponding insights

  - [ ] 3.3 Write property test for personality type assignment
    - **Property 9: Personality Type Assignment**
    - **Validates: Requirements 3.5**
    - Generate insight combinations, verify personality type is assigned

  - [ ] 3.4 Write property test for minimum insight count
    - **Property 10: Minimum Insight Count**
    - **Validates: Requirements 3.6**
    - Generate valid doodles, verify at least 3 insights returned

- [ ] 4. Implement PersonalityAnalyzer orchestrator
  - [ ] 4.1 Create `lib/personality-analyzer/index.ts`
    - Implement `PersonalityAnalyzer` class
    - Implement `analyzeDoodle()` method for single doodle analysis
    - Implement `analyzeOverallProfile()` method for multi-doodle analysis
    - Implement data validation logic
    - Handle all error cases gracefully with appropriate error messages
    - _Requirements: 4.1, 4.4, 5.1, 5.2, 5.3, 5.4, 8.1, 8.2, 8.3, 8.4, 8.5_

  - [ ] 4.2 Write property test for single doodle isolation
    - **Property 11: Single Doodle Isolation**
    - **Validates: Requirements 4.1**
    - Generate multiple doodles, verify analysis uses only specified doodle

  - [ ] 4.3 Write property test for overall profile aggregation
    - **Property 13: Overall Profile Aggregation**
    - **Validates: Requirements 5.1, 5.2**
    - Generate doodle collection, verify weighted average calculation

  - [ ] 4.4 Write property test for dominant trait identification
    - **Property 14: Dominant Trait Identification**
    - **Validates: Requirements 5.3**
    - Generate multiple analyses, verify dominant traits identified

- [ ] 5. Checkpoint - Ensure core analyzer tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Create PersonalityAnalysisModal component
  - [ ] 6.1 Create `components/PersonalityAnalysisModal.tsx`
    - Implement modal component with glassmorphism styling
    - Add loading state display
    - Add error state display
    - Implement metrics visualization with progress bars/badges
    - Implement personality insights display with emphasis styling
    - Implement personality type badge display
    - Add close button and backdrop click handling
    - Use Tailwind CSS consistent with existing design system
    - _Requirements: 6.3, 6.4, 6.5, 7.1, 7.2, 7.3, 7.4, 7.5_

  - [ ] 6.2 Write property test for result display
    - **Property 12: Per-Doodle Result Display**
    - **Validates: Requirements 4.2, 4.3**
    - Generate analysis results, verify modal contains all metrics and insights

  - [ ] 6.3 Write property test for visual indicators
    - **Property 15: Visual Indicator Presence**
    - **Validates: Requirements 7.1**
    - Verify rendered modal contains progress bars/badges for metrics

  - [ ] 6.4 Write property test for personality type display
    - **Property 16: Personality Type Display**
    - **Validates: Requirements 7.3**
    - Verify modal contains personality type name and description

  - [ ] 6.5 Write unit tests for modal interactions
    - Test modal open/close behavior
    - Test backdrop click closes modal
    - Test close button functionality
    - Test loading state rendering
    - Test error state rendering
    - _Requirements: 6.2, 6.3, 6.5_

- [ ] 7. Integrate analyzer with HomeView
  - [ ] 7.1 Update `components/HomeView.tsx`
    - Add "Analyze Personality" button to the home page UI
    - Add state management for modal open/close
    - Add state for analysis results
    - Implement button click handler to trigger analysis
    - Retrieve current doodle data or all doodles from page manager
    - Call PersonalityAnalyzer with retrieved data
    - Pass analysis results to PersonalityAnalysisModal
    - Style button consistent with existing design (gradient, animations)
    - _Requirements: 6.1, 6.2_

  - [ ] 7.2 Write unit tests for HomeView integration
    - Test "Analyze Personality" button renders
    - Test button click opens modal
    - Test data retrieval from page manager
    - _Requirements: 6.1, 6.2_

- [ ] 8. Add data retrieval utilities
  - [ ] 8.1 Create helper functions to extract stroke data
    - Add utility to convert page data to `DoodleData` format
    - Add utility to retrieve all pages as `DoodleData[]`
    - Handle cases where stroke data may be incomplete
    - Ensure compatibility with existing page manager types
    - _Requirements: 4.1, 5.1_

- [ ] 9. Final checkpoint - End-to-end testing
  - Ensure all tests pass, ask the user if questions arise.
  - Manually verify button appears on home page
  - Manually verify modal displays correctly with sample data
  - Manually verify error handling for edge cases

## Notes

- All tasks are required for comprehensive implementation
- Each task references specific requirements for traceability
- Property tests use fast-check library with minimum 100 iterations
- All property tests include tags: **Feature: doodle-personality-analyzer, Property {N}: {property text}**
- UI components use Tailwind CSS and follow existing design patterns from HomeView
- The analyzer is purely client-side with no backend dependencies
- Focus on fun, engaging presentation over scientific accuracy

