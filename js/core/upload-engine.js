/* ========================================
   REUSABLE UPLOAD ENGINE
   Handles drag-drop, click, paste, mobile
   ======================================== */

class UploadEngine {
  constructor(options = {}) {
    this.options = {
      dropZone: null,
      fileInput: null,
      allowedTypes: [],
      maxSize: 50 * 1024 * 1024, // 50MB default
      maxFiles: 10,
      onFilesAdded: null,
      onError: null,
      onProgress: null,
      ...options
    };
    
    this.files = [];
    this.isDragging = false;
    this.init();
  }

  init() {
    this.bindEvents();
  }

  bindEvents() {
    const { dropZone, fileInput } = this.options;

    if (!dropZone) {
      console.error('UploadEngine: dropZone element required');
      return;
    }

    // Drag events
    dropZone.addEventListener('dragenter', (e) => this.handleDragEnter(e));
    dropZone.addEventListener('dragover', (e) => this.handleDragOver(e));
    dropZone.addEventListener('dragleave', (e) => this.handleDragLeave(e));
    dropZone.addEventListener('drop', (e) => this.handleDrop(e));

    // Click upload
    if (fileInput) {
      fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
      
      // Also allow clicking the dropzone to trigger file input
      dropZone.addEventListener('click', () => {
        if (!this.options.processing) {
          fileInput.click();
        }
      });
    }

    // Paste support
    document.addEventListener('paste', (e) => this.handlePaste(e));

    // Touch support for mobile
    this.bindTouchEvents();
  }

  bindTouchEvents() {
    const { dropZone } = this.options;
    let touchStartY = 0;
    let touchStartX = 0;

    dropZone.addEventListener('touchstart', (e) => {
      touchStartY = e.touches[0].clientY;
      touchStartX = e.touches[0].clientX;
    }, { passive: true });

    dropZone.addEventListener('touchend', (e) => {
      const touchEndY = e.changedTouches[0].clientY;
      const touchEndX = e.changedTouches[0].clientX;
      
      // Detect tap vs swipe
      const diffY = Math.abs(touchEndY - touchStartY);
      const diffX = Math.abs(touchEndX - touchStartX);
      
      if (diffY < 10 && diffX < 10) {
        // It's a tap
        const fileInput = this.options.fileInput;
        if (fileInput && !this.options.processing) {
          fileInput.click();
        }
      }
    }, { passive: true });
  }

  handleDragEnter(e) {
    e.preventDefault();
    e.stopPropagation();
    
    if (this.isValidDragTarget(e)) {
      this.isDragging = true;
      this.options.dropZone.classList.add('drag-over');
      
      if (this.options.onDragEnter) {
        this.options.onDragEnter();
      }
    }
  }

  handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    
    if (this.isDragging) {
      e.dataTransfer.dropEffect = 'copy';
    }
  }

  handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    
    // Check if we're leaving the dropzone entirely
    const rect = this.options.dropZone.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x <= rect.left || x >= rect.right || y <= rect.top || y >= rect.bottom) {
      this.isDragging = false;
      this.options.dropZone.classList.remove('drag-over');
      
      if (this.options.onDragLeave) {
        this.options.onDragLeave();
      }
    }
  }

  handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    
    this.isDragging = false;
    this.options.dropZone.classList.remove('drag-over');
    
    if (this.isValidDragTarget(e)) {
      const dt = e.dataTransfer;
      const files = dt.files;
      
      this.processFiles(files);
    }
  }

  handleFileSelect(e) {
    const files = e.target.files;
    this.processFiles(files);
    
    // Reset input so same file can be selected again
    e.target.value = '';
  }

  handlePaste(e) {
    // Only handle paste if we're not in an input field
    const activeElement = document.activeElement;
    if (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA') {
      return;
    }
    
    const items = e.clipboardData.items;
    const files = [];
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.kind === 'file') {
        const file = item.getAsFile();
        if (file) {
          files.push(file);
        }
      }
    }
    
    if (files.length > 0) {
      this.processFiles(files);
    }
  }

  isValidDragTarget(e) {
    // Allow all file drags by default
    // Can be customized based on file types
    return true;
  }

  async processFiles(fileList) {
    const files = Array.from(fileList);
    const validFiles = [];
    const errors = [];

    // Validate files
    for (const file of files) {
      const validation = this.validateFile(file);
      
      if (validation.valid) {
        validFiles.push(file);
      } else {
        errors.push({
          file: file.name,
          error: validation.error
        });
      }
    }

    // Check max files limit
    if (this.files.length + validFiles.length > this.options.maxFiles) {
      errors.push({
        error: `Maximum ${this.options.maxFiles} files allowed`
      });
      validFiles.splice(this.options.maxFiles - this.files.length);
    }

    // Add valid files
    validFiles.forEach(file => {
      this.files.push(file);
    });

    // Generate previews for image files
    const filesWithPreviews = await Promise.all(
      validFiles.map(async (file) => {
        const preview = await this.generatePreview(file);
        return {
          file,
          preview,
          id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          size: file.size,
          type: file.type
        };
      })
    );

    // Callback
    if (validFiles.length > 0 && this.options.onFilesAdded) {
      this.options.onFilesAdded(filesWithPreviews);
    }

    // Error callback
    if (errors.length > 0 && this.options.onError) {
      this.options.onError(errors);
    }

    return filesWithPreviews;
  }

  validateFile(file) {
    // Check file size
    if (file.size > this.options.maxSize) {
      const maxSizeMB = Math.round(this.options.maxSize / 1024 / 1024);
      return {
        valid: false,
        error: `File size exceeds ${maxSizeMB}MB limit`
      };
    }

    // Check file type
    if (this.options.allowedTypes.length > 0) {
      const isAllowed = this.options.allowedTypes.some(type => {
        if (type.includes('*')) {
          // Wildcard matching (e.g., image/*)
          const baseType = type.split('/')[0];
          return file.type.startsWith(baseType);
        }
        return file.type === type;
      });

      if (!isAllowed) {
        return {
          valid: false,
          error: 'File type not allowed'
        };
      }
    }

    return { valid: true };
  }

  generatePreview(file) {
    return new Promise((resolve) => {
      if (!file.type.startsWith('image/')) {
        resolve(null);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // Create canvas for thumbnail
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Max thumbnail size
          const maxSize = 200;
          let width = img.width;
          let height = img.height;
          
          if (width > height) {
            if (width > maxSize) {
              height = Math.round(height * maxSize / width);
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width = Math.round(width * maxSize / height);
              height = maxSize;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);
          
          resolve(canvas.toDataURL(file.type, 0.8));
        };
        img.onerror = () => resolve(null);
        img.src = e.target.result;
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  }

  // Public methods
  addFile(file) {
    return this.processFiles([file]);
  }

  clearFiles() {
    this.files = [];
  }

  getFiles() {
    return this.files;
  }

  setProcessing(processing) {
    this.options.processing = processing;
  }

  destroy() {
    const { dropZone, fileInput } = this.options;
    
    if (dropZone) {
      dropZone.removeEventListener('dragenter', this.handleDragEnter);
      dropZone.removeEventListener('dragover', this.handleDragOver);
      dropZone.removeEventListener('dragleave', this.handleDragLeave);
      dropZone.removeEventListener('drop', this.handleDrop);
    }
    
    if (fileInput) {
      fileInput.removeEventListener('change', this.handleFileSelect);
    }
    
    document.removeEventListener('paste', this.handlePaste);
  }
}

// Export for use
window.UploadEngine = UploadEngine;
