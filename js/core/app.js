/**
 * BrowserTools - Core Application Engine
 * Central state management, initialization, and configuration
 */

// ============================================
// CONFIGURATION
// ============================================

const Config = {
  // App settings
  appName: 'BrowserTools',
  appVersion: '1.0.0',
  baseUrl: window.location.origin,
  
  // File limits
  maxFileSize: 100 * 1024 * 1024, // 100MB
  maxFiles: 10,
  
  // Supported formats
  supportedImageFormats: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  supportedPdfFormats: ['application/pdf'],
  
  // Worker paths
  workers: {
    compress: '/workers/compress.worker.js',
    convert: '/workers/convert.worker.js',
    resize: '/workers/resize.worker.js',
    pdfMerge: '/workers/pdf-merge.worker.js',
    pdfSplit: '/workers/pdf-split.worker.js',
    pdfCompress: '/workers/pdf-compress.worker.js',
    pdfToJpg: '/workers/pdf-to-jpg.worker.js',
    jpgToPdf: '/workers/jpg-to-pdf.worker.js'
  },
  
  // Default settings
  defaults: {
    imageQuality: 0.8,
    maxWidth: 1920,
    maxHeight: 1920,
    targetSizeKB: null
  },
  
  // Tool categories
  categories: {
    pdf: { name: 'PDF Tools', icon: '📄', tools: [] },
    image: { name: 'Image Tools', icon: '🖼️', tools: [] },
    compression: { name: 'Compression', icon: '🗜️', tools: [] },
    conversion: { name: 'Conversion', icon: '🔄', tools: [] },
    resize: { name: 'Resize', icon: '📐', tools: [] },
    social: { name: 'Social Media', icon: '📱', tools: [] },
    utility: { name: 'Utilities', icon: '🛠️', tools: [] }
  }
};

// ============================================
// STATE MANAGEMENT
// ============================================

const AppState = {
  currentTool: null,
  uploadedFiles: [],
  processedFiles: [],
  isProcessing: false,
  settings: {},
  
  // Get state
  get(key) {
    return this[key] || null;
  },
  
  // Set state
  set(key, value) {
    this[key] = value;
    this.notify(key, value);
  },
  
  // Reset state
  reset() {
    this.currentTool = null;
    this.uploadedFiles = [];
    this.processedFiles = [];
    this.isProcessing = false;
    this.settings = {};
  },
  
  // State listeners
  listeners: {},
  
  subscribe(key, callback) {
    if (!this.listeners[key]) {
      this.listeners[key] = [];
    }
    this.listeners[key].push(callback);
  },
  
  notify(key, value) {
    if (this.listeners[key]) {
      this.listeners[key].forEach(cb => cb(value));
    }
  }
};

// ============================================
// APP INITIALIZATION
// ============================================

const App = {
  initialized: false,
  
  async init() {
    if (this.initialized) return;
    
    // Initialize core modules
    await Promise.all([
      Toast.init(),
      WorkerManager.init(),
      UploadEngine.init(),
      DownloadEngine.init()
    ]);
    
    // Detect mobile
    AppState.set('isMobile', Utils.isMobile());
    
    // Load saved settings
    this.loadSettings();
    
    // Setup route handling
    Router.init();
    
    this.initialized = true;
    console.log(`${Config.appName} v${Config.appVersion} initialized`);
  },
  
  loadSettings() {
    const saved = localStorage.getItem('browsertools-settings');
    if (saved) {
      try {
        AppState.settings = JSON.parse(saved);
      } catch (e) {
        AppState.settings = { ...Config.defaults };
      }
    } else {
      AppState.settings = { ...Config.defaults };
    }
  },
  
  saveSettings() {
    localStorage.setItem('browsertools-settings', JSON.stringify(AppState.settings));
  },
  
  updateSetting(key, value) {
    AppState.settings[key] = value;
    this.saveSettings();
    AppState.notify(`setting-${key}`, value);
  }
};

// ============================================
// ROUTER
// ============================================

const Router = {
  routes: [],
  
  init() {
    // Handle browser back/forward
    window.addEventListener('popstate', () => this.handleRoute());
    
    // Handle initial route
    this.handleRoute();
  },
  
  register(path, handler) {
    this.routes.push({ path, handler });
  },
  
  navigate(path) {
    history.pushState({}, '', path);
    this.handleRoute();
  },
  
  handleRoute() {
    const path = window.location.pathname;
    
    for (const route of this.routes) {
      const regex = new RegExp(`^${route.path.replace(/\*/g, '.*')}$`);
      if (regex.test(path)) {
        const match = path.match(regex);
        route.handler(match);
        return;
      }
    }
    
    // Default: check if tool page
    if (path.startsWith('/tools/')) {
      ToolEngine.initFromURL(path);
    }
  }
};

// ============================================
// EXPORTS
// ============================================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Config, AppState, App, Router };
}
