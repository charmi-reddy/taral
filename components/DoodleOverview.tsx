'use client';

import { useEffect, useRef } from 'react';
import type { Stroke, BackgroundStyle } from '@/lib/types';

interface DoodleOverviewProps {
  pageId: string;
  pageName: string;
  strokes: Stroke[];
  background?: BackgroundStyle;
  onBack: () => void;
}

export default function DoodleOverview({
  pageId,
  pageName,
  strokes,
  background,
  onBack,
}: DoodleOverviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 800;
    canvas.height = 600;

    // Clear canvas with white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw all strokes
    strokes.forEach((stroke) => {
      if (stroke.points.length < 2) return;

      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.baseWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);

      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }

      ctx.stroke();
    });
  }, [strokes, background]);

  return (
    <div className="min-h-screen bg-black text-green-500 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="px-4 py-2 border-2 border-green-500 bg-black text-green-500 font-mono hover:bg-green-950"
          >
            &lt; BACK
          </button>
          <h1 className="text-2xl font-mono">{pageName}</h1>
          <div className="w-24"></div> {/* Spacer for centering */}
        </div>

        {/* Canvas Display */}
        <div className="border-2 border-green-500 p-4 mb-6">
          <canvas
            ref={canvasRef}
            className="w-full h-auto bg-white"
            style={{ maxHeight: '70vh' }}
          />
        </div>

        {/* Stats */}
        <div className="border-2 border-green-500 p-4 font-mono">
          <div className="text-lg mb-2">DOODLE_STATS:</div>
          <div className="pl-4 space-y-1">
            <div>ID: {pageId}</div>
            <div>STROKES: {strokes.length}</div>
            <div>
              COLORS: {new Set(strokes.map((s) => s.color)).size}
            </div>
            <div>
              BRUSHES: {new Set(strokes.map((s) => s.brushType)).size}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
