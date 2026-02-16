import { useRef, useEffect, useState, RefObject } from 'react';
import { CanvasEngine } from '@/lib/canvas-engine';
import { StrokeProcessor } from '@/lib/stroke-processor';
import type { CanvasConfig, Point, BrushType, BackgroundStyle, Stroke } from '@/lib/types';

export interface UseCanvasOptions {
  initialStrokes?: Stroke[];
  initialBackground?: BackgroundStyle;
  onStrokeComplete?: (strokes: Stroke[]) => void;
  onBackgroundChange?: (background: BackgroundStyle) => void;
}

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
  isFillMode: boolean;
  
  // Current state
  config: CanvasConfig;
  
  // State getters
  getStrokes: () => Stroke[];
  getBackgroundStyle: () => BackgroundStyle;
}

export function useCanvas(options: UseCanvasOptions = {}): UseCanvasReturn {
  const { initialStrokes, initialBackground, onStrokeComplete, onBackgroundChange } = options;
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
    brushType: 'pixel',
    brushSize: 3,
    backgroundStyle: initialBackground || 'grid',
  });
  
  // Undo/redo state
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  
  // Fill mode state
  const [isFillMode, setIsFillMode] = useState(false);
  
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
      
      // Load initial strokes if provided
      if (initialStrokes && initialStrokes.length > 0) {
        initialStrokes.forEach(stroke => {
          engineRef.current?.addStroke(stroke);
          engineRef.current?.renderStroke(stroke);
        });
        updateUndoRedoState();
      }
    } catch (error) {
      console.error('Failed to initialize canvas engine:', error);
    }
  }, []);
  
  // Handle window resize with debouncing
  useEffect(() => {
    let resizeTimeout: NodeJS.Timeout;
    
    const handleResize = () => {
      // Debounce resize to avoid excessive redraws
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (!engineRef.current) return;
        
        try {
          engineRef.current.resize();
          engineRef.current.updateBackground(configRef.current.backgroundStyle);
        } catch (error) {
          console.error('Error during resize:', error);
        }
      }, 150); // Wait 150ms after last resize event
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
    };
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
  
  // Pointer down - start new stroke or fill
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    
    const point = getCanvasCoordinates(e);
    
    // If in fill mode, flood fill at click point (stay in fill mode)
    if (isFillMode && engineRef.current) {
      engineRef.current.floodFill(point.x, point.y, configRef.current.color);
      updateUndoRedoState();
      return;
    }
    
    // Apply snap-to-grid if pixel pen on grid background
    let snappedPoint = point;
    if (
      configRef.current.brushType === 'pixel' &&
      configRef.current.backgroundStyle === 'grid'
    ) {
      snappedPoint = StrokeProcessor.snapToGrid(point, 16); // Grid size is 16px
    }
    
    drawingStateRef.current.isDrawing = true;
    drawingStateRef.current.currentStroke = [snappedPoint];
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
    
    // Notify parent of stroke completion
    if (onStrokeComplete) {
      onStrokeComplete(engineRef.current.getStrokes());
    }
    
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
    // Exit fill mode when changing brush type
    setIsFillMode(false);
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
    
    // Notify parent of background change
    if (onBackgroundChange) {
      onBackgroundChange(backgroundStyle);
    }
  };
  
  const clearCanvas = () => {
    if (!engineRef.current) return;
    
    engineRef.current.clear();
    // Preserve and re-render background
    engineRef.current.updateBackground(configRef.current.backgroundStyle);
    updateUndoRedoState();
    
    // Notify parent of stroke change
    if (onStrokeComplete) {
      onStrokeComplete([]);
    }
  };
  
  const fillCanvas = () => {
    // Toggle fill mode
    setIsFillMode(prev => !prev);
  };
  
  const undo = () => {
    if (!engineRef.current) return;
    
    engineRef.current.undo();
    updateUndoRedoState();
    
    // Notify parent of stroke change
    if (onStrokeComplete) {
      onStrokeComplete(engineRef.current.getStrokes());
    }
  };
  
  const redo = () => {
    if (!engineRef.current) return;
    
    engineRef.current.redo();
    updateUndoRedoState();
    
    // Notify parent of stroke change
    if (onStrokeComplete) {
      onStrokeComplete(engineRef.current.getStrokes());
    }
  };
  
  // Get current strokes
  const getStrokes = (): Stroke[] => {
    if (!engineRef.current) return [];
    return engineRef.current.getStrokes();
  };
  
  // Get current background style
  const getBackgroundStyle = (): BackgroundStyle => {
    return configRef.current.backgroundStyle;
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
    isFillMode,
    config,
    getStrokes,
    getBackgroundStyle,
  };
}
