# Sticker Creation Module

This module provides AI-powered sticker creation from doodles, with automatic subject detection, background removal, and multi-format export.

## Features

- **AI-Powered Subject Detection**: Uses Google Gemini Vision API to intelligently identify the main subject in your doodle
- **Automatic Fallback**: Falls back to pixel-based detection if AI is unavailable
- **Background Removal**: Removes background while preserving subject details
- **Smart Cropping**: Automatically crops to the subject with appropriate padding
- **Multi-Format Export**: Exports to PNG (high quality) and WebP (WhatsApp-optimized)

## Setup

### 1. Configure API Key

Add your Google Gemini API key to `.env.local`:

```bash
NEXT_PUBLIC_GEMINI_API_KEY=your_api_key_here
```

Get your API key from: https://aistudio.google.com/app/apikey

### 2. Usage

```typescript
import { StickerCreationOrchestrator } from '@/lib/sticker-creation';

// Create orchestrator (AI enabled by default)
const orchestrator = new StickerCreationOrchestrator();

// Or disable AI and use pixel-based detection only
const orchestrator = new StickerCreationOrchestrator(false);

// Create sticker from canvas
const result = await orchestrator.createSticker(canvasElement);

// Access results
console.log('Preview:', result.preview);
console.log('PNG:', result.formats.png);
console.log('WebP:', result.formats.webp);
console.log('Metadata:', result.metadata);
```

## How It Works

### 1. Subject Detection

The system first attempts to detect the main subject using Gemini Vision API:

- Converts canvas to base64 PNG
- Sends to Gemini with subject detection prompt
- Parses bounding box from response
- Falls back to pixel-based detection on failure

### 2. Background Removal

- Uses the detected subject mask to identify foreground/background
- Sets background pixels to transparent
- Applies edge smoothing for clean boundaries

### 3. Smart Cropping

- Calculates minimal bounding box around subject
- Adds configurable padding (default 8px)
- Enforces minimum dimensions (64x64)
- Maintains aspect ratio

### 4. Format Export

**PNG Export:**
- Lossless compression
- Full resolution up to 2048x2048
- Preserves all details

**WebP Export:**
- Optimized for WhatsApp (512x512, <100KB)
- Iterative quality reduction to meet size constraint
- High-quality interpolation for resizing

## Error Handling

The system handles various error scenarios gracefully:

- **Empty Canvas**: Validates canvas has content before processing
- **AI Failure**: Automatically falls back to pixel-based detection
- **Small Drawings**: Enforces minimum dimensions
- **API Timeout**: 10-second timeout with retry logic
- **Export Failures**: Provides clear error messages

## API Reference

### StickerCreationOrchestrator

Main orchestrator class that coordinates the sticker creation pipeline.

```typescript
class StickerCreationOrchestrator {
  constructor(useAI?: boolean)
  createSticker(canvas: HTMLCanvasElement): Promise<StickerResult>
}
```

### AISubjectDetector

AI-powered subject detector using Gemini Vision API.

```typescript
class AISubjectDetector {
  constructor(apiKey?: string)
  detectSubject(imageData: ImageData): Promise<SubjectMask>
}
```

### PixelSubjectDetector

Fallback pixel-based subject detector.

```typescript
class PixelSubjectDetector {
  detectSubject(imageData: ImageData): Promise<SubjectMask>
}
```

### GeminiVisionClient

Low-level client for Gemini Vision API.

```typescript
class GeminiVisionClient {
  constructor(apiKey?: string, timeout?: number, maxRetries?: number)
  analyzeImage(imageBase64: string, prompt: string): Promise<GeminiVisionResponse>
}
```

## Types

```typescript
interface StickerResult {
  preview: ImageData
  formats: {
    png: Blob
    webp?: Blob
  }
  metadata: StickerMetadata
}

interface SubjectMask {
  mask: Uint8Array  // Binary mask: 1 = subject, 0 = background
  boundingBox: BoundingBox
  confidence: number
  method: 'ai' | 'fallback'
}

interface BoundingBox {
  x: number
  y: number
  width: number
  height: number
}
```

## Performance

Typical processing times:
- AI subject detection: < 2 seconds
- Pixel-based detection: < 500ms
- Background removal: < 500ms (512x512)
- Cropping: < 100ms
- PNG export: < 200ms
- WebP export: < 1 second
- **Total pipeline: < 3 seconds**

## Troubleshooting

### AI Detection Not Working

1. Check API key is set in `.env.local`
2. Verify API key has correct permissions
3. Check browser console for error messages
4. System will automatically fall back to pixel detection

### WebP Export Fails

- Browser may not support WebP
- Drawing may be too complex to compress under 100KB
- System will still provide PNG export

### Subject Not Detected Correctly

- Try drawing with more contrast
- Ensure subject is clearly separated from background
- Avoid very small or very large drawings
- System will use best available detection method
