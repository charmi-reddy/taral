import { JSDOM } from 'jsdom';
import { Canvas } from 'canvas';

// Setup canvas for jsdom
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.document = dom.window.document as any;
global.window = dom.window as any;

// Polyfill HTMLCanvasElement.getContext for node-canvas
HTMLCanvasElement.prototype.getContext = function (contextType: string) {
  if (contextType === '2d') {
    const canvas = new Canvas(this.width || 300, this.height || 150);
    return canvas.getContext('2d') as any;
  }
  return null;
} as any;

// Mock getBoundingClientRect
HTMLCanvasElement.prototype.getBoundingClientRect = function () {
  const width = parseInt(this.style.width) || this.width || 300;
  const height = parseInt(this.style.height) || this.height || 150;
  
  return {
    width,
    height,
    top: 0,
    left: 0,
    right: width,
    bottom: height,
    x: 0,
    y: 0,
    toJSON: () => {},
  } as DOMRect;
};
