/**
 * Thumbnail generation utility for page previews
 * 
 * This module provides functionality to generate thumbnail images from canvas elements.
 * Thumbnails are created by compositing the background and drawing layers, scaling to
 * consistent dimensions, and encoding as base64 JPEG images.
 */

import { PAGE_CONSTANTS } from './types';

/**
 * Generates a thumbnail image from background and drawing canvas elements
 * 
 * Creates an off-screen canvas, draws both the background and drawing layers,
 * scales to thumbnail dimensions (300x200), and converts to base64 JPEG format
 * with 80% quality.
 * 
 * @param backgroundCanvas - The canvas element containing the background layer
 * @param drawingCanvas - The canvas element containing the drawing strokes
 * @returns Base64-encoded JPEG image string (data URL format)
 * 
 * @example
 * ```typescript
 * const thumbnail = generateThumbnail(bgCanvas, drawCanvas);
 * // Returns: "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
 * ```
 */
export function generateThumbnail(
  backgroundCanvas: HTMLCanvasElement,
  drawingCanvas: HTMLCanvasElement
): string {
  // Create off-screen canvas for thumbnail rendering
  const offscreenCanvas = document.createElement('canvas');
  offscreenCanvas.width = PAGE_CONSTANTS.THUMBNAIL_WIDTH;
  offscreenCanvas.height = PAGE_CONSTANTS.THUMBNAIL_HEIGHT;
  
  const ctx = offscreenCanvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get 2D context for thumbnail generation');
  }
  
  // Draw background layer (scaled to thumbnail dimensions)
  ctx.drawImage(
    backgroundCanvas,
    0,
    0,
    PAGE_CONSTANTS.THUMBNAIL_WIDTH,
    PAGE_CONSTANTS.THUMBNAIL_HEIGHT
  );
  
  // Draw drawing layer on top (scaled to thumbnail dimensions)
  ctx.drawImage(
    drawingCanvas,
    0,
    0,
    PAGE_CONSTANTS.THUMBNAIL_WIDTH,
    PAGE_CONSTANTS.THUMBNAIL_HEIGHT
  );
  
  // Convert to base64 JPEG with 80% quality
  return offscreenCanvas.toDataURL('image/jpeg', 0.8);
}
