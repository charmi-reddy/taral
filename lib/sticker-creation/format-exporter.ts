export class FormatExporter {
  private readonly maxResolution = 2048;
  private readonly whatsappSize = 512;
  private readonly maxWebPSize = 100 * 1024; // 100KB in bytes

  /**
   * Export ImageData as PNG blob
   * @param imageData - The image to export
   * @returns Promise resolving to PNG Blob
   */
  async exportPNG(imageData: ImageData): Promise<Blob> {
    const canvas = document.createElement('canvas');
    
    // Preserve resolution up to max
    const scale = Math.min(1, this.maxResolution / Math.max(imageData.width, imageData.height));
    canvas.width = Math.round(imageData.width * scale);
    canvas.height = Math.round(imageData.height * scale);
    
    const ctx = canvas.getContext('2d')!;
    
    if (scale < 1) {
      // Scale down with high quality
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = imageData.width;
      tempCanvas.height = imageData.height;
      const tempCtx = tempCanvas.getContext('2d')!;
      tempCtx.putImageData(imageData, 0, 0);
      
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(tempCanvas, 0, 0, canvas.width, canvas.height);
    } else {
      ctx.putImageData(imageData, 0, 0);
    }
    
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create PNG blob'));
        }
      }, 'image/png');
    });
  }

  /**
   * Export ImageData as WebP blob optimized for WhatsApp
   * @param imageData - The image to export
   * @param maxSize - Maximum file size in bytes (default 100KB)
   * @returns Promise resolving to WebP Blob or null if size constraint cannot be met
   */
  async exportWebP(imageData: ImageData, maxSize: number = this.maxWebPSize): Promise<Blob | null> {
    // Check if browser supports WebP
    if (!this.supportsWebP()) {
      return null;
    }
    
    // Resize to 512x512 with aspect ratio preservation
    const resized = this.resizeForWhatsApp(imageData);
    
    // Try different quality levels
    let quality = 0.95;
    const minQuality = 0.5;
    const qualityStep = 0.05;
    const maxIterations = 10;
    
    for (let i = 0; i < maxIterations; i++) {
      const blob = await this.createWebPBlob(resized, quality);
      
      if (blob && blob.size <= maxSize) {
        return blob;
      }
      
      quality -= qualityStep;
      
      if (quality < minQuality) {
        break;
      }
    }
    
    // Could not meet size constraint
    return null;
  }

  /**
   * Resize image to 512x512 for WhatsApp, maintaining aspect ratio
   */
  private resizeForWhatsApp(imageData: ImageData): ImageData {
    const targetSize = this.whatsappSize;
    const scale = Math.min(targetSize / imageData.width, targetSize / imageData.height);
    
    const newWidth = Math.round(imageData.width * scale);
    const newHeight = Math.round(imageData.height * scale);
    
    // Create canvas for resizing
    const sourceCanvas = document.createElement('canvas');
    sourceCanvas.width = imageData.width;
    sourceCanvas.height = imageData.height;
    const sourceCtx = sourceCanvas.getContext('2d')!;
    sourceCtx.putImageData(imageData, 0, 0);
    
    // Create target canvas (512x512 with transparent background)
    const targetCanvas = document.createElement('canvas');
    targetCanvas.width = targetSize;
    targetCanvas.height = targetSize;
    const targetCtx = targetCanvas.getContext('2d')!;
    
    // Center the image
    const offsetX = Math.round((targetSize - newWidth) / 2);
    const offsetY = Math.round((targetSize - newHeight) / 2);
    
    // Use high-quality interpolation
    targetCtx.imageSmoothingEnabled = true;
    targetCtx.imageSmoothingQuality = 'high';
    
    targetCtx.drawImage(sourceCanvas, 0, 0, imageData.width, imageData.height, offsetX, offsetY, newWidth, newHeight);
    
    return targetCtx.getImageData(0, 0, targetSize, targetSize);
  }

  /**
   * Create WebP blob with specified quality
   */
  private createWebPBlob(imageData: ImageData, quality: number): Promise<Blob | null> {
    const canvas = document.createElement('canvas');
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    const ctx = canvas.getContext('2d')!;
    ctx.putImageData(imageData, 0, 0);
    
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/webp', quality);
    });
  }

  /**
   * Check if browser supports WebP format
   */
  private supportsWebP(): boolean {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    
    try {
      const dataURL = canvas.toDataURL('image/webp');
      return dataURL.indexOf('data:image/webp') === 0;
    } catch {
      return false;
    }
  }
}
