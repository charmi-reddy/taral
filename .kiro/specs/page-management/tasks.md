# Implementation Plan: Page Management System

## Overview

This implementation plan breaks down the Page Management System into incremental, testable steps. The approach follows a bottom-up strategy: build core data structures and utilities first, then layer on state management, UI components, and finally integration. Each task builds on previous work, with checkpoints to validate progress.

## Tasks

- [ ] 1. Set up core data types and Page Manager foundation
  - Create TypeScript interfaces for Page, PageMetadata, PageStorage, and ViewState
  - Implement UUID generation utility for unique page IDs
  - Create localStorage wrapper with error handling
  - Set up test files for Page Manager
  - _Requirements: 1.5, 8.5, 9.1_

- [x] 1.1 Write property test for unique page ID generation
  - **Property 2: Unique Page Identifiers**
  - **Validates: Requirements 1.5, 10.5**

- [ ] 2. Implement Page Manager core CRUD operations
  - [x] 2.1 Implement createPage function with default naming
    - Generate unique ID for new pages
    - Initialize page with default values (empty strokes, plain background)
    - Assign sequential default name ("Untitled Page N")
    - Set creation and modification timestamps
    - _Requirements: 1.1, 2.1, 9.1, 10.2, 10.4, 10.5_
  
  - [x] 2.2 Write property test for sequential default naming
    - **Property 3: Sequential Default Naming**
    - **Validates: Requirements 1.1, 2.1**
  
  - [x] 2.3 Write property test for new page initialization
    - **Property 23: New Page Initialization**
    - **Validates: Requirements 10.2, 10.4**
  
  - [x] 2.4 Write property test for complete metadata initialization
    - **Property 19: Complete Metadata Initialization**
    - **Validates: Requirements 9.1**
  
  - [x] 2.5 Implement getPage, getAllPages, updatePage, and deletePage functions
    - Implement page retrieval by ID
    - Implement fetching all page metadata
    - Implement page updates with timestamp refresh
    - Implement page deletion with cleanup
    - _Requirements: 7.3, 9.2_
  
  - [x] 2.6 Write property test for timestamp updates on modification
    - **Property 20: Timestamp Update on Modification**
    - **Validates: Requirements 9.2**

- [ ] 3. Implement localStorage persistence layer
  - [x] 3.1 Create saveToLocalStorage and loadFromLocalStorage functions
    - Implement JSON serialization/deserialization
    - Add error handling for QuotaExceededError and SecurityError
    - Implement data validation on load
    - Add logging for debugging
    - _Requirements: 1.2, 1.3, 1.4, 8.2, 8.3, 8.5_
  
  - [~] 3.2 Write property test for page persistence round-trip
    - **Property 1: Page Persistence Round-Trip**
    - **Validates: Requirements 1.2, 1.3, 1.4, 8.2, 8.3, 9.4**
  
  - [~] 3.3 Write property test for graceful error handling
    - **Property 18: Graceful Error Handling**
    - **Validates: Requirements 8.5**
  
  - [~] 3.4 Write unit tests for localStorage edge cases
    - Test quota exceeded error handling
    - Test corrupted data recovery
    - Test missing fields with default values
    - _Requirements: 8.4, 9.5_

- [~] 4. Checkpoint - Ensure Page Manager core functionality works
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Implement usePageManager React hook
  - [~] 5.1 Create usePageManager hook with state management
    - Set up React state for pages and activePageId
    - Implement loadPages effect on mount
    - Implement auto-save with 1-second debouncing
    - Expose CRUD operations and active page management
    - _Requirements: 1.4, 8.1_
  
  - [~] 5.2 Implement page name update functionality
    - Add updatePageName function with validation
    - Reject empty/whitespace-only names
    - Enforce 100-character limit
    - Persist changes immediately
    - _Requirements: 2.2, 2.3, 2.4, 2.5_
  
  - [~] 5.3 Write property test for page name update round-trip
    - **Property 4: Page Name Update Round-Trip**
    - **Validates: Requirements 2.2, 2.4**
  
  - [~] 5.4 Write property test for invalid name rejection
    - **Property 5: Invalid Name Rejection**
    - **Validates: Requirements 2.3, 2.5**

- [ ] 6. Implement thumbnail generation utility
  - [~] 6.1 Create generateThumbnail function
    - Create off-screen canvas for thumbnail rendering
    - Draw background layer to off-screen canvas
    - Draw drawing layer to off-screen canvas
    - Scale to consistent dimensions (300x200)
    - Convert to base64 JPEG with 80% quality
    - _Requirements: 5.1, 5.2, 5.3_
  
  - [~] 6.2 Write property test for complete thumbnail generation
    - **Property 12: Complete Thumbnail Generation**
    - **Validates: Requirements 5.1, 5.2, 5.3**
  
  - [~] 6.3 Write unit test for empty page thumbnail
    - Test thumbnail generation for page with no strokes
    - Verify background is visible in thumbnail
    - _Requirements: 5.4_

- [ ] 7. Implement view navigation state management
  - [~] 7.1 Create useViewNavigation hook
    - Set up ViewState with currentView, previousView, activePageId
    - Implement navigateToHome function
    - Implement navigateToDrawing function
    - Preserve view state during transitions
    - _Requirements: 3.2, 6.1, 6.2, 6.3, 6.4_
  
  - [~] 7.2 Write property test for view navigation state transition
    - **Property 7: View Navigation State Transition**
    - **Validates: Requirements 3.2, 6.2**
  
  - [~] 7.3 Write property test for view state preservation
    - **Property 13: View State Preservation**
    - **Validates: Requirements 6.3**
  
  - [~] 7.4 Write property test for active page restoration
    - **Property 14: Active Page Restoration**
    - **Validates: Requirements 6.4**

- [~] 8. Checkpoint - Ensure state management hooks work correctly
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Create Home View component
  - [~] 9.1 Implement HomeView component structure
    - Create responsive grid layout with CSS Grid
    - Display "New Page" card/button
    - Handle empty state (no pages)
    - Implement page card rendering with thumbnail, name, and date
    - _Requirements: 4.1, 4.2, 4.3, 10.1_
  
  - [~] 9.2 Write property test for complete page display
    - **Property 9: Complete Page Display**
    - **Validates: Requirements 4.1, 4.2**
  
  - [~] 9.3 Write property test for new page button presence
    - **Property 22: New Page Button Presence**
    - **Validates: Requirements 10.1**
  
  - [~] 9.4 Write unit test for empty state display
    - Test that empty state message appears when no pages exist
    - _Requirements: 4.3_
  
  - [~] 9.5 Implement page sorting by last modified date
    - Sort pages in reverse chronological order
    - Display most recently modified pages first
    - _Requirements: 4.5_
  
  - [~] 9.6 Write property test for reverse chronological ordering
    - **Property 11: Reverse Chronological Ordering**
    - **Validates: Requirements 4.5**
  
  - [~] 9.7 Implement human-readable date formatting
    - Format timestamps as relative dates ("2 hours ago")
    - Fall back to absolute dates for older pages
    - _Requirements: 9.3_
  
  - [~] 9.8 Write property test for human-readable date formatting
    - **Property 21: Human-Readable Date Formatting**
    - **Validates: Requirements 9.3**

- [ ] 10. Implement page interaction handlers in Home View
  - [~] 10.1 Add page selection handler
    - Implement onClick for page cards
    - Navigate to Drawing View with selected page
    - _Requirements: 4.4_
  
  - [~] 10.2 Write property test for page selection navigation
    - **Property 10: Page Selection Navigation**
    - **Validates: Requirements 4.4**
  
  - [~] 10.3 Add new page creation handler
    - Implement onClick for New Page button
    - Create new page with default settings
    - Navigate to Drawing View with new page
    - _Requirements: 10.2, 10.3_
  
  - [~] 10.4 Write property test for new page navigation
    - **Property 24: New Page Navigation**
    - **Validates: Requirements 10.3**
  
  - [~] 10.5 Add page deletion handler
    - Implement delete button for each page card
    - Show confirmation dialog before deletion
    - Delete page and update grid
    - Handle active page deletion edge case
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_
  
  - [~] 10.6 Write property test for delete option availability
    - **Property 15: Delete Option Availability**
    - **Validates: Requirements 7.1**
  
  - [~] 10.7 Write property test for deletion confirmation flow
    - **Property 16: Deletion Confirmation Flow**
    - **Validates: Requirements 7.2**
  
  - [~] 10.8 Write property test for permanent page deletion
    - **Property 17: Permanent Page Deletion**
    - **Validates: Requirements 7.3, 7.4**
  
  - [~] 10.9 Write unit test for active page deletion edge case
    - Test that active page reference is cleared when active page is deleted
    - _Requirements: 7.5_

- [~] 11. Checkpoint - Ensure Home View component works correctly
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 12. Modify Canvas component to integrate with Page Manager
  - [~] 12.1 Update Canvas component to accept page state props
    - Add pageId prop
    - Add initialState prop (strokes, backgroundStyle)
    - Add onHomeClick prop
    - Load initial state into canvas engine on mount
    - _Requirements: 3.1, 3.3, 3.5_
  
  - [~] 12.2 Write property test for data preservation during navigation
    - **Property 8: Data Preservation During Navigation**
    - **Validates: Requirements 3.3, 3.5**
  
  - [~] 12.3 Implement auto-save integration
    - Save page state after each stroke completion
    - Save page state after background changes
    - Use debounced save to prevent excessive writes
    - _Requirements: 8.1, 8.2_

- [ ] 13. Add Home button to Controls component
  - [~] 13.1 Add Home button UI to Controls
    - Position Home button above "Drawing Tools" heading
    - Style button to be visually distinct
    - Make button responsive for all screen sizes
    - Wire up onHomeClick handler
    - _Requirements: 3.1, 3.2, 3.4_
  
  - [~] 13.2 Write property test for Home button presence
    - **Property 6: Home Button Presence**
    - **Validates: Requirements 3.1**

- [ ] 14. Create main App component with view routing
  - [~] 14.1 Implement App component with view router
    - Integrate usePageManager hook
    - Integrate useViewNavigation hook
    - Conditionally render HomeView or Canvas based on currentView
    - Pass appropriate props to each view
    - Handle page state synchronization
    - _Requirements: 6.1, 6.2, 6.3, 6.4_
  
  - [~] 14.2 Wire up all event handlers
    - Connect Home button to navigateToHome
    - Connect page selection to navigateToDrawing
    - Connect new page creation to createPage + navigateToDrawing
    - Connect page deletion to deletePage
    - Connect page rename to updatePageName
    - _Requirements: 3.2, 4.4, 7.3, 10.3_

- [ ] 15. Implement page name editing in Home View
  - [~] 15.1 Add inline editing for page names
    - Add edit button/icon to page cards
    - Show input field when editing
    - Validate input (non-empty, ≤100 chars)
    - Save on blur or Enter key
    - Cancel on Escape key
    - _Requirements: 2.2, 2.3, 2.4, 2.5_

- [ ] 16. Final checkpoint - Integration testing
  - [~] 16.1 Test complete user flows
    - Create new page → draw → navigate home → verify page appears
    - Select existing page → modify → navigate home → verify changes saved
    - Delete page → verify removal from grid and localStorage
    - Rename page → verify name persists across sessions
    - _Requirements: All_
  
  - [~] 16.2 Run all property-based tests
    - Verify all 24 properties pass with 100+ iterations
    - Fix any failures discovered by property tests
  
  - [~] 16.3 Test error scenarios
    - Simulate localStorage quota exceeded
    - Test with corrupted localStorage data
    - Test with localStorage disabled (private browsing)
    - _Requirements: 8.4, 8.5, 9.5_

- [~] 17. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties (24 total)
- Unit tests validate specific examples and edge cases
- The implementation uses TypeScript with React and Next.js
- Testing uses Vitest and fast-check for property-based testing
