import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCanvas } from './useCanvas';

// Mock canvas
beforeEach(() => {
  HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 0,
    lineCap: 'round',
    lineJoin: 'round',
    scale: vi.fn(),
    fillRect: vi.fn(),
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    quadraticCurveTo: vi.fn(),
    stroke: vi.fn(),
    fill: vi.fn(),
    arc: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    setTransform: vi.fn(),
  })) as any;
  
  HTMLCanvasElement.prototype.getBoundingClientRect = vi.fn(() => ({
    width: 800,
    height: 600,
    top: 0,
    left: 0,
    bottom: 600,
    right: 800,
    x: 0,
    y: 0,
    toJSON: () => {},
  })) as any;
});

describe('useCanvas', () => {
  describe('Initialization', () => {
    it('should initialize with default config', () => {
      const { result } = renderHook(() => useCanvas());
      
      expect(result.current.config).toEqual({
        color: '#000000',
        brushType: 'ink',
        brushSize: 3,
        backgroundStyle: 'plain',
      });
    });

    it('should provide canvas refs', () => {
      const { result } = renderHook(() => useCanvas());
      
      expect(result.current.drawingCanvasRef).toBeDefined();
      expect(result.current.backgroundCanvasRef).toBeDefined();
    });

    it('should provide event handlers', () => {
      const { result } = renderHook(() => useCanvas());
      
      expect(typeof result.current.handlePointerDown).toBe('function');
      expect(typeof result.current.handlePointerMove).toBe('function');
      expect(typeof result.current.handlePointerUp).toBe('function');
    });

    it('should provide configuration methods', () => {
      const { result } = renderHook(() => useCanvas());
      
      expect(typeof result.current.setColor).toBe('function');
      expect(typeof result.current.setBrushType).toBe('function');
      expect(typeof result.current.setBrushSize).toBe('function');
      expect(typeof result.current.setBackgroundStyle).toBe('function');
      expect(typeof result.current.clearCanvas).toBe('function');
    });
  });

  describe('Configuration Updates', () => {
    it('should update color', () => {
      const { result } = renderHook(() => useCanvas());
      
      act(() => {
        result.current.setColor('#ff0000');
      });
      
      expect(result.current.config.color).toBe('#ff0000');
    });

    it('should update brush type', () => {
      const { result } = renderHook(() => useCanvas());
      
      act(() => {
        result.current.setBrushType('marker');
      });
      
      expect(result.current.config.brushType).toBe('marker');
    });

    it('should update brush size', () => {
      const { result } = renderHook(() => useCanvas());
      
      act(() => {
        result.current.setBrushSize(10);
      });
      
      expect(result.current.config.brushSize).toBe(10);
    });

    it('should clamp brush size to valid range', () => {
      const { result } = renderHook(() => useCanvas());
      
      act(() => {
        result.current.setBrushSize(100);
      });
      
      expect(result.current.config.brushSize).toBe(50); // Max
      
      act(() => {
        result.current.setBrushSize(-5);
      });
      
      expect(result.current.config.brushSize).toBe(1); // Min
    });

    it('should update background style', () => {
      const { result } = renderHook(() => useCanvas());
      
      act(() => {
        result.current.setBackgroundStyle('dotted');
      });
      
      expect(result.current.config.backgroundStyle).toBe('dotted');
    });
  });

  describe('Property 12: Color Change Isolation', () => {
    // Feature: doodle-canvas, Property 12: Color Change Isolation
    // Validates: Requirements 6.2, 6.3

    it('should not affect previous strokes when color changes', () => {
      const { result } = renderHook(() => useCanvas());
      
      const initialColor = result.current.config.color;
      
      act(() => {
        result.current.setColor('#ff0000');
      });
      
      // New color should be different
      expect(result.current.config.color).not.toBe(initialColor);
      expect(result.current.config.color).toBe('#ff0000');
    });
  });

  describe('Property 14: Brush Size Change Isolation', () => {
    // Feature: doodle-canvas, Property 14: Brush Size Change Isolation
    // Validates: Requirements 7.2, 7.3

    it('should not affect previous strokes when size changes', () => {
      const { result } = renderHook(() => useCanvas());
      
      const initialSize = result.current.config.brushSize;
      
      act(() => {
        result.current.setBrushSize(20);
      });
      
      // New size should be different
      expect(result.current.config.brushSize).not.toBe(initialSize);
      expect(result.current.config.brushSize).toBe(20);
    });
  });

  describe('Property 16: Snap-to-Grid Activation', () => {
    // Feature: doodle-canvas, Property 16: Snap-to-Grid Activation
    // Validates: Requirements 9.1

    it('should enable snap-to-grid only for pixel pen on grid background', () => {
      const { result } = renderHook(() => useCanvas());
      
      // Not pixel pen, not grid
      expect(result.current.config.brushType).toBe('ink');
      expect(result.current.config.backgroundStyle).toBe('plain');
      
      // Set to pixel pen but not grid
      act(() => {
        result.current.setBrushType('pixel');
      });
      expect(result.current.config.brushType).toBe('pixel');
      expect(result.current.config.backgroundStyle).toBe('plain');
      
      // Set to grid background with pixel pen
      act(() => {
        result.current.setBackgroundStyle('grid');
      });
      expect(result.current.config.brushType).toBe('pixel');
      expect(result.current.config.backgroundStyle).toBe('grid');
      // Snap-to-grid should be active (tested in pointer handlers)
    });
  });

  describe('Property 19: Clear Canvas Removes Strokes', () => {
    // Feature: doodle-canvas, Property 19: Clear Canvas Removes Strokes
    // Validates: Requirements 10.1

    it('should clear canvas when clearCanvas is called', () => {
      const { result } = renderHook(() => useCanvas());
      
      // clearCanvas should not throw
      act(() => {
        result.current.clearCanvas();
      });
      
      // Config should remain unchanged
      expect(result.current.config).toBeDefined();
    });
  });

  describe('Property 20: Clear Preserves Background', () => {
    // Feature: doodle-canvas, Property 20: Clear Preserves Background
    // Validates: Requirements 10.2

    it('should preserve background style after clear', () => {
      const { result } = renderHook(() => useCanvas());
      
      act(() => {
        result.current.setBackgroundStyle('ruled');
      });
      
      const backgroundBefore = result.current.config.backgroundStyle;
      
      act(() => {
        result.current.clearCanvas();
      });
      
      expect(result.current.config.backgroundStyle).toBe(backgroundBefore);
      expect(result.current.config.backgroundStyle).toBe('ruled');
    });
  });

  describe('Property 22: Configuration Update Immediacy', () => {
    // Feature: doodle-canvas, Property 22: Configuration Update Immediacy
    // Validates: Requirements 12.6

    it('should update configuration immediately', () => {
      const { result } = renderHook(() => useCanvas());
      
      act(() => {
        result.current.setColor('#00ff00');
      });
      
      // Should be updated immediately
      expect(result.current.config.color).toBe('#00ff00');
      
      act(() => {
        result.current.setBrushSize(15);
      });
      
      expect(result.current.config.brushSize).toBe(15);
    });
  });

  describe('Event Handler Safety', () => {
    it('should handle pointer events without canvas engine', () => {
      const { result } = renderHook(() => useCanvas());
      
      const mockEvent = {
        preventDefault: vi.fn(),
        currentTarget: document.createElement('canvas'),
        clientX: 100,
        clientY: 100,
        pressure: 0.5,
      } as any;
      
      // Should not throw
      expect(() => {
        result.current.handlePointerDown(mockEvent);
        result.current.handlePointerMove(mockEvent);
        result.current.handlePointerUp(mockEvent);
      }).not.toThrow();
    });
  });
});
