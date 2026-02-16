// Mode Toggle Types

export type DrawingMode = 'doodle' | 'ai';

export interface ModeState {
  currentMode: DrawingMode;
  isTransitioning: boolean;
}

export interface ThemeColors {
  background: string;
  text: string;
  accent: string;
  border: string;
}

export interface ThemeConfig {
  mode: DrawingMode;
  colors: ThemeColors;
  fonts: {
    header: string;
    body: string;
  };
  effects: {
    glow: boolean;
    scanlines: boolean;
  };
}

export interface ModeConfig {
  mode: DrawingMode;
  theme: ThemeConfig;
  analysisEnabled: boolean;
  aiSuggestionsEnabled: boolean;
}
