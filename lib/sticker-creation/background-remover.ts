import { SubjectMask } from './types';

export class BackgroundRemover {
  /**
   * Remove background from image based on subject mask
   * @param imageData - The source image data
   * @param mask - Subject mask indicating which pixels to keep
   * @returns New ImageData with transparent background
   */
  removeBackground(imageData: ImageData, mask: SubjectMask): ImageData {
    const { width, height, data } = imageData;
    const newData = new Uint8ClampedArray(data.length);
    
    // Copy all pixel data
    newData.set(data);
    
    // Apply mask: set alpha = 0 for background pixels
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const pixelIdx = (y * width + x) * 4;
        const maskIdx = y * width + x;
        
        if (mask.mask[maskIdx] === 0) {
          // Background pixel - make fully transparent
          newData[pixelIdx + 3] = 0;
        }
        // Subject pixels keep their original RGBA values
      }
    }
    
    // Apply edge smoothing
    const smoothedData = this.applyEdgeSmoothing(newData, mask.mask, width, height);
    
    return new ImageData(smoothedData, width, height);
  }

  /**
   * Apply edge smoothing to prevent harsh boundaries
   * Uses a 3x3 Gaussian blur at mask boundaries
   */
  private applyEdgeSmoothing(
    data: Uint8ClampedArray,
    mask: Uint8Array,
    width: number,
    height: number
  ): Uint8ClampedArray {
    const result = new Uint8ClampedArray(data);
    
    // 3x3 Gaussian kernel (simplified)
    const kernel = [
      [1, 2, 1],
      [2, 4, 2],
      [1, 2, 1]
    ];
    const kernelSum = 16;
    
    // Find edge pixels (subject pixels adjacent to background)
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const maskIdx = y * width + x;
        
        // Check if this is an edge pixel
        if (mask[maskIdx] === 1) {
          // Check if any neighbor is background
          let isEdge = false;
          for (let dy = -1; dy <= 1 && !isEdge; dy++) {
            for (let dx = -1; dx <= 1 && !isEdge; dx++) {
              const neighborIdx = (y + dy) * width + (x + dx);
              if (mask[neighborIdx] === 0) {
                isEdge = true;
              }
            }
          }
          
          if (isEdge) {
            // Apply Gaussian blur to alpha channel only
            let alphaSum = 0;
            let weightSum = 0;
            
            for (let dy = -1; dy <= 1; dy++) {
              for (let dx = -1; dx <= 1; dx++) {
                const ny = y + dy;
                const nx = x + dx;
                const neighborPixelIdx = (ny * width + nx) * 4;
                const neighborMaskIdx = ny * width + nx;
                
                if (mask[neighborMaskIdx] === 1) {
                  const weight = kernel[dy + 1][dx + 1];
                  alphaSum += data[neighborPixelIdx + 3] * weight;
                  weightSum += weight;
                }
              }
            }
            
            if (weightSum > 0) {
              const pixelIdx = (y * width + x) * 4;
              result[pixelIdx + 3] = Math.round(alphaSum / weightSum);
            }
          }
        }
      }
    }
    
    return result;
  }
}
