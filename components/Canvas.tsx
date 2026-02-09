'use client';

import { useCanvas } from '@/hooks/useCanvas';

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

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gray-100">
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

      {/* Simple Controls Overlay */}
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4 space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">Color</label>
          <input
            type="color"
            value={config.color}
            onChange={(e) => setColor(e.target.value)}
            className="w-full h-10 rounded cursor-pointer"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Brush Type</label>
          <select
            value={config.brushType}
            onChange={(e) => setBrushType(e.target.value as any)}
            className="w-full px-2 py-1 border rounded"
          >
            <option value="ink">Ink Pen</option>
            <option value="marker">Marker</option>
            <option value="pencil">Pencil</option>
            <option value="pixel">Pixel Pen</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Size: {config.brushSize}
          </label>
          <input
            type="range"
            min="1"
            max="50"
            value={config.brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Background</label>
          <select
            value={config.backgroundStyle}
            onChange={(e) => setBackgroundStyle(e.target.value as any)}
            className="w-full px-2 py-1 border rounded"
          >
            <option value="plain">Plain</option>
            <option value="ruled">Ruled</option>
            <option value="dotted">Dotted</option>
            <option value="grid">Grid</option>
          </select>
        </div>

        <button
          onClick={clearCanvas}
          className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
        >
          Clear Canvas
        </button>
      </div>
    </div>
  );
}
