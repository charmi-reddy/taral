import { SubjectMask } from './types';
import { calculateBoundingBoxFromMask } from './utils/bounding-box';

export class PixelSubjectDetector {
  private readonly alphaThreshold = 10; // Minimum alpha to consider as content

  /**
   * Detect subject using pixel-based analysis (fallback method)
   * @param imageData - The image to analyze
   * @returns SubjectMask with detected subject region
   */
  async detectSubject(imageData: ImageData): Promise<SubjectMask> {
    const { width, height, data } = imageData;
    
    // Create initial mask from non-transparent pixels
    const mask = new Uint8Array(width * height);
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const alpha = data[idx + 3];
        
        mask[y * width + x] = alpha > this.alphaThreshold ? 1 : 0;
      }
    }
    
    // Find largest connected component
    const largestBlob = this.findLargestConnectedComponent(mask, width, height);
    
    // Apply morphological operations to clean up
    const cleanedMask = this.morphologicalClose(largestBlob, width, height);
    
    // Calculate bounding box
    const boundingBox = calculateBoundingBoxFromMask(cleanedMask, width, height);
    
    return {
      mask: cleanedMask,
      boundingBox,
      confidence: 0.8, // Fallback method has lower confidence
      method: 'fallback',
    };
  }

  /**
   * Find the largest connected component using flood fill
   */
  private findLargestConnectedComponent(
    mask: Uint8Array,
    width: number,
    height: number
  ): Uint8Array {
    const visited = new Uint8Array(width * height);
    let largestSize = 0;
    let largestComponent: Uint8Array | null = null;
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        
        if (mask[idx] === 1 && visited[idx] === 0) {
          const component = new Uint8Array(width * height);
          const size = this.floodFill(mask, visited, component, x, y, width, height);
          
          if (size > largestSize) {
            largestSize = size;
            largestComponent = component;
          }
        }
      }
    }
    
    return largestComponent || new Uint8Array(width * height);
  }

  /**
   * Flood fill algorithm to find connected pixels
   */
  private floodFill(
    mask: Uint8Array,
    visited: Uint8Array,
    component: Uint8Array,
    startX: number,
    startY: number,
    width: number,
    height: number
  ): number {
    const stack: Array<[number, number]> = [[startX, startY]];
    let size = 0;
    
    while (stack.length > 0) {
      const [x, y] = stack.pop()!;
      
      if (x < 0 || x >= width || y < 0 || y >= height) continue;
      
      const idx = y * width + x;
      
      if (visited[idx] === 1 || mask[idx] === 0) continue;
      
      visited[idx] = 1;
      component[idx] = 1;
      size++;
      
      // Add 4-connected neighbors
      stack.push([x + 1, y]);
      stack.push([x - 1, y]);
      stack.push([x, y + 1]);
      stack.push([x, y - 1]);
    }
    
    return size;
  }

  /**
   * Morphological closing operation (dilation followed by erosion)
   * Helps fill small holes and connect nearby regions
   */
  private morphologicalClose(
    mask: Uint8Array,
    width: number,
    height: number
  ): Uint8Array {
    // Dilate
    const dilated = this.dilate(mask, width, height);
    
    // Erode
    const closed = this.erode(dilated, width, height);
    
    return closed;
  }

  /**
   * Dilation operation - expand the mask
   */
  private dilate(mask: Uint8Array, width: number, height: number): Uint8Array {
    const result = new Uint8Array(width * height);
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        
        // Check 3x3 neighborhood
        let hasNeighbor = false;
        for (let dy = -1; dy <= 1 && !hasNeighbor; dy++) {
          for (let dx = -1; dx <= 1 && !hasNeighbor; dx++) {
            const ny = y + dy;
            const nx = x + dx;
            
            if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
              const neighborIdx = ny * width + nx;
              if (mask[neighborIdx] === 1) {
                hasNeighbor = true;
              }
            }
          }
        }
        
        result[idx] = hasNeighbor ? 1 : 0;
      }
    }
    
    return result;
  }

  /**
   * Erosion operation - shrink the mask
   */
  private erode(mask: Uint8Array, width: number, height: number): Uint8Array {
    const result = new Uint8Array(width * height);
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        
        if (mask[idx] === 0) {
          result[idx] = 0;
          continue;
        }
        
        // Check if all 3x3 neighbors are set
        let allNeighborsSet = true;
        for (let dy = -1; dy <= 1 && allNeighborsSet; dy++) {
          for (let dx = -1; dx <= 1 && allNeighborsSet; dx++) {
            const ny = y + dy;
            const nx = x + dx;
            
            if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
              const neighborIdx = ny * width + nx;
              if (mask[neighborIdx] === 0) {
                allNeighborsSet = false;
              }
            }
          }
        }
        
        result[idx] = allNeighborsSet ? 1 : 0;
      }
    }
    
    return result;
  }
}
