# Fill Tool Bug Fix - Requirements

## Overview
The fill tool currently has a bug where filling large enclosed areas triggers a fallback that fills the entire canvas instead of just the target area.

## Problem Description
When using the fill tool on a large white area (but not the entire canvas), the flood fill algorithm detects that more than 50% of pixels are being filled and assumes the area is not properly enclosed. It then falls back to filling the entire canvas, which is incorrect behavior.

## User Stories

### 1. Fill Large Enclosed Areas
**As a** user drawing on the canvas  
**I want to** fill large enclosed areas with color  
**So that** I can color in my drawings without the entire canvas being filled

**Acceptance Criteria:**
- 1.1: When clicking on a large enclosed white area, only that area should be filled
- 1.2: The fill should respect the boundaries of the drawn shapes
- 1.3: The fill should not affect areas outside the clicked region
- 1.4: The fill should work correctly regardless of the size of the enclosed area

### 2. Maintain Undo Functionality
**As a** user who makes mistakes  
**I want to** undo fill operations  
**So that** I can correct accidental fills

**Acceptance Criteria:**
- 2.1: Fill operations should be undoable
- 2.2: Undo should restore the canvas to the state before the fill
- 2.3: Redo should reapply the fill operation

## Technical Context
- The issue is in `lib/canvas-engine.ts` in the `floodFill` method
- Current threshold: 50% of canvas pixels (`maxPixels = physicalWidth * physicalHeight * 0.5`)
- The fallback behavior fills the entire canvas when threshold is exceeded

## Constraints
- Must maintain performance for large canvases
- Must not break existing undo/redo functionality
- Must handle edge cases (clicking on already-filled areas, clicking on boundaries)
