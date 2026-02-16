import type { Point, Stroke } from '../types';

export interface DoodleData {
  id: string;
  strokes: Stroke[];
}

export interface DrawingMetrics {
  averageSpeed: number | null;          // pixels per millisecond
  pressureVariance: number | null;      // 0-1 range
  smoothness: number;                   // 0-1 range (1 = very smooth)
  directionChanges: number;             // count of significant angle changes
  brushVariety: number;                 // count of unique brush types
  colorDiversity: number;               // count of unique colors
  totalStrokes: number;
  totalPoints: number;
}

export interface PersonalityInsight {
  text: string;                         // e.g., "Fast, chaotic strokes — high creative impulse"
  category: string;                     // e.g., "creativity", "control", "expression"
  metric: keyof DrawingMetrics;         // which metric triggered this insight
}

export interface PersonalityType {
  name: string;                         // e.g., "The Spontaneous Creator"
  description: string;                  // brief description
  traits: string[];                     // list of key traits
}

export interface AnalysisResult {
  success: boolean;
  metrics?: DrawingMetrics;
  insights?: PersonalityInsight[];
  personalityType?: PersonalityType;
  error?: string;
}
