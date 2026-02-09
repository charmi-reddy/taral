'use client';

import { useState } from 'react';
import { useCanvas } from '@/hooks/useCanvas';
import Controls from './Controls';
import type { Theme } from './ThemeToggle';

export default function Canvas() {
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
    config,
  } = useCanvas();

  const [theme, setTheme] = useState<Theme>('light');

  const getBackgroundColor = () => {
    switch (theme) {
      case 'dark':
        return '#1f2937'; // gray-800
      case 'purple':
        return '#581c87'; // purple-900
      default:
        return '#f3f4f6'; // gray-100
    }
  };

  return (
    <div 
      className="relative w-full h-screen overflow-hidden"
      style={{ backgroundColor: getBackgroundColor() }}
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
        className="absolute top-0 left-0 w-full h-full cursor-crosshair"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        style={{ touchAction: 'none' }}
      />

      {/* Controls */}
      <Controls
        config={config}
        theme={theme}
        onColorChange={setColor}
        onBrushTypeChange={setBrushType}
        onBrushSizeChange={setBrushSize}
        onBackgroundChange={setBackgroundStyle}
        onThemeChange={setTheme}
        onClear={clearCanvas}
      />
    </div>
  );
}
