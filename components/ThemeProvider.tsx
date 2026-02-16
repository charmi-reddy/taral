'use client';

import { useEffect, ReactNode } from 'react';
import { DrawingMode } from '@/lib/mode-toggle/types';
import { DOODLE_THEME, AI_THEME } from '@/lib/mode-toggle/theme-config';

interface ThemeProviderProps {
  mode: DrawingMode;
  children: ReactNode;
}

export default function ThemeProvider({ mode, children }: ThemeProviderProps) {
  const theme = mode === 'doodle' ? DOODLE_THEME : AI_THEME;
  
  useEffect(() => {
    // Apply CSS custom properties
    document.documentElement.style.setProperty('--bg-color', theme.colors.background);
    document.documentElement.style.setProperty('--text-color', theme.colors.text);
    document.documentElement.style.setProperty('--accent-color', theme.colors.accent);
    document.documentElement.style.setProperty('--border-color', theme.colors.border);
    document.documentElement.style.setProperty('--header-font', theme.fonts.header);
    document.documentElement.style.setProperty('--body-font', theme.fonts.body);
    
    // Apply theme class to body
    document.body.className = `theme-${mode}`;
    
    // Apply effects
    if (theme.effects.glow) {
      document.body.classList.add('glow-effects');
    } else {
      document.body.classList.remove('glow-effects');
    }
    
    if (theme.effects.scanlines) {
      document.body.classList.add('scanlines');
    } else {
      document.body.classList.remove('scanlines');
    }
  }, [mode, theme]);
  
  return <>{children}</>;
}
