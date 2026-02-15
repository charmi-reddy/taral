'use client';

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
      <div className="absolute inset-0 flex items-center justify-center p-20">
        <div className="relative bg-white shadow-2xl border-4 border-gray-700 group" style={{ width: '80%', height: '80%' }}>
          {/* Resize handles at corners */}
          <div className="absolute -top-2 -left-2 w-4 h-4 bg-white border-2 border-gray-700 cursor-nw-resize opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-2 border-gray-700 cursor-n-resize opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-white border-2 border-gray-700 cursor-ne-resize opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="absolute top-1/2 -translate-y-1/2 -right-2 w-4 h-4 bg-white border-2 border-gray-700 cursor-e-resize opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-white border-2 border-gray-700 cursor-se-resize opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-2 border-gray-700 cursor-s-resize opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-white border-2 border-gray-700 cursor-sw-resize opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="absolute top-1/2 -translate-y-1/2 -left-2 w-4 h-4 bg-white border-2 border-gray-700 cursor-w-resize opacity-0 group-hover:opacity-100 transition-opacity"></div>
          
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
            style={{ touchAction: 'none' }}
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
