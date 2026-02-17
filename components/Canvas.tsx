'use client';

import { useState } from 'react';
import { useCanvas } from '@/hooks/useCanvas';
import Controls from './Controls';
import StickerPreview from './StickerPreview';
import { StickerCreationOrchestrator } from '@/lib/sticker-creation/orchestrator';
import { DownloadManager } from '@/lib/sticker-creation/download-manager';
import type { Stroke, BackgroundStyle } from '@/lib/types';
import type { StickerResult } from '@/lib/sticker-creation/types';

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
  const [isCreatingSticker, setIsCreatingSticker] = useState(false);
  const [stickerResult, setStickerResult] = useState<StickerResult | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleCreateSticker = async () => {
    if (!drawingCanvasRef.current) return;

    setIsCreatingSticker(true);
    setError(null);

    try {
      const orchestrator = new StickerCreationOrchestrator();
      const result = await orchestrator.createSticker(drawingCanvasRef.current);
      
      setStickerResult(result);
      setShowPreview(true);
    } catch (err: any) {
      setError(err.message || 'Failed to create sticker');
      console.error('Sticker creation error:', err);
    } finally {
      setIsCreatingSticker(false);
    }
  };

  const handleDownloadPNG = () => {
    if (!stickerResult) return;
    
    const downloadManager = new DownloadManager();
    downloadManager.download(stickerResult.formats.png, 'png');
  };

  const handleDownloadWebP = () => {
    if (!stickerResult?.formats.webp) return;
    
    const downloadManager = new DownloadManager();
    downloadManager.download(stickerResult.formats.webp, 'webp');
  };

  const handleClosePreview = () => {
    setShowPreview(false);
    setStickerResult(null);
  };

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
            ? 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'20\' height=\'24\' viewBox=\'0 0 20 24\'><defs><linearGradient id=\'g\' x1=\'0%25\' y1=\'0%25\' x2=\'0%25\' y2=\'100%25\'><stop offset=\'0%25\' style=\'stop-color:%23a855f7\'/><stop offset=\'100%25\' style=\'stop-color:%23ec4899\'/></linearGradient></defs><g><circle cx=\'10\' cy=\'6\' r=\'5\' fill=\'url(%23g)\' stroke=\'%23000\' stroke-width=\'1.5\'/><path d=\'M 10 11 Q 7 13, 7 16 L 7 19 Q 7 20, 8 21 L 10 23 L 12 21 Q 13 20, 13 19 L 13 16 Q 13 13, 10 11 Z\' fill=\'url(%23g)\' stroke=\'%23000\' stroke-width=\'1.5\'/><circle cx=\'10\' cy=\'6\' r=\'1.5\' fill=\'%23fff\' opacity=\'0.7\'/><circle cx=\'10\' cy=\'23\' r=\'1\' fill=\'%23000\'/></g></svg>") 10 23, auto'
            : config.brushType === 'spray'
            ? 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\'><g><rect x=\'8\' y=\'2\' width=\'8\' height=\'4\' rx=\'1\' fill=\'%23ef4444\' stroke=\'%23000\' stroke-width=\'1\'/><rect x=\'9\' y=\'6\' width=\'6\' height=\'10\' rx=\'1\' fill=\'%23dc2626\' stroke=\'%23000\' stroke-width=\'1\'/><circle cx=\'12\' cy=\'4\' r=\'1\' fill=\'%23000\'/><line x1=\'12\' y1=\'16\' x2=\'10\' y2=\'20\' stroke=\'%2364748b\' stroke-width=\'1.5\' opacity=\'0.6\'/><line x1=\'12\' y1=\'16\' x2=\'12\' y2=\'21\' stroke=\'%2364748b\' stroke-width=\'1.5\' opacity=\'0.6\'/><line x1=\'12\' y1=\'16\' x2=\'14\' y2=\'20\' stroke=\'%2364748b\' stroke-width=\'1.5\' opacity=\'0.6\'/><circle cx=\'12\' cy=\'21\' r=\'1\' fill=\'%23000\'/></g></svg>") 12 21, auto'
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
        onCreateSticker={handleCreateSticker}
        isCreatingSticker={isCreatingSticker}
      />

      {/* Error Message */}
      {error && (
        <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-50 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg animate-fadeIn">
          {error}
        </div>
      )}

      {/* Sticker Preview Modal */}
      <StickerPreview
        isOpen={showPreview}
        result={stickerResult}
        onClose={handleClosePreview}
        onDownloadPNG={handleDownloadPNG}
        onDownloadWebP={stickerResult?.formats.webp ? handleDownloadWebP : undefined}
      />
    </div>
  );
}
