/**
 * BrowserTools - Reusable Upload Engine
 * Centralized file upload handling with drag-drop, paste, and mobile support
 */

const UploadEngine = {
  initialized: false,
  
  // Configuration
  config: {
    acceptedTypes: Config.supportedImageFormats.concat(Config.supportedPdfFormats),
    maxFileSize: Config.maxFileSize,
    maxFiles: Config.maxFiles
  },
  
  // State
  currentFiles: [],
  previews: [],
  
  // Initialize
  async init() {
    if (this.initialized) return;
    
    this.setupGlobalPaste();
    this.initialized = true;
    console.log('UploadEngine initialized');
  },
  
  // Setup global paste listener
  setupGlobalPaste() {
    document.addEventListener('paste', (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      
      const files = [];
      for (let item of items) {
        if (item.type.startsWith('image/')) {
          files.push(item.getAsFile());
        }
      }
      
      if (files.length > 0 && this.onFilesCallback) {
        this.handleFiles(files, this.onFilesCallback);
      }
    });
  },
  
  // Bind upload area to callback
  bind(uploadArea, fileInput, onFilesSelected) {
    if (!uploadArea || !fileInput) return;
    
    this.onFilesCallback = onFilesSelected;
    
    // Click to upload
    uploadArea.addEventListener('click', (e) => {
      // Prevent double-trigger if clicking on child elements
      if (e.target === uploadArea || e.target.closest('.upload-icon, .upload-text')) {
        fileInput.click();
      }
    });
    
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
  },
  
  // Handle files array
  handleFiles(files, callback) {
    const validFiles = files.filter(file => {
      const ext = '.' + file.name.split('.').pop().toLowerCase();
      const isValidType = this.config.acceptedTypes.some(type => 
        type.includes(ext.replace('.', '')) || file.type === type
      );
      const isValidSize = file.size <= this.config.maxFileSize;
      
      if (!isValidType) {
        Toast.error(`Invalid file type: ${file.name}`);
      }
      if (!isValidSize) {
        Toast.error(`File too large: ${file.name} (max ${Utils.formatFileSize(this.config.maxFileSize)})`);
      }
      
      return isValidType && isValidSize;
    });
    
    if (validFiles.length > this.config.maxFiles) {
      Toast.warning(`Maximum ${this.config.maxFiles} files allowed`);
      validFiles.splice(this.config.maxFiles);
    }
    
    if (validFiles.length > 0 && callback) {
      callback(validFiles);
    }
    
    return validFiles;
  },
  
  // Generate preview for file
  async generatePreview(file) {
    if (!Utils.isImage(file)) {
      return { type: 'pdf', name: file.name, size: file.size };
    }
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve({
          type: 'image',
          name: file.name,
          size: file.size,
          dataURL: e.target.result
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },
  
  // Generate previews for multiple files
  async generatePreviews(files) {
    this.previews = await Promise.all(files.map(f => this.generatePreview(f)));
    return this.previews;
  },
  
  // Read file as ArrayBuffer
  readAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  },
  
  // Read file as DataURL
  readAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },
  
  // Clear current files
  clear() {
    this.currentFiles = [];
    this.previews = [];
  },
  
  // Add files to current list
  addFiles(files) {
    this.currentFiles = [...this.currentFiles, ...files];
  },
  
  // Remove file by index
  removeFile(index) {
    this.currentFiles.splice(index, 1);
    this.previews.splice(index, 1);
  }
};
