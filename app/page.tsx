'use client';

import { useEffect, useCallback } from 'react';
import Canvas from '@/components/Canvas';
import HomeView from '@/components/HomeView';
import { usePageManager } from '@/hooks/usePageManager';
import { useViewNavigation } from '@/hooks/useViewNavigation';
import { generateThumbnail } from '@/lib/page-manager/thumbnail';
import type { Stroke, BackgroundStyle } from '@/lib/types';

export default function Home() {
  const {
    pages,
    activePageId,
    createNewPage,
    getPageById,
    getAllPageMetadata,
    updatePageData,
    updatePageName,
    deletePageById,
    setActivePageId,
  } = usePageManager();
  
  const { viewState, navigateToHome, navigateToDrawing } = useViewNavigation();
  
  // Get the active page data
  const activePage = activePageId ? getPageById(activePageId) : null;
  
  // Handle page selection from home view
  const handlePageSelect = useCallback((pageId: string) => {
    setActivePageId(pageId);
    navigateToDrawing(pageId);
  }, [setActivePageId, navigateToDrawing]);
  
  // Handle new page creation
  const handleNewPage = useCallback(() => {
    const newPage = createNewPage();
    setActivePageId(newPage.id);
    navigateToDrawing(newPage.id);
  }, [createNewPage, setActivePageId, navigateToDrawing]);
  
  // Handle home button click
  const handleHomeClick = useCallback(() => {
    navigateToHome();
  }, [navigateToHome]);
  
  // Handle page deletion
  const handleDeletePage = useCallback((pageId: string) => {
    deletePageById(pageId);
  }, [deletePageById]);
  
  // Handle page rename
  const handleRenamePage = useCallback((pageId: string, newName: string) => {
    updatePageName(pageId, newName);
  }, [updatePageName]);
  
  // Handle stroke completion - update page data and generate thumbnail
  const handleStrokeComplete = useCallback((strokes: Stroke[]) => {
    if (!activePageId) return;
    
    updatePageData(activePageId, { strokes });
    
    // Generate thumbnail after a short delay to ensure canvas is rendered
    setTimeout(() => {
      const backgroundCanvas = document.querySelector('canvas:nth-of-type(1)') as HTMLCanvasElement;
      const drawingCanvas = document.querySelector('canvas:nth-of-type(2)') as HTMLCanvasElement;
      
      if (backgroundCanvas && drawingCanvas) {
        try {
          const thumbnail = generateThumbnail(backgroundCanvas, drawingCanvas);
          updatePageData(activePageId, { thumbnail });
        } catch (error) {
          console.error('Failed to generate thumbnail:', error);
        }
      }
    }, 100);
  }, [activePageId, updatePageData]);
  
  // Handle background change
  const handleBackgroundChange = useCallback((backgroundStyle: BackgroundStyle) => {
    if (!activePageId) return;
    
    updatePageData(activePageId, { backgroundStyle });
    
    // Generate thumbnail after background change
    setTimeout(() => {
      const backgroundCanvas = document.querySelector('canvas:nth-of-type(1)') as HTMLCanvasElement;
      const drawingCanvas = document.querySelector('canvas:nth-of-type(2)') as HTMLCanvasElement;
      
      if (backgroundCanvas && drawingCanvas) {
        try {
          const thumbnail = generateThumbnail(backgroundCanvas, drawingCanvas);
          updatePageData(activePageId, { thumbnail });
        } catch (error) {
          console.error('Failed to generate thumbnail:', error);
        }
      }
    }, 100);
  }, [activePageId, updatePageData]);
  
  // Sync view navigation activePageId with page manager activePageId
  useEffect(() => {
    if (viewState.activePageId && viewState.activePageId !== activePageId) {
      setActivePageId(viewState.activePageId);
    }
  }, [viewState.activePageId, activePageId, setActivePageId]);
  
  // Render based on current view
  if (viewState.currentView === 'home') {
    return (
      <HomeView
        pages={getAllPageMetadata()}
        onPageSelect={handlePageSelect}
        onNewPage={handleNewPage}
        onDeletePage={handleDeletePage}
        onRenamePage={handleRenamePage}
      />
    );
  }
  
  // Drawing view
  return (
    <Canvas
      pageId={activePageId || undefined}
      initialStrokes={activePage?.strokes}
      initialBackground={activePage?.backgroundStyle}
      onHomeClick={handleHomeClick}
      onStrokeComplete={handleStrokeComplete}
      onBackgroundChange={handleBackgroundChange}
    />
  );
}
