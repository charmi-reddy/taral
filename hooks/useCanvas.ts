import { useRef, useEffect, useState, RefObject } from 'react';
import { CanvasEngine } from '@/lib/canvas-engine';
import { StrokeProcessor } from '@/lib/stroke-processor';
import type { CanvasConfig, Point, BrushType, BackgroundStyle } from '@/lib/types';

export interface UseCanvasReturn {
  // Refs for canvas elements
  drawingCanvasRef: RefObject<HTMLCanvasElement>;
  backgroundCanvasRef: RefObject<HTMLCanvasElement>;
  
  // Event handlers
  handlePointerDown: (e: React.PointerEvent<HTMLCanvasElement>) => void;
  handlePointerMove: (e: React.PointerEvent<HTMLCanvasElement>) => void;
  handlePointerUp: (e: React.PointerEvent<HTMLCanvasElement>) => void;
  
  // Configuration methods
  setColor: (color: string) => void;
  setBrushType: (type: BrushType) => void;
  setBrushSize: (size: number) => void;
  setBackgroundStyle: (style: BackgroundStyle) => void;
  clearCanvas: () => void;
  fillCanvas: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  
  // Current state
  config: CanvasConfig;
}

export function useCanvas(): UseCanvasReturn {
  // Canvas refs
  const drawingCanvasRef = useRef<HTMLCanvasElement>(null);
  const backgroundCanvasRef = useRef<HTMLCanvasElement>(null);
  
  // Canvas engine ref (doesn't trigger re-renders)
  const engineRef = useRef<CanvasEngine | null>(null);
  
  // Drawing state (doesn't trigger re-renders)
  const drawingStateRef = useRef({
    isDrawing: false,
    currentStroke: [] as Point[],
  });
  
  // Configuration state (triggers re-renders for UI)
  const [config, setConfig] = useState<CanvasConfig>({
    color: '#000000',
    brushType: 'ink',
    brushSize: 3,
    backgroundStyle: 'plain',
  });
  
  // Undo/redo state
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  
  // Keep a ref copy of config for use in event handlers
  const configRef = useRef(config);
  useEffect(() => {
    configRef.current = config;
  }, [config]);
  
  // Initialize canvas engine
  useEffect(() => {
    if (!drawingCanvasRef.current || !backgroundCanvasRef.current) return;
    
    try {
      engineRef.current = new CanvasEngine(
        drawingCanvasRef.current,
        backgroundCanvasRef.current
      );
      
      // Render initial background
      engineRef.current.updateBackground(config.backgroundStyle);
    } catch (error) {
      console.error('Failed to initialize canvas engine:', error);
    }
  }, []);
  
  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (!engineRef.current) return;
      
      try {
        engineRef.current.resize();
        engineRef.current.updateBackground(configRef.current.backgroundStyle);
      } catch (error) {
        console.error('Error during resize:', error);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Get canvas coordinates from pointer event
  const getCanvasCoordinates = (e: React.PointerEvent<HTMLCanvasElement>): Point => {
    const canvas = e.currentTarget;
    const rect = canvas.getBoundingClientRect();
    
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      pressure: e.pressure,
      timestamp: Date.now(),
    };
  };
  
  // Pointer down - start new stroke
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    
    let point = getCanvasCoordinates(e);
    
    // Apply snap-to-grid if pixel pen on grid background
    if (
      configRef.current.brushType === 'pixel' &&
      configRef.current.backgroundStyle === 'grid'
    ) {
      point = StrokeProcessor.snapToGrid(point, 16); // Grid size is 16px
    }
    
    drawingStateRef.current.isDrawing = true;
    drawingStateRef.current.currentStroke = [point];
  };
  
  // Pointer move - add points and render
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingStateRef.current.isDrawing || !engineRef.current) return;
    
    e.preventDefault();
    
    let point = getCanvasCoordinates(e);
    
    // Apply snap-to-grid if pixel pen on grid background
    if (
      configRef.current.brushType === 'pixel' &&
      configRef.current.backgroundStyle === 'grid'
    ) {
      point = StrokeProcessor.snapToGrid(point, 16);
    }
    
    drawingStateRef.current.currentStroke.push(point);
    
    // Render the current stroke incrementally
    const stroke = {
      points: drawingStateRef.current.currentStroke,
      color: configRef.current.color,
      brushType: configRef.current.brushType,
      baseWidth: configRef.current.brushSize,
    };
    
    engineRef.current.renderStroke(stroke);
  };
  
  // Pointer up - complete stroke
  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingStateRef.current.isDrawing || !engineRef.current) return;
    
    e.preventDefault();
    
    let point = getCanvasCoordinates(e);
    
    // Apply snap-to-grid if pixel pen on grid background
    if (
      configRef.current.brushType === 'pixel' &&
      configRef.current.backgroundStyle === 'grid'
    ) {
      point = StrokeProcessor.snapToGrid(point, 16);
    }
    
    drawingStateRef.current.currentStroke.push(point);
    
    // Save completed stroke
    const stroke = {
      points: drawingStateRef.current.currentStroke,
      color: configRef.current.color,
      brushType: configRef.current.brushType,
      baseWidth: configRef.current.brushSize,
    };
    
    engineRef.current.addStroke(stroke);
    engineRef.current.renderStroke(stroke);
    
    // Update undo/redo state
    updateUndoRedoState();
    
    // Reset drawing state
    drawingStateRef.current.isDrawing = false;
    drawingStateRef.current.currentStroke = [];
  };
  
  // Update undo/redo button states
  const updateUndoRedoState = () => {
    if (engineRef.current) {
      setCanUndo(engineRef.current.canUndo());
      setCanRedo(engineRef.current.canRedo());
    }
  };
  
  // Configuration setters
  const setColor = (color: string) => {
    setConfig(prev => ({ ...prev, color }));
  };
  
  const setBrushType = (brushType: BrushType) => {
    setConfig(prev => ({ ...prev, brushType }));
  };
  
  const setBrushSize = (size: number) => {
    // Clamp to valid range (1-50)
    const clampedSize = Math.max(1, Math.min(50, size));
    setConfig(prev => ({ ...prev, brushSize: clampedSize }));
  };
  
  const setBackgroundStyle = (backgroundStyle: BackgroundStyle) => {
    setConfig(prev => ({ ...prev, backgroundStyle }));
    
    // Update background immediately
    if (engineRef.current) {
      engineRef.current.updateBackground(backgroundStyle);
    }
  };
  
  const clearCanvas = () => {
    if (!engineRef.current) return;
    
    engineRef.current.clear();
    // Preserve and re-render background
    engineRef.current.updateBackground(configRef.current.backgroundStyle);
    updateUndoRedoState();
  };
  
  const fillCanvas = () => {
    if (!engineRef.current) return;
    
    engineRef.current.fill(configRef.current.color);
    updateUndoRedoState();
  };
  
  const undo = () => {
    if (!engineRef.current) return;
    
    engineRef.current.undo();
    updateUndoRedoState();
  };
  
  const redo = () => {
    if (!engineRef.current) return;
    
    engineRef.current.redo();
    updateUndoRedoState();
  };
  
  return {
    drawingCanvasRef,
    backgroundCanvasRef,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    setColor,
    setBrushType,
    setBrushSize,
    setBackgroundStyle,
    clearCanvas,
    fillCanvas,
    undo,
    redo,
    canUndo,
    canRedo,
    config,
  };
}
