export class DownloadManager {
  /**
   * Download a blob as a file
   * @param blob - The blob to download
   * @param format - File format ('png' or 'webp')
   */
  download(blob: Blob, format: 'png' | 'webp'): void {
    const filename = this.generateFilename(format);
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // Cleanup object URL after a short delay
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }

  /**
   * Generate filename with format: sticker_YYYYMMDD_HHMMSS.{ext}
   */
  private generateFilename(format: 'png' | 'webp'): string {
    const now = new Date();
    
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    const timestamp = `${year}${month}${day}_${hours}${minutes}${seconds}`;
    
    return `sticker_${timestamp}.${format}`;
  }
}
