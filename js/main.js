/**
 * BrowserTools - Core JavaScript
 * Main utilities, worker manager, upload handler, toast notifications
 */

// ============================================
// TOAST NOTIFICATIONS
// ============================================

const Toast = {
  container: null,
  
  init() {
    this.container = document.getElementById('toastContainer');
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'toastContainer';
      this.container.className = 'toast-container';
      document.body.appendChild(this.container);
    }
  },
  
  show(message, type = 'success', duration = 3000) {
    if (!this.container) this.init();
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <span class="toast-icon">${type === 'success' ? '✓' : type === 'error' ? '✕' : '⚠'}</span>
      <span class="toast-message">${message}</span>
      <button class="toast-close" onclick="this.parentElement.remove()">✕</button>
    `;
    
    this.container.appendChild(toast);
    
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },
  
  success(message) { this.show(message, 'success'); },
  error(message) { this.show(message, 'error'); },
  warning(message) { this.show(message, 'warning'); }
};

// ============================================
// WORKER MANAGER
// ============================================

const WorkerManager = {
  workers: {},
  workerQueue: [],
  maxWorkers: 4,
  
  getWorker(type) {
    return new Promise((resolve, reject) => {
      if (this.workers[type]) {
        resolve(this.workers[type]);
        return;
      }
      
      try {
        const worker = new Worker(`/workers/${type}.worker.js`);
        worker.onmessage = (e) => {
          if (e.data.callback) {
            e.data.callback(e.data.result, e.data.error);
          }
        };
        worker.onerror = (e) => {
          console.error(`Worker error (${type}):`, e);
          reject(e);
        };
        this.workers[type] = worker;
        resolve(worker);
      } catch (e) {
        reject(e);
      }
    });
  },
  
  process(type, data, callback) {
    return new Promise(async (resolve, reject) => {
      try {
        const worker = await this.getWorker(type);
        worker.postMessage({
          type: type,
          data: data,
          callback: (result, error) => {
            if (error) reject(error);
            else resolve(result);
            if (callback) callback(result, error);
          }
        });
      } catch (e) {
        // Fallback to main thread if worker fails
        console.warn('Worker failed, using fallback');
        resolve(this.fallbackProcess(type, data));
      }
    });
  },
  
  fallbackProcess(type, data) {
    console.log('Fallback processing for:', type);
    return { success: false, error: 'Worker not available' };
  },
  
  terminate(type) {
    if (this.workers[type]) {
      this.workers[type].terminate();
      delete this.workers[type];
    }
  },
  
  terminateAll() {
    Object.keys(this.workers).forEach(type => this.terminate(type));
  }
};

// ============================================
// UPLOAD HANDLER
// ============================================

const UploadHandler = {
  acceptedTypes: ['.pdf', '.jpg', '.jpeg', '.png', '.webp', '.gif'],
  maxFileSize: 100 * 1024 * 1024, // 100MB
  
  init(uploadArea, fileInput, onFilesSelected) {
    if (!uploadArea || !fileInput) return;
    
    // Click to upload
    uploadArea.addEventListener('click', () => fileInput.click());
    
    fileInput.addEventListener('change', (e) => {
      const files = Array.from(e.target.files);
      this.handleFiles(files, onFilesSelected);
      fileInput.value = '';
    });
    
    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadArea.classList.add('drag-over');
    });
    
    uploadArea.addEventListener('dragleave', () => {
      uploadArea.classList.remove('drag-over');
    });
    
    uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadArea.classList.remove('drag-over');
      const files = Array.from(e.dataTransfer.files);
      this.handleFiles(files, onFilesSelected);
    });
    
    // Paste support
    document.addEventListener('paste', (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      
      const files = [];
      for (let item of items) {
        if (item.type.startsWith('image/')) {
          files.push(item.getAsFile());
        }
      }
      
      if (files.length > 0) {
        this.handleFiles(files, onFilesSelected);
      }
    });
  },
  
  handleFiles(files, callback) {
    const validFiles = files.filter(file => {
      const ext = '.' + file.name.split('.').pop().toLowerCase();
      const isValidType = this.acceptedTypes.includes(ext);
      const isValidSize = file.size <= this.maxFileSize;
      
      if (!isValidType) {
        Toast.error(`Invalid file type: ${file.name}`);
      }
      if (!isValidSize) {
        Toast.error(`File too large: ${file.name} (max 100MB)`);
      }
      
      return isValidType && isValidSize;
    });
    
    if (validFiles.length > 0 && callback) {
      callback(validFiles);
    }
  },
  
  readFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(e);
      reader.readAsArrayBuffer(file);
    });
  },
  
  readAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
    });
  }
};

// ============================================
// DOWNLOAD HELPER
// ============================================

const DownloadHelper = {
  download(data, filename, mimeType = 'application/octet-stream') {
    const blob = data instanceof Blob ? data : new Blob([data], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 100);
  },
  
  downloadFromCanvas(canvas, filename, format = 'image/jpeg', quality = 0.9) {
    canvas.toBlob((blob) => {
      if (blob) {
        this.download(blob, filename);
      } else {
        Toast.error('Failed to generate image');
      }
    }, format, quality);
  }
};

// ============================================
// PROGRESS HELPER
// ============================================

const ProgressHelper = {
  update(progressBar, percent) {
    if (progressBar) {
      progressBar.style.width = `${percent}%`;
    }
  },
  
  simulate(duration, onUpdate, onComplete) {
    let progress = 0;
    const interval = 50;
    const increment = 100 / (duration / interval);
    
    const timer = setInterval(() => {
      progress += increment;
      if (progress >= 100) {
        progress = 100;
        clearInterval(timer);
        if (onComplete) onComplete();
      }
      if (onUpdate) onUpdate(progress);
    }, interval);
    
    return () => clearInterval(timer);
  }
};

// ============================================
// UTILITIES
// ============================================

const Utils = {
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },
  
  formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  },
  
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },
  
  throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },
  
  isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  },
  
  isImage(file) {
    return file.type.startsWith('image/');
  },
  
  isPDF(file) {
    return file.type === 'application/pdf';
  }
};

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  Toast.init();
  
  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href !== '#') {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });
  
  // Lazy load images
  const observerOptions = { rootMargin: '50px' };
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
        }
        imageObserver.unobserve(img);
      }
    });
  }, observerOptions);
  
  document.querySelectorAll('img[data-src]').forEach(img => {
    imageObserver.observe(img);
  });
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Toast, WorkerManager, UploadHandler, DownloadHelper, ProgressHelper, Utils };
}
