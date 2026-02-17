// Core types for sticker creation feature

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SubjectMask {
  mask: Uint8Array;  // Binary mask: 1 = subject, 0 = background
  boundingBox: BoundingBox;
  confidence: number;
  method: 'ai' | 'fallback';
}

export interface StickerResult {
  preview: ImageData;
  formats: {
    png: Blob;
    webp?: Blob;
  };
  metadata: StickerMetadata;
}

export interface StickerMetadata {
  createdAt: Date;
  originalDimensions: { width: number; height: number };
  croppedDimensions: { width: number; height: number };
  detectionMethod: 'ai' | 'fallback';
  detectionConfidence: number;
  exportFormats: Array<'png' | 'webp'>;
  fileSizes: Record<string, number>;
}

export type ProcessingStage = 
  | 'idle'
  | 'detecting'
  | 'removing-background'
  | 'cropping'
  | 'exporting'
  | 'complete'
  | 'error';

export interface ProcessingState {
  stage: ProcessingStage;
  progress: number;  // 0-100
  error?: string;
}

export interface CroppedResult {
  imageData: ImageData;
  boundingBox: BoundingBox;
  padding: number;
}

export class StickerCreationError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'StickerCreationError';
  }
}
