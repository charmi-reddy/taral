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
    } else if (stroke.brushType === 'rainbow') {
      this.renderRainbowStroke(stroke.points, stroke.baseWidth);
    } else if (stroke.brushType === 'glitter') {
      this.renderGlitterStroke(stroke.points, stroke.color, stroke.baseWidth);
    } else if (stroke.brushType === 'watercolor') {
      this.renderWatercolorStroke(stroke.points, stroke.color, stroke.baseWidth);
    } else if (stroke.brushType === 'neon') {
      this.renderNeonStroke(stroke.points, stroke.color, stroke.baseWidth);
    } else if (stroke.brushType === 'geometric') {
      this.renderGeometricStroke(stroke.points, stroke.color, stroke.baseWidth);
    } else if (stroke.brushType === 'star') {
      this.renderStarStroke(stroke.points, stroke.color, stroke.baseWidth);
    } else if (stroke.brushType === 'chain') {
      this.renderChainStroke(stroke.points, stroke.color, stroke.baseWidth);
    } else if (stroke.brushType === 'wave') {
      this.renderWaveStroke(stroke.points, stroke.color, stroke.baseWidth);
    } else if (stroke.brushType === 'lightning') {
      this.renderLightningStroke(stroke.points, stroke.color, stroke.baseWidth);
    } else if (stroke.brushType === 'dots') {
      this.renderDotsStroke(stroke.points, stroke.color, stroke.baseWidth);
    } else if (stroke.brushType === 'stitch') {
      this.renderStitchStroke(stroke.points, stroke.color, stroke.baseWidth);
    } else if (stroke.brushType === 'fire') {
      this.renderFireStroke(stroke.points, stroke.baseWidth);
    } else if (stroke.brushType === 'ice') {
      this.renderIceStroke(stroke.points, stroke.baseWidth);
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
   * Renders a rainbow gradient effect
   * Creates a multi-colored trail that cycles through rainbow colors
   * 
   * @param points - Array of points in the stroke
   * @param width - Stroke width
   */
  private renderRainbowStroke(points: Point[], width: number): void {
    if (points.length < 2) return;

    this.drawingCtx.save();
    this.drawingCtx.lineWidth = width;
    this.drawingCtx.lineCap = 'round';
    this.drawingCtx.lineJoin = 'round';

    // Draw segments with different colors
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      
      // Calculate hue based on position in stroke (0-360 degrees)
      const hue = (i / points.length) * 360;
      this.drawingCtx.strokeStyle = `hsl(${hue}, 100%, 50%)`;
      
      this.drawingCtx.beginPath();
      this.drawingCtx.moveTo(p0.x, p0.y);
      this.drawingCtx.lineTo(p1.x, p1.y);
      this.drawingCtx.stroke();
    }

    this.drawingCtx.restore();
  }

  /**
   * Renders a glitter effect with sparkly particles
   * Creates random bright particles with varying sizes and opacity
   * 
   * @param points - Array of points in the stroke
   * @param color - Base color for glitter
   * @param size - Glitter spread size
   */
  private renderGlitterStroke(points: Point[], color: string, size: number): void {
    if (points.length === 0) return;

    this.drawingCtx.save();
    
    // Draw base stroke
    this.drawingCtx.strokeStyle = color;
    this.drawingCtx.lineWidth = size * 0.5;
    this.drawingCtx.lineCap = 'round';
    this.drawingCtx.lineJoin = 'round';
    this.drawingCtx.globalAlpha = 0.3;
    
    this.drawingCtx.beginPath();
    this.drawingCtx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      this.drawingCtx.lineTo(points[i].x, points[i].y);
    }
    this.drawingCtx.stroke();
    
    // Add sparkly particles
    const particleCount = Math.max(10, Math.floor(points.length / 2));
    const spread = size * 1.5;
    
    for (let i = 0; i < particleCount; i++) {
      const point = points[Math.floor(Math.random() * points.length)];
      const offsetX = (Math.random() - 0.5) * spread;
      const offsetY = (Math.random() - 0.5) * spread;
      
      // Random bright colors for sparkles
      const hue = Math.random() * 360;
      const lightness = 60 + Math.random() * 30; // Bright sparkles
      this.drawingCtx.fillStyle = `hsl(${hue}, 100%, ${lightness}%)`;
      this.drawingCtx.globalAlpha = 0.6 + Math.random() * 0.4;
      
      // Random sparkle size
      const sparkleSize = Math.random() * 2 + 1;
      
      // Draw star-shaped sparkle
      const x = point.x + offsetX;
      const y = point.y + offsetY;
      
      this.drawingCtx.beginPath();
      this.drawingCtx.arc(x, y, sparkleSize, 0, Math.PI * 2);
      this.drawingCtx.fill();
      
      // Add cross for star effect
      this.drawingCtx.globalAlpha = 0.8;
      this.drawingCtx.strokeStyle = `hsl(${hue}, 100%, 90%)`;
      this.drawingCtx.lineWidth = 0.5;
      this.drawingCtx.beginPath();
      this.drawingCtx.moveTo(x - sparkleSize * 1.5, y);
      this.drawingCtx.lineTo(x + sparkleSize * 1.5, y);
      this.drawingCtx.moveTo(x, y - sparkleSize * 1.5);
      this.drawingCtx.lineTo(x, y + sparkleSize * 1.5);
      this.drawingCtx.stroke();
    }

    this.drawingCtx.restore();
  }

  /**
   * Renders a watercolor effect with soft, blended edges
   * Creates organic, flowing strokes with transparency and bleeding
   * 
   * @param points - Array of points in the stroke
   * @param color - Watercolor base color
   * @param size - Brush size
   */
  private renderWatercolorStroke(points: Point[], color: string, size: number): void {
    if (points.length < 2) return;

    this.drawingCtx.save();
    
    // Draw multiple layers with decreasing opacity for soft edges
    const layers = 3;
    for (let layer = 0; layer < layers; layer++) {
      const layerSize = size * (1 + layer * 0.4);
      const opacity = 0.15 - layer * 0.03;
      
      this.drawingCtx.globalAlpha = opacity;
      this.drawingCtx.strokeStyle = color;
      this.drawingCtx.lineWidth = layerSize;
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
    }
    
    // Add subtle texture spots for watercolor effect
    this.drawingCtx.globalAlpha = 0.08;
    this.drawingCtx.fillStyle = color;
    
    const spotCount = Math.floor(points.length / 4);
    for (let i = 0; i < spotCount; i++) {
      const point = points[Math.floor(Math.random() * points.length)];
      const offsetX = (Math.random() - 0.5) * size * 2;
      const offsetY = (Math.random() - 0.5) * size * 2;
      const spotSize = Math.random() * size * 0.8;
      
      this.drawingCtx.beginPath();
      this.drawingCtx.arc(
        point.x + offsetX,
        point.y + offsetY,
        spotSize,
        0,
        Math.PI * 2
      );
      this.drawingCtx.fill();
    }

    this.drawingCtx.restore();
  }

  /**
   * Renders a neon glow effect
   * Creates bright glowing lines with multiple shadow layers
   * 
   * @param points - Array of points in the stroke
   * @param color - Neon color
   * @param size - Brush size
   */
  private renderNeonStroke(points: Point[], color: string, size: number): void {
    if (points.length < 2) return;

    this.drawingCtx.save();
    this.drawingCtx.lineCap = 'round';
    this.drawingCtx.lineJoin = 'round';
    
    // Draw outer glow layers
    const glowLayers = 3;
    for (let i = glowLayers; i > 0; i--) {
      this.drawingCtx.shadowBlur = size * i * 2;
      this.drawingCtx.shadowColor = color;
      this.drawingCtx.strokeStyle = color;
      this.drawingCtx.lineWidth = size * (1 + i * 0.3);
      this.drawingCtx.globalAlpha = 0.2;
      
      this.drawingCtx.beginPath();
      this.drawingCtx.moveTo(points[0].x, points[0].y);
      
      for (let j = 1; j < points.length - 1; j++) {
        const p0 = points[j];
        const p1 = points[j + 1];
        const midX = (p0.x + p1.x) / 2;
        const midY = (p0.y + p1.y) / 2;
        this.drawingCtx.quadraticCurveTo(p0.x, p0.y, midX, midY);
      }
      
      const lastPoint = points[points.length - 1];
      this.drawingCtx.lineTo(lastPoint.x, lastPoint.y);
      this.drawingCtx.stroke();
    }
    
    // Draw bright core
    this.drawingCtx.shadowBlur = size * 2;
    this.drawingCtx.shadowColor = color;
    this.drawingCtx.strokeStyle = '#ffffff';
    this.drawingCtx.lineWidth = size * 0.3;
    this.drawingCtx.globalAlpha = 1;
    
    this.drawingCtx.beginPath();
    this.drawingCtx.moveTo(points[0].x, points[0].y);
    
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

    this.drawingCtx.restore();
  }

  /**
   * Renders geometric shapes along the stroke path
   * Creates patterns of circles, squares, and triangles
   * 
   * @param points - Array of points in the stroke
   * @param color - Shape color
   * @param size - Shape size
   */
  private renderGeometricStroke(points: Point[], color: string, size: number): void {
    if (points.length === 0) return;

    this.drawingCtx.save();
    this.drawingCtx.strokeStyle = color;
    this.drawingCtx.fillStyle = color;
    this.drawingCtx.lineWidth = 2;
    this.drawingCtx.globalAlpha = 0.7;
    
    // Draw shapes at intervals along the stroke
    const interval = Math.max(3, Math.floor(size / 2));
    const shapes = ['circle', 'square', 'triangle'];
    
    for (let i = 0; i < points.length; i += interval) {
      const point = points[i];
      const shapeType = shapes[i % shapes.length];
      const shapeSize = size * 0.8;
      
      this.drawingCtx.beginPath();
      
      if (shapeType === 'circle') {
        this.drawingCtx.arc(point.x, point.y, shapeSize / 2, 0, Math.PI * 2);
        this.drawingCtx.stroke();
      } else if (shapeType === 'square') {
        this.drawingCtx.rect(
          point.x - shapeSize / 2,
          point.y - shapeSize / 2,
          shapeSize,
          shapeSize
        );
        this.drawingCtx.stroke();
      } else if (shapeType === 'triangle') {
        const height = shapeSize * 0.866; // equilateral triangle height
        this.drawingCtx.moveTo(point.x, point.y - height / 2);
        this.drawingCtx.lineTo(point.x - shapeSize / 2, point.y + height / 2);
        this.drawingCtx.lineTo(point.x + shapeSize / 2, point.y + height / 2);
        this.drawingCtx.closePath();
        this.drawingCtx.stroke();
      }
    }

    this.drawingCtx.restore();
  }

  /**
   * Renders stars along the stroke path
   * Creates a trail of five-pointed stars
   * 
   * @param points - Array of points in the stroke
   * @param color - Star color
   * @param size - Star size
   */
  private renderStarStroke(points: Point[], color: string, size: number): void {
    if (points.length === 0) return;

    this.drawingCtx.save();
    this.drawingCtx.fillStyle = color;
    this.drawingCtx.strokeStyle = color;
    this.drawingCtx.lineWidth = 1.5;
    this.drawingCtx.globalAlpha = 0.8;
    
    // Draw stars at intervals
    const interval = Math.max(3, Math.floor(size / 3));
    
    for (let i = 0; i < points.length; i += interval) {
      const point = points[i];
      const starSize = size * 0.6;
      const rotation = (i / points.length) * Math.PI * 2; // Rotate stars along path
      
      this.drawingCtx.save();
      this.drawingCtx.translate(point.x, point.y);
      this.drawingCtx.rotate(rotation);
      
      // Draw 5-pointed star with 10 points (5 outer, 5 inner)
      this.drawingCtx.beginPath();
      for (let j = 0; j < 10; j++) {
        const angle = (j * Math.PI) / 5 - Math.PI / 2;
        const radius = j % 2 === 0 ? starSize : starSize * 0.4;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        
        if (j === 0) {
          this.drawingCtx.moveTo(x, y);
        } else {
          this.drawingCtx.lineTo(x, y);
        }
      }
      this.drawingCtx.closePath();
      this.drawingCtx.fill();
      this.drawingCtx.stroke();
      
      this.drawingCtx.restore();
    }

    this.drawingCtx.restore();
  }

  /**
   * Renders a chain link pattern along the stroke
   * Creates connected oval links like a chain
   * 
   * @param points - Array of points in the stroke
   * @param color - Chain color
   * @param size - Link size
   */
  private renderChainStroke(points: Point[], color: string, size: number): void {
    if (points.length < 2) return;

    this.drawingCtx.save();
    this.drawingCtx.strokeStyle = color;
    this.drawingCtx.lineWidth = 2;
    this.drawingCtx.globalAlpha = 0.8;
    
    // Draw chain links at intervals
    const linkSpacing = size * 2;
    let distance = 0;
    
    for (let i = 1; i < points.length; i++) {
      const p0 = points[i - 1];
      const p1 = points[i];
      const dx = p1.x - p0.x;
      const dy = p1.y - p0.y;
      const segmentLength = Math.sqrt(dx * dx + dy * dy);
      
      distance += segmentLength;
      
      if (distance >= linkSpacing) {
        distance = 0;
        
        // Calculate angle for link orientation
        const angle = Math.atan2(dy, dx);
        const isVertical = i % 2 === 0;
        
        this.drawingCtx.save();
        this.drawingCtx.translate(p1.x, p1.y);
        this.drawingCtx.rotate(isVertical ? angle + Math.PI / 2 : angle);
        
        // Draw oval link
        this.drawingCtx.beginPath();
        this.drawingCtx.ellipse(0, 0, size * 0.8, size * 0.4, 0, 0, Math.PI * 2);
        this.drawingCtx.stroke();
        
        this.drawingCtx.restore();
      }
    }

    this.drawingCtx.restore();
  }

  /**
   * Renders a wavy pattern along the stroke
   * Creates flowing sine wave curves
   * 
   * @param points - Array of points in the stroke
   * @param color - Wave color
   * @param size - Wave amplitude
   */
  private renderWaveStroke(points: Point[], color: string, size: number): void {
    if (points.length < 2) return;

    this.drawingCtx.save();
    this.drawingCtx.strokeStyle = color;
    this.drawingCtx.lineWidth = size * 0.3;
    this.drawingCtx.lineCap = 'round';
    this.drawingCtx.globalAlpha = 0.8;
    
    // Draw multiple wave lines for depth
    const waveCount = 3;
    for (let wave = 0; wave < waveCount; wave++) {
      this.drawingCtx.globalAlpha = 0.6 - wave * 0.15;
      this.drawingCtx.beginPath();
      
      for (let i = 0; i < points.length; i++) {
        const point = points[i];
        
        // Calculate perpendicular offset for wave effect
        let perpX = 0;
        let perpY = 0;
        
        if (i < points.length - 1) {
          const nextPoint = points[i + 1];
          const dx = nextPoint.x - point.x;
          const dy = nextPoint.y - point.y;
          const length = Math.sqrt(dx * dx + dy * dy);
          
          if (length > 0) {
            // Perpendicular vector
            perpX = -dy / length;
            perpY = dx / length;
          }
        }
        
        // Apply sine wave offset
        const waveOffset = Math.sin((i / points.length) * Math.PI * 4 + wave * Math.PI / 3) * size * (wave + 1) * 0.5;
        const x = point.x + perpX * waveOffset;
        const y = point.y + perpY * waveOffset;
        
        if (i === 0) {
          this.drawingCtx.moveTo(x, y);
        } else {
          this.drawingCtx.lineTo(x, y);
        }
      }
      
      this.drawingCtx.stroke();
    }

    this.drawingCtx.restore();
  }

  /**
   * Renders a lightning bolt effect with jagged edges
   * Creates electric, zigzag patterns
   * 
   * @param points - Array of points in the stroke
   * @param color - Lightning color
   * @param size - Bolt thickness
   */
  private renderLightningStroke(points: Point[], color: string, size: number): void {
    if (points.length < 2) return;

    this.drawingCtx.save();
    
    // Draw outer glow
    this.drawingCtx.shadowBlur = size * 3;
    this.drawingCtx.shadowColor = color;
    this.drawingCtx.strokeStyle = color;
    this.drawingCtx.lineWidth = size * 0.8;
    this.drawingCtx.lineCap = 'round';
    this.drawingCtx.lineJoin = 'miter';
    this.drawingCtx.globalAlpha = 0.6;
    
    this.drawingCtx.beginPath();
    this.drawingCtx.moveTo(points[0].x, points[0].y);
    
    // Create jagged lightning path
    for (let i = 1; i < points.length; i++) {
      const p0 = points[i - 1];
      const p1 = points[i];
      
      // Add random jitter for lightning effect
      const jitterX = (Math.random() - 0.5) * size * 2;
      const jitterY = (Math.random() - 0.5) * size * 2;
      
      this.drawingCtx.lineTo(p1.x + jitterX, p1.y + jitterY);
    }
    
    this.drawingCtx.stroke();
    
    // Draw bright core
    this.drawingCtx.shadowBlur = size * 2;
    this.drawingCtx.strokeStyle = '#ffffff';
    this.drawingCtx.lineWidth = size * 0.3;
    this.drawingCtx.globalAlpha = 1;
    
    this.drawingCtx.beginPath();
    this.drawingCtx.moveTo(points[0].x, points[0].y);
    
    for (let i = 1; i < points.length; i++) {
      const p1 = points[i];
      const jitterX = (Math.random() - 0.5) * size;
      const jitterY = (Math.random() - 0.5) * size;
      this.drawingCtx.lineTo(p1.x + jitterX, p1.y + jitterY);
    }
    
    this.drawingCtx.stroke();
    
    // Add random branches
    this.drawingCtx.strokeStyle = color;
    this.drawingCtx.lineWidth = size * 0.4;
    this.drawingCtx.globalAlpha = 0.5;
    
    const branchCount = Math.floor(points.length / 10);
    for (let i = 0; i < branchCount; i++) {
      const branchStart = points[Math.floor(Math.random() * points.length)];
      const branchLength = size * 3;
      const angle = Math.random() * Math.PI * 2;
      
      this.drawingCtx.beginPath();
      this.drawingCtx.moveTo(branchStart.x, branchStart.y);
      this.drawingCtx.lineTo(
        branchStart.x + Math.cos(angle) * branchLength,
        branchStart.y + Math.sin(angle) * branchLength
      );
      this.drawingCtx.stroke();
    }

    this.drawingCtx.restore();
  }

  /**
   * Renders evenly spaced dots along the stroke
   * Creates a dotted line pattern
   * 
   * @param points - Array of points in the stroke
   * @param color - Dot color
   * @param size - Dot size
   */
  private renderDotsStroke(points: Point[], color: string, size: number): void {
    if (points.length === 0) return;

    this.drawingCtx.save();
    this.drawingCtx.fillStyle = color;
    this.drawingCtx.globalAlpha = 0.9;
    
    // Draw dots at regular intervals
    const dotSpacing = size * 1.5;
    let distance = 0;
    
    // Always draw first dot
    this.drawingCtx.beginPath();
    this.drawingCtx.arc(points[0].x, points[0].y, size / 2, 0, Math.PI * 2);
    this.drawingCtx.fill();
    
    for (let i = 1; i < points.length; i++) {
      const p0 = points[i - 1];
      const p1 = points[i];
      const dx = p1.x - p0.x;
      const dy = p1.y - p0.y;
      const segmentLength = Math.sqrt(dx * dx + dy * dy);
      
      distance += segmentLength;
      
      if (distance >= dotSpacing) {
        distance = 0;
        
        this.drawingCtx.beginPath();
        this.drawingCtx.arc(p1.x, p1.y, size / 2, 0, Math.PI * 2);
        this.drawingCtx.fill();
      }
    }

    this.drawingCtx.restore();
  }

  /**
   * Renders a stitched pattern like sewing
   * Creates dashed lines with cross-stitches
   * 
   * @param points - Array of points in the stroke
   * @param color - Stitch color
   * @param size - Stitch size
   */
  private renderStitchStroke(points: Point[], color: string, size: number): void {
    if (points.length < 2) return;

    this.drawingCtx.save();
    this.drawingCtx.strokeStyle = color;
    this.drawingCtx.lineWidth = size * 0.2;
    this.drawingCtx.lineCap = 'round';
    this.drawingCtx.globalAlpha = 0.8;
    
    // Draw base dashed line
    this.drawingCtx.setLineDash([size * 1.5, size * 0.8]);
    this.drawingCtx.beginPath();
    this.drawingCtx.moveTo(points[0].x, points[0].y);
    
    for (let i = 1; i < points.length; i++) {
      this.drawingCtx.lineTo(points[i].x, points[i].y);
    }
    
    this.drawingCtx.stroke();
    this.drawingCtx.setLineDash([]);
    
    // Draw cross-stitches at intervals
    const stitchSpacing = size * 2;
    let distance = 0;
    
    for (let i = 1; i < points.length; i++) {
      const p0 = points[i - 1];
      const p1 = points[i];
      const dx = p1.x - p0.x;
      const dy = p1.y - p0.y;
      const segmentLength = Math.sqrt(dx * dx + dy * dy);
      
      distance += segmentLength;
      
      if (distance >= stitchSpacing) {
        distance = 0;
        
        // Calculate perpendicular direction for cross
        const angle = Math.atan2(dy, dx);
        const perpAngle = angle + Math.PI / 2;
        const crossSize = size * 0.6;
        
        // Draw X stitch
        this.drawingCtx.beginPath();
        this.drawingCtx.moveTo(
          p1.x - Math.cos(perpAngle) * crossSize,
          p1.y - Math.sin(perpAngle) * crossSize
        );
        this.drawingCtx.lineTo(
          p1.x + Math.cos(perpAngle) * crossSize,
          p1.y + Math.sin(perpAngle) * crossSize
        );
        this.drawingCtx.stroke();
        
        this.drawingCtx.beginPath();
        this.drawingCtx.moveTo(
          p1.x - Math.cos(angle) * crossSize,
          p1.y - Math.sin(angle) * crossSize
        );
        this.drawingCtx.lineTo(
          p1.x + Math.cos(angle) * crossSize,
          p1.y + Math.sin(angle) * crossSize
        );
        this.drawingCtx.stroke();
      }
    }

    this.drawingCtx.restore();
  }

  /**
   * Renders a fire effect with flickering flames
   * Creates orange-red-yellow gradient particles rising upward
   * 
   * @param points - Array of points in the stroke
   * @param size - Flame size
   */
  private renderFireStroke(points: Point[], size: number): void {
    if (points.length === 0) return;

    this.drawingCtx.save();
    
    // Draw multiple flame particles
    const particleCount = Math.max(15, Math.floor(points.length / 2));
    
    for (let i = 0; i < particleCount; i++) {
      const point = points[Math.floor(Math.random() * points.length)];
      
      // Random upward offset for rising flames
      const offsetX = (Math.random() - 0.5) * size * 2;
      const offsetY = -Math.random() * size * 3; // Negative for upward
      
      // Fire colors: yellow -> orange -> red
      const colorChoice = Math.random();
      let color;
      if (colorChoice < 0.3) {
        color = `rgba(255, 255, ${Math.floor(Math.random() * 100)}, ${0.6 + Math.random() * 0.4})`;
      } else if (colorChoice < 0.7) {
        color = `rgba(255, ${Math.floor(100 + Math.random() * 100)}, 0, ${0.5 + Math.random() * 0.4})`;
      } else {
        color = `rgba(255, ${Math.floor(Math.random() * 50)}, 0, ${0.4 + Math.random() * 0.3})`;
      }
      
      this.drawingCtx.fillStyle = color;
      
      // Random flame particle size
      const particleSize = Math.random() * size * 0.8 + size * 0.3;
      
      // Draw flame particle (teardrop shape)
      const x = point.x + offsetX;
      const y = point.y + offsetY;
      
      this.drawingCtx.beginPath();
      this.drawingCtx.moveTo(x, y - particleSize);
      this.drawingCtx.quadraticCurveTo(
        x + particleSize * 0.5,
        y - particleSize * 0.5,
        x,
        y
      );
      this.drawingCtx.quadraticCurveTo(
        x - particleSize * 0.5,
        y - particleSize * 0.5,
        x,
        y - particleSize
      );
      this.drawingCtx.fill();
      
      // Add glow
      this.drawingCtx.shadowBlur = size;
      this.drawingCtx.shadowColor = 'rgba(255, 150, 0, 0.8)';
    }

    this.drawingCtx.restore();
  }

  /**
   * Renders an ice crystal effect with frost patterns
   * Creates blue-white crystalline structures
   * 
   * @param points - Array of points in the stroke
   * @param size - Crystal size
   */
  private renderIceStroke(points: Point[], size: number): void {
    if (points.length === 0) return;

    this.drawingCtx.save();
    
    // Draw base icy stroke
    this.drawingCtx.strokeStyle = 'rgba(150, 200, 255, 0.4)';
    this.drawingCtx.lineWidth = size * 0.8;
    this.drawingCtx.lineCap = 'round';
    this.drawingCtx.shadowBlur = size;
    this.drawingCtx.shadowColor = 'rgba(150, 200, 255, 0.6)';
    
    this.drawingCtx.beginPath();
    this.drawingCtx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      this.drawingCtx.lineTo(points[i].x, points[i].y);
    }
    this.drawingCtx.stroke();
    
    // Draw ice crystals at intervals
    const crystalSpacing = size * 2.5;
    let distance = 0;
    
    for (let i = 1; i < points.length; i++) {
      const p0 = points[i - 1];
      const p1 = points[i];
      const dx = p1.x - p0.x;
      const dy = p1.y - p0.y;
      const segmentLength = Math.sqrt(dx * dx + dy * dy);
      
      distance += segmentLength;
      
      if (distance >= crystalSpacing) {
        distance = 0;
        
        // Draw snowflake crystal
        this.drawingCtx.strokeStyle = 'rgba(200, 230, 255, 0.8)';
        this.drawingCtx.lineWidth = 1.5;
        this.drawingCtx.shadowBlur = size * 0.5;
        
        const crystalSize = size * 0.7;
        const branches = 6;
        
        for (let b = 0; b < branches; b++) {
          const angle = (b * Math.PI * 2) / branches;
          
          // Main branch
          this.drawingCtx.beginPath();
          this.drawingCtx.moveTo(p1.x, p1.y);
          this.drawingCtx.lineTo(
            p1.x + Math.cos(angle) * crystalSize,
            p1.y + Math.sin(angle) * crystalSize
          );
          this.drawingCtx.stroke();
          
          // Side branches
          const sideBranchSize = crystalSize * 0.4;
          const sideBranchAngle = Math.PI / 6;
          
          this.drawingCtx.beginPath();
          this.drawingCtx.moveTo(
            p1.x + Math.cos(angle) * crystalSize * 0.6,
            p1.y + Math.sin(angle) * crystalSize * 0.6
          );
          this.drawingCtx.lineTo(
            p1.x + Math.cos(angle + sideBranchAngle) * (crystalSize * 0.6 + sideBranchSize),
            p1.y + Math.sin(angle + sideBranchAngle) * (crystalSize * 0.6 + sideBranchSize)
          );
          this.drawingCtx.stroke();
          
          this.drawingCtx.beginPath();
          this.drawingCtx.moveTo(
            p1.x + Math.cos(angle) * crystalSize * 0.6,
            p1.y + Math.sin(angle) * crystalSize * 0.6
          );
          this.drawingCtx.lineTo(
            p1.x + Math.cos(angle - sideBranchAngle) * (crystalSize * 0.6 + sideBranchSize),
            p1.y + Math.sin(angle - sideBranchAngle) * (crystalSize * 0.6 + sideBranchSize)
          );
          this.drawingCtx.stroke();
        }
      }
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
    
    // Optimized scanline flood fill with performance limits
    const stack: [number, number, number, number][] = []; // [y, xLeft, xRight, direction]
    const visited = new Uint8Array(physicalWidth * physicalHeight);
    let pixelsFilled = 0;
    const maxPixels = physicalWidth * physicalHeight * 0.8; // Limit to 80% to prevent hangs
    
    const matchesTarget = (x: number, y: number): boolean => {
      if (x < 0 || x >= physicalWidth || y < 0 || y >= physicalHeight) return false;
      const pos = (y * physicalWidth + x) * 4;
      return pixels[pos] === targetR &&
             pixels[pos + 1] === targetG &&
             pixels[pos + 2] === targetB &&
             pixels[pos + 3] === targetA;
    };
    
    const fillPixel = (x: number, y: number): void => {
      const pos = (y * physicalWidth + x) * 4;
      pixels[pos] = fillR;
      pixels[pos + 1] = fillG;
      pixels[pos + 2] = fillB;
      pixels[pos + 3] = fillA;
      pixelsFilled++;
    };
    
    // Fill initial scanline
    let xLeft = physicalX;
    let xRight = physicalX;
    
    // Expand left
    while (xLeft > 0 && matchesTarget(xLeft - 1, physicalY)) {
      xLeft--;
    }
    
    // Expand right
    while (xRight < physicalWidth - 1 && matchesTarget(xRight + 1, physicalY)) {
      xRight++;
    }
    
    // Fill the initial scanline
    for (let x = xLeft; x <= xRight; x++) {
      fillPixel(x, physicalY);
      visited[physicalY * physicalWidth + x] = 1;
    }
    
    // Add scanlines above and below to stack
    if (physicalY > 0) stack.push([physicalY - 1, xLeft, xRight, -1]);
    if (physicalY < physicalHeight - 1) stack.push([physicalY + 1, xLeft, xRight, 1]);
    
    // Process stack with limits
    let iterations = 0;
    const maxIterations = 100000; // Safety limit to prevent infinite loops
    
    while (stack.length > 0 && iterations < maxIterations && pixelsFilled < maxPixels) {
      iterations++;
      const [y, xLeft, xRight, direction] = stack.pop()!;
      
      let x = xLeft;
      while (x <= xRight) {
        // Skip already visited pixels
        if (visited[y * physicalWidth + x]) {
          x++;
          continue;
        }
        
        // Find start of new span
        if (!matchesTarget(x, y)) {
          x++;
          continue;
        }
        
        // Found a span - expand it
        let spanLeft = x;
        let spanRight = x;
        
        // Expand left
        while (spanLeft > 0 && matchesTarget(spanLeft - 1, y) && !visited[y * physicalWidth + (spanLeft - 1)]) {
          spanLeft--;
        }
        
        // Expand right
        while (spanRight < physicalWidth - 1 && matchesTarget(spanRight + 1, y) && !visited[y * physicalWidth + (spanRight + 1)]) {
          spanRight++;
        }
        
        // Fill the span
        for (let sx = spanLeft; sx <= spanRight; sx++) {
          fillPixel(sx, y);
          visited[y * physicalWidth + sx] = 1;
        }
        
        // Add adjacent scanlines
        const nextY = y + direction;
        if (nextY >= 0 && nextY < physicalHeight) {
          stack.push([nextY, spanLeft, spanRight, direction]);
        }
        
        const prevY = y - direction;
        if (prevY >= 0 && prevY < physicalHeight && (spanLeft < xLeft || spanRight > xRight)) {
          stack.push([prevY, spanLeft, spanRight, -direction]);
        }
        
        x = spanRight + 1;
      }
    }
    
    // If we hit the pixel limit, fill the entire canvas instead
    if (pixelsFilled >= maxPixels) {
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
