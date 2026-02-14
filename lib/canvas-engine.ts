import type { Stroke, Point, BackgroundStyle } from './types';
import { StrokeProcessor } from './stroke-processor';
import { BackgroundRenderer } from './background-renderer';

export class CanvasEngine {
  private drawingCtx: CanvasRenderingContext2D;
  private backgroundCtx: CanvasRenderingContext2D;
  private drawingCanvas: HTMLCanvasElement;
  private backgroundCanvas: HTMLCanvasElement;
  private dpr: number;
  private currentStroke: Point[] = [];
  private strokes: Stroke[] = [];
  private undoneStrokes: Stroke[] = [];
  private rafId: number | null = null;

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
      this.renderStrokeImmediate(stroke);
    });
  }

  /**
   * Renders a stroke to the canvas
   * Dispatches to appropriate rendering method based on brush type
   * Uses requestAnimationFrame for smooth rendering
   * 
   * @param stroke - The stroke to render
   */
  renderStroke(stroke: Stroke): void {
    // Cancel any pending render
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
    }

    // Schedule render on next animation frame
    this.rafId = requestAnimationFrame(() => {
      this.renderStrokeImmediate(stroke);
      this.rafId = null;
    });
  }

  /**
   * Renders a stroke immediately without RAF
   * Used for redrawing multiple strokes
   * 
   * @param stroke - The stroke to render
   */
  private renderStrokeImmediate(stroke: Stroke): void {
    if (stroke.brushType === 'pixel') {
      this.renderPixelStroke(stroke.points, stroke.color, stroke.baseWidth);
    } else {
      this.renderSmoothStroke(stroke.points, stroke.color, stroke.baseWidth, stroke.brushType);
    }
  }

  /**
   * Renders a smooth stroke using quadratic Bezier curves
   * Used for ink, marker, pencil, and eraser brush types
   * 
   * @param points - Array of points in the stroke
   * @param color - Stroke color
   * @param baseWidth - Base stroke width
   * @param brushType - Type of brush (affects velocity sensitivity)
   */
  private renderSmoothStroke(
    points: Point[],
    color: string,
    baseWidth: number,
    brushType: 'ink' | 'marker' | 'pencil' | 'eraser'
  ): void {
    if (points.length < 2) return;

    // Save context state
    this.drawingCtx.save();

    // Use destination-out for eraser to actually remove pixels
    if (brushType === 'eraser') {
      this.drawingCtx.globalCompositeOperation = 'destination-out';
      this.drawingCtx.strokeStyle = 'rgba(0,0,0,1)'; // Color doesn't matter for destination-out
    } else {
      // Apply brush-specific visual properties
      switch (brushType) {
        case 'marker':
          // Marker: semi-transparent, bold, consistent
          this.drawingCtx.globalAlpha = 0.6;
          this.drawingCtx.strokeStyle = color;
          this.drawingCtx.lineCap = 'round';
          break;
        case 'pencil':
          // Pencil: slightly transparent, textured feel
          this.drawingCtx.globalAlpha = 0.7;
          this.drawingCtx.strokeStyle = color;
          this.drawingCtx.lineCap = 'round';
          break;
        case 'ink':
        default:
          // Ink: solid, clean, precise
          this.drawingCtx.globalAlpha = 1.0;
          this.drawingCtx.strokeStyle = color;
          this.drawingCtx.lineCap = 'round';
          break;
      }
    }
    
    this.drawingCtx.lineJoin = 'round';

    // For single segment, just draw a line
    if (points.length === 2) {
      const velocity = StrokeProcessor.calculateVelocity(points[0], points[1]);
      const width = StrokeProcessor.calculateWidth(velocity, baseWidth, brushType);
      
      this.drawingCtx.lineWidth = width;
      this.drawingCtx.beginPath();
      this.drawingCtx.moveTo(points[0].x, points[0].y);
      this.drawingCtx.lineTo(points[1].x, points[1].y);
      this.drawingCtx.stroke();
      
      // Restore context state
      this.drawingCtx.restore();
      return;
    }

    // Smooth the points using Bezier curves
    this.drawingCtx.beginPath();
    this.drawingCtx.moveTo(points[0].x, points[0].y);

    // Draw quadratic curves between points
    for (let i = 1; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];

      // Calculate velocity and width for this segment
      const velocity = StrokeProcessor.calculateVelocity(p0, p1);
      const width = StrokeProcessor.calculateWidth(velocity, baseWidth, brushType);
      this.drawingCtx.lineWidth = width;

      // Control point is current point
      // End point is midpoint to next point
      const midX = (p0.x + p1.x) / 2;
      const midY = (p0.y + p1.y) / 2;

      this.drawingCtx.quadraticCurveTo(p0.x, p0.y, midX, midY);
    }

    // Draw final segment to last point
    const lastPoint = points[points.length - 1];
    this.drawingCtx.lineTo(lastPoint.x, lastPoint.y);
    this.drawingCtx.stroke();
    
    // Restore context state
    this.drawingCtx.restore();
  }

  /**
   * Renders a pixel-perfect stroke using straight lines
   * Used for pixel pen brush type
   * No smoothing or velocity-based width variation
   * 
   * @param points - Array of points in the stroke
   * @param color - Stroke color
   * @param width - Fixed stroke width
   */
  private renderPixelStroke(points: Point[], color: string, width: number): void {
    if (points.length < 2) return;

    this.drawingCtx.strokeStyle = color;
    this.drawingCtx.lineWidth = width;
    this.drawingCtx.lineCap = 'square';
    this.drawingCtx.lineJoin = 'miter';

    this.drawingCtx.beginPath();
    this.drawingCtx.moveTo(points[0].x, points[0].y);

    // Draw straight lines between all points
    for (let i = 1; i < points.length; i++) {
      this.drawingCtx.lineTo(points[i].x, points[i].y);
    }

    this.drawingCtx.stroke();
  }

  /**
   * Updates the background canvas with the specified style
   * 
   * @param style - Background style to render
   */
  updateBackground(style: BackgroundStyle): void {
    const { width, height } = this.getLogicalDimensions();
    BackgroundRenderer.render(this.backgroundCtx, width, height, style);
  }

  /**
   * Adds a stroke to the history
   */
  addStroke(stroke: Stroke): void {
    this.strokes.push(stroke);
    // Clear redo stack when new stroke is added
    this.undoneStrokes = [];
  }

  /**
   * Sets the strokes array (used for undo/redo)
   */
  setStrokes(strokes: Stroke[]): void {
    this.strokes = strokes;
  }

  /**
   * Gets all stored strokes
   */
  getStrokes(): Stroke[] {
    return [...this.strokes];
  }

  /**
   * Undo the last stroke
   */
  undo(): boolean {
    if (this.strokes.length === 0) return false;
    
    const lastStroke = this.strokes.pop();
    if (lastStroke) {
      this.undoneStrokes.push(lastStroke);
    }
    
    // Redraw canvas with remaining strokes
    this.clearDrawingLayer();
    this.redrawAllStrokes();
    
    return true;
  }

  /**
   * Redo the last undone stroke
   */
  redo(): boolean {
    if (this.undoneStrokes.length === 0) return false;
    
    const stroke = this.undoneStrokes.pop();
    if (stroke) {
      this.strokes.push(stroke);
      this.renderStroke(stroke);
    }
    
    return true;
  }

  /**
   * Check if undo is available
   */
  canUndo(): boolean {
    return this.strokes.length > 0;
  }

  /**
   * Check if redo is available
   */
  canRedo(): boolean {
    return this.undoneStrokes.length > 0;
  }

  /**
   * Clears only the drawing layer without resetting stroke history
   */
  private clearDrawingLayer(): void {
    const width = this.drawingCanvas.width;
    const height = this.drawingCanvas.height;
    
    this.drawingCtx.save();
    this.drawingCtx.setTransform(1, 0, 0, 1, 0, 0);
    this.drawingCtx.clearRect(0, 0, width, height);
    this.drawingCtx.restore();
  }

  /**
   * Clears the drawing layer, removing all strokes
   */
  clear(): void {
    this.clearDrawingLayer();
    
    // Reset current stroke and stroke history
    this.currentStroke = [];
    this.strokes = [];
    this.undoneStrokes = [];
  }

  /**
   * Fills the entire canvas with a solid color
   * 
   * @param color - Fill color
   */
  fill(color: string): void {
    const { width, height } = this.getLogicalDimensions();
    
    this.drawingCtx.fillStyle = color;
    this.drawingCtx.fillRect(0, 0, width, height);
    
    // Clear stroke history since canvas is now filled
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
