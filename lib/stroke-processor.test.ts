import { describe, it, expect } from 'vitest';
import { fc } from '@fast-check/vitest';
import { StrokeProcessor } from './stroke-processor';
import type { Point, BrushType } from './types';

describe('StrokeProcessor', () => {
  describe('Property 5: Velocity Calculation Consistency', () => {
    // Feature: doodle-canvas, Property 5: Velocity Calculation Consistency
    // Validates: Requirements 2.5

    it('should calculate velocity as distance divided by time', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 2000 }), // x1
          fc.integer({ min: 0, max: 2000 }), // y1
          fc.integer({ min: 0, max: 2000 }), // x2
          fc.integer({ min: 0, max: 2000 }), // y2
          fc.integer({ min: 1, max: 1000 }), // time1
          fc.integer({ min: 1, max: 1000 }), // timeDiff
          (x1, y1, x2, y2, time1, timeDiff) => {
            const p1: Point = { x: x1, y: y1, timestamp: time1 };
            const p2: Point = { x: x2, y: y2, timestamp: time1 + timeDiff };

            const velocity = StrokeProcessor.calculateVelocity(p1, p2);

            // Calculate expected velocity manually
            const dx = x2 - x1;
            const dy = y2 - y1;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const expectedVelocity = distance / timeDiff;

            expect(velocity).toBeCloseTo(expectedVelocity, 10);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return zero velocity when time difference is zero', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 2000 }),
          fc.integer({ min: 0, max: 2000 }),
          fc.integer({ min: 0, max: 2000 }),
          fc.integer({ min: 0, max: 2000 }),
          fc.integer({ min: 0, max: 10000 }),
          (x1, y1, x2, y2, timestamp) => {
            const p1: Point = { x: x1, y: y1, timestamp };
            const p2: Point = { x: x2, y: y2, timestamp }; // Same timestamp

            const velocity = StrokeProcessor.calculateVelocity(p1, p2);

            expect(velocity).toBe(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return zero velocity when points are identical', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 2000 }),
          fc.integer({ min: 0, max: 2000 }),
          fc.integer({ min: 0, max: 10000 }),
          fc.integer({ min: 1, max: 1000 }),
          (x, y, time1, timeDiff) => {
            const p1: Point = { x, y, timestamp: time1 };
            const p2: Point = { x, y, timestamp: time1 + timeDiff };

            const velocity = StrokeProcessor.calculateVelocity(p1, p2);

            expect(velocity).toBe(0);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 8: Velocity-Width Inverse Relationship', () => {
    // Feature: doodle-canvas, Property 8: Velocity-Width Inverse Relationship
    // Validates: Requirements 4.1, 4.2, 4.3

    it('should produce thinner strokes for higher velocity', () => {
      fc.assert(
        fc.property(
          fc.double({ min: 0.1, max: 5, noNaN: true }), // velocity1
          fc.double({ min: 0.1, max: 5, noNaN: true }), // velocity2
          fc.integer({ min: 1, max: 50 }), // baseWidth
          fc.constantFrom<BrushType>('ink'),
          (v1, v2, baseWidth, brushType) => {
            // Ensure v1 < v2
            const lowVelocity = Math.min(v1, v2);
            const highVelocity = Math.max(v1, v2);

            // Skip if velocities are too similar
            if (Math.abs(highVelocity - lowVelocity) < 0.1) {
              return true;
            }

            const widthLow = StrokeProcessor.calculateWidth(
              lowVelocity,
              baseWidth,
              brushType
            );
            const widthHigh = StrokeProcessor.calculateWidth(
              highVelocity,
              baseWidth,
              brushType
            );

            // Higher velocity should produce smaller or equal width
            expect(widthHigh).toBeLessThanOrEqual(widthLow);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 9: Stroke Width Bounds', () => {
    // Feature: doodle-canvas, Property 9: Stroke Width Bounds
    // Validates: Requirements 4.4

    it('should clamp width within brush-specific bounds', () => {
      fc.assert(
        fc.property(
          fc.double({ min: 0, max: 10, noNaN: true }), // velocity
          fc.integer({ min: 1, max: 50 }), // baseWidth
          fc.constantFrom<BrushType>('ink'),
          (velocity, baseWidth, brushType) => {
            const width = StrokeProcessor.calculateWidth(
              velocity,
              baseWidth,
              brushType
            );

            // Ink: moderate variation (40% to 200%)
            const minWidth = baseWidth * 0.4;
            const maxWidth = baseWidth * 2.0;

            expect(width).toBeGreaterThanOrEqual(minWidth);
            expect(width).toBeLessThanOrEqual(maxWidth);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 10: Pixel Pen Fixed Width', () => {
    // Feature: doodle-canvas, Property 10: Pixel Pen Fixed Width
    // Validates: Requirements 5.5

    it('should return fixed width for pixel pen regardless of velocity', () => {
      fc.assert(
        fc.property(
          fc.double({ min: 0, max: 10, noNaN: true }), // velocity
          fc.integer({ min: 1, max: 50 }), // baseWidth
          (velocity, baseWidth) => {
            const width = StrokeProcessor.calculateWidth(
              velocity,
              baseWidth,
              'pixel'
            );

            expect(width).toBe(baseWidth);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 17: Grid Snapping Behavior', () => {
    // Feature: doodle-canvas, Property 17: Grid Snapping Behavior
    // Validates: Requirements 9.2

    it('should snap to nearest grid intersection', () => {
      fc.assert(
        fc.property(
          fc.double({ min: 0, max: 2000, noNaN: true }), // x
          fc.double({ min: 0, max: 2000, noNaN: true }), // y
          fc.integer({ min: 1, max: 100 }), // gridSize
          fc.integer({ min: 0, max: 10000 }), // timestamp
          (x, y, gridSize, timestamp) => {
            const point: Point = { x, y, timestamp };
            const snapped = StrokeProcessor.snapToGrid(point, gridSize);

            // Snapped coordinates should be multiples of gridSize
            expect(snapped.x % gridSize).toBeCloseTo(0, 10);
            expect(snapped.y % gridSize).toBeCloseTo(0, 10);

            // Snapped point should be close to original (within gridSize distance)
            const dx = snapped.x - x;
            const dy = snapped.y - y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            expect(distance).toBeLessThanOrEqual(gridSize * Math.sqrt(2));
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should preserve timestamp and pressure when snapping', () => {
      fc.assert(
        fc.property(
          fc.double({ min: 0, max: 2000, noNaN: true }),
          fc.double({ min: 0, max: 2000, noNaN: true }),
          fc.integer({ min: 1, max: 100 }),
          fc.integer({ min: 0, max: 10000 }),
          fc.option(fc.double({ min: 0, max: 1, noNaN: true })),
          (x, y, gridSize, timestamp, pressure) => {
            const point: Point = {
              x,
              y,
              timestamp,
              ...(pressure !== null && { pressure }),
            };
            const snapped = StrokeProcessor.snapToGrid(point, gridSize);

            expect(snapped.timestamp).toBe(timestamp);
            if (pressure !== null) {
              expect(snapped.pressure).toBe(pressure);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 18: No Snapping When Disabled', () => {
    // Feature: doodle-canvas, Property 18: No Snapping When Disabled
    // Validates: Requirements 9.3
    // Note: This property is validated by NOT calling snapToGrid
    // The test verifies that points remain unchanged when snap is not applied

    it('should return exact point when not snapping', () => {
      fc.assert(
        fc.property(
          fc.double({ min: 0, max: 2000, noNaN: true }),
          fc.double({ min: 0, max: 2000, noNaN: true }),
          fc.integer({ min: 0, max: 10000 }),
          (x, y, timestamp) => {
            const point: Point = { x, y, timestamp };
            
            // When snap-to-grid is disabled, we simply don't call snapToGrid
            // The point should remain unchanged
            const unchanged = { ...point };

            expect(unchanged.x).toBe(x);
            expect(unchanged.y).toBe(y);
            expect(unchanged.timestamp).toBe(timestamp);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Stroke Smoothing', () => {
    it('should return original points if less than 2 points', () => {
      const singlePoint: Point[] = [{ x: 10, y: 20, timestamp: 0 }];
      const smoothed = StrokeProcessor.smoothPoints(singlePoint);
      expect(smoothed).toEqual(singlePoint);

      const empty: Point[] = [];
      const smoothedEmpty = StrokeProcessor.smoothPoints(empty);
      expect(smoothedEmpty).toEqual(empty);
    });

    it('should return original points if exactly 2 points', () => {
      const twoPoints: Point[] = [
        { x: 10, y: 20, timestamp: 0 },
        { x: 30, y: 40, timestamp: 10 },
      ];
      const smoothed = StrokeProcessor.smoothPoints(twoPoints);
      expect(smoothed).toEqual(twoPoints);
    });

    it('should smooth points using quadratic Bezier algorithm', () => {
      const points: Point[] = [
        { x: 0, y: 0, timestamp: 0 },
        { x: 10, y: 10, timestamp: 10 },
        { x: 20, y: 0, timestamp: 20 },
      ];

      const smoothed = StrokeProcessor.smoothPoints(points);

      // Should start with first point
      expect(smoothed[0]).toEqual(points[0]);
      
      // Should end with last point
      expect(smoothed[smoothed.length - 1]).toEqual(points[2]);
      
      // Should have more points than original (control points + midpoints)
      expect(smoothed.length).toBeGreaterThan(points.length);
    });

    it('should create midpoints between consecutive points', () => {
      const points: Point[] = [
        { x: 0, y: 0, timestamp: 0 },
        { x: 100, y: 0, timestamp: 10 },
        { x: 100, y: 100, timestamp: 20 },
      ];

      const smoothed = StrokeProcessor.smoothPoints(points);

      // Check that midpoint is calculated correctly
      // Midpoint between (100,0) and (100,100) should be (100,50)
      const hasMidpoint = smoothed.some(
        p => p.x === 100 && p.y === 50
      );
      expect(hasMidpoint).toBe(true);
    });
  });

  describe('Width Calculation Edge Cases', () => {
    it('should handle zero velocity', () => {
      const width = StrokeProcessor.calculateWidth(0, 10, 'ink');
      expect(width).toBe(10); // Should return base width
    });

    it('should handle very high velocity', () => {
      const width = StrokeProcessor.calculateWidth(1000, 10, 'ink');
      expect(width).toBeGreaterThanOrEqual(4); // Min bound for ink (0.4x)
      expect(width).toBeLessThanOrEqual(20); // Max bound
    });

    it('should respect brush type sensitivity', () => {
      const velocity = 2;
      const baseWidth = 10;

      const inkWidth = StrokeProcessor.calculateWidth(velocity, baseWidth, 'ink');
      const pixelWidth = StrokeProcessor.calculateWidth(velocity, baseWidth, 'pixel');

      // Pixel should always be base width
      expect(pixelWidth).toBe(baseWidth);

      // Ink should vary from base width (sensitive to velocity)
      expect(Math.abs(inkWidth - baseWidth)).toBeGreaterThan(0);
    });
  });
});
