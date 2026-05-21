/* ========================================
   TOOL ENGINE
   Reusable architecture for all tools
   ======================================== */

class ToolEngine {
  constructor(toolConfig) {
    this.config = {
      id: null,
      name: '',
      description: '',
      category: '',
      icon: '',
      allowedTypes: [],
      maxFiles: 1,
      maxSize: 50 * 1024 * 1024,
      workerType: null,
      settings: {},
      onProcess: null,
      ...toolConfig
    };

    this.uploadEngine = null;
    this.state = {
      initialized: false,
      files: [],
      processing: false,
      progress: 0,
      result: null,
      error: null,
      settings: { ...this.config.settings }
    };

    this.callbacks = {
      onFileAdded: null,
      onFileRemoved: null,
      onProcessing: null,
      onProgress: null,
      onComplete: null,
      onError: null,
      onReset: null
    };

    this.init();
  }

  init() {
    if (this.state.initialized) return;

    // Initialize upload engine
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');

    if (dropZone && fileInput) {
      this.uploadEngine = new UploadEngine({
        dropZone,
        fileInput,
        allowedTypes: this.config.allowedTypes,
        maxSize: this.config.maxSize,
        maxFiles: this.config.maxFiles,
        onFilesAdded: (files) => this.handleFilesAdded(files),
        onError: (errors) => this.handleUploadError(errors)
      });
    }

    // Bind process button
    const processBtn = document.getElementById('process-btn');
    if (processBtn) {
      processBtn.addEventListener('click', () => this.process());
    }

    // Bind reset/new file button
    const resetBtn = document.getElementById('reset-btn') || document.getElementById('new-file-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.reset());
    }

    // Bind settings changes
    this.bindSettingsListeners();

    this.state.initialized = true;

    // Update UI based on state
    this.render();
  }

  bindSettingsListeners() {
    // Listen for setting changes
    const settingsContainer = document.getElementById('settings-container');
    if (!settingsContainer) return;

    const inputs = settingsContainer.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      input.addEventListener('change', (e) => {
        const key = e.target.dataset.setting || e.target.id.replace('-setting', '');
        let value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        
        // Convert number strings to numbers
        if (e.target.type === 'number' || e.target.dataset.type === 'number') {
          value = parseFloat(value);
        }

        this.state.settings[key] = value;
        
        // Auto-process if enabled
        if (this.config.settings.autoProcess && !this.state.processing) {
          this.process();
        }
      });
    });
  }

  handleFilesAdded(files) {
    this.state.files = files;
    
    // Update app state
    if (window.appState) {
      files.forEach(f => {
        window.appState.addFile(f.file);
      });
    }

    // Callback
    if (this.callbacks.onFileAdded) {
      this.callbacks.onFileAdded(files);
    }

    // Auto-start processing if single file and enabled
    if (this.config.settings.autoStart && files.length === 1) {
      this.process();
    } else {
      this.render();
    }
  }

  handleUploadError(errors) {
    this.state.error = errors[0]?.error || 'Upload failed';
    
    if (this.callbacks.onError) {
      this.callbacks.onError(this.state.error);
    }

    this.render();
  }

  async process() {
    if (this.state.processing || this.state.files.length === 0) return;

    this.state.processing = true;
    this.state.progress = 0;
    this.state.error = null;

    if (this.callbacks.onProcessing) {
      this.callbacks.onProcessing(true);
    }

    this.render();

    try {
      let result;

      // Use custom process function if provided
      if (this.config.onProcess) {
        result = await this.config.onProcess(this.state.files, this.state.settings, (progress) => {
          this.state.progress = progress;
          if (this.callbacks.onProgress) {
            this.callbacks.onProgress(progress);
          }
          this.render();
        });
      } 
      // Otherwise use worker
      else if (this.config.workerType && window.workerManager) {
        const fileData = this.state.files.map(f => ({
          name: f.name,
          type: f.type,
          data: await this.fileToArrayBuffer(f.file)
        }));

        result = await window.workerManager.process(
          this.config.workerType,
          {
            files: fileData,
            settings: this.state.settings
          },
          (progress) => {
            this.state.progress = progress;
            if (this.callbacks.onProgress) {
              this.callbacks.onProgress(progress);
            }
            this.render();
          }
        );
      } else {
        throw new Error('No processing method configured');
      }

      this.state.result = result;
      this.state.processing = false;
      this.state.progress = 100;

      if (this.callbacks.onComplete) {
        this.callbacks.onComplete(result);
      }

      // Add to history
      if (window.appState) {
        window.appState.addToHistory({
          tool: this.config.id,
          action: 'process',
          filesProcessed: this.state.files.length,
          result
        });
      }

    } catch (error) {
      this.state.error = error.message || 'Processing failed';
      this.state.processing = false;

      if (this.callbacks.onError) {
        this.callbacks.onError(this.state.error);
      }
    }

    this.render();
  }

  async fileToArrayBuffer(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }

  async arrayBufferToBlob(arrayBuffer, type = 'application/octet-stream') {
    return new Blob([arrayBuffer], { type });
  }

  download(filename, blob) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Add to history
    if (window.appState) {
      window.appState.addToHistory({
        tool: this.config.id,
        action: 'download',
        filename
      });
    }
  }

  reset() {
    // Clear files
    if (this.uploadEngine) {
      this.uploadEngine.clearFiles();
    }

    // Clear app state files
    if (window.appState) {
      window.appState.clearFiles();
    }

    // Reset state
    this.state.files = [];
    this.state.processing = false;
    this.state.progress = 0;
    this.state.result = null;
    this.state.error = null;
    this.state.settings = { ...this.config.settings };

    // Reset form inputs
    const settingsContainer = document.getElementById('settings-container');
    if (settingsContainer) {
      const inputs = settingsContainer.querySelectorAll('input, select, textarea');
      inputs.forEach(input => {
        if (input.type === 'checkbox') {
          input.checked = this.config.settings[input.dataset.setting || input.id.replace('-setting', '')] || false;
        } else {
          input.value = this.config.settings[input.dataset.setting || input.id.replace('-setting', '')] || '';
        }
      });
    }

    if (this.callbacks.onReset) {
      this.callbacks.onReset();
    }

    this.render();
  }

  setCallback(name, callback) {
    if (this.callbacks.hasOwnProperty(name)) {
      this.callbacks[name] = callback;
    }
  }

  updateSetting(key, value) {
    this.state.settings[key] = value;
    
    // Update UI
    const input = document.querySelector(`[data-setting="${key}"]`) || 
                  document.getElementById(`${key}-setting`);
    if (input) {
      if (input.type === 'checkbox') {
        input.checked = value;
      } else {
        input.value = value;
      }
    }
  }

  getSetting(key) {
    return this.state.settings[key];
  }

  render() {
    // Update progress bar
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    if (progressBar) {
      progressBar.style.width = `${this.state.progress}%`;
      progressBar.classList.toggle('active', this.state.processing);
    }
    if (progressText) {
      progressText.textContent = `${Math.round(this.state.progress)}%`;
    }

    // Show/hide processing state
    const processingOverlay = document.getElementById('processing-overlay');
    if (processingOverlay) {
      processingOverlay.classList.toggle('hidden', !this.state.processing);
    }

    // Show/hide result section
    const resultSection = document.getElementById('result-section');
    if (resultSection) {
      resultSection.classList.toggle('hidden', !this.state.result);
    }

    // Show/hide error
    const errorSection = document.getElementById('error-section');
    if (errorSection) {
      errorSection.classList.toggle('hidden', !this.state.error);
    }
    const errorMessage = document.getElementById('error-message');
    if (errorMessage) {
      errorMessage.textContent = this.state.error || '';
    }

    // Update process button state
    const processBtn = document.getElementById('process-btn');
    if (processBtn) {
      processBtn.disabled = this.state.processing || this.state.files.length === 0;
      processBtn.classList.toggle('loading', this.state.processing);
    }

    // Render file previews
    this.renderFilePreviews();

    // Render result preview
    this.renderResultPreview();
  }

  renderFilePreviews() {
    const previewsContainer = document.getElementById('file-previews');
    if (!previewsContainer) return;

    if (this.state.files.length === 0) {
      previewsContainer.innerHTML = '';
      return;
    }

    previewsContainer.innerHTML = this.state.files.map(file => `
      <div class="file-preview" data-file-id="${file.id}">
        ${file.preview ? 
          `<img src="${file.preview}" alt="${file.name}" />` : 
          '<div class="file-icon">📄</div>'
        }
        <div class="file-info">
          <span class="file-name">${file.name}</span>
          <span class="file-size">${this.formatFileSize(file.size)}</span>
        </div>
        <button class="remove-file-btn" onclick="toolEngine.removeFile('${file.id}')">
          ✕
        </button>
      </div>
    `).join('');
  }

  removeFile(fileId) {
    const index = this.state.files.findIndex(f => f.id === fileId);
    if (index !== -1) {
      this.state.files.splice(index, 1);
      
      if (window.appState) {
        window.appState.removeFile(fileId);
      }
      
      if (this.callbacks.onFileRemoved) {
        this.callbacks.onFileRemoved(fileId);
      }
      
      this.render();
    }
  }

  renderResultPreview() {
    const resultPreview = document.getElementById('result-preview');
    if (!resultPreview || !this.state.result) return;

    // Handle different result types
    if (this.state.result.blob) {
      const url = URL.createObjectURL(this.state.result.blob);
      
      if (this.state.result.blob.type.startsWith('image/')) {
        resultPreview.innerHTML = `
          <img src="${url}" alt="Result" class="result-image" />
        `;
      } else if (this.state.result.blob.type === 'application/pdf') {
        resultPreview.innerHTML = `
          <embed src="${url}" type="application/pdf" class="result-pdf" />
        `;
      } else {
        resultPreview.innerHTML = `
          <div class="result-file">
            <div class="file-icon">📄</div>
            <span>Ready to download</span>
          </div>
        `;
      }

      // Store URL for cleanup
      resultPreview.dataset.objectUrl = url;
    }
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  cleanup() {
    // Clean up object URLs
    const resultPreview = document.getElementById('result-preview');
    if (resultPreview && resultPreview.dataset.objectUrl) {
      URL.revokeObjectURL(resultPreview.dataset.objectUrl);
    }

    // Destroy upload engine
    if (this.uploadEngine) {
      this.uploadEngine.destroy();
    }
  }

  destroy() {
    this.cleanup();
    this.state = {};
    this.callbacks = {};
  }
}

// Export for use
window.ToolEngine = ToolEngine;
