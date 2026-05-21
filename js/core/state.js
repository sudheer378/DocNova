/* ========================================
   GLOBAL STATE MANAGEMENT
   ======================================== */

class AppState {
  constructor() {
    this.state = {
      currentTool: null,
      uploadedFiles: [],
      processing: false,
      progress: 0,
      result: null,
      error: null,
      settings: {},
      history: []
    };
    
    this.listeners = new Map();
  }

  // Get state value
  get(key) {
    return this.state[key];
  }

  // Set state value and notify listeners
  set(key, value) {
    const oldValue = this.state[key];
    this.state[key] = value;
    this.notify(key, value, oldValue);
  }

  // Update multiple keys at once
  update(updates) {
    Object.keys(updates).forEach(key => {
      const oldValue = this.state[key];
      this.state[key] = updates[key];
      this.notify(key, updates[key], oldValue);
    });
  }

  // Reset state to initial values
  reset() {
    this.state = {
      currentTool: null,
      uploadedFiles: [],
      processing: false,
      progress: 0,
      result: null,
      error: null,
      settings: {},
      history: []
    };
    this.notifyAll();
  }

  // Subscribe to state changes
  subscribe(key, callback) {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key).add(callback);
    
    // Return unsubscribe function
    return () => {
      this.listeners.get(key)?.delete(callback);
    };
  }

  // Notify listeners of change
  notify(key, newValue, oldValue) {
    const listeners = this.listeners.get(key);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(newValue, oldValue);
        } catch (error) {
          console.error(`Error in state listener for ${key}:`, error);
        }
      });
    }
  }

  // Notify all listeners (full reset)
  notifyAll() {
    this.listeners.forEach((listeners, key) => {
      listeners.forEach(callback => {
        try {
          callback(this.state[key], null);
        } catch (error) {
          console.error(`Error in state listener for ${key}:`, error);
        }
      });
    });
  }

  // Add file to uploaded files
  addFile(file) {
    const fileWithId = {
      id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      preview: null,
      status: 'pending' // pending, processing, completed, error
    };
    
    this.state.uploadedFiles.push(fileWithId);
    this.notify('uploadedFiles', this.state.uploadedFiles, null);
    return fileWithId.id;
  }

  // Remove file by ID
  removeFile(fileId) {
    const index = this.state.uploadedFiles.findIndex(f => f.id === fileId);
    if (index !== -1) {
      const removed = this.state.uploadedFiles.splice(index, 1)[0];
      // Clean up preview URL
      if (removed.preview) {
        URL.revokeObjectURL(removed.preview);
      }
      this.notify('uploadedFiles', this.state.uploadedFiles, null);
    }
  }

  // Clear all files
  clearFiles() {
    this.state.uploadedFiles.forEach(f => {
      if (f.preview) {
        URL.revokeObjectURL(f.preview);
      }
    });
    this.state.uploadedFiles = [];
    this.notify('uploadedFiles', this.state.uploadedFiles, null);
  }

  // Update file status
  updateFileStatus(fileId, status, data = {}) {
    const fileObj = this.state.uploadedFiles.find(f => f.id === fileId);
    if (fileObj) {
      const oldStatus = fileObj.status;
      fileObj.status = status;
      Object.assign(fileObj, data);
      this.notify('uploadedFiles', this.state.uploadedFiles, null);
    }
  }

  // Add to history
  addToHistory(action) {
    this.state.history.unshift({
      ...action,
      timestamp: Date.now()
    });
    // Keep only last 50 actions
    if (this.state.history.length > 50) {
      this.state.history = this.state.history.slice(0, 50);
    }
    this.notify('history', this.state.history, null);
  }
}

// Create global state instance
window.appState = new AppState();
