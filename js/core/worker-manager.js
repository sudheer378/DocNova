/**
 * BrowserTools - Worker Manager
 * Centralized Web Worker management with pooling, reuse, and error recovery
 */

const WorkerManager = {
  initialized: false,
  
  // Worker pool
  workers: {},
  workerPromises: {},
  
  // Queue for pending tasks
  queue: [],
  processing: false,
  
  // Max concurrent workers
  maxConcurrent: navigator.hardwareConcurrency ? Math.min(navigator.hardwareConcurrency, 4) : 2,
  activeWorkers: 0,
  
  // Initialize
  async init() {
    if (this.initialized) return;
    this.initialized = true;
    console.log('WorkerManager initialized');
  },
  
  // Get or create worker
  getWorker(type) {
    return new Promise((resolve, reject) => {
      // Return existing worker if available
      if (this.workers[type]) {
        resolve(this.workers[type]);
        return;
      }
      
      // Check if already creating
      if (this.workerPromises[type]) {
        this.workerPromises[type].then(resolve).catch(reject);
        return;
      }
      
      // Create new worker
      this.workerPromises[type] = new Promise(async (res, rej) => {
        try {
          const workerPath = Config.workers[type];
          if (!workerPath) {
            throw new Error(`Unknown worker type: ${type}`);
          }
          
          const worker = new Worker(workerPath);
          
          // Setup message handler
          worker.onmessage = (e) => {
            const { callbackId, result, error } = e.data;
            
            // Resolve callback if exists
            if (callbackId && this.callbacks[callbackId]) {
              const callback = this.callbacks[callbackId];
              delete this.callbacks[callbackId];
              callback.resolve(result);
              if (error) callback.reject(error);
            }
          };
          
          worker.onerror = (e) => {
            console.error(`Worker error (${type}):`, e);
            rej(e);
          };
          
          this.workers[type] = worker;
          res(worker);
        } catch (e) {
          rej(e);
        } finally {
          delete this.workerPromises[type];
        }
      });
      
      this.workerPromises[type].then(resolve).catch(reject);
    });
  },
  
  // Callback storage
  callbacks: {},
  callbackIdCounter: 0,
  
  // Process with worker
  async process(type, data, onProgress) {
    return new Promise(async (resolve, reject) => {
      try {
        const worker = await this.getWorker(type);
        
        // Generate callback ID
        const callbackId = `cb_${++this.callbackIdCounter}`;
        
        // Store callback
        this.callbacks[callbackId] = {
          resolve: (result) => {
            if (onProgress) onProgress(100);
            resolve(result);
          },
          reject: (error) => reject(error)
        };
        
        // Send to worker
        worker.postMessage({
          type,
          data,
          callbackId
        });
        
        // Update progress
        if (onProgress) {
          onProgress(10); // Started
        }
        
      } catch (e) {
        // Fallback to main thread processing
        console.warn('Worker failed, using fallback:', e);
        try {
          const result = await this.fallbackProcess(type, data, onProgress);
          resolve(result);
        } catch (fallbackError) {
          reject(fallbackError);
        }
      }
    });
  },
  
  // Fallback processing (main thread)
  async fallbackProcess(type, data, onProgress) {
    console.log('Fallback processing for:', type);
    
    // Import worker script and execute in main thread
    // This is a simplified fallback - real implementation would need to import scripts
    return { 
      success: false, 
      error: 'Worker not available, please try again' 
    };
  },
  
  // Queue task
  queueTask(type, data, onProgress) {
    return new Promise((resolve, reject) => {
      this.queue.push({ type, data, onProgress, resolve, reject });
      this.processQueue();
    });
  },
  
  // Process queue
  async processQueue() {
    if (this.processing || this.queue.length === 0) return;
    if (this.activeWorkers >= this.maxConcurrent) return;
    
    this.processing = true;
    
    while (this.queue.length > 0 && this.activeWorkers < this.maxConcurrent) {
      const task = this.queue.shift();
      this.activeWorkers++;
      
      this.process(task.type, task.data, task.onProgress)
        .then(task.resolve)
        .catch(task.reject)
        .finally(() => {
          this.activeWorkers--;
          this.processQueue();
        });
    }
    
    this.processing = false;
  },
  
  // Terminate specific worker
  terminate(type) {
    if (this.workers[type]) {
      this.workers[type].terminate();
      delete this.workers[type];
    }
  },
  
  // Terminate all workers
  terminateAll() {
    Object.keys(this.workers).forEach(type => this.terminate(type));
    this.callbacks = {};
    this.queue = [];
    this.activeWorkers = 0;
  },
  
  // Get stats
  getStats() {
    return {
      activeWorkers: this.activeWorkers,
      queuedTasks: this.queue.length,
      maxConcurrent: this.maxConcurrent,
      availableWorkers: Object.keys(this.workers).length
    };
  }
};
