import { ThemeConfig } from './types';

export const DOODLE_THEME: ThemeConfig = {
  mode: 'doodle',
  colors: {
    background: '#ffffff',
    text: '#1f2937',
    accent: 'linear-gradient(to right, #9333ea, #ec4899, #f97316)',
    border: '#e5e7eb',
  },
  fonts: {
    header: 'var(--font-pacifico)',
    body: 'var(--font-geist-sans)',
  },
  effects: {
    glow: false,
    scanlines: false,
  },
};

export const AI_THEME: ThemeConfig = {
  mode: 'ai',
  colors: {
    background: '#000000',
    text: '#00FF00',
    accent: '#00FF41',
    border: '#00FF00',
  },
  fonts: {
    header: 'var(--font-geist-mono)',
    body: 'var(--font-geist-mono)',
  },
  effects: {
    glow: true,
    scanlines: true,
  },
};
