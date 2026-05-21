/* ========================================
   DOWNLOAD ENGINE
   Handles file downloads with progress
   ======================================== */

class DownloadEngine {
  constructor() {
    this.activeDownloads = new Map();
  }

  // Download a single file
  download(filename, blob, onProgress = null) {
    const url = URL.createObjectURL(blob);
    const downloadId = `dl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.activeDownloads.set(downloadId, {
      filename,
      blob,
      url,
      startTime: Date.now(),
      size: blob.size
    });

    return new Promise((resolve, reject) => {
      try {
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.style.display = 'none';
        
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        // Report completion
        if (onProgress && typeof onProgress === 'function') {
          onProgress(100);
        }

        // Clean up after delay
        setTimeout(() => {
          URL.revokeObjectURL(url);
          this.activeDownloads.delete(downloadId);
        }, 1000);

        resolve({ downloadId, filename, size: blob.size });

      } catch (error) {
        URL.revokeObjectURL(url);
        this.activeDownloads.delete(downloadId);
        reject(error);
      }
    });
  }

  // Download multiple files (triggers each)
  async downloadMultiple(files, zipName = 'files.zip') {
    // Note: Actual ZIP creation would require a library like JSZip
    // For now, download each file sequentially
    
    const results = [];
    
    for (const file of files) {
      try {
        const result = await this.download(file.filename, file.blob);
        results.push(result);
        
        // Small delay between downloads
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (error) {
        console.error(`Failed to download ${file.filename}:`, error);
      }
    }
    
    return results;
  }

  // Download image from canvas
  downloadFromCanvas(canvas, filename, format = 'image/jpeg', quality = 0.9) {
    return new Promise((resolve, reject) => {
      try {
        canvas.toBlob((blob) => {
          if (blob) {
            this.download(filename, blob).then(resolve).catch(reject);
          } else {
            reject(new Error('Canvas export failed'));
          }
        }, format, quality);
      } catch (error) {
        reject(error);
      }
    });
  }

  // Download image from data URL
  downloadFromDataUrl(dataUrl, filename) {
    return new Promise((resolve, reject) => {
      try {
        fetch(dataUrl)
          .then(res => res.blob())
          .then(blob => {
            this.download(filename, blob).then(resolve).catch(reject);
          })
          .catch(reject);
      } catch (error) {
        reject(error);
      }
    });
  }

  // Get download statistics
  getStats(downloadId) {
    const download = this.activeDownloads.get(downloadId);
    if (!download) return null;

    return {
      filename: download.filename,
      size: download.size,
      formattedSize: this.formatFileSize(download.size),
      duration: Date.now() - download.startTime
    };
  }

  // Cancel download (limited browser support)
  cancel(downloadId) {
    const download = this.activeDownloads.get(downloadId);
    if (download) {
      URL.revokeObjectURL(download.url);
      this.activeDownloads.delete(downloadId);
      return true;
    }
    return false;
  }

  // Cancel all active downloads
  cancelAll() {
    this.activeDownloads.forEach((download, id) => {
      URL.revokeObjectURL(download.url);
    });
    this.activeDownloads.clear();
  }

  // Format file size
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Generate filename with timestamp
  generateFilename(baseName, extension) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const cleanBase = baseName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    return `${cleanBase}_${timestamp}.${extension}`;
  }

  // Check if download is supported
  isDownloadSupported() {
    return typeof document.createElement('a').download !== 'undefined';
  }

  // Download text content
  downloadText(content, filename, encoding = 'text/plain') {
    const blob = new Blob([content], { type: encoding });
    return this.download(filename, blob);
  }

  // Download JSON
  downloadJSON(data, filename, pretty = true) {
    const content = pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
    return this.downloadText(content, filename, 'application/json');
  }
}

// Create global download engine instance
window.downloadEngine = new DownloadEngine();
