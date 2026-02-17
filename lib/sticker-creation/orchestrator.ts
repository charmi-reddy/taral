import { StickerResult, StickerCreationError } from './types';
import { AISubjectDetector } from './ai-subject-detector';
import { PixelSubjectDetector } from './pixel-subject-detector';
import { BackgroundRemover } from './background-remover';
import { SmartCropper } from './smart-cropper';
import { FormatExporter } from './format-exporter';

export class StickerCreationOrchestrator {
  private aiDetector: AISubjectDetector;
  private pixelDetector: PixelSubjectDetector;
  private backgroundRemover: BackgroundRemover;
  private cropper: SmartCropper;
  private exporter: FormatExporter;
  private useAI: boolean;

  constructor(useAI: boolean = true) {
    this.aiDetector = new AISubjectDetector();
    this.pixelDetector = new PixelSubjectDetector();
    this.backgroundRemover = new BackgroundRemover();
    this.cropper = new SmartCropper();
    this.exporter = new FormatExporter();
    this.useAI = useAI;
  }

  /**
   * Create a sticker from a canvas element
   * @param canvas - The canvas containing the drawing
   * @returns Promise resolving to StickerResult
   */
  async createSticker(canvas: HTMLCanvasElement): Promise<StickerResult> {
    // Validate canvas is not empty
    if (!this.hasContent(canvas)) {
      throw new StickerCreationError(
        'Cannot create sticker from empty canvas. Please draw something first.',
        'EMPTY_CANVAS'
      );
    }

    // Extract ImageData
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new StickerCreationError(
        'Failed to get canvas context',
        'CANVAS_CONTEXT_ERROR'
      );
    }

    const originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const originalDimensions = { width: canvas.width, height: canvas.height };

    try {
      // Step 1: Detect subject with AI (fallback to pixel-based if AI fails)
      let mask;
      let detectionMethod: 'ai' | 'fallback' = 'fallback';

      if (this.useAI) {
        try {
          console.log('Attempting AI subject detection...');
          mask = await this.aiDetector.detectSubject(originalImageData);
          detectionMethod = 'ai';
          console.log('AI detection successful');
        } catch (aiError) {
          console.warn('AI detection failed, falling back to pixel detection:', aiError);
          mask = await this.pixelDetector.detectSubject(originalImageData);
        }
      } else {
        mask = await this.pixelDetector.detectSubject(originalImageData);
      }

      // Step 2: Remove background
      const withoutBackground = this.backgroundRemover.removeBackground(originalImageData, mask);

      // Step 3: Smart crop
      const cropped = this.cropper.crop(withoutBackground);

      // Check if drawing is too small
      if (cropped.boundingBox.width < 32 || cropped.boundingBox.height < 32) {
        throw new StickerCreationError(
          'Drawing is too small for a quality sticker. Try drawing something larger.',
          'DRAWING_TOO_SMALL'
        );
      }

      // Step 4: Export to formats
      const pngBlob = await this.exporter.exportPNG(cropped.imageData);
      const webpBlob = await this.exporter.exportWebP(cropped.imageData);

      // Collect metadata
      const metadata = {
        createdAt: new Date(),
        originalDimensions,
        croppedDimensions: {
          width: cropped.imageData.width,
          height: cropped.imageData.height,
        },
        detectionMethod: mask.method,
        detectionConfidence: mask.confidence,
        exportFormats: webpBlob ? ['png' as const, 'webp' as const] : ['png' as const],
        fileSizes: {
          png: pngBlob.size,
          ...(webpBlob && { webp: webpBlob.size }),
        },
      };

      return {
        preview: cropped.imageData,
        formats: {
          png: pngBlob,
          webp: webpBlob || undefined,
        },
        metadata,
      };
    } catch (error) {
      if (error instanceof StickerCreationError) {
        throw error;
      }

      throw new StickerCreationError(
        'Failed to create sticker. Please try again.',
        'PROCESSING_ERROR',
        error
      );
    }
  }

  /**
   * Check if canvas has any content
   */
  private hasContent(canvas: HTMLCanvasElement): boolean {
    const ctx = canvas.getContext('2d');
    if (!ctx) return false;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const { data } = imageData;

    // Check if any pixel has alpha > 0
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] > 0) {
        return true;
      }
    }

    return false;
  }
}
