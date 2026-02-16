import { useState, useCallback } from 'react';
import { DrawingMode } from '@/lib/mode-toggle/types';

export interface UseModeToggleReturn {
  mode: DrawingMode;
  isTransitioning: boolean;
  toggleMode: () => void;
}

export function useModeToggle(): UseModeToggleReturn {
  const [mode, setMode] = useState<DrawingMode>('doodle');
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const toggleMode = useCallback(() => {
    setIsTransitioning(true);
    setMode(prev => prev === 'doodle' ? 'ai' : 'doodle');
    
    // Transition completes after animation (1000ms as per requirements)
    setTimeout(() => setIsTransitioning(false), 1000);
  }, []);
  
  return { mode, isTransitioning, toggleMode };
}
