'use client';

import { useState } from 'react';
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
  const [zoom, setZoom] = useState(100);
  const [showZoomDropdown, setShowZoomDropdown] = useState(false);
  
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

  const zoomLevels = [25, 50, 75, 100, 125, 150, 200, 300, 400];
  
  const handleZoomIn = () => {
    const currentIndex = zoomLevels.indexOf(zoom);
    if (currentIndex < zoomLevels.length - 1) {
      setZoom(zoomLevels[currentIndex + 1]);
    }
  };
  
  const handleZoomOut = () => {
    const currentIndex = zoomLevels.indexOf(zoom);
    if (currentIndex > 0) {
      setZoom(zoomLevels[currentIndex - 1]);
    }
  };
  
  const handleFitToScreen = () => {
    setZoom(100);
  };

  return (
    <div 
      className="relative w-full h-screen overflow-hidden bg-gray-900"
    >
      {/* Header with branding */}
      <div className="absolute top-0 left-0 right-0 z-20 flex justify-center pt-6 pointer-events-none">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 drop-shadow-lg pointer-events-auto" style={{ fontFamily: 'var(--font-pacifico)' }}>
          Taral - Doodle it!
        </h1>
      </div>
      
      {/* Zoom Controls */}
      <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-20 flex items-center gap-3 bg-gray-800 rounded-lg px-4 py-2 shadow-lg">
        {/* Fit to screen button */}
        <button
          onClick={handleFitToScreen}
          className="text-white hover:text-blue-400 transition p-1"
          title="Fit to screen"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
          </svg>
        </button>
        
        {/* Zoom percentage dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowZoomDropdown(!showZoomDropdown)}
            className="flex items-center gap-2 text-white hover:text-blue-400 transition px-2 py-1 rounded"
          >
            <span className="font-semibold min-w-[60px]">{zoom}%</span>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
              <path d="M6 9L1 4h10z" />
            </svg>
          </button>
          
          {showZoomDropdown && (
            <div className="absolute top-full mt-2 left-0 bg-gray-800 rounded-lg shadow-xl py-2 min-w-[100px]">
              {zoomLevels.map((level) => (
                <button
                  key={level}
                  onClick={() => {
                    setZoom(level);
                    setShowZoomDropdown(false);
                  }}
                  className={`w-full px-4 py-2 text-left hover:bg-gray-700 transition ${
                    zoom === level ? 'text-blue-400 font-semibold' : 'text-white'
                  }`}
                >
                  {level}%
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Zoom slider */}
        <input
          type="range"
          min="0"
          max={zoomLevels.length - 1}
          value={zoomLevels.indexOf(zoom)}
          onChange={(e) => setZoom(zoomLevels[parseInt(e.target.value)])}
          className="w-48 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
        
        {/* Zoom out button */}
        <button
          onClick={handleZoomOut}
          disabled={zoom === zoomLevels[0]}
          className="text-white hover:text-blue-400 transition disabled:opacity-30 disabled:cursor-not-allowed p-1"
          title="Zoom out"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="M8 11h6" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
        </button>
        
        {/* Zoom in button */}
        <button
          onClick={handleZoomIn}
          disabled={zoom === zoomLevels[zoomLevels.length - 1]}
          className="text-white hover:text-blue-400 transition disabled:opacity-30 disabled:cursor-not-allowed p-1"
          title="Zoom in"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="M8 11h6" />
            <path d="M11 8v6" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
        </button>
      </div>
      
      {/* Canvas container with zoom */}
      <div className="absolute inset-0 flex items-center justify-center overflow-auto">
        <div 
          className="relative bg-white shadow-2xl"
          style={{ 
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'center center',
            width: '100%',
            height: '100%',
            maxWidth: '1920px',
            maxHeight: '1080px',
          }}
        >
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
            onPointerDown={(e) => {
              e.preventDefault();
              const canvas = e.currentTarget;
              const rect = canvas.getBoundingClientRect();
              // Calculate the actual canvas coordinates accounting for zoom
              const x = (e.clientX - rect.left) * (canvas.width / rect.width);
              const y = (e.clientY - rect.top) * (canvas.height / rect.height);
              
              const adjustedEvent = {
                ...e,
                preventDefault: () => {},
                currentTarget: canvas,
                clientX: x + rect.left,
                clientY: y + rect.top,
              } as React.PointerEvent<HTMLCanvasElement>;
              handlePointerDown(adjustedEvent);
            }}
            onPointerMove={(e) => {
              e.preventDefault();
              const canvas = e.currentTarget;
              const rect = canvas.getBoundingClientRect();
              const x = (e.clientX - rect.left) * (canvas.width / rect.width);
              const y = (e.clientY - rect.top) * (canvas.height / rect.height);
              
              const adjustedEvent = {
                ...e,
                preventDefault: () => {},
                currentTarget: canvas,
                clientX: x + rect.left,
                clientY: y + rect.top,
              } as React.PointerEvent<HTMLCanvasElement>;
              handlePointerMove(adjustedEvent);
            }}
            onPointerUp={(e) => {
              e.preventDefault();
              const canvas = e.currentTarget;
              const rect = canvas.getBoundingClientRect();
              const x = (e.clientX - rect.left) * (canvas.width / rect.width);
              const y = (e.clientY - rect.top) * (canvas.height / rect.height);
              
              const adjustedEvent = {
                ...e,
                preventDefault: () => {},
                currentTarget: canvas,
                clientX: x + rect.left,
                clientY: y + rect.top,
              } as React.PointerEvent<HTMLCanvasElement>;
              handlePointerUp(adjustedEvent);
            }}
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
