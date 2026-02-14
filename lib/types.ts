// Core type definitions for the doodle canvas application

export type BrushType = 'ink' | 'pixel' | 'eraser';

export type BackgroundStyle = 'plain' | 'ruled' | 'dotted' | 'grid';

export type ShapeType = 'circle' | 'rectangle' | 'star' | 'triangle' | 'line' | 'arrow';

export type DrawMode = 'freehand' | 'shape';

export interface Point {
  x: number;
  y: number;
  pressure?: number;
  timestamp: number;
}

export interface Stroke {
  points: Point[];
  color: string;
  brushType: BrushType;
  baseWidth: number;
}

export interface CanvasConfig {
  color: string;
  brushType: BrushType;
  brushSize: number;
  backgroundStyle: BackgroundStyle;
  drawMode: DrawMode;
  shapeType: ShapeType;
}

export interface CanvasState {
  isDrawing: boolean;
  currentStroke: Point[];
  strokes: Stroke[];
  config: CanvasConfig;
}
