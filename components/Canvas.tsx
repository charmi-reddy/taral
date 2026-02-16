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
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 drop-shadow-lg pointer-events-auto" style={{ fontFamily: 'var(--font-pacifico)' }}>
          Taral - Doodle it!
        </h1>
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
        className="absolute top-0 left-0 w-full h-full"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        style={{ 
          touchAction: 'none',
          cursor: isFillMode 
            ? 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'28\' height=\'28\' viewBox=\'0 0 28 28\'><defs><linearGradient id=\'g\' x1=\'0%25\' y1=\'0%25\' x2=\'0%25\' y2=\'100%25\'><stop offset=\'0%25\' style=\'stop-color:%23a855f7\'/><stop offset=\'100%25\' style=\'stop-color:%23ec4899\'/></linearGradient></defs><g><circle cx=\'14\' cy=\'8\' r=\'6\' fill=\'url(%23g)\' stroke=\'%23fff\' stroke-width=\'1.5\'/><path d=\'M 14 14 Q 10 16, 10 20 L 10 24 L 18 24 L 18 20 Q 18 16, 14 14 Z\' fill=\'url(%23g)\' stroke=\'%23fff\' stroke-width=\'1.5\'/><circle cx=\'14\' cy=\'8\' r=\'2\' fill=\'%23fff\' opacity=\'0.6\'/></g></svg>") 14 24, auto'
            : 'crosshair'
        }}
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
