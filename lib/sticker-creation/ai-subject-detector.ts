/**
 * AI-powered subject detector using Gemini Vision API
 */

import { SubjectMask, BoundingBox } from './types';
import { GeminiVisionClient } from './gemini-vision-client';

const SUBJECT_DETECTION_PROMPT = `Analyze this drawing and identify the main subject or doodle.
Provide the bounding box coordinates of the primary subject in the following format:
{"x": <number>, "y": <number>, "width": <number>, "height": <number>}

Where:
- x and y are the top-left corner coordinates (in pixels)
- width and height are the dimensions (in pixels)

Ignore any background elements and focus on the main drawing. If there are multiple subjects, select the largest or most central one.`;

export class AISubjectDetector {
  private client: GeminiVisionClient;

  constructor(apiKey?: string) {
    this.client = new GeminiVisionClient(apiKey);
  }

  /**
   * Detect the main subject in an image using Gemini Vision API
   * @param imageData - The image to analyze
   * @returns Promise resolving to SubjectMask
   */
  async detectSubject(imageData: ImageData): Promise<SubjectMask> {
    // Convert ImageData to base64 PNG
    const base64Image = await this.imageDataToBase64(imageData);

    // Call Gemini Vision API
    const response = await this.client.analyzeImage(base64Image, SUBJECT_DETECTION_PROMPT);

    if (response.error || !response.boundingBox) {
      throw new Error(response.error || 'Failed to detect subject');
    }

    // Normalize bounding box to image dimensions
    const normalizedBox = this.normalizeBoundingBox(
      response.boundingBox,
      imageData.width,
      imageData.height
    );

    // Generate binary mask from bounding box
    const mask = this.createMaskFromBoundingBox(
      normalizedBox,
      imageData.width,
      imageData.height
    );

    return {
      mask,
      boundingBox: normalizedBox,
      confidence: response.confidence || 0.85,
      method: 'ai',
    };
  }

  /**
   * Convert ImageData to base64 encoded PNG
   */
  private async imageDataToBase64(imageData: ImageData): Promise<string> {
    // Create a temporary canvas
    const canvas = document.createElement('canvas');
    canvas.width = imageData.width;
    canvas.height = imageData.height;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }

    // Put image data on canvas
    ctx.putImageData(imageData, 0, 0);

    // Convert to blob then to base64
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Failed to create blob from canvas'));
          return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          // Remove data:image/png;base64, prefix
          const base64Data = base64.split(',')[1];
          resolve(base64Data);
        };
        reader.onerror = () => reject(new Error('Failed to read blob'));
        reader.readAsDataURL(blob);
      }, 'image/png');
    });
  }

  /**
   * Normalize bounding box coordinates to ensure they're within image bounds
   */
  private normalizeBoundingBox(
    box: BoundingBox,
    imageWidth: number,
    imageHeight: number
  ): BoundingBox {
    // Clamp coordinates to image bounds
    const x = Math.max(0, Math.min(box.x, imageWidth - 1));
    const y = Math.max(0, Math.min(box.y, imageHeight - 1));
    
    // Clamp dimensions
    const maxWidth = imageWidth - x;
    const maxHeight = imageHeight - y;
    const width = Math.max(1, Math.min(box.width, maxWidth));
    const height = Math.max(1, Math.min(box.height, maxHeight));

    return { x, y, width, height };
  }

  /**
   * Create a binary mask from a bounding box
   */
  private createMaskFromBoundingBox(
    box: BoundingBox,
    imageWidth: number,
    imageHeight: number
  ): Uint8Array {
    const mask = new Uint8Array(imageWidth * imageHeight);

    // Fill the bounding box area with 1s
    for (let y = Math.floor(box.y); y < Math.ceil(box.y + box.height); y++) {
      for (let x = Math.floor(box.x); x < Math.ceil(box.x + box.width); x++) {
        if (x >= 0 && x < imageWidth && y >= 0 && y < imageHeight) {
          mask[y * imageWidth + x] = 1;
        }
      }
    }

    return mask;
  }
}
