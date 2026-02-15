'use client';

import { useState, useRef, useEffect } from 'react';
import { useCanvas } from '@/hooks/useCanvas';
import Controls from './Controls';
import type { Stroke, BackgroundStyle } from '@/lib/types';

interface CanvasProps {
  pageId?: string;
  initialStrokes?: Stroke[];
  initialBackground?: BackgroundStyle;
  onHomeClick?: () => void;
  onStrokeComplete?: (strokes: Stroke[]) => void;
  onBackgroundChange?: (background: BackgroundStyle) => void;
}

export default function Canvas({
  pageId,
  initialStrokes,
  initialBackground,
  onHomeClick,
  onStrokeComplete,
  onBackgroundChange,
}: CanvasProps) {
  const [canvasSize, setCanvasSize] = useState({ width: 80, height: 80 }); // percentage
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const startPosRef = useRef({ x: 0, y: 0, width: 0, height: 0 });
  
  const {
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
  } = useCanvas({
    initialStrokes,
    initialBackground,
    onStrokeComplete,
    onBackgroundChange,
  });

  const handleResizeStart = (e: React.MouseEvent, handle: string) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizeHandle(handle);
    startPosRef.current = {
      x: e.clientX,
      y: e.clientY,
      width: canvasSize.width,
      height: canvasSize.height,
    };
  };

  const handleResizeMove = (e: MouseEvent) => {
    if (!isResizing || !containerRef.current) return;
    
    const container = containerRef.current.parentElement;
    if (!container) return;
    
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    const deltaX = e.clientX - startPosRef.current.x;
    const deltaY = e.clientY - startPosRef.current.y;
    
    const deltaWidthPercent = (deltaX / containerWidth) * 100;
    const deltaHeightPercent = (deltaY / containerHeight) * 100;
    
    let newWidth = startPosRef.current.width;
    let newHeight = startPosRef.current.height;
    
    // Handle different resize directions
    if (resizeHandle?.includes('e')) {
      newWidth = Math.max(20, Math.min(95, startPosRef.current.width + deltaWidthPercent));
    }
    if (resizeHandle?.includes('w')) {
      newWidth = Math.max(20, Math.min(95, startPosRef.current.width - deltaWidthPercent));
    }
    if (resizeHandle?.includes('s')) {
      newHeight = Math.max(20, Math.min(95, startPosRef.current.height + deltaHeightPercent));
    }
    if (resizeHandle?.includes('n')) {
      newHeight = Math.max(20, Math.min(95, startPosRef.current.height - deltaHeightPercent));
    }
    
    setCanvasSize({ width: newWidth, height: newHeight });
  };

  const handleResizeEnd = () => {
    setIsResizing(false);
    setResizeHandle(null);
  };

  // Add event listeners for resize
  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleResizeMove);
      window.addEventListener('mouseup', handleResizeEnd);
      return () => {
        window.removeEventListener('mousemove', handleResizeMove);
        window.removeEventListener('mouseup', handleResizeEnd);
      };
    }
  }, [isResizing]);

  return (
    <div 
      className="relative w-full h-screen overflow-hidden bg-gray-900"
    >
      {/* Header with branding */}
      <div className="absolute top-0 left-0 right-0 z-20 flex justify-center pt-6 pointer-events-none">
        <h1 className="text-4xl sm:text-5xl font-bold text-white drop-shadow-lg pointer-events-auto" style={{ fontFamily: 'var(--font-pacifico)' }}>
          Taral - Doodle it!
        </h1>
      </div>
      
      {/* Canvas container with resize handles */}
      <div className="absolute inset-0 flex items-center justify-center p-20" ref={containerRef}>
        <div 
          className="relative bg-white shadow-2xl border-4 border-gray-700 group" 
          style={{ width: `${canvasSize.width}%`, height: `${canvasSize.height}%` }}
        >
          {/* Resize handles at corners and edges */}
          <div 
            onMouseDown={(e) => handleResizeStart(e, 'nw')}
            className="absolute -top-2 -left-2 w-4 h-4 bg-white border-2 border-gray-700 cursor-nw-resize opacity-0 group-hover:opacity-100 transition-opacity z-50"
          ></div>
          <div 
            onMouseDown={(e) => handleResizeStart(e, 'n')}
            className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-2 border-gray-700 cursor-n-resize opacity-0 group-hover:opacity-100 transition-opacity z-50"
          ></div>
          <div 
            onMouseDown={(e) => handleResizeStart(e, 'ne')}
            className="absolute -top-2 -right-2 w-4 h-4 bg-white border-2 border-gray-700 cursor-ne-resize opacity-0 group-hover:opacity-100 transition-opacity z-50"
          ></div>
          <div 
            onMouseDown={(e) => handleResizeStart(e, 'e')}
            className="absolute top-1/2 -translate-y-1/2 -right-2 w-4 h-4 bg-white border-2 border-gray-700 cursor-e-resize opacity-0 group-hover:opacity-100 transition-opacity z-50"
          ></div>
          <div 
            onMouseDown={(e) => handleResizeStart(e, 'se')}
            className="absolute -bottom-2 -right-2 w-4 h-4 bg-white border-2 border-gray-700 cursor-se-resize opacity-0 group-hover:opacity-100 transition-opacity z-50"
          ></div>
          <div 
            onMouseDown={(e) => handleResizeStart(e, 's')}
            className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-2 border-gray-700 cursor-s-resize opacity-0 group-hover:opacity-100 transition-opacity z-50"
          ></div>
          <div 
            onMouseDown={(e) => handleResizeStart(e, 'sw')}
            className="absolute -bottom-2 -left-2 w-4 h-4 bg-white border-2 border-gray-700 cursor-sw-resize opacity-0 group-hover:opacity-100 transition-opacity z-50"
          ></div>
          <div 
            onMouseDown={(e) => handleResizeStart(e, 'w')}
            className="absolute top-1/2 -translate-y-1/2 -left-2 w-4 h-4 bg-white border-2 border-gray-700 cursor-w-resize opacity-0 group-hover:opacity-100 transition-opacity z-50"
          ></div>
          
          {/* Background Canvas */}
          <canvas
            ref={backgroundCanvasRef}
            className="absolute top-0 left-0 w-full h-full"
            style={{ touchAction: 'none' }}
          />
          
          {/* Drawing Canvas */}
          <canvas
            ref={drawingCanvasRef}
            className={`absolute top-0 left-0 w-full h-full ${isFillMode ? 'cursor-pointer' : 'cursor-crosshair'}`}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            style={{ touchAction: 'none', pointerEvents: isResizing ? 'none' : 'auto' }}
          />
        </div>
      </div>

      {/* Controls */}
      <Controls
        config={config}
        onColorChange={setColor}
        onBrushTypeChange={setBrushType}
        onBrushSizeChange={setBrushSize}
        onBackgroundChange={setBackgroundStyle}
        onClear={clearCanvas}
        onFill={fillCanvas}
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
        isFillMode={isFillMode}
        onHomeClick={onHomeClick}
      />
    </div>
  );
}
