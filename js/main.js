/**
 * Main JavaScript - Core Utilities & Shared Functions
 * Browser Tools Platform
 */

// ========================================
// GLOBAL CONFIGURATION
// ========================================
const CONFIG = {
  maxFileSize: 500 * 1024 * 1024, // 500MB
  supportedFormats: {
    image: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp'],
    pdf: ['pdf']
  },
  workerTimeout: 300000 // 5 minutes
};

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Format file size to human-readable string
 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Get file extension from filename
 */
function getFileExtension(filename) {
  return filename.split('.').pop().toLowerCase();
}

/**
 * Check if file type is supported
 */
function isSupportedFile(file) {
  const ext = getFileExtension(file.name);
  return [...CONFIG.supportedFormats.image, ...CONFIG.supportedFormats.pdf].includes(ext);
}

/**
 * Generate unique ID
 */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Sleep utility
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ========================================
// FILE HANDLING
// ========================================

/**
 * Read file as ArrayBuffer
 */
function readFileAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Read file as Data URL
 */
function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Download file with custom name
 */
function downloadFile(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ========================================
// WORKER MANAGEMENT
// ========================================

/**
 * Create and manage web workers
 */
class WorkerManager {
  constructor(workerPath) {
    this.workerPath = workerPath;
    this.worker = null;
    this.queue = [];
    this.processing = false;
  }

  async process(message) {
    return new Promise((resolve, reject) => {
      if (!this.worker) {
        this.worker = new Worker(this.workerPath);
      }

      const messageId = generateId();
      
      this.worker.onmessage = (e) => {
        if (e.data.id === messageId) {
          if (e.data.error) {
            reject(new Error(e.data.error));
          } else {
            resolve(e.data.result);
          }
          this.processing = false;
          this.processNext();
        }
      };

      this.worker.onerror = (e) => {
        reject(new Error(e.message));
        this.processing = false;
        this.processNext();
      };

      this.queue.push({ message: { ...message, id: messageId }, resolve, reject });
      
      if (!this.processing) {
        this.processNext();
      }
    });
  }

  processNext() {
    if (this.queue.length > 0 && !this.processing) {
      this.processing = true;
      const { message } = this.queue.shift();
      this.worker.postMessage(message);
    }
  }

  terminate() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    this.queue = [];
    this.processing = false;
  }
}

// ========================================
// UPLOAD HANDLER
// ========================================

/**
 * Handle drag and drop uploads
 */
class UploadHandler {
  constructor(options = {}) {
    this.dropZone = options.dropZone;
    this.fileInput = options.fileInput;
    this.onFilesSelected = options.onFilesSelected;
    this.accept = options.accept || '*';
    
    this.init();
  }

  init() {
    if (this.dropZone) {
      this.setupDragDrop();
      this.dropZone.addEventListener('click', () => {
        if (this.fileInput) this.fileInput.click();
      });
    }

    if (this.fileInput) {
      this.fileInput.addEventListener('change', (e) => {
        this.handleFiles(e.target.files);
      });
    }

    // Paste support
    document.addEventListener('paste', (e) => {
      const items = e.clipboardData.items;
      const files = [];
      for (let item of items) {
        if (item.type.indexOf('image') !== -1) {
          files.push(item.getAsFile());
        }
      }
      if (files.length > 0) {
        this.handleFiles(files);
      }
    });
  }

  setupDragDrop() {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      this.dropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
      });
    });

    ['dragenter', 'dragover'].forEach(eventName => {
      this.dropZone.addEventListener(eventName, () => {
        this.dropZone.classList.add('dragover');
      });
    });

    ['dragleave', 'drop'].forEach(eventName => {
      this.dropZone.addEventListener(eventName, () => {
        this.dropZone.classList.remove('dragover');
      });
    });

    this.dropZone.addEventListener('drop', (e) => {
      const files = e.dataTransfer.files;
      this.handleFiles(files);
    });
  }

  handleFiles(files) {
    const validFiles = Array.from(files).filter(file => {
      if (!isSupportedFile(file)) {
        console.warn(`Unsupported file type: ${file.name}`);
        return false;
      }
      if (file.size > CONFIG.maxFileSize) {
        console.warn(`File too large: ${file.name}`);
        return false;
      }
      return true;
    });

    if (validFiles.length > 0 && this.onFilesSelected) {
      this.onFilesSelected(validFiles);
    }
  }
}

// ========================================
// PROGRESS TRACKER
// ========================================

/**
 * Track and display progress
 */
class ProgressTracker {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.progress = 0;
  }

  update(percent) {
    this.progress = Math.min(100, Math.max(0, percent));
    if (this.container) {
      const bar = this.container.querySelector('.progress-bar');
      if (bar) {
        bar.style.width = this.progress + '%';
      }
      const text = this.container.querySelector('.progress-text');
      if (text) {
        text.textContent = Math.round(this.progress) + '%';
      }
    }
  }

  reset() {
    this.progress = 0;
    this.update(0);
  }

  complete() {
    this.update(100);
  }
}

// ========================================
// UI HELPERS
// ========================================

/**
 * Show loading state
 */
function showLoading(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.innerHTML = '<div class="spinner"></div>';
    element.classList.remove('hidden');
  }
}

/**
 * Hide loading state
 */
function hideLoading(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.classList.add('hidden');
  }
}

/**
 * Show notification
 */
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `glass-card p-4 fixed bottom-4 right-4 z-50 animate-slide-up`;
  notification.style.cssText = `
    background: ${type === 'error' ? '#FF6B6B' : type === 'success' ? '#48BB78' : '#6C5CE7'};
    color: white;
    border-radius: 12px;
    box-shadow: 0 4px 24px rgba(0,0,0,0.2);
  `;
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transition = 'opacity 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

/**
 * Create tool card HTML
 */
function createToolCard(tool) {
  return `
    <a href="${tool.url}" class="glass-card category-card block">
      <div class="category-icon">
        ${tool.icon}
      </div>
      <h3 class="mb-2">${tool.name}</h3>
      <p class="text-gray-600 text-sm">${tool.description}</p>
    </a>
  `;
}

// ========================================
// LOCAL STORAGE UTILS
// ========================================

const Storage = {
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
  
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },
  
  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  }
};

// ========================================
// EXPORT
// ========================================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    CONFIG,
    formatFileSize,
    getFileExtension,
    isSupportedFile,
    generateId,
    sleep,
    readFileAsArrayBuffer,
    readFileAsDataURL,
    downloadFile,
    WorkerManager,
    UploadHandler,
    ProgressTracker,
    showLoading,
    hideLoading,
    showNotification,
    createToolCard,
    Storage
  };
}
