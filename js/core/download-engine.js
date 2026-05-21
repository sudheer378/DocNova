/**
 * BrowserTools - Download Engine
 * Centralized download handling with progress, batch support, and filename generation
 */

const DownloadEngine = {
  initialized: false,
  
  // Initialize
  async init() {
    if (this.initialized) return;
    this.initialized = true;
    console.log('DownloadEngine initialized');
  },
  
  // Download single file
  download(data, filename, mimeType = 'application/octet-stream') {
    const blob = data instanceof Blob ? data : new Blob([data], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // Cleanup
    setTimeout(() => URL.revokeObjectURL(url), 100);
    
    Toast.success(`Downloaded: ${filename}`);
  },
  
  // Download from Canvas
  downloadFromCanvas(canvas, filename, format = 'image/jpeg', quality = 0.9) {
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          this.download(blob, filename);
          resolve(true);
        } else {
          Toast.error('Failed to generate image');
          reject(new Error('Canvas export failed'));
        }
      }, format, quality);
    });
  },
  
  // Download multiple files (batch)
  downloadBatch(files, baseFilename) {
    if (files.length === 1) {
      this.download(files[0].data, files[0].name || `${baseFilename}.processed`, files[0].mimeType);
      return;
    }
    
    // Create ZIP for multiple files (client-side would need JSZip library)
    // For now, download individually with slight delay
    files.forEach((file, index) => {
      setTimeout(() => {
        this.download(file.data, file.name || `${baseFilename}-${index + 1}.processed`, file.mimeType);
      }, index * 300);
    });
    
    Toast.success(`Downloading ${files.length} files...`);
  },
  
  // Generate filename
  generateFilename(originalName, outputFormat, suffix = '') {
    const nameParts = originalName.split('.');
    nameParts.pop(); // Remove extension
    const baseName = nameParts.join('.');
    
    const ext = outputFormat || originalName.split('.').pop();
    
    return `${baseName}${suffix}.${ext}`;
  },
  
  // Generate filename with timestamp
  generateTimestampedFilename(originalName, outputFormat) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    return this.generateFilename(originalName, outputFormat, `-${timestamp}`);
  },
  
  // Download with progress simulation
  downloadWithProgress(data, filename, mimeType, onProgress) {
    return new Promise((resolve) => {
      // Simulate progress for UX
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        if (onProgress) onProgress(progress);
        
        if (progress >= 100) {
          clearInterval(interval);
          this.download(data, filename, mimeType);
          resolve(true);
        }
      }, 50);
    });
  },
  
  // Download blob URL
  downloadFromURL(url, filename) {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  },
  
  // Check download support
  isDownloadSupported() {
    return typeof document.createElement('a').download !== 'undefined';
  },
  
  // Get download directory (not available in browser, just informational)
  getDownloadInfo() {
    return {
      supported: this.isDownloadSupported(),
      note: 'Files are downloaded to your browser\'s default download location'
    };
  }
};
