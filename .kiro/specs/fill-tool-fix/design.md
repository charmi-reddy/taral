# Fill Tool Bug Fix - Design

## Problem Analysis

The current flood fill implementation has a safety mechanism that's too aggressive:

```typescript
const maxPixels = physicalWidth * physicalHeight * 0.5; // 50% threshold
```

When filling a large enclosed area (like a big white region in a drawing), the algorithm counts pixels and if it exceeds 50% of the canvas, it assumes the area isn't properly enclosed and fills the entire canvas instead.

## Root Cause

The 50% threshold is too low. In typical drawing scenarios, users often have large background areas that are legitimately enclosed by their drawings. These areas can easily exceed 50% of the canvas while still being properly bounded.

## Proposed Solution

Remove the fallback behavior entirely. The flood fill algorithm should fill exactly what's connected to the clicked point, regardless of size.

### Rationale

1. **Correctness**: The flood fill algorithm already checks boundaries correctly - it only fills pixels that match the target color and are connected
2. **User Expectation**: Users expect the fill tool to fill the clicked area, not make assumptions about what they intended
3. **Performance**: Modern browsers can handle flood fill operations efficiently even for large areas
4. **Safety**: If a user truly wants to fill the entire canvas, they can use the "Clear" button or click in an area that's actually connected to the entire canvas

## Implementation Changes

### File: `lib/canvas-engine.ts`

**Method: `floodFill`**

Remove the pixel count threshold and fallback logic:

1. Remove the `maxPixels` constant
2. Remove the `pixelsFilled` counter and comparison
3. Remove the conditional that fills the entire canvas
4. Always apply the flood-filled `imageData` back to the canvas

### Algorithm Flow (Updated)

```
1. Get click coordinates (convert logical to physical pixels)
2. Get target color at click point
3. Parse fill color
4. If target color === fill color, return (no-op)
5. Save canvas state for undo
6. Initialize flood fill stack with click point
7. While stack is not empty:
   a. Pop point from stack
   b. Check bounds
   c. If already visited or doesn't match target, skip
   d. Mark as visited
   e. Fill pixel with new color
   f. Add 4-connected neighbors to stack
8. Put modified imageData back to canvas
9. Save filled state for undo
```

## Edge Cases Handled

1. **Clicking on same color**: No-op, returns early
2. **Out of bounds**: Boundary checks in the loop
3. **Already visited pixels**: Set-based tracking prevents infinite loops
4. **Undo/redo**: Canvas state saved before and after fill

## Performance Considerations

- The flood fill algorithm is O(n) where n is the number of pixels in the filled region
- Using a Set for visited pixels provides O(1) lookup
- Stack-based approach prevents recursion stack overflow
- For very large fills (millions of pixels), there may be a brief delay, but this is acceptable for the correctness gained

## Testing Strategy

### Manual Testing
1. Draw shapes with enclosed areas of various sizes
2. Fill small enclosed areas (< 10% of canvas)
3. Fill medium enclosed areas (10-50% of canvas)
4. Fill large enclosed areas (> 50% of canvas)
5. Verify only the clicked region is filled in all cases
6. Test undo/redo functionality

### Property-Based Testing
Not applicable for this bug fix - the change is straightforward and manual testing is sufficient.

## Correctness Properties

**Property 1: Boundary Respect**
- **Validates: Requirements 1.2, 1.3**
- When flood fill is applied to a point, only pixels that:
  1. Match the target color
  2. Are 4-connected to the starting point
  3. Are within canvas bounds
  Should be filled with the new color

**Property 2: Undo Consistency**
- **Validates: Requirements 2.1, 2.2**
- After a fill operation followed by undo, the canvas state should be identical to the state before the fill operation

## Rollback Plan

If issues arise, the previous threshold-based approach can be restored, but with a higher threshold (e.g., 95% instead of 50%).
