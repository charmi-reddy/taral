import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BackgroundRenderer } from './background-renderer';

// Mock canvas setup
function createMockCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

describe('BackgroundRenderer', () => {
  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;

  beforeEach(() => {
    canvas = createMockCanvas(800, 600);
    ctx = canvas.getContext('2d')!;
  });

  describe('renderPlain', () => {
    it('should fill canvas with solid color', () => {
      const fillRectSpy = vi.spyOn(ctx, 'fillRect');

      BackgroundRenderer.renderPlain(ctx, 800, 600);

      expect(fillRectSpy).toHaveBeenCalledWith(0, 0, 800, 600);
      expect(ctx.fillStyle).toBe('#ffffff');
    });

    it('should use custom color when provided', () => {
      BackgroundRenderer.renderPlain(ctx, 800, 600, '#f0f0f0');

      expect(ctx.fillStyle).toBe('#f0f0f0');
    });
  });

  describe('renderRuled', () => {
    it('should draw horizontal lines at regular intervals', () => {
      const strokeSpy = vi.spyOn(ctx, 'stroke');
      const lineSpacing = 30;

      BackgroundRenderer.renderRuled(ctx, 800, 600, lineSpacing);

      // Should have called stroke multiple times for lines
      expect(strokeSpy).toHaveBeenCalled();
      expect(strokeSpy.mock.calls.length).toBeGreaterThan(10);
    });

    it('should use default spacing of 30px', () => {
      const moveToSpy = vi.spyOn(ctx, 'moveTo');

      BackgroundRenderer.renderRuled(ctx, 800, 600);

      // First line should be at y=30
      expect(moveToSpy).toHaveBeenCalledWith(0, 30);
    });

    it('should apply custom line spacing', () => {
      const moveToSpy = vi.spyOn(ctx, 'moveTo');

      BackgroundRenderer.renderRuled(ctx, 800, 600, 50);

      // First line should be at y=50
      expect(moveToSpy).toHaveBeenCalledWith(0, 50);
    });

    it('should set line color', () => {
      BackgroundRenderer.renderRuled(ctx, 800, 600, 30, '#cccccc');

      expect(ctx.strokeStyle).toBe('#cccccc');
    });
  });

  describe('renderDotted', () => {
    it('should draw dots in a grid pattern', () => {
      const fillSpy = vi.spyOn(ctx, 'fill');
      const dotSpacing = 20;

      BackgroundRenderer.renderDotted(ctx, 800, 600, dotSpacing);

      // Should have called fill many times for dots
      expect(fillSpy).toHaveBeenCalled();
      expect(fillSpy.mock.calls.length).toBeGreaterThan(1000);
    });

    it('should use default spacing of 20px', () => {
      const arcSpy = vi.spyOn(ctx, 'arc');

      BackgroundRenderer.renderDotted(ctx, 800, 600);

      // First dot should be at (20, 20)
      expect(arcSpy).toHaveBeenCalledWith(20, 20, 1.5, 0, Math.PI * 2);
    });

    it('should apply custom dot spacing', () => {
      const arcSpy = vi.spyOn(ctx, 'arc');

      BackgroundRenderer.renderDotted(ctx, 800, 600, 25);

      // First dot should be at (25, 25)
      expect(arcSpy).toHaveBeenCalledWith(25, 25, 1.5, 0, Math.PI * 2);
    });

    it('should apply custom dot radius', () => {
      const arcSpy = vi.spyOn(ctx, 'arc');

      BackgroundRenderer.renderDotted(ctx, 800, 600, 20, 2);

      // Should use radius of 2
      expect(arcSpy).toHaveBeenCalledWith(20, 20, 2, 0, Math.PI * 2);
    });

    it('should set dot color', () => {
      BackgroundRenderer.renderDotted(ctx, 800, 600, 20, 1.5, '#aaaaaa');

      // fillStyle should be set to dot color (after background fill)
      expect(ctx.fillStyle).toBe('#aaaaaa');
    });
  });

  describe('renderGrid', () => {
    it('should draw vertical and horizontal grid lines', () => {
      const strokeSpy = vi.spyOn(ctx, 'stroke');
      const gridSize = 16;

      BackgroundRenderer.renderGrid(ctx, 800, 600, gridSize);

      // Calculate expected number of lines (including edges at 0)
      const verticalLines = Math.floor(800 / gridSize) + 1;
      const horizontalLines = Math.floor(600 / gridSize) + 1;
      const expectedLines = verticalLines + horizontalLines;

      // Should have called stroke for each line
      expect(strokeSpy.mock.calls.length).toBeGreaterThanOrEqual(expectedLines - 2);
    });

    it('should use default grid size of 16px', () => {
      const moveToSpy = vi.spyOn(ctx, 'moveTo');

      BackgroundRenderer.renderGrid(ctx, 800, 600);

      // Should have lines at multiples of 16
      expect(moveToSpy).toHaveBeenCalledWith(16, 0);
      expect(moveToSpy).toHaveBeenCalledWith(0, 16);
    });

    it('should apply custom grid size', () => {
      const moveToSpy = vi.spyOn(ctx, 'moveTo');

      BackgroundRenderer.renderGrid(ctx, 800, 600, 32);

      // Should have lines at multiples of 32
      expect(moveToSpy).toHaveBeenCalledWith(32, 0);
      expect(moveToSpy).toHaveBeenCalledWith(0, 32);
    });

    it('should set grid line color', () => {
      BackgroundRenderer.renderGrid(ctx, 800, 600, 16, '#dddddd');

      expect(ctx.strokeStyle).toBe('#dddddd');
    });

    it('should draw lines from edge to edge', () => {
      const lineToSpy = vi.spyOn(ctx, 'lineTo');

      BackgroundRenderer.renderGrid(ctx, 800, 600, 16);

      // Vertical lines should go from top to bottom
      expect(lineToSpy).toHaveBeenCalledWith(expect.any(Number), 600);
      
      // Horizontal lines should go from left to right
      expect(lineToSpy).toHaveBeenCalledWith(800, expect.any(Number));
    });
  });

  describe('render (dispatcher)', () => {
    it('should call renderPlain for plain style', () => {
      const fillRectSpy = vi.spyOn(ctx, 'fillRect');

      BackgroundRenderer.render(ctx, 800, 600, 'plain');

      expect(fillRectSpy).toHaveBeenCalledWith(0, 0, 800, 600);
    });

    it('should call renderRuled for ruled style', () => {
      const strokeSpy = vi.spyOn(ctx, 'stroke');

      BackgroundRenderer.render(ctx, 800, 600, 'ruled');

      expect(strokeSpy).toHaveBeenCalled();
    });

    it('should call renderDotted for dotted style', () => {
      const fillSpy = vi.spyOn(ctx, 'fill');

      BackgroundRenderer.render(ctx, 800, 600, 'dotted');

      expect(fillSpy).toHaveBeenCalled();
    });

    it('should call renderGrid for grid style', () => {
      const strokeSpy = vi.spyOn(ctx, 'stroke');

      BackgroundRenderer.render(ctx, 800, 600, 'grid');

      expect(strokeSpy).toHaveBeenCalled();
    });
  });

  describe('Pattern Dimensions', () => {
    it('should respect canvas dimensions for plain background', () => {
      const fillRectSpy = vi.spyOn(ctx, 'fillRect');

      BackgroundRenderer.renderPlain(ctx, 1000, 800);

      expect(fillRectSpy).toHaveBeenCalledWith(0, 0, 1000, 800);
    });

    it('should draw ruled lines across full width', () => {
      const lineToSpy = vi.spyOn(ctx, 'lineTo');

      BackgroundRenderer.renderRuled(ctx, 1200, 600);

      // Lines should extend to full width
      expect(lineToSpy).toHaveBeenCalledWith(1200, expect.any(Number));
    });

    it('should fill entire canvas with dot grid', () => {
      const arcSpy = vi.spyOn(ctx, 'arc');

      BackgroundRenderer.renderDotted(ctx, 400, 300, 20);

      // Should have dots near the edges
      const calls = arcSpy.mock.calls;
      const xCoords = calls.map(call => call[0]);
      const yCoords = calls.map(call => call[1]);

      expect(Math.max(...xCoords)).toBeGreaterThanOrEqual(380);
      expect(Math.max(...yCoords)).toBeGreaterThanOrEqual(280);
    });

    it('should draw grid lines to canvas edges', () => {
      const lineToSpy = vi.spyOn(ctx, 'lineTo');

      BackgroundRenderer.renderGrid(ctx, 640, 480, 16);

      // Should have lines extending to edges
      expect(lineToSpy).toHaveBeenCalledWith(640, expect.any(Number));
      expect(lineToSpy).toHaveBeenCalledWith(expect.any(Number), 480);
    });
  });
});
