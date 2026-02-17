import { CroppedResult } from './types';
import { calculateBoundingBox } from './utils/bounding-box';

export class SmartCropper {
  private readonly defaultPadding = 8;
  private readonly minDimension = 64;
  private readonly maxDimension = 2048;

  constructor(private padding: number = 8) {
    this.padding = Math.max(5, Math.min(10, padding));
  }

  /**
   * Crop ImageData to minimal bounding box with padding
   * @param imageData - The image data to crop
   * @returns CroppedResult with cropped image and metadata
   */
  crop(imageData: ImageData): CroppedResult {
    // Calculate bounding box of non-transparent pixels
    const bbox = calculateBoundingBox(imageData);
    
    // Add padding
    let x = Math.max(0, bbox.x - this.padding);
    let y = Math.max(0, bbox.y - this.padding);
    let width = Math.min(imageData.width - x, bbox.width + this.padding * 2);
    let height = Math.min(imageData.height - y, bbox.height + this.padding * 2);
    
    // Enforce minimum dimensions
    if (width < this.minDimension) {
      const diff = this.minDimension - width;
      x = Math.max(0, x - Math.floor(diff / 2));
      width = Math.min(imageData.width - x, this.minDimension);
    }
    
    if (height < this.minDimension) {
      const diff = this.minDimension - height;
      y = Math.max(0, y - Math.floor(diff / 2));
      height = Math.min(imageData.height - y, this.minDimension);
    }
    
    // Scale down if exceeds maximum dimensions
    let scale = 1;
    if (width > this.maxDimension || height > this.maxDimension) {
      scale = Math.min(this.maxDimension / width, this.maxDimension / height);
    }
    
    const finalWidth = Math.round(width * scale);
    const finalHeight = Math.round(height * scale);
    
    // Extract and scale the sub-region
    const croppedData = this.extractRegion(imageData, x, y, width, height, finalWidth, finalHeight);
    
    return {
      imageData: croppedData,
      boundingBox: { x, y, width: finalWidth, height: finalHeight },
      padding: this.padding,
    };
  }

  /**
   * Extract a region from ImageData and optionally scale it
   */
  private extractRegion(
    source: ImageData,
    x: number,
    y: number,
    width: number,
    height: number,
    targetWidth: number,
    targetHeight: number
  ): ImageData {
    // Create temporary canvas for extraction
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempCtx = tempCanvas.getContext('2d')!;
    
    // Put source image on temp canvas
    const fullCanvas = document.createElement('canvas');
    fullCanvas.width = source.width;
    fullCanvas.height = source.height;
    const fullCtx = fullCanvas.getContext('2d')!;
    fullCtx.putImageData(source, 0, 0);
    
    // Draw the cropped region
    tempCtx.drawImage(fullCanvas, x, y, width, height, 0, 0, width, height);
    
    // Scale if needed
    if (targetWidth !== width || targetHeight !== height) {
      const scaledCanvas = document.createElement('canvas');
      scaledCanvas.width = targetWidth;
      scaledCanvas.height = targetHeight;
      const scaledCtx = scaledCanvas.getContext('2d')!;
      
      // Use high-quality interpolation
      scaledCtx.imageSmoothingEnabled = true;
      scaledCtx.imageSmoothingQuality = 'high';
      
      scaledCtx.drawImage(tempCanvas, 0, 0, width, height, 0, 0, targetWidth, targetHeight);
      
      return scaledCtx.getImageData(0, 0, targetWidth, targetHeight);
    }
    
    return tempCtx.getImageData(0, 0, width, height);
  }
}
