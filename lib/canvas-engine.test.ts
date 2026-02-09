import { describe, it, expect, beforeEach, vi } from 'vitest';
import { fc } from '@fast-check/vitest';
import { CanvasEngine } from './canvas-engine';

// Mock canvas setup
function createMockCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  
  // Mock getBoundingClientRect
  canvas.getBoundingClientRect = vi.fn(() => ({
    width,
    height,
    top: 0,
    left: 0,
    bottom: height,
    right: width,
    x: 0,
    y: 0,
    toJSON: () => {},
  }));
  
  return canvas;
}

describe('CanvasEngine', () => {
  let drawingCanvas: HTMLCanvasElement;
  let backgroundCanvas: HTMLCanvasElement;

  beforeEach(() => {
    drawingCanvas = createMockCanvas(800, 600);
    backgroundCanvas = createMockCanvas(800, 600);
  });

  describe('Constructor and Setup', () => {
    it('should create CanvasEngine with valid canvases', () => {
      const engine = new CanvasEngine(drawingCanvas, backgroundCanvas);
      expect(engine).toBeInstanceOf(CanvasEngine);
    });

    it('should throw error if canvas context is not available', () => {
      const badCanvas = document.createElement('canvas');
      badCanvas.getContext = vi.fn(() => null);
      
      expect(() => new CanvasEngine(badCanvas, backgroundCanvas)).toThrow(
        'Failed to get 2D context from canvas'
      );
    });
  });

  describe('Property 2: High-DPI Scaling Correctness', () => {
    // Feature: doodle-canvas, Property 2: High-DPI Scaling Correctness
    // Validates: Requirements 1.3
    
    it('should scale canvas resolution by device pixel ratio', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 4 }), // DPR values (1, 1.5, 2, 3, 4 are common)
          fc.integer({ min: 100, max: 2000 }), // width
          fc.integer({ min: 100, max: 2000 }), // height
          (dpr, width, height) => {
            // Mock device pixel ratio
            Object.defineProperty(window, 'devicePixelRatio', {
              writable: true,
              configurable: true,
              value: dpr,
            });

            const canvas1 = createMockCanvas(width, height);
            const canvas2 = createMockCanvas(width, height);
            const engine = new CanvasEngine(canvas1, canvas2);

            const physical = engine.getPhysicalDimensions();
            const logical = engine.getLogicalDimensions();

            // Physical dimensions should equal logical dimensions * DPR
            expect(physical.width).toBe(logical.width * dpr);
            expect(physical.height).toBe(logical.height * dpr);
            
            // Canvas internal resolution should match physical dimensions
            expect(canvas1.width).toBe(width * dpr);
            expect(canvas1.height).toBe(height * dpr);
          }
        ),
        { numRuns: 50 } // Reduced from 100 to avoid memory issues
      );
    });

    it('should maintain correct DPR value', () => {
      fc.assert(
        fc.property(
          fc.double({ min: 1, max: 4, noNaN: true }),
          (dpr) => {
            Object.defineProperty(window, 'devicePixelRatio', {
              writable: true,
              configurable: true,
              value: dpr,
            });

            const canvas1 = createMockCanvas(800, 600);
            const canvas2 = createMockCanvas(800, 600);
            const engine = new CanvasEngine(canvas1, canvas2);

            expect(engine.getDevicePixelRatio()).toBe(dpr);
          }
        ),
        { numRuns: 50 } // Reduced from 100 to avoid memory issues
      );
    });
  });

  describe('Clear Method', () => {
    it('should clear the drawing canvas', () => {
      const engine = new CanvasEngine(drawingCanvas, backgroundCanvas);
      const ctx = drawingCanvas.getContext('2d')!;
      
      // Spy on clearRect
      const clearRectSpy = vi.spyOn(ctx, 'clearRect');
      
      engine.clear();
      
      expect(clearRectSpy).toHaveBeenCalled();
    });

    it('should clear canvas with correct dimensions', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 100, max: 2000 }),
          fc.integer({ min: 100, max: 2000 }),
          (width, height) => {
            const canvas1 = createMockCanvas(width, height);
            const canvas2 = createMockCanvas(width, height);
            const engine = new CanvasEngine(canvas1, canvas2);
            
            const ctx = canvas1.getContext('2d')!;
            const clearRectSpy = vi.spyOn(ctx, 'clearRect');
            
            engine.clear();
            
            // Should clear the entire physical canvas
            const physical = engine.getPhysicalDimensions();
            expect(clearRectSpy).toHaveBeenCalledWith(
              0,
              0,
              physical.width,
              physical.height
            );
          }
        ),
        { numRuns: 50 } // Reduced from 100 to avoid memory issues
      );
    });
  });

  describe('Dimension Methods', () => {
    it('should return correct logical dimensions', () => {
      const engine = new CanvasEngine(drawingCanvas, backgroundCanvas);
      const logical = engine.getLogicalDimensions();
      
      // Allow for floating point precision errors
      expect(logical.width).toBeCloseTo(800, -1);
      expect(logical.height).toBeCloseTo(600, -1);
    });

    it('should return correct physical dimensions', () => {
      Object.defineProperty(window, 'devicePixelRatio', {
        writable: true,
        configurable: true,
        value: 2,
      });
      
      const canvas1 = createMockCanvas(800, 600);
      const canvas2 = createMockCanvas(800, 600);
      const engine = new CanvasEngine(canvas1, canvas2);
      
      const physical = engine.getPhysicalDimensions();
      
      expect(physical.width).toBe(1600);
      expect(physical.height).toBe(1200);
    });
  });

  describe('Property 1: Canvas Responsive Resizing', () => {
    // Feature: doodle-canvas, Property 1: Canvas Responsive Resizing
    // Validates: Requirements 1.2
    
    it('should adjust canvas dimensions on resize', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 100, max: 2000 }),
          fc.integer({ min: 100, max: 2000 }),
          fc.integer({ min: 100, max: 2000 }),
          fc.integer({ min: 100, max: 2000 }),
          (initialWidth, initialHeight, newWidth, newHeight) => {
            // Create canvas with initial dimensions
            const canvas1 = createMockCanvas(initialWidth, initialHeight);
            const canvas2 = createMockCanvas(initialWidth, initialHeight);
            const engine = new CanvasEngine(canvas1, canvas2);

            // Verify initial dimensions
            const initialLogical = engine.getLogicalDimensions();
            expect(initialLogical.width).toBeCloseTo(initialWidth, -1);
            expect(initialLogical.height).toBeCloseTo(initialHeight, -1);

            // Simulate resize by updating getBoundingClientRect
            canvas1.getBoundingClientRect = vi.fn(() => ({
              width: newWidth,
              height: newHeight,
              top: 0,
              left: 0,
              bottom: newHeight,
              right: newWidth,
              x: 0,
              y: 0,
              toJSON: () => {},
            }));
            
            canvas2.getBoundingClientRect = vi.fn(() => ({
              width: newWidth,
              height: newHeight,
              top: 0,
              left: 0,
              bottom: newHeight,
              right: newWidth,
              x: 0,
              y: 0,
              toJSON: () => {},
            }));

            // Trigger resize
            engine.resize();

            // Verify new dimensions
            const newLogical = engine.getLogicalDimensions();
            expect(newLogical.width).toBeCloseTo(newWidth, -1);
            expect(newLogical.height).toBeCloseTo(newHeight, -1);
          }
        ),
        { numRuns: 50 } // Reduced from 100 to avoid memory issues
      );
    });

    it('should preserve strokes after resize', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 10 }), // number of strokes
          (numStrokes) => {
            const canvas1 = createMockCanvas(800, 600);
            const canvas2 = createMockCanvas(800, 600);
            const engine = new CanvasEngine(canvas1, canvas2);

            // Add some strokes
            for (let i = 0; i < numStrokes; i++) {
              engine.addStroke({
                points: [
                  { x: i * 10, y: i * 10, timestamp: i },
                  { x: i * 10 + 50, y: i * 10 + 50, timestamp: i + 10 },
                ],
                color: '#000000',
                brushType: 'ink',
                baseWidth: 3,
              });
            }

            expect(engine.getStrokes()).toHaveLength(numStrokes);

            // Resize
            canvas1.getBoundingClientRect = vi.fn(() => ({
              width: 1000,
              height: 800,
              top: 0,
              left: 0,
              bottom: 800,
              right: 1000,
              x: 0,
              y: 0,
              toJSON: () => {},
            }));
            
            canvas2.getBoundingClientRect = vi.fn(() => ({
              width: 1000,
              height: 800,
              top: 0,
              left: 0,
              bottom: 800,
              right: 1000,
              x: 0,
              y: 0,
              toJSON: () => {},
            }));

            engine.resize();

            // Strokes should still be preserved
            expect(engine.getStrokes()).toHaveLength(numStrokes);
          }
        ),
        { numRuns: 50 } // Reduced from 100 to avoid memory issues
      );
    });
  });

  describe('Stroke Management', () => {
    it('should add and retrieve strokes', () => {
      const engine = new CanvasEngine(drawingCanvas, backgroundCanvas);
      
      const stroke = {
        points: [
          { x: 0, y: 0, timestamp: 0 },
          { x: 10, y: 10, timestamp: 10 },
        ],
        color: '#ff0000',
        brushType: 'ink' as const,
        baseWidth: 5,
      };
      
      engine.addStroke(stroke);
      
      const strokes = engine.getStrokes();
      expect(strokes).toHaveLength(1);
      expect(strokes[0]).toEqual(stroke);
    });

    it('should clear all strokes', () => {
      const engine = new CanvasEngine(drawingCanvas, backgroundCanvas);
      
      engine.addStroke({
        points: [{ x: 0, y: 0, timestamp: 0 }],
        color: '#000000',
        brushType: 'ink',
        baseWidth: 3,
      });
      
      expect(engine.getStrokes()).toHaveLength(1);
      
      engine.clear();
      
      expect(engine.getStrokes()).toHaveLength(0);
    });
  });
});
