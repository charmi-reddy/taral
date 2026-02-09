import type { BackgroundStyle } from './types';

export class BackgroundRenderer {
  /**
   * Renders a plain solid color background
   * 
   * @param ctx - Canvas 2D context
   * @param width - Canvas width in logical pixels
   * @param height - Canvas height in logical pixels
   * @param color - Background color (default: white)
   */
  static renderPlain(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    color: string = '#ffffff'
  ): void {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, width, height);
  }

  /**
   * Renders ruled paper with horizontal lines
   * Similar to notebook paper
   * 
   * @param ctx - Canvas 2D context
   * @param width - Canvas width in logical pixels
   * @param height - Canvas height in logical pixels
   * @param lineSpacing - Space between lines in pixels (default: 30)
   * @param lineColor - Color of the lines (default: light gray)
   * @param backgroundColor - Background color (default: white)
   */
  static renderRuled(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    lineSpacing: number = 30,
    lineColor: string = '#e0e0e0',
    backgroundColor: string = '#ffffff'
  ): void {
    // Fill background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);

    // Draw horizontal lines
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 1;

    for (let y = lineSpacing; y < height; y += lineSpacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  }

  /**
   * Renders dotted paper with a grid of dots
   * Useful for sketching and maintaining proportions
   * 
   * @param ctx - Canvas 2D context
   * @param width - Canvas width in logical pixels
   * @param height - Canvas height in logical pixels
   * @param dotSpacing - Space between dots in pixels (default: 20)
   * @param dotRadius - Radius of each dot (default: 1.5)
   * @param dotColor - Color of the dots (default: light gray)
   * @param backgroundColor - Background color (default: white)
   */
  static renderDotted(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    dotSpacing: number = 20,
    dotRadius: number = 1.5,
    dotColor: string = '#d0d0d0',
    backgroundColor: string = '#ffffff'
  ): void {
    // Fill background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);

    // Draw dots
    ctx.fillStyle = dotColor;

    for (let x = dotSpacing; x < width; x += dotSpacing) {
      for (let y = dotSpacing; y < height; y += dotSpacing) {
        ctx.beginPath();
        ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  /**
   * Renders a pixel grid with square cells
   * Perfect for pixel art with snap-to-grid functionality
   * 
   * @param ctx - Canvas 2D context
   * @param width - Canvas width in logical pixels
   * @param height - Canvas height in logical pixels
   * @param gridSize - Size of each grid square in pixels (default: 16)
   * @param gridColor - Color of the grid lines (default: light gray)
   * @param backgroundColor - Background color (default: white)
   */
  static renderGrid(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    gridSize: number = 16,
    gridColor: string = '#e0e0e0',
    backgroundColor: string = '#ffffff'
  ): void {
    // Fill background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);

    // Draw grid lines
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;

    // Vertical lines
    for (let x = 0; x <= width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Horizontal lines
    for (let y = 0; y <= height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  }

  /**
   * Renders the appropriate background based on style
   * Convenience method that dispatches to specific render methods
   * 
   * @param ctx - Canvas 2D context
   * @param width - Canvas width in logical pixels
   * @param height - Canvas height in logical pixels
   * @param style - Background style to render
   */
  static render(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    style: BackgroundStyle
  ): void {
    switch (style) {
      case 'plain':
        this.renderPlain(ctx, width, height);
        break;
      case 'ruled':
        this.renderRuled(ctx, width, height);
        break;
      case 'dotted':
        this.renderDotted(ctx, width, height);
        break;
      case 'grid':
        this.renderGrid(ctx, width, height);
        break;
    }
  }
}
