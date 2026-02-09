import { describe, it, expect } from 'vitest';
import type { BrushType, BackgroundStyle, Point, Stroke, CanvasConfig, CanvasState } from './types';

describe('Type definitions', () => {
  it('should allow valid BrushType values', () => {
    const brushTypes: BrushType[] = ['ink', 'marker', 'pencil', 'pixel'];
    expect(brushTypes).toHaveLength(4);
  });

  it('should allow valid BackgroundStyle values', () => {
    const backgroundStyles: BackgroundStyle[] = ['plain', 'ruled', 'dotted', 'grid'];
    expect(backgroundStyles).toHaveLength(4);
  });

  it('should create a valid Point', () => {
    const point: Point = {
      x: 100,
      y: 200,
      timestamp: Date.now(),
    };
    expect(point.x).toBe(100);
    expect(point.y).toBe(200);
  });

  it('should create a valid Stroke', () => {
    const stroke: Stroke = {
      points: [
        { x: 0, y: 0, timestamp: 0 },
        { x: 10, y: 10, timestamp: 10 },
      ],
      color: '#000000',
      brushType: 'ink',
      baseWidth: 3,
    };
    expect(stroke.points).toHaveLength(2);
    expect(stroke.color).toBe('#000000');
  });

  it('should create a valid CanvasConfig', () => {
    const config: CanvasConfig = {
      color: '#ff0000',
      brushType: 'marker',
      brushSize: 5,
      backgroundStyle: 'dotted',
    };
    expect(config.brushSize).toBe(5);
  });

  it('should create a valid CanvasState', () => {
    const state: CanvasState = {
      isDrawing: false,
      currentStroke: [],
      strokes: [],
      config: {
        color: '#000000',
        brushType: 'ink',
        brushSize: 3,
        backgroundStyle: 'plain',
      },
    };
    expect(state.isDrawing).toBe(false);
    expect(state.strokes).toHaveLength(0);
  });
});
