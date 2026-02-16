// Core type definitions for the doodle canvas application

export type BrushType = 'ink' | 'pixel' | 'eraser' | 'spray' | 'pencil';

export type BackgroundStyle = 'plain' | 'ruled' | 'dotted' | 'grid';

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
}

export interface CanvasState {
  isDrawing: boolean;
  currentStroke: Point[];
  strokes: Stroke[];
  config: CanvasConfig;
}
