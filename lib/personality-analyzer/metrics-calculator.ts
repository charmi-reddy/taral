import type { Stroke } from '../types';
import type { DrawingMetrics, DoodleData } from './types';

export class MetricsCalculator {
  calculateSpeed(strokes: Stroke[]): number | null {
    let totalDistance = 0;
    let totalTime = 0;
    let validSegments = 0;

    for (const stroke of strokes) {
      const points = stroke.points;
      for (let i = 1; i < points.length; i++) {
        const p1 = points[i - 1];
        const p2 = points[i];
        
        if (p1.timestamp && p2.timestamp) {
          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const time = p2.timestamp - p1.timestamp;
          
          if (time > 0) {
            totalDistance += distance;
            totalTime += time;
            validSegments++;
          }
        }
      }
    }

    return validSegments > 0 && totalTime > 0 ? totalDistance / totalTime : null;
  }

  calculatePressureVariance(strokes: Stroke[]): number | null {
    const pressures: number[] = [];
    
    for (const stroke of strokes) {
      for (const point of stroke.points) {
        if (point.pressure !== undefined) {
          pressures.push(point.pressure);
        }
      }
    }

    if (pressures.length < 2) return null;

    const mean = pressures.reduce((sum, p) => sum + p, 0) / pressures.length;
    const variance = pressures.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / pressures.length;
    const stdDev = Math.sqrt(variance);
    
    // Normalize to 0-1 range (assuming pressure is 0-1)
    return Math.min(stdDev / mean, 1);
  }

  calculateSmoothness(strokes: Stroke[]): number {
    let smallChanges = 0;
    let totalChanges = 0;

    for (const stroke of strokes) {
      const points = stroke.points;
      if (points.length < 3) continue;

      for (let i = 1; i < points.length - 1; i++) {
        const p1 = points[i - 1];
        const p2 = points[i];
        const p3 = points[i + 1];

        const angle1 = Math.atan2(p2.y - p1.y, p2.x - p1.x);
        const angle2 = Math.atan2(p3.y - p2.y, p3.x - p2.x);
        
        let angleDiff = Math.abs(angle2 - angle1);
        if (angleDiff > Math.PI) angleDiff = 2 * Math.PI - angleDiff;
        
        const angleDegrees = (angleDiff * 180) / Math.PI;
        
        if (angleDegrees < 15) {
          smallChanges++;
        }
        totalChanges++;
      }
    }

    return totalChanges > 0 ? smallChanges / totalChanges : 0.5;
  }

  calculateDirectionChanges(strokes: Stroke[]): number {
    let changes = 0;

    for (const stroke of strokes) {
      const points = stroke.points;
      if (points.length < 3) continue;

      for (let i = 1; i < points.length - 1; i++) {
        const p1 = points[i - 1];
        const p2 = points[i];
        const p3 = points[i + 1];

        const angle1 = Math.atan2(p2.y - p1.y, p2.x - p1.x);
        const angle2 = Math.atan2(p3.y - p2.y, p3.x - p2.x);
        
        let angleDiff = Math.abs(angle2 - angle1);
        if (angleDiff > Math.PI) angleDiff = 2 * Math.PI - angleDiff;
        
        const angleDegrees = (angleDiff * 180) / Math.PI;
        
        if (angleDegrees > 30) {
          changes++;
        }
      }
    }

    return changes;
  }

  calculateBrushVariety(strokes: Stroke[]): number {
    const brushes = new Set<string>();
    
    for (const stroke of strokes) {
      if (stroke.brushType) {
        brushes.add(stroke.brushType);
      }
    }

    return brushes.size;
  }

  calculateColorDiversity(strokes: Stroke[]): number {
    const colors = new Set<string>();
    
    for (const stroke of strokes) {
      if (stroke.color) {
        colors.add(stroke.color);
      }
    }

    return colors.size;
  }

  calculateMetrics(doodleData: DoodleData): DrawingMetrics {
    const strokes = doodleData.strokes;
    const totalPoints = strokes.reduce((sum, s) => sum + s.points.length, 0);

    return {
      averageSpeed: this.calculateSpeed(strokes),
      pressureVariance: this.calculatePressureVariance(strokes),
      smoothness: this.calculateSmoothness(strokes),
      directionChanges: this.calculateDirectionChanges(strokes),
      brushVariety: this.calculateBrushVariety(strokes),
      colorDiversity: this.calculateColorDiversity(strokes),
      totalStrokes: strokes.length,
      totalPoints,
    };
  }

  aggregateMetrics(doodles: DoodleData[]): DrawingMetrics {
    if (doodles.length === 0) {
      return {
        averageSpeed: null,
        pressureVariance: null,
        smoothness: 0,
        directionChanges: 0,
        brushVariety: 0,
        colorDiversity: 0,
        totalStrokes: 0,
        totalPoints: 0,
      };
    }

    const allMetrics = doodles.map(d => this.calculateMetrics(d));
    const totalPoints = allMetrics.reduce((sum, m) => sum + m.totalPoints, 0);

    // Weighted average based on point count
    const weightedSum = (metric: keyof DrawingMetrics) => {
      return allMetrics.reduce((sum, m) => {
        const value = m[metric];
        if (typeof value === 'number') {
          return sum + value * m.totalPoints;
        }
        return sum;
      }, 0);
    };

    return {
      averageSpeed: weightedSum('averageSpeed') / totalPoints || null,
      pressureVariance: weightedSum('pressureVariance') / totalPoints || null,
      smoothness: weightedSum('smoothness') / totalPoints,
      directionChanges: allMetrics.reduce((sum, m) => sum + m.directionChanges, 0),
      brushVariety: Math.max(...allMetrics.map(m => m.brushVariety)),
      colorDiversity: Math.max(...allMetrics.map(m => m.colorDiversity)),
      totalStrokes: allMetrics.reduce((sum, m) => sum + m.totalStrokes, 0),
      totalPoints,
    };
  }
}
