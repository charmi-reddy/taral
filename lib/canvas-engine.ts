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
    // Check if this is an image data stroke (from fill operation)
    const strokeWithImageData = stroke as Stroke & { imageData?: ImageData };
    if (strokeWithImageData.imageData) {
      this.drawingCtx.putImageData(strokeWithImageData.imageData, 0, 0);
      return;
    }
    
    if (stroke.brushType === 'pixel') {
      this.renderPixelStroke(stroke.points, stroke.color, stroke.baseWidth);
    } else if (stroke.brushType === 'spray') {
      this.renderSprayStroke(stroke.points, stroke.color, stroke.baseWidth);
    } else if (stroke.brushType === 'pencil') {
      this.renderPencilStroke(stroke.points, stroke.color, stroke.baseWidth);
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
    brushType: 'ink' | 'eraser'
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
      this.drawingCtx.globalAlpha = 1.0; // Always use full opacity to avoid compounding
      this.drawingCtx.strokeStyle = color;
      this.drawingCtx.lineCap = 'round';
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
   * Renders a spray paint effect
   * Creates random dots around each point for a spray can effect
   * 
   * @param points - Array of points in the stroke
   * @param color - Spray color
   * @param size - Spray radius
   */
  private renderSprayStroke(points: Point[], color: string, size: number): void {
    if (points.length === 0) return;

    this.drawingCtx.fillStyle = color;
    
    // Spray density - more dots for larger sizes
    const density = Math.max(5, Math.floor(size / 2));
    const radius = size * 2;

    for (const point of points) {
      // Create random spray dots around each point
      for (let i = 0; i < density; i++) {
        // Random angle and distance from center
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * radius;
        
        const x = point.x + Math.cos(angle) * distance;
        const y = point.y + Math.sin(angle) * distance;
        
        // Random dot size for more natural spray effect
        const dotSize = Math.random() * 1.5 + 0.5;
        
        this.drawingCtx.beginPath();
        this.drawingCtx.arc(x, y, dotSize, 0, Math.PI * 2);
        this.drawingCtx.fill();
      }
    }
  }

  /**
   * Renders a pencil effect with texture
   * Creates grainy, textured strokes like graphite pencil
   * 
   * @param points - Array of points in the stroke
   * @param color - Pencil color
   * @param width - Pencil width (respects user size setting)
   */
  private renderPencilStroke(points: Point[], color: string, width: number): void {
    if (points.length < 2) return;

    this.drawingCtx.save();
    
    // Main stroke with slight transparency
    this.drawingCtx.globalAlpha = 0.7;
    this.drawingCtx.strokeStyle = color;
    this.drawingCtx.lineWidth = width;
    this.drawingCtx.lineCap = 'round';
    this.drawingCtx.lineJoin = 'round';

    this.drawingCtx.beginPath();
    this.drawingCtx.moveTo(points[0].x, points[0].y);

    // Draw smooth curves
    for (let i = 1; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const midX = (p0.x + p1.x) / 2;
      const midY = (p0.y + p1.y) / 2;
      this.drawingCtx.quadraticCurveTo(p0.x, p0.y, midX, midY);
    }

    const lastPoint = points[points.length - 1];
    this.drawingCtx.lineTo(lastPoint.x, lastPoint.y);
    this.drawingCtx.stroke();

    // Add texture with small random dots along the stroke
    this.drawingCtx.globalAlpha = 0.3;
    this.drawingCtx.fillStyle = color;
    
    const texturePoints = Math.floor(points.length / 3); // Texture density
    for (let i = 0; i < texturePoints; i++) {
      const point = points[Math.floor(Math.random() * points.length)];
      const offsetX = (Math.random() - 0.5) * width;
      const offsetY = (Math.random() - 0.5) * width;
      
      this.drawingCtx.beginPath();
      this.drawingCtx.arc(
        point.x + offsetX,
        point.y + offsetY,
        Math.random() * 0.8,
        0,
        Math.PI * 2
      );
      this.drawingCtx.fill();
    }

    this.drawingCtx.restore();
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
   * Saves current canvas state as an image data stroke
   * Used before fill operations to enable undo
   */
  private saveCanvasState(): void {
    const imageData = this.drawingCtx.getImageData(
      0, 
      0, 
      this.drawingCanvas.width, 
      this.drawingCanvas.height
    );
    
    // Create a special stroke that stores the canvas state
    const canvasStateStroke: Stroke & { imageData?: ImageData } = {
      points: [],
      color: '',
      brushType: 'ink',
      baseWidth: 0,
      imageData: imageData,
    };
    
    this.strokes.push(canvasStateStroke as Stroke);
    // Clear redo stack when new action is performed
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
      
      // Check if this is an image data stroke (from fill operation)
      const strokeWithImageData = stroke as Stroke & { imageData?: ImageData };
      if (strokeWithImageData.imageData) {
        this.drawingCtx.putImageData(strokeWithImageData.imageData, 0, 0);
      } else {
        this.renderStroke(stroke);
      }
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
    // Save canvas state before clearing to enable undo
    this.saveCanvasState();
    
    this.clearDrawingLayer();
    
    // Reset current stroke
    this.currentStroke = [];
  }

  /**
   * Fills the entire canvas with a solid color
   * 
   * @param color - Fill color
   */
  fill(color: string): void {
    // Save canvas state before filling to enable undo
    this.saveCanvasState();
    
    const { width, height } = this.getLogicalDimensions();
    
    this.drawingCtx.fillStyle = color;
    this.drawingCtx.fillRect(0, 0, width, height);
    
    // Save the filled state so subsequent operations can undo to this state
    this.saveCanvasState();
  }

  /**
   * Flood fill at a specific point
   * Fills an enclosed area with the specified color
   * Falls back to full canvas fill if area is too large (not enclosed)
   * 
   * @param x - X coordinate (logical pixels)
   * @param y - Y coordinate (logical pixels)
   * @param fillColor - Color to fill with
   */
  floodFill(x: number, y: number, fillColor: string): void {
    const { width, height } = this.getLogicalDimensions();
    
    // Convert logical coordinates to physical pixels
    const physicalX = Math.floor(x * this.dpr);
    const physicalY = Math.floor(y * this.dpr);
    const physicalWidth = this.drawingCanvas.width;
    const physicalHeight = this.drawingCanvas.height;
    
    // Get image data
    const imageData = this.drawingCtx.getImageData(0, 0, physicalWidth, physicalHeight);
    const pixels = imageData.data;
    
    // Get target color at click point
    const startPos = (physicalY * physicalWidth + physicalX) * 4;
    const targetR = pixels[startPos];
    const targetG = pixels[startPos + 1];
    const targetB = pixels[startPos + 2];
    const targetA = pixels[startPos + 3];
    
    // Parse fill color
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d')!;
    tempCtx.fillStyle = fillColor;
    tempCtx.fillRect(0, 0, 1, 1);
    const fillData = tempCtx.getImageData(0, 0, 1, 1).data;
    const fillR = fillData[0];
    const fillG = fillData[1];
    const fillB = fillData[2];
    const fillA = 255;
    
    // If clicking on same color, do nothing
    if (targetR === fillR && targetG === fillG && targetB === fillB && targetA === fillA) {
      return;
    }
    
    // Save canvas state before filling to enable undo
    this.saveCanvasState();
    
    // Flood fill algorithm with stack
    const stack: [number, number][] = [[physicalX, physicalY]];
    const visited = new Set<number>();
    let pixelsFilled = 0;
    const maxPixels = physicalWidth * physicalHeight * 0.5; // If filling more than 50%, fill whole canvas
    
    const matchesTarget = (pos: number): boolean => {
      return pixels[pos] === targetR &&
             pixels[pos + 1] === targetG &&
             pixels[pos + 2] === targetB &&
             pixels[pos + 3] === targetA;
    };
    
    while (stack.length > 0 && pixelsFilled < maxPixels) {
      const [px, py] = stack.pop()!;
      
      // Check bounds
      if (px < 0 || px >= physicalWidth || py < 0 || py >= physicalHeight) continue;
      
      const pos = (py * physicalWidth + px) * 4;
      const key = py * physicalWidth + px;
      
      // Skip if already visited or doesn't match target color
      if (visited.has(key) || !matchesTarget(pos)) continue;
      
      visited.add(key);
      pixelsFilled++;
      
      // Fill this pixel
      pixels[pos] = fillR;
      pixels[pos + 1] = fillG;
      pixels[pos + 2] = fillB;
      pixels[pos + 3] = fillA;
      
      // Add neighbors to stack
      stack.push([px + 1, py]);
      stack.push([px - 1, py]);
      stack.push([px, py + 1]);
      stack.push([px, py - 1]);
    }
    
    // If we filled too many pixels, it's not enclosed - fill whole canvas instead
    if (pixelsFilled >= maxPixels) {
      // Note: fill() already calls saveCanvasState(), but we already called it above
      // Remove the duplicate by directly filling without calling fill()
      const { width, height } = this.getLogicalDimensions();
      this.drawingCtx.fillStyle = fillColor;
      this.drawingCtx.fillRect(0, 0, width, height);
    } else {
      // Put the modified image data back
      this.drawingCtx.putImageData(imageData, 0, 0);
    }
    
    // Save the filled state so subsequent operations can undo to this state
    this.saveCanvasState();
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
