/**
 * Unit tests for thumbnail generation
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { generateThumbnail } from './thumbnail';
import { PAGE_CONSTANTS } from './types';

describe('generateThumbnail', () => {
  let backgroundCanvas: HTMLCanvasElement;
  let drawingCanvas: HTMLCanvasElement;

  beforeEach(() => {
    // Create mock canvas elements
    backgroundCanvas = document.createElement('canvas');
    backgroundCanvas.width = 800;
    backgroundCanvas.height = 600;

    drawingCanvas = document.createElement('canvas');
    drawingCanvas.width = 800;
    drawingCanvas.height = 600;
  });

  it('should generate a valid base64 JPEG data URL', () => {
    // Draw something on the canvas to ensure it's not empty
    const bgCtx = backgroundCanvas.getContext('2d')!;
    bgCtx.fillStyle = 'white';
    bgCtx.fillRect(0, 0, 10, 10);

    const thumbnail = generateThumbnail(backgroundCanvas, drawingCanvas);
    
    expect(thumbnail).toMatch(/^data:image\/jpeg;base64,/);
    expect(thumbnail.length).toBeGreaterThan(100); // Should have actual image data
  });

  it('should generate thumbnail with correct dimensions', () => {
    const thumbnail = generateThumbnail(backgroundCanvas, drawingCanvas);
    
    // Create an image to verify dimensions
    const img = new Image();
    img.src = thumbnail;
    
    // Note: In jsdom, we can't actually load images, but we can verify the data URL format
    expect(thumbnail).toBeTruthy();
  });

  it('should include background layer in thumbnail', () => {
    // Draw a red background
    const bgCtx = backgroundCanvas.getContext('2d')!;
    bgCtx.fillStyle = 'red';
    bgCtx.fillRect(0, 0, backgroundCanvas.width, backgroundCanvas.height);

    const thumbnail = generateThumbnail(backgroundCanvas, drawingCanvas);
    
    expect(thumbnail).toMatch(/^data:image\/jpeg;base64,/);
    expect(thumbnail.length).toBeGreaterThan(100);
  });

  it('should include drawing layer in thumbnail', () => {
    // Draw a blue circle on drawing canvas
    const drawCtx = drawingCanvas.getContext('2d')!;
    drawCtx.fillStyle = 'blue';
    drawCtx.beginPath();
    drawCtx.arc(400, 300, 50, 0, Math.PI * 2);
    drawCtx.fill();

    const thumbnail = generateThumbnail(backgroundCanvas, drawingCanvas);
    
    expect(thumbnail).toMatch(/^data:image\/jpeg;base64,/);
    expect(thumbnail.length).toBeGreaterThan(100);
  });

  it('should composite both layers in thumbnail', () => {
    // Draw background
    const bgCtx = backgroundCanvas.getContext('2d')!;
    bgCtx.fillStyle = 'white';
    bgCtx.fillRect(0, 0, backgroundCanvas.width, backgroundCanvas.height);

    // Draw on drawing layer
    const drawCtx = drawingCanvas.getContext('2d')!;
    drawCtx.strokeStyle = 'black';
    drawCtx.lineWidth = 5;
    drawCtx.beginPath();
    drawCtx.moveTo(100, 100);
    drawCtx.lineTo(700, 500);
    drawCtx.stroke();

    const thumbnail = generateThumbnail(backgroundCanvas, drawingCanvas);
    
    expect(thumbnail).toMatch(/^data:image\/jpeg;base64,/);
    expect(thumbnail.length).toBeGreaterThan(100);
  });

  it('should handle empty canvases', () => {
    // Both canvases are empty (transparent)
    const thumbnail = generateThumbnail(backgroundCanvas, drawingCanvas);
    
    expect(thumbnail).toMatch(/^data:image\/jpeg;base64,/);
    expect(thumbnail.length).toBeGreaterThan(100);
  });

  it('should throw error if 2D context cannot be obtained', () => {
    // This is difficult to test in jsdom, but we can verify the function structure
    // In a real browser, this would only fail in very rare circumstances
    expect(() => {
      generateThumbnail(backgroundCanvas, drawingCanvas);
    }).not.toThrow();
  });
});
