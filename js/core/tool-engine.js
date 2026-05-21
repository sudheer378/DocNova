/**
 * BrowserTools - Tool Engine
 * Reusable tool initialization and processing system
 */

const ToolEngine = {
  initialized: false,
  currentToolId: null,
  
  // Tool configurations
  tools: {
    'compress-image': {
      name: 'Compress Image',
      category: 'image',
      worker: 'compress',
      acceptedTypes: ['image/jpeg', 'image/png', 'image/webp'],
      settings: {
        quality: { type: 'range', min: 10, max: 100, default: 80, label: 'Quality' },
        format: { type: 'select', options: ['jpeg', 'png', 'webp'], default: 'jpeg', label: 'Output Format' }
      }
    },
    'compress-image-to-20kb': {
      name: 'Compress Image to 20KB',
      category: 'compression',
      worker: 'compress',
      acceptedTypes: ['image/jpeg', 'image/png', 'image/webp'],
      settings: {
        targetSize: { type: 'fixed', value: 20, unit: 'KB' }
      }
    },
    'jpg-to-png': {
      name: 'JPG to PNG',
      category: 'conversion',
      worker: 'convert',
      acceptedTypes: ['image/jpeg'],
      settings: {}
    },
    'resize-image': {
      name: 'Resize Image',
      category: 'resize',
      worker: 'resize',
      acceptedTypes: ['image/jpeg', 'image/png', 'image/webp'],
      settings: {
        width: { type: 'number', default: 800, label: 'Width (px)' },
        height: { type: 'number', default: null, label: 'Height (px)' },
        maintainAspectRatio: { type: 'checkbox', default: true, label: 'Maintain Aspect Ratio' }
      }
    },
    'merge-pdf': {
      name: 'Merge PDF',
      category: 'pdf',
      worker: 'pdfMerge',
      acceptedTypes: ['application/pdf'],
      multiFile: true,
      settings: {}
    }
  },
  
  // Initialize tool from URL
  async initFromURL(path) {
    const toolId = path.split('/').pop().replace('.html', '');
    
    if (!this.tools[toolId]) {
      console.warn('Tool not found:', toolId);
      return;
    }
    
    this.currentToolId = toolId;
    await this.init(toolId);
  },
  
  // Initialize specific tool
  async init(toolId) {
    const tool = this.tools[toolId];
    if (!tool) {
      Toast.error('Tool not found');
      return;
    }
    
    AppState.set('currentTool', toolId);
    
    // Setup upload area
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    
    if (uploadArea && fileInput) {
      UploadEngine.bind(uploadArea, fileInput, (files) => this.handleFiles(files, tool));
    }
    
    // Setup settings panel
    this.setupSettingsPanel(tool);
    
    console.log('Tool initialized:', toolId);
  },
  
  // Handle uploaded files
  async handleFiles(files, tool) {
    AppState.set('uploadedFiles', files);
    
    // Generate previews
    const previews = await UploadEngine.generatePreviews(files);
    this.renderPreviews(previews, tool);
    
    // Show process button
    const processBtn = document.getElementById('processBtn');
    if (processBtn) {
      processBtn.style.display = 'block';
      processBtn.onclick = () => this.process(tool);
    }
  },
  
  // Render file previews
  renderPreviews(previews, tool) {
    const previewContainer = document.getElementById('previewContainer');
    if (!previewContainer) return;
    
    previewContainer.innerHTML = previews.map((preview, index) => `
      <div class="preview-card" data-index="${index}">
        ${preview.type === 'image' ? `
          <img src="${preview.dataURL}" alt="${preview.name}" />
        ` : `
          <div class="pdf-preview">
            <span class="pdf-icon">📄</span>
            <span class="pdf-name">${preview.name}</span>
          </div>
        `}
        <div class="preview-info">
          <span class="preview-name">${preview.name}</span>
          <span class="preview-size">${Utils.formatFileSize(preview.size)}</span>
        </div>
        <button class="remove-preview" onclick="ToolEngine.removePreview(${index})">×</button>
      </div>
    `).join('');
    
    previewContainer.style.display = 'grid';
  },
  
  // Remove preview
  removePreview(index) {
    UploadEngine.removeFile(index);
    const previews = UploadEngine.previews;
    this.renderPreviews(previews, this.tools[this.currentToolId]);
    
    if (previews.length === 0) {
      document.getElementById('previewContainer').style.display = 'none';
      document.getElementById('processBtn').style.display = 'none';
    }
  },
  
  // Setup settings panel
  setupSettingsPanel(tool) {
    const settingsContainer = document.getElementById('settingsContainer');
    if (!settingsContainer || !tool.settings) return;
    
    const settingsHTML = Object.entries(tool.settings).map(([key, setting]) => {
      switch(setting.type) {
        case 'range':
          return `
            <div class="setting-row">
              <label>${setting.label}</label>
              <input type="range" id="setting-${key}" 
                min="${setting.min}" max="${setting.max}" 
                value="${AppState.settings[key] || setting.default}"
                oninput="document.getElementById('setting-${key}-value').textContent = this.value" />
              <span id="setting-${key}-value">${AppState.settings[key] || setting.default}</span>
            </div>
          `;
        case 'select':
          return `
            <div class="setting-row">
              <label>${setting.label}</label>
              <select id="setting-${key}">
                ${setting.options.map(opt => `<option value="${opt}" ${AppState.settings[key] === opt ? 'selected' : ''}>${opt.toUpperCase()}</option>`).join('')}
              </select>
            </div>
          `;
        case 'number':
          return `
            <div class="setting-row">
              <label>${setting.label}</label>
              <input type="number" id="setting-${key}" 
                value="${AppState.settings[key] || setting.default}" />
            </div>
          `;
        case 'checkbox':
          return `
            <div class="setting-row">
              <label>${setting.label}</label>
              <input type="checkbox" id="setting-${key}" 
                ${AppState.settings[key] !== undefined ? AppState.settings[key] : setting.default} />
            </div>
          `;
        case 'fixed':
          return `
            <div class="setting-row">
              <span>${setting.label}: ${setting.value}${setting.unit}</span>
            </div>
          `;
        default:
          return '';
      }
    }).join('');
    
    settingsContainer.innerHTML = settingsHTML;
    settingsContainer.style.display = 'block';
  },
  
  // Process files
  async process(tool) {
    const files = AppState.get('uploadedFiles');
    if (!files || files.length === 0) {
      Toast.error('No files to process');
      return;
    }
    
    AppState.set('isProcessing', true);
    
    // Get settings
    const settings = {};
    if (tool.settings) {
      Object.keys(tool.settings).forEach(key => {
        const el = document.getElementById(`setting-${key}`);
        if (el) {
          settings[key] = el.type === 'checkbox' ? el.checked : el.value;
        }
      });
    }
    
    // Show progress
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    if (progressBar) progressBar.style.width = '0%';
    if (progressText) progressText.textContent = 'Processing...';
    
    try {
      // Read files
      const fileData = await Promise.all(files.map(f => UploadEngine.readAsArrayBuffer(f)));
      
      // Process with worker
      const result = await WorkerManager.process(tool.worker, {
        files: fileData,
        filenames: files.map(f => f.name),
        settings
      }, (progress) => {
        if (progressBar) progressBar.style.width = `${progress}%`;
      });
      
      // Handle result
      if (result.success) {
        AppState.set('processedFiles', result.files);
        this.showDownload(result);
        Toast.success('Processing complete!');
      } else {
        throw new Error(result.error || 'Processing failed');
      }
      
    } catch (error) {
      console.error('Processing error:', error);
      Toast.error(error.message);
    } finally {
      AppState.set('isProcessing', false);
    }
  },
  
  // Show download section
  showDownload(result) {
    const downloadSection = document.getElementById('downloadSection');
    if (!downloadSection) return;
    
    downloadSection.innerHTML = result.files.map((file, index) => {
      const blob = new Blob([file.data], { type: file.mimeType });
      const url = URL.createObjectURL(blob);
      
      return `
        <div class="download-item">
          <span class="download-name">${file.name}</span>
          <span class="download-size">${Utils.formatFileSize(file.size)}</span>
          <a href="${url}" download="${file.name}" class="btn btn-primary">
            Download
          </a>
        </div>
      `;
    }).join('');
    
    downloadSection.style.display = 'block';
    downloadSection.scrollIntoView({ behavior: 'smooth' });
  },
  
  // Reset tool
  reset() {
    AppState.reset();
    UploadEngine.clear();
    
    const previewContainer = document.getElementById('previewContainer');
    const downloadSection = document.getElementById('downloadSection');
    const processBtn = document.getElementById('processBtn');
    
    if (previewContainer) previewContainer.style.display = 'none';
    if (downloadSection) downloadSection.style.display = 'none';
    if (processBtn) processBtn.style.display = 'none';
    
    // Re-init tool
    if (this.currentToolId) {
      this.init(this.currentToolId);
    }
  }
};
