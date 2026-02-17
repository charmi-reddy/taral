import { BoundingBox } from '../types';

/**
 * Calculate the bounding box of all non-transparent pixels in an ImageData
 * @param imageData - The image data to analyze
 * @returns BoundingBox containing the minimal rectangle around non-transparent pixels
 * @throws Error if the image is fully transparent
 */
export function calculateBoundingBox(imageData: ImageData): BoundingBox {
  const { width, height, data } = imageData;
  
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  
  // Scan all pixels to find non-transparent bounds
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const alpha = data[idx + 3];
      
      // If pixel is not fully transparent
      if (alpha > 0) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }
  
  // Check if image is fully transparent
  if (maxX === -1 || maxY === -1) {
    throw new Error('Cannot calculate bounding box: image is fully transparent');
  }
  
  return {
    x: minX,
    y: minY,
    width: maxX - minX + 1,
    height: maxY - minY + 1,
  };
}

/**
 * Calculate bounding box from a binary mask
 * @param mask - Binary mask (1 = subject, 0 = background)
 * @param width - Width of the mask
 * @param height - Height of the mask
 * @returns BoundingBox of the masked region
 */
export function calculateBoundingBoxFromMask(
  mask: Uint8Array,
  width: number,
  height: number
): BoundingBox {
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      
      if (mask[idx] === 1) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }
  
  if (maxX === -1 || maxY === -1) {
    throw new Error('Cannot calculate bounding box: mask is empty');
  }
  
  return {
    x: minX,
    y: minY,
    width: maxX - minX + 1,
    height: maxY - minY + 1,
  };
}
