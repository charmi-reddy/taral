import type { Stroke, Point, BackgroundStyle } from './types';

export class CanvasEngine {
  private drawingCtx: CanvasRenderingContext2D;
  private backgroundCtx: CanvasRenderingContext2D;
  private drawingCanvas: HTMLCanvasElement;
  private backgroundCanvas: HTMLCanvasElement;
  private dpr: number;
  private currentStroke: Point[] = [];
  private strokes: Stroke[] = [];

  constructor(
    drawingCanvas: HTMLCanvasElement,
    backgroundCanvas: HTMLCanvasElement
  ) {
    const drawingCtx = drawingCanvas.getContext('2d');
    const backgroundCtx = backgroundCanvas.getContext('2d');

    if (!drawingCtx || !backgroundCtx) {
      throw new Error('Failed to get 2D context from canvas');
    }

    this.drawingCanvas = drawingCanvas;
    this.backgroundCanvas = backgroundCanvas;
    this.drawingCtx = drawingCtx;
    this.backgroundCtx = backgroundCtx;
    
    // Get device pixel ratio for high-DPI support
    this.dpr = window.devicePixelRatio || 1;
    
    this.setupCanvas();
  }

  /**
   * Sets up canvas with high-DPI scaling
   * Adjusts canvas internal resolution based on device pixel ratio
   */
  setupCanvas(): void {
    // Get CSS dimensions
    const rect = this.drawingCanvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Set internal resolution (accounting for DPR)
    this.drawingCanvas.width = width * this.dpr;
    this.drawingCanvas.height = height * this.dpr;
    this.backgroundCanvas.width = width * this.dpr;
    this.backgroundCanvas.height = height * this.dpr;

    // Scale context to match DPR
    // This allows us to work in logical pixels while rendering at physical pixels
    this.drawingCtx.scale(this.dpr, this.dpr);
    this.backgroundCtx.scale(this.dpr, this.dpr);

    // Set default rendering properties
    this.drawingCtx.lineCap = 'round';
    this.drawingCtx.lineJoin = 'round';
  }

  /**
   * Handles canvas resize
   * Preserves existing strokes by redrawing them after resize
   */
  resize(): void {
    // Update DPR in case it changed (e.g., moving between monitors)
    this.dpr = window.devicePixelRatio || 1;
    
    // Reconfigure canvas dimensions
    this.setupCanvas();
    
    // Redraw all existing strokes
    this.redrawAllStrokes();
  }

  /**
   * Redraws all stored strokes
   * Used after resize to preserve drawing
   */
  private redrawAllStrokes(): void {
    this.strokes.forEach(stroke => {
      // This will be implemented when we add rendering methods
      // For now, just a placeholder
    });
  }

  /**
   * Adds a stroke to the history
   */
  addStroke(stroke: Stroke): void {
    this.strokes.push(stroke);
  }

  /**
   * Gets all stored strokes
   */
  getStrokes(): Stroke[] {
    return [...this.strokes];
  }

  /**
   * Clears the drawing layer, removing all strokes
   */
  clear(): void {
    const width = this.drawingCanvas.width;
    const height = this.drawingCanvas.height;
    
    // Clear at physical pixel resolution
    this.drawingCtx.save();
    this.drawingCtx.setTransform(1, 0, 0, 1, 0, 0);
    this.drawingCtx.clearRect(0, 0, width, height);
    this.drawingCtx.restore();
    
    // Reset current stroke and stroke history
    this.currentStroke = [];
    this.strokes = [];
  }

  /**
   * Gets the device pixel ratio used for scaling
   */
  getDevicePixelRatio(): number {
    return this.dpr;
  }

  /**
   * Gets the logical dimensions of the canvas
   */
  getLogicalDimensions(): { width: number; height: number } {
    return {
      width: this.drawingCanvas.width / this.dpr,
      height: this.drawingCanvas.height / this.dpr,
    };
  }

  /**
   * Gets the physical dimensions of the canvas
   */
  getPhysicalDimensions(): { width: number; height: number } {
    return {
      width: this.drawingCanvas.width,
      height: this.drawingCanvas.height,
    };
  }
}
