'use client';

import { useEffect, useRef, useState } from 'react';
import type { Stroke, BackgroundStyle } from '@/lib/types';

interface DoodleOverviewProps {
  pageId: string;
  pageName: string;
  strokes: Stroke[];
  background?: BackgroundStyle;
  onBack: () => void;
}

interface TerminalOutput {
  type: 'command' | 'output' | 'error';
  text: string;
}

export default function DoodleOverview({
  pageId,
  pageName,
  strokes,
  background,
  onBack,
}: DoodleOverviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hasStrokes = strokes && strokes.length > 0;
  const [command, setCommand] = useState('');
  const [terminalHistory, setTerminalHistory] = useState<TerminalOutput[]>([
    { type: 'output', text: 'TERMINAL READY. TYPE "HELP" FOR COMMANDS.' }
  ]);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll terminal to bottom
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalHistory]);

  useEffect(() => {
    if (!hasStrokes) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Calculate bounding box of all strokes
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;

    strokes.forEach((stroke) => {
      stroke.points.forEach((point) => {
        minX = Math.min(minX, point.x);
        maxX = Math.max(maxX, point.x);
        minY = Math.min(minY, point.y);
        maxY = Math.max(maxY, point.y);
      });
    });

    // Add padding
    const padding = 50;
    minX -= padding;
    minY -= padding;
    maxX += padding;
    maxY += padding;

    // Set canvas size to bounding box
    const width = maxX - minX;
    const height = maxY - minY;
    
    canvas.width = width;
    canvas.height = height;

    // Clear canvas with white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw all strokes with offset
    strokes.forEach((stroke) => {
      if (stroke.points.length < 2) return;

      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.baseWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x - minX, stroke.points[0].y - minY);

      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x - minX, stroke.points[i].y - minY);
      }

      ctx.stroke();
    });
  }, [strokes, background, hasStrokes]);

  // Calculate basic stats
  const calculateStats = () => {
    if (!hasStrokes) return null;

    const totalPoints = strokes.reduce((sum, s) => sum + s.points.length, 0);
    const uniqueColors = new Set(strokes.map(s => s.color)).size;
    const uniqueBrushes = new Set(strokes.map(s => s.brushType)).size;
    
    // Calculate average speed
    let totalSpeed = 0;
    let speedCount = 0;
    strokes.forEach(stroke => {
      if (stroke.points.length >= 2) {
        const first = stroke.points[0];
        const last = stroke.points[stroke.points.length - 1];
        const timeDiff = last.timestamp - first.timestamp;
        if (timeDiff > 0) {
          let distance = 0;
          for (let i = 1; i < stroke.points.length; i++) {
            const dx = stroke.points[i].x - stroke.points[i-1].x;
            const dy = stroke.points[i].y - stroke.points[i-1].y;
            distance += Math.sqrt(dx * dx + dy * dy);
          }
          totalSpeed += distance / timeDiff;
          speedCount++;
        }
      }
    });
    const avgSpeed = speedCount > 0 ? totalSpeed / speedCount : 0;

    return {
      strokes: strokes.length,
      points: totalPoints,
      colors: uniqueColors,
      brushes: uniqueBrushes,
      avgSpeed: avgSpeed.toFixed(2)
    };
  };

  // Handle terminal commands
  const handleCommand = (cmd: string) => {
    const trimmedCmd = cmd.trim().toUpperCase();
    
    setTerminalHistory(prev => [...prev, { type: 'command', text: `> ${cmd}` }]);

    if (!trimmedCmd) return;

    switch (trimmedCmd) {
      case 'HELP':
        setTerminalHistory(prev => [...prev, 
          { type: 'output', text: 'AVAILABLE COMMANDS:' },
          { type: 'output', text: '  ANALYZE  - Run full doodle analysis' },
          { type: 'output', text: '  STATS    - Show drawing statistics' },
          { type: 'output', text: '  SUGGEST  - Get AI suggestions (coming soon)' },
          { type: 'output', text: '  CLEAR    - Clear terminal' },
          { type: 'output', text: '  HELP     - Show this message' }
        ]);
        break;

      case 'STATS':
        const stats = calculateStats();
        if (stats) {
          setTerminalHistory(prev => [...prev,
            { type: 'output', text: 'DRAWING STATISTICS:' },
            { type: 'output', text: `  STROKES: ${stats.strokes}` },
            { type: 'output', text: `  POINTS: ${stats.points}` },
            { type: 'output', text: `  COLORS: ${stats.colors}` },
            { type: 'output', text: `  BRUSHES: ${stats.brushes}` },
            { type: 'output', text: `  AVG_SPEED: ${stats.avgSpeed} px/ms` }
          ]);
        } else {
          setTerminalHistory(prev => [...prev, { type: 'error', text: 'ERROR: No data to analyze' }]);
        }
        break;

      case 'ANALYZE':
        if (hasStrokes) {
          setTerminalHistory(prev => [...prev,
            { type: 'output', text: 'RUNNING ANALYSIS...' },
            { type: 'output', text: 'PATTERN: Analyzing stroke patterns...' },
            { type: 'output', text: 'STYLE: Detecting drawing style...' },
            { type: 'output', text: 'ANALYSIS COMPLETE.' }
          ]);
          // Add actual analysis results
          const stats = calculateStats();
          if (stats) {
            setTerminalHistory(prev => [...prev,
              { type: 'output', text: `COMPLEXITY: ${stats.strokes > 20 ? 'HIGH' : stats.strokes > 10 ? 'MEDIUM' : 'LOW'}` },
              { type: 'output', text: `SPEED: ${parseFloat(stats.avgSpeed) > 2 ? 'FAST' : parseFloat(stats.avgSpeed) > 1 ? 'MEDIUM' : 'SLOW'}` },
              { type: 'output', text: `COLOR_USAGE: ${stats.colors > 5 ? 'DIVERSE' : stats.colors > 2 ? 'MODERATE' : 'MINIMAL'}` }
            ]);
          }
        } else {
          setTerminalHistory(prev => [...prev, { type: 'error', text: 'ERROR: Nothing to analyze' }]);
        }
        break;

      case 'SUGGEST':
        setTerminalHistory(prev => [...prev,
          { type: 'output', text: 'AI SUGGESTIONS:' },
          { type: 'output', text: '  [Feature coming soon with Gemini integration]' }
        ]);
        break;

      case 'CLEAR':
        setTerminalHistory([{ type: 'output', text: 'TERMINAL CLEARED.' }]);
        break;

      default:
        setTerminalHistory(prev => [...prev, 
          { type: 'error', text: `ERROR: Unknown command "${cmd}". Type HELP for available commands.` }
        ]);
    }

    setCommand('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCommand(command);
    }
  };

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
          {hasStrokes ? (
            <canvas
              ref={canvasRef}
              className="w-full h-auto bg-white"
              style={{ maxHeight: '70vh' }}
            />
          ) : (
            <div className="flex items-center justify-center h-64 bg-black">
              <p className="text-green-500 font-mono text-2xl">Nothing On Canvas!</p>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="border-2 border-green-500 p-4 font-mono mb-6">
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

        {/* Terminal Interface */}
        <div className="border-2 border-green-500 p-4 font-mono">
          <div className="text-lg mb-2">TERMINAL:</div>
          
          {/* Terminal Output */}
          <div className="bg-black border border-green-500 p-3 h-64 overflow-y-auto mb-3">
            {terminalHistory.map((entry, idx) => (
              <div
                key={idx}
                className={`${
                  entry.type === 'command' ? 'text-green-400' :
                  entry.type === 'error' ? 'text-red-500' :
                  'text-green-500'
                }`}
              >
                {entry.text}
              </div>
            ))}
            <div ref={terminalEndRef} />
          </div>

          {/* Terminal Input */}
          <div className="flex items-center gap-2">
            <span className="text-green-500">&gt;</span>
            <input
              type="text"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-black border border-green-500 text-green-500 px-2 py-1 font-mono focus:outline-none focus:ring-1 focus:ring-green-500"
              placeholder="Type command (HELP for list)"
              autoComplete="off"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
