/**
 * BrowserTools - Utility Functions
 * Shared helper functions used across the application
 */

const Utils = {
  // Format file size
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },
  
  // Format large numbers
  formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  },
  
  // Debounce function
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
  
  // Throttle function
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
  
  // Detect mobile device
  isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  },
  
  // Check if file is image
  isImage(file) {
    return file && file.type && file.type.startsWith('image/');
  },
  
  // Check if file is PDF
  isPDF(file) {
    return file && file.type === 'application/pdf';
  },
  
  // Get file extension
  getFileExtension(filename) {
    return filename.split('.').pop().toLowerCase();
  },
  
  // Get filename without extension
  getFilenameWithoutExtension(filename) {
    const parts = filename.split('.');
    parts.pop();
    return parts.join('.');
  },
  
  // Generate unique ID
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  },
  
  // Sleep utility
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },
  
  // Clamp number between min and max
  clamp(num, min, max) {
    return Math.min(Math.max(num, min), max);
  },
  
  // Round to decimal places
  roundTo(num, decimals) {
    const factor = Math.pow(10, decimals);
    return Math.round(num * factor) / factor;
  },
  
  // Convert KB to bytes
  kbToBytes(kb) {
    return kb * 1024;
  },
  
  // Convert bytes to KB
  bytesToKb(bytes) {
    return bytes / 1024;
  },
  
  // Get image dimensions from file
  getImageDimensions(file) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  },
  
  // Check webp support
  supportsWebP() {
    const elem = document.createElement('canvas');
    if (!!(elem.getContext && elem.getContext('2d'))) {
      return elem.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    }
    return false;
  },
  
  // Get browser info
  getBrowserInfo() {
    const userAgent = navigator.userAgent;
    let browserName = 'Unknown';
    let browserVersion = 'Unknown';
    
    if (userAgent.indexOf('Firefox') > -1) {
      browserName = 'Firefox';
      browserVersion = userAgent.split('Firefox/')[1];
    } else if (userAgent.indexOf('Chrome') > -1) {
      browserName = 'Chrome';
      browserVersion = userAgent.split('Chrome/')[1].split(' ')[0];
    } else if (userAgent.indexOf('Safari') > -1) {
      browserName = 'Safari';
      browserVersion = userAgent.split('Version/')[1];
    } else if (userAgent.indexOf('MSIE') > -1 || userAgent.indexOf('Trident/') > -1) {
      browserName = 'IE';
      browserVersion = userAgent.split(/MSIE |rv:/)[1];
    }
    
    return { name: browserName, version: browserVersion };
  },
  
  // Check if online
  isOnline() {
    return navigator.onLine;
  },
  
  // Local storage helpers
  storage: {
    get(key, defaultValue = null) {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
      } catch (e) {
        return defaultValue;
      }
    },
    
    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (e) {
        return false;
      }
    },
    
    remove(key) {
      try {
        localStorage.removeItem(key);
        return true;
      } catch (e) {
        return false;
      }
    },
    
    clear() {
      try {
        localStorage.clear();
        return true;
      } catch (e) {
        return false;
      }
    }
  },
  
  // URL helpers
  url: {
    getParam(name) {
      const params = new URLSearchParams(window.location.search);
      return params.get(name);
    },
    
    setParam(name, value) {
      const params = new URLSearchParams(window.location.search);
      params.set(name, value);
      window.history.replaceState({}, '', `${window.location.pathname}?${params}`);
    },
    
    removeParam(name) {
      const params = new URLSearchParams(window.location.search);
      params.delete(name);
      const newUrl = params.toString() 
        ? `${window.location.pathname}?${params}`
        : window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  },
  
  // Animation frame helper
  raf(callback) {
    let rafId;
    return {
      start() {
        const loop = () => {
          callback();
          rafId = requestAnimationFrame(loop);
        };
        rafId = requestAnimationFrame(loop);
      },
      stop() {
        cancelAnimationFrame(rafId);
      }
    };
  },
  
  // Event emitter pattern
  createEmitter() {
    const events = {};
    return {
      on(event, callback) {
        if (!events[event]) events[event] = [];
        events[event].push(callback);
      },
      off(event, callback) {
        if (!events[event]) return;
        events[event] = events[event].filter(cb => cb !== callback);
      },
      emit(event, data) {
        if (!events[event]) return;
        events[event].forEach(cb => cb(data));
      }
    };
  }
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Utils;
}
