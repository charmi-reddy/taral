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
  onSave?: () => void;
}

export default function Canvas({
  pageId,
  initialStrokes,
  initialBackground,
  onHomeClick,
  onStrokeComplete,
  onBackgroundChange,
  onSave,
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
      className="relative w-full h-screen overflow-hidden bg-gray-100"
    >
      {/* Header with branding */}
      <div className="absolute top-0 left-0 right-0 z-20 flex justify-center pt-6 pointer-events-none">
        <div className="flex items-center gap-3 pointer-events-auto">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-purple-400 via-pink-400 to-orange-400 flex items-center justify-center shadow-lg transform -rotate-12">
            <span className="text-2xl sm:text-3xl">✨</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 drop-shadow-lg" style={{ fontFamily: 'var(--font-pacifico)' }}>
            Taral - Doodle it!
          </h1>
        </div>
      </div>
      
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
        onSave={onSave}
      />
    </div>
  );
}
