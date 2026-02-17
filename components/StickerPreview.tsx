'use client';

import { useEffect, useRef } from 'react';
import type { StickerResult } from '@/lib/sticker-creation/types';

interface StickerPreviewProps {
  isOpen: boolean;
  result: StickerResult | null;
  onClose: () => void;
  onDownloadPNG: () => void;
  onDownloadWebP?: () => void;
}

export default function StickerPreview({
  isOpen,
  result,
  onClose,
  onDownloadPNG,
  onDownloadWebP,
}: StickerPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!isOpen || !result || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;

    // Set canvas size
    canvas.width = result.preview.width;
    canvas.height = result.preview.height;

    // Draw checkered background
    drawCheckeredPattern(ctx, canvas.width, canvas.height);

    // Draw sticker on top
    ctx.putImageData(result.preview, 0, 0);
  }, [isOpen, result]);

  if (!isOpen || !result) return null;

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-2xl w-full animate-scaleIn">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Sticker Preview</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Preview Canvas */}
        <div className="flex justify-center mb-6 p-4 bg-gray-100 rounded-xl">
          <canvas
            ref={canvasRef}
            className="max-w-full max-h-96 object-contain"
            style={{ imageRendering: 'pixelated' }}
          />
        </div>

        {/* File Info */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Dimensions:</span>
              <span className="ml-2 font-semibold">{result.metadata.croppedDimensions.width} × {result.metadata.croppedDimensions.height}</span>
            </div>
            <div>
              <span className="text-gray-600">PNG Size:</span>
              <span className="ml-2 font-semibold">{formatFileSize(result.metadata.fileSizes.png)}</span>
            </div>
            {result.metadata.fileSizes.webp && (
              <div>
                <span className="text-gray-600">WebP Size:</span>
                <span className="ml-2 font-semibold">{formatFileSize(result.metadata.fileSizes.webp)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold transition-all duration-200"
          >
            Cancel
          </button>
          
          <button
            onClick={onDownloadPNG}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold transition-all duration-200 shadow-lg hover:scale-105"
          >
            Download PNG
          </button>
          
          {onDownloadWebP && result.formats.webp && (
            <button
              onClick={onDownloadWebP}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-semibold transition-all duration-200 shadow-lg hover:scale-105"
            >
              Download WebP
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Draw checkered pattern to indicate transparency
 */
function drawCheckeredPattern(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const squareSize = 10;
  const lightColor = '#ffffff';
  const darkColor = '#e0e0e0';

  for (let y = 0; y < height; y += squareSize) {
    for (let x = 0; x < width; x += squareSize) {
      const isLight = ((x / squareSize) + (y / squareSize)) % 2 === 0;
      ctx.fillStyle = isLight ? lightColor : darkColor;
      ctx.fillRect(x, y, squareSize, squareSize);
    }
  }
}
