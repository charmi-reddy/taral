/**
 * React hook for managing view navigation state
 * Handles transitions between Home and Drawing views while preserving state
 */

import { useState, useCallback } from 'react';

export type View = 'home' | 'drawing';

export interface ViewState {
  currentView: View;
  previousView: View | null;
  activePageId: string | null;
}

export interface UseViewNavigationReturn {
  viewState: ViewState;
  navigateToHome: () => void;
  navigateToDrawing: (pageId: string) => void;
}

/**
 * Custom hook for view navigation state management
 * Manages transitions between home and drawing views while preserving state
 */
export function useViewNavigation(): UseViewNavigationReturn {
  const [viewState, setViewState] = useState<ViewState>({
    currentView: 'home',
    previousView: null,
    activePageId: null,
  });
  
  /**
   * Navigate to the Home view
   * Preserves the current view as previousView and maintains activePageId
   */
  const navigateToHome = useCallback(() => {
    setViewState(prev => ({
      currentView: 'home',
      previousView: prev.currentView,
      activePageId: prev.activePageId,
    }));
  }, []);
  
  /**
   * Navigate to the Drawing view with a specific page
   * Preserves the current view as previousView and updates activePageId
   */
  const navigateToDrawing = useCallback((pageId: string) => {
    setViewState(prev => ({
      currentView: 'drawing',
      previousView: prev.currentView,
      activePageId: pageId,
    }));
  }, []);
  
  return {
    viewState,
    navigateToHome,
    navigateToDrawing,
  };
}
