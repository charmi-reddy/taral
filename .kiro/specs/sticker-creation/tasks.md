# Implementation Plan: Sticker Creation

## Overview

This implementation plan breaks down the sticker creation feature into discrete coding tasks. The approach follows a bottom-up strategy: build core utilities first, then individual components, then integrate them into the complete pipeline, and finally wire up the UI. Each task includes property-based tests to validate correctness properties from the design document.

## Tasks

- [x] 1. Set up project structure and core types
  - Create `lib/sticker-creation/` directory structure
  - Define TypeScript interfaces for all data models (StickerResult, SubjectMask, BoundingBox, StickerMetadata, ProcessingState)
  - Set up fast-check library for property-based testing
  - Create test utilities and custom arbitraries for ImageData and SubjectMask generation
  - _Requirements: All (foundational)_

- [x] 2. Implement BoundingBox calculation utility
  - [x] 2.1 Create `calculateBoundingBox` function
    - Scan ImageData to find min/max coordinates of non-transparent pixels
    - Return BoundingBox with x, y, width, height
    - Handle edge case of fully transparent image
    - _Requirements: 3.1_
  
  - [ ]* 2.2 Write property test for bounding box calculation
    - **Property 7: Bounding Box Calculation**
    - **Validates: Requirements 3.1**
    - Verify bounding box encompasses all pixels with alpha > 0
    - Verify no pixels with alpha = 0 are inside the bounding box

- [x] 3. Implement SmartCropper component
  - [x] 3.1 Create SmartCropper class with crop method
    - Use calculateBoundingBox to find content bounds
    - Add configurable padding (default 8 pixels)
    - Enforce minimum dimensions (64x64)
    - Extract sub-region from ImageData
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  
  - [ ]* 3.2 Write property test for crop dimensions with padding
    - **Property 8: Crop Dimensions with Padding**
    - **Validates: Requirements 3.2, 3.3**
    - Verify output dimensions = bounding box + padding
  
  - [ ]* 3.3 Write property test for aspect ratio preservation
    - **Property 9: Aspect Ratio Preservation**
    - **Validates: Requirements 3.5**
    - Verify aspect ratio preserved within 1% tolerance
  
  - [ ]* 3.4 Write unit tests for edge cases
    - Test minimum dimension enforcement (64x64)
    - Test very small drawings (< 32x32)
    - Test very large drawings (> 4096x4096)
    - _Requirements: 3.4, 8.2, 8.3_

- [x] 4. Implement BackgroundRemover component
  - [x] 4.1 Create BackgroundRemover class with removeBackground method
    - Accept ImageData and SubjectMask as inputs
    - Create new ImageData with same dimensions
    - Set alpha = 0 for pixels outside mask
    - Preserve RGB and alpha for pixels inside mask
    - Apply edge smoothing with 3x3 Gaussian blur at mask boundaries
    - _Requirements: 2.1, 2.2, 2.3_
  
  - [ ]* 4.2 Write property test for background pixel transparency
    - **Property 4: Background Pixel Transparency**
    - **Validates: Requirements 2.1**
    - Verify all pixels outside mask have alpha = 0
  
  - [ ]* 4.3 Write property test for subject color preservation
    - **Property 5: Subject Color Preservation**
    - **Validates: Requirements 2.2**
    - Verify RGB values unchanged for pixels inside mask
  
  - [ ]* 4.4 Write property test for alpha channel preservation
    - **Property 6: Alpha Channel Preservation**
    - **Validates: Requirements 2.3**
    - Verify alpha values preserved for semi-transparent pixels inside mask

- [x] 5. Implement pixel-based SubjectDetector (fallback)
  - [x] 5.1 Create PixelSubjectDetector class
    - Scan all pixels for non-transparent content (alpha > 0)
    - Use connected component analysis to identify largest blob
    - Apply morphological operations to clean noise
    - Generate binary mask from detected region
    - Calculate bounding box from mask
    - Return SubjectMask with method = 'fallback'
    - _Requirements: 1.4_
  
  - [ ]* 5.2 Write unit tests for pixel detection
    - Test with simple shapes (circle, rectangle)
    - Test with multiple disconnected regions
    - Test with noisy/scattered pixels
    - _Requirements: 1.4_

- [x] 6. Implement Gemini Vision API integration
  - [x] 6.1 Create GeminiVisionClient class
    - Implement analyzeImage method with API call
    - Convert canvas to base64 PNG for API request
    - Use subject detection prompt template
    - Parse API response to extract bounding box or segmentation
    - Implement 10-second timeout with retry logic
    - Handle API errors gracefully
    - _Requirements: 1.1, 1.2, 10.3_
  
  - [x] 6.2 Create AISubjectDetector class
    - Use GeminiVisionClient to get subject information
    - Convert API response to SubjectMask format
    - Handle multiple subjects by selecting largest/most central
    - Return SubjectMask with method = 'ai' and confidence score
    - _Requirements: 1.1, 1.3_
  
  - [ ]* 6.3 Write property test for subject detection invocation
    - **Property 1: Subject Detection Invocation**
    - **Validates: Requirements 1.1**
    - Verify detection is called with correct image data
  
  - [ ]* 6.4 Write property test for multi-subject prioritization
    - **Property 2: Multi-Subject Prioritization**
    - **Validates: Requirements 1.3**
    - Verify largest/most central subject is selected
  
  - [ ]* 6.5 Write unit tests for API integration
    - Mock API responses with valid subject data
    - Test API timeout handling
    - Test API error handling
    - Test response parsing
    - _Requirements: 1.2, 8.4, 10.3_

- [ ] 7. Checkpoint - Ensure core components work
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Implement FormatExporter component
  - [x] 8.1 Create FormatExporter class with exportPNG method
    - Create temporary canvas with ImageData
    - Use canvas.toBlob('image/png') for lossless export
    - Preserve resolution up to 2048x2048
    - Return Blob
    - _Requirements: 4.1, 4.6_
  
  - [x] 8.2 Implement exportWebP method with optimization
    - Resize ImageData to 512x512 with aspect ratio preservation
    - Center on canvas with transparent background
    - Use high-quality bilinear/bicubic interpolation
    - Start with quality = 0.95
    - Iteratively reduce quality by 0.05 until size < 100KB
    - Maximum 10 iterations, minimum quality 0.5
    - Return Blob or null if size constraint cannot be met
    - _Requirements: 4.2, 4.3, 4.4, 4.5_
  
  - [ ]* 8.3 Write property test for PNG resolution preservation
    - **Property 12: PNG Resolution Preservation**
    - **Validates: Requirements 4.6**
    - Verify output resolution matches input up to 2048x2048
  
  - [ ]* 8.4 Write property test for WebP dimensions and size
    - **Property 10: WebP Dimensions and Size**
    - **Validates: Requirements 4.3, 4.4**
    - Verify output is 512x512 and <= 100KB
  
  - [ ]* 8.5 Write property test for iterative quality reduction
    - **Property 11: Iterative Quality Reduction**
    - **Validates: Requirements 4.5**
    - Verify quality is reduced in steps until size constraint met
  
  - [ ]* 8.6 Write property test for transparent background in exports
    - **Property 13: Transparent Background in Exports**
    - **Validates: Requirements 4.7**
    - Verify background pixels have alpha = 0 in both formats
  
  - [ ]* 8.7 Write unit tests for format export edge cases
    - Test WebP compression failure (cannot reach 100KB)
    - Test browser WebP support detection
    - Test very large image scaling
    - _Requirements: 8.5, 8.6_

- [x] 9. Implement StickerCreationOrchestrator
  - [x] 9.1 Create orchestrator class with createSticker method
    - Validate canvas is not empty
    - Extract ImageData from canvas
    - Try AI subject detection with fallback to pixel detection
    - Pass result to BackgroundRemover
    - Pass result to SmartCropper
    - Pass result to FormatExporter for both PNG and WebP
    - Collect metadata (dimensions, file sizes, detection method)
    - Return StickerResult with preview, formats, and metadata
    - Implement error handling with graceful degradation
    - _Requirements: 1.1, 1.4, 1.5, 8.1, 8.4_
  
  - [ ]* 9.2 Write property test for detection to removal pipeline
    - **Property 3: Detection to Removal Pipeline**
    - **Validates: Requirements 1.5**
    - Verify subject mask passed correctly between stages
  
  - [ ]* 9.3 Write unit tests for orchestrator
    - Test empty canvas rejection
    - Test AI failure fallback to pixel detection
    - Test complete pipeline with valid input
    - Test error handling at each stage
    - _Requirements: 8.1, 8.4, 8.7_

- [x] 10. Implement DownloadManager
  - [x] 10.1 Create DownloadManager class with download method
    - Generate filename with format: sticker_YYYYMMDD_HHMMSS.{ext}
    - Create object URL from Blob
    - Trigger download using anchor element
    - Clean up object URL after download
    - _Requirements: 7.4, 7.5, 7.7_
  
  - [ ]* 10.2 Write property test for filename format compliance
    - **Property 14: Filename Format Compliance**
    - **Validates: Requirements 7.7**
    - Verify filename matches pattern with valid timestamp
  
  - [ ]* 10.3 Write unit tests for download functionality
    - Test PNG download
    - Test WebP download
    - Test filename generation
    - _Requirements: 7.4, 7.5_

- [ ] 11. Implement ShareManager
  - [ ] 11.1 Create ShareManager class
    - Implement canShare method to detect Web Share API support
    - Implement shareToWhatsApp method using Web Share API
    - Fall back to WhatsApp Web URL if Share API unavailable
    - Handle mobile vs desktop differences
    - Provide user feedback on share status
    - _Requirements: 7.3, 7.6_
  
  - [ ]* 11.2 Write unit tests for share functionality
    - Test Web Share API detection
    - Test WhatsApp share invocation
    - Test fallback to WhatsApp Web URL
    - _Requirements: 7.3, 7.6_

- [ ] 12. Checkpoint - Ensure pipeline and utilities work
  - Ensure all tests pass, ask the user if questions arise.

- [x] 13. Implement PreviewUI component
  - [x] 13.1 Create PreviewUI React component
    - Display modal overlay with semi-transparent backdrop
    - Render sticker preview with checkered background pattern
    - Show file size information for PNG and WebP formats
    - Display action buttons: Download PNG, Download WebP, Share to WhatsApp, Cancel
    - Conditionally show WebP button based on browser support
    - Conditionally show WhatsApp button based on platform capabilities
    - Handle button clicks to trigger download/share actions
    - Include close button to dismiss modal
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 7.1, 7.2, 7.3_
  
  - [x] 13.2 Create checkered background pattern utility
    - Generate canvas with alternating light/dark squares
    - Use as background to indicate transparency
    - _Requirements: 6.2_
  
  - [ ]* 13.3 Write unit tests for PreviewUI
    - Test modal visibility
    - Test button rendering based on capabilities
    - Test button click handlers
    - Test close/cancel functionality
    - _Requirements: 6.1, 6.5, 6.6, 7.1, 7.2, 7.3_

- [x] 14. Implement "Create Sticker" button in doodle view
  - [x] 14.1 Add button to DoodleOverview component
    - Show button only when in Doodle mode (not AI mode)
    - Disable button when canvas is empty
    - Enable button when canvas has content
    - Add click handler to initiate sticker creation
    - Show loading indicator during processing
    - Display progress messages if processing > 5 seconds
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 10.1, 10.4_
  
  - [ ]* 14.2 Write unit tests for button behavior
    - Test button visibility in Doodle mode vs AI mode
    - Test button disabled state with empty canvas
    - Test button enabled state with content
    - Test click handler invocation
    - Test loading indicator display
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 10.1_

- [ ] 15. Integrate sticker creation with UI
  - [ ] 15.1 Wire orchestrator to button click handler
    - Get canvas reference from DoodleOverview
    - Call orchestrator.createSticker(canvas)
    - Handle loading state and progress updates
    - Display PreviewUI with result on success
    - Display error messages on failure
    - _Requirements: 5.5, 8.7, 10.1, 10.4, 10.6_
  
  - [ ] 15.2 Connect PreviewUI to DownloadManager and ShareManager
    - Pass download handler to PreviewUI
    - Pass share handler to PreviewUI
    - Handle download button clicks
    - Handle share button clicks
    - Close preview after successful action
    - _Requirements: 7.4, 7.5, 7.6_
  
  - [ ]* 15.3 Write property test for error message display
    - **Property 15: Error Message Display**
    - **Validates: Requirements 8.7**
    - Verify error messages shown for all error types
  
  - [ ]* 15.4 Write integration tests for complete flow
    - Test end-to-end: button click → processing → preview → download
    - Test error scenarios: empty canvas, API failure, export failure
    - Test fallback scenarios: AI failure → pixel detection
    - Test WebP optimization: iterative quality reduction
    - _Requirements: All_

- [ ] 16. Add error handling and user feedback
  - [ ] 16.1 Implement error message display component
    - Create toast/notification component for errors
    - Map error codes to user-friendly messages
    - Display technical details in console
    - Auto-dismiss after timeout or user action
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7_
  
  - [ ]* 16.2 Write unit tests for error handling
    - Test each error code displays correct message
    - Test error logging
    - Test auto-dismiss behavior
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7_

- [ ] 17. Performance optimization and testing
  - [ ] 17.1 Add performance monitoring
    - Measure time for each pipeline stage
    - Log performance metrics in development
    - Display loading indicator within 100ms of button click
    - Display preview within 500ms of completion
    - _Requirements: 10.1, 10.6_
  
  - [ ]* 17.2 Run performance benchmarks
    - Test with various image sizes (64x64 to 2048x2048)
    - Test with complex drawings
    - Verify background removal < 500ms for 512x512
    - Verify total pipeline < 3 seconds for typical drawings
    - _Requirements: 10.2_

- [ ] 18. Final checkpoint - End-to-end testing
  - Ensure all tests pass, ask the user if questions arise.
  - Test complete user flow: draw → create sticker → preview → download/share
  - Verify all error cases handled gracefully
  - Verify performance meets requirements

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples, edge cases, and error conditions
- The implementation follows a bottom-up approach: utilities → components → integration → UI
- All property tests should run with minimum 100 iterations using fast-check
- Each property test must include a comment tag referencing the design property
