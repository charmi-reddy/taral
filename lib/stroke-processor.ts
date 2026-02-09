import type { Point, BrushType } from './types';

export class StrokeProcessor {
  /**
   * Calculates velocity between two points in pixels per millisecond
   * Velocity is used for dynamic brush width calculation
   * 
   * @param p1 - First point
   * @param p2 - Second point
   * @returns Velocity in pixels per millisecond
   */
  static calculateVelocity(p1: Point, p2: Point): number {
    // Calculate distance between points using Pythagorean theorem
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Calculate time difference in milliseconds
    const timeDiff = p2.timestamp - p1.timestamp;
    
    // Avoid division by zero
    if (timeDiff === 0) {
      return 0;
    }
    
    // Velocity = distance / time
    return distance / timeDiff;
  }

  /**
   * Calculates dynamic stroke width based on velocity
   * Implements inverse relationship: faster movement = thinner stroke
   * Different brush types have different sensitivity to velocity
   * 
   * @param velocity - Pointer velocity in pixels per millisecond
   * @param baseWidth - Base stroke width from brush size setting
   * @param brushType - Type of brush (affects velocity sensitivity)
   * @returns Calculated stroke width clamped to min/max bounds
   */
  static calculateWidth(
    velocity: number,
    baseWidth: number,
    brushType: BrushType
  ): number {
    // Pixel pen has no velocity-based width variation
    if (brushType === 'pixel') {
      return baseWidth;
    }

    // Velocity sensitivity factors for each brush type
    // Higher value = more responsive to velocity changes
    const sensitivity: Record<BrushType, number> = {
      ink: 0.5,      // Moderate response - natural pen feel
      marker: 0.1,   // Minimal response - consistent width
      pencil: 0.8,   // High response - varies significantly
      pixel: 0,      // No response - fixed width
      eraser: 0.3,   // Light response - smooth erasing
    };

    const factor = sensitivity[brushType];

    // Inverse relationship: higher velocity reduces width
    // Formula: width = baseWidth / (1 + velocity * factor)
    // The denominator increases with velocity, reducing the overall width
    const velocityFactor = 1 / (1 + velocity * factor);
    const width = baseWidth * velocityFactor;

    // Clamp width to reasonable bounds (50% to 200% of base width)
    const minWidth = baseWidth * 0.5;
    const maxWidth = baseWidth * 2.0;

    return Math.max(minWidth, Math.min(maxWidth, width));
  }

  /**
   * Smooths a sequence of points using quadratic Bezier curves
   * Connects discrete pointer positions into smooth curves
   * 
   * Algorithm:
   * - For each triplet of points (p0, p1, p2)
   * - p1 becomes the control point
   * - Curve goes from midpoint(p0,p1) to midpoint(p1,p2)
   * - This creates smooth transitions between segments
   * 
   * @param points - Array of raw pointer positions
   * @returns Array of smoothed points (may be fewer than input)
   */
  static smoothPoints(points: Point[]): Point[] {
    // Need at least 2 points to smooth
    if (points.length < 2) {
      return points;
    }

    // Single point or two points don't need smoothing
    if (points.length === 2) {
      return points;
    }

    const smoothed: Point[] = [];

    // Start with the first point
    smoothed.push(points[0]);

    // Process triplets of points
    for (let i = 0; i < points.length - 2; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const p2 = points[i + 2];

      // Calculate midpoint between p1 and p2
      // This becomes the end point of the curve segment
      const midX = (p1.x + p2.x) / 2;
      const midY = (p1.y + p2.y) / 2;

      // Add the control point (p1) and end point (midpoint)
      // The actual curve will be drawn by the rendering engine
      smoothed.push(p1);
      smoothed.push({
        x: midX,
        y: midY,
        timestamp: p1.timestamp,
      });
    }

    // Add the last point
    smoothed.push(points[points.length - 1]);

    return smoothed;
  }

  /**
   * Snaps a point to the nearest grid intersection
   * Used for pixel-perfect drawing on grid backgrounds
   * 
   * @param point - Raw pointer position
   * @param gridSize - Size of grid squares in pixels
   * @returns Point snapped to nearest grid intersection
   */
  static snapToGrid(point: Point, gridSize: number): Point {
    return {
      x: Math.round(point.x / gridSize) * gridSize,
      y: Math.round(point.y / gridSize) * gridSize,
      pressure: point.pressure,
      timestamp: point.timestamp,
    };
  }
}
