# Implementation Plan: Doodle Canvas Application

## Overview

This implementation plan breaks down the doodle canvas application into incremental coding tasks. Each task builds on previous work, starting with core infrastructure, then implementing drawing functionality, and finally adding UI controls. The plan includes property-based tests to validate correctness properties from the design document.

## Tasks

- [x] 1. Set up Next.js project structure and core types
  - Initialize Next.js 14 project with TypeScript and Tailwind CSS
  - Create directory structure: app/, components/, hooks/, lib/
  - Define core TypeScript types in lib/types.ts (Point, Stroke, BrushType, BackgroundStyle, CanvasConfig, CanvasState)
  - Set up fast-check library for property-based testing
  - Configure test framework (Jest or Vitest)
  - _Requirements: All (foundation)_

- [x] 2. Implement canvas engine core functionality
  - [x] 2.1 Create CanvasEngine class in lib/canvas-engine.ts
    - Implement constructor with canvas element refs and DPR handling
    - Implement setupCanvas() method with high-DPI scaling
    - Implement clear() method to reset drawing layer
    - Add internal state for tracking current stroke
    - _Requirements: 1.1, 1.3, 10.1_
  
  - [x] 2.2 Write property test for high-DPI scaling
    - **Property 2: High-DPI Scaling Correctness**
    - **Validates: Requirements 1.3**
  
  - [x] 2.3 Implement resize handling
    - Add resize event listener in canvas hook
    - Implement canvas dimension adjustment on resize
    - Preserve existing strokes during resize
    - _Requirements: 1.2_
  
  - [x] 2.4 Write property test for responsive resizing
    - **Property 1: Canvas Responsive Resizing**
    - **Validates: Requirements 1.2**

- [ ] 3. Implement stroke processing and smoothing
  - [ ] 3.1 Create StrokeProcessor class in lib/stroke-processor.ts
    - Implement calculateVelocity() for velocity calculation between points
    - Implement calculateWidth() with velocity-based width adjustment
    - Implement smoothPoints() using quadratic Bezier curve algorithm
    - Implement snapToGrid() for pixel pen grid snapping
    - Add clear comments explaining Bezier math
    - _Requirements: 2.5, 3.1, 3.2, 3.3, 4.1, 4.2, 4.3, 4.4, 9.2_
  
  - [ ] 3.2 Write property test for velocity calculation
    - **Property 5: Velocity Calculation Consistency**
    - **Validates: Requirements 2.5**
  
  - [ ] 3.3 Write property test for velocity-width relationship
    - **Property 8: Velocity-Width Inverse Relationship**
    - **Validates: Requirements 4.1, 4.2, 4.3**
  
  - [ ] 3.4 Write property test for stroke width bounds
    - **Property 9: Stroke Width Bounds**
    - **Validates: Requirements 4.4**
  
  - [ ] 3.5 Write property test for pixel pen fixed width
    - **Property 10: Pixel Pen Fixed Width**
    - **Validates: Requirements 5.5**
  
  - [ ] 3.6 Write property test for grid snapping
    - **Property 17: Grid Snapping Behavior**
    - **Validates: Requirements 9.2**
  
  - [ ] 3.7 Write property test for no snapping when disabled
    - **Property 18: No Snapping When Disabled**
    - **Validates: Requirements 9.3**

- [ ] 4. Implement stroke rendering
  - [ ] 4.1 Add rendering methods to CanvasEngine
    - Implement renderStroke() dispatcher based on brush type
    - Implement renderSmoothStroke() using quadratic curves for ink/marker/pencil
    - Implement renderPixelStroke() using straight lines for pixel pen
    - Use requestAnimationFrame for rendering
    - Apply color and width from stroke data
    - _Requirements: 3.1, 3.2, 6.1, 7.1, 11.1_
  
  - [ ] 4.2 Write property test for smooth brush smoothing
    - **Property 6: Smooth Brush Stroke Smoothing**
    - **Validates: Requirements 3.1**
  
  - [ ] 4.3 Write property test for pixel pen no smoothing
    - **Property 7: Pixel Pen No Smoothing**
    - **Validates: Requirements 3.2**
  
  - [ ] 4.4 Write property test for color application
    - **Property 11: Color Application**
    - **Validates: Requirements 6.1**
  
  - [ ] 4.5 Write property test for brush size application
    - **Property 13: Brush Size Application**
    - **Validates: Requirements 7.1**

- [ ] 5. Checkpoint - Ensure core rendering works
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Implement background rendering
  - [ ] 6.1 Create BackgroundRenderer class in lib/background-renderer.ts
    - Implement renderPlain() for solid color background
    - Implement renderRuled() for horizontal ruled lines
    - Implement renderDotted() for dot grid pattern
    - Implement renderGrid() for pixel grid squares
    - Add configurable spacing/size parameters
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_
  
  - [ ] 6.2 Write unit tests for background patterns
    - Test each background style renders correctly
    - Test pattern spacing and dimensions
    - _Requirements: 8.3, 8.4, 8.5, 8.6_
  
  - [ ] 6.3 Add updateBackground() method to CanvasEngine
    - Call appropriate BackgroundRenderer method based on style
    - Render to background canvas layer
    - _Requirements: 8.2_
  
  - [ ] 6.4 Write property test for background style rendering
    - **Property 15: Background Style Rendering**
    - **Validates: Requirements 8.2**

- [ ] 7. Implement useCanvas hook
  - [ ] 7.1 Create useCanvas hook in hooks/useCanvas.ts
    - Set up canvas refs for drawing and background layers
    - Initialize state for config (color, brushType, brushSize, backgroundStyle)
    - Initialize ref for drawing state (isDrawing, currentStroke, strokes)
    - Create CanvasEngine instance on mount
    - _Requirements: 1.4, 1.5_
  
  - [ ] 7.2 Implement pointer event handlers
    - Implement handlePointerDown to start new stroke
    - Implement handlePointerMove to add points and render incrementally
    - Implement handlePointerUp to complete stroke
    - Attach event listeners directly to canvas (not through React props)
    - Calculate velocity and apply snap-to-grid when appropriate
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 9.1, 9.2, 9.3_
  
  - [ ] 7.3 Write property test for stroke lifecycle
    - **Property 3: Stroke Lifecycle Completeness**
    - **Validates: Requirements 2.1, 2.2, 2.3**
  
  - [ ] 7.4 Write property test for multi-device input
    - **Property 4: Multi-Device Input Support**
    - **Validates: Requirements 2.4**
  
  - [ ] 7.5 Write property test for snap-to-grid activation
    - **Property 16: Snap-to-Grid Activation**
    - **Validates: Requirements 9.1**
  
  - [ ] 7.6 Implement configuration setter methods
    - Implement setColor, setBrushType, setBrushSize, setBackgroundStyle
    - Update config state (triggers UI re-render)
    - Update ref state (used for next stroke)
    - Call updateBackground when background style changes
    - Validate and clamp brush size to valid range (1-50)
    - _Requirements: 6.2, 7.2, 8.2, 12.6_
  
  - [ ] 7.7 Write property test for color change isolation
    - **Property 12: Color Change Isolation**
    - **Validates: Requirements 6.2, 6.3**
  
  - [ ] 7.8 Write property test for brush size change isolation
    - **Property 14: Brush Size Change Isolation**
    - **Validates: Requirements 7.2, 7.3**
  
  - [ ] 7.9 Implement clearCanvas method
    - Clear drawing layer
    - Reset stroke history
    - Preserve background style
    - _Requirements: 10.1, 10.2_
  
  - [ ] 7.10 Write property test for clear canvas
    - **Property 19: Clear Canvas Removes Strokes**
    - **Validates: Requirements 10.1**
  
  - [ ] 7.11 Write property test for clear preserves background
    - **Property 20: Clear Preserves Background**
    - **Validates: Requirements 10.2**
  
  - [ ] 7.12 Implement resize handling
    - Add window resize listener
    - Call setupCanvas on resize
    - Redraw all strokes and background
    - _Requirements: 1.2_

- [ ] 8. Checkpoint - Ensure hook integration works
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Implement Canvas component
  - [ ] 9.1 Create Canvas component in components/Canvas.tsx
    - Use useCanvas hook
    - Render two canvas elements (background and drawing layers)
    - Position canvases absolutely with background behind drawing
    - Apply fullscreen styling with Tailwind
    - Attach pointer event handlers from hook
    - _Requirements: 1.1, 1.4, 1.5_
  
  - [ ] 9.2 Write unit tests for Canvas component
    - Test component renders both canvas layers
    - Test canvas layers are properly stacked
    - Test event handlers are attached
    - _Requirements: 1.4, 1.5_

- [ ] 10. Implement UI control components
  - [ ] 10.1 Create ColorPicker component in components/ColorPicker.tsx
    - Render HTML color input
    - Call setColor from useCanvas on change
    - Style with Tailwind
    - _Requirements: 12.1, 12.6_
  
  - [ ] 10.2 Create BrushSelector component in components/BrushSelector.tsx
    - Render buttons or select for four brush types
    - Call setBrushType from useCanvas on selection
    - Show active brush type
    - Style with Tailwind
    - _Requirements: 12.3, 12.6_
  
  - [ ] 10.3 Create SizeSlider component in components/SizeSlider.tsx
    - Render range input (1-50)
    - Call setBrushSize from useCanvas on change
    - Display current size value
    - Style with Tailwind
    - _Requirements: 12.2, 12.6_
  
  - [ ] 10.4 Create BackgroundSelector component in components/BackgroundSelector.tsx
    - Render buttons or select for four background styles
    - Call setBackgroundStyle from useCanvas on selection
    - Show active background style
    - Style with Tailwind
    - _Requirements: 12.4, 12.6_
  
  - [ ] 10.5 Create ClearButton component in components/ClearButton.tsx
    - Render button
    - Call clearCanvas from useCanvas on click
    - Style with Tailwind
    - _Requirements: 12.5, 12.6_
  
  - [ ] 10.6 Create Controls component in components/Controls.tsx
    - Compose all control components
    - Layout controls in a panel (top or side)
    - Style with Tailwind
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_
  
  - [ ] 10.7 Write unit tests for UI controls
    - Test each control renders correctly
    - Test controls call appropriate hook methods
    - Test controls display current state
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_
  
  - [ ] 10.8 Write property test for configuration update immediacy
    - **Property 22: Configuration Update Immediacy**
    - **Validates: Requirements 12.6**

- [ ] 11. Implement main page
  - [ ] 11.1 Create main page in app/page.tsx
    - Import Canvas and Controls components
    - Layout canvas fullscreen with controls overlay
    - Apply global styles with Tailwind
    - _Requirements: All (integration)_
  
  - [ ] 11.2 Write integration tests
    - Test full drawing flow: select brush, draw stroke, change color, draw another stroke
    - Test background changes
    - Test clear canvas
    - _Requirements: All (integration)_

- [ ] 12. Performance optimization and final polish
  - [ ] 12.1 Add performance monitoring
    - Measure rendering time in pointer move handler
    - Log warning if rendering exceeds 16ms
    - _Requirements: 11.3_
  
  - [ ] 12.2 Write property test for rendering performance
    - **Property 21: Rendering Performance**
    - **Validates: Requirements 11.3**
  
  - [ ] 12.3 Optimize rendering if needed
    - Reduce point sampling if performance issues detected
    - Implement stroke batching if necessary
    - Add throttling to pointer move events if needed
    - _Requirements: 11.1, 11.3_
  
  - [ ] 12.4 Add error handling
    - Handle missing canvas context gracefully
    - Handle resize errors
    - Add user-facing error messages
    - _Requirements: All (robustness)_
  
  - [ ] 12.5 Final code review and cleanup
    - Ensure all code is well-commented
    - Verify variable and function names are clear
    - Remove any console.logs or debug code
    - Ensure no placeholder logic remains
    - _Requirements: All (code quality)_

- [ ] 13. Final checkpoint - Complete testing
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Each task references specific requirements for traceability
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples, edge cases, and UI behavior
- Checkpoints ensure incremental validation at key milestones
- Fast-check library will be used for property-based testing with minimum 100 iterations per test
- Each property test should be tagged with: `// Feature: doodle-canvas, Property N: [property text]`
