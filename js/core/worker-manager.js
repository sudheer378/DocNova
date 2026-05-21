/* ========================================
   WORKER MANAGER
   Handles worker pooling, reuse, and cleanup
   ======================================== */

class WorkerManager {
  constructor() {
    this.workers = new Map(); // workerType -> worker instance
    this.workerQueue = new Map(); // workerType -> queue of pending tasks
    this.workerBusy = new Map(); // workerType -> boolean
    this.workerPromises = new Map(); // workerType -> resolve/reject functions
    
    this.init();
  }

  init() {
    // Initialize worker types from config
    const config = window.TOOLSAAS_CONFIG;
    if (config && config.workers) {
      Object.keys(config.workers).forEach(type => {
        this.workerQueue.set(type, []);
        this.workerBusy.set(type, false);
        this.workerPromises.set(type, null);
      });
    }
  }

  // Get or create a worker
  getWorker(type) {
    const config = window.TOOLSAAS_CONFIG;
    if (!config || !config.workers || !config.workers[type]) {
      throw new Error(`Worker type "${type}" not found in config`);
    }

    // Create worker if doesn't exist
    if (!this.workers.has(type)) {
      try {
        const workerPath = config.workers[type];
        const worker = new Worker(workerPath);
        
        // Set up message handler
        worker.onmessage = (e) => this.handleWorkerMessage(type, e);
        worker.onerror = (e) => this.handleWorkerError(type, e);
        
        this.workers.set(type, worker);
      } catch (error) {
        console.error(`Failed to create worker ${type}:`, error);
        throw error;
      }
    }

    return this.workers.get(type);
  }

  // Process a task with a worker
  async process(type, data, onProgress = null) {
    return new Promise((resolve, reject) => {
      try {
        const worker = this.getWorker(type);
        
        // Add progress callback if provided
        const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Store resolve/reject for this task
        const callbacks = this.workerPromises.get(type) || {};
        callbacks[taskId] = { resolve, reject, onProgress };
        this.workerPromises.set(type, callbacks);

        // Send message to worker
        worker.postMessage({
          type: 'process',
          taskId,
          data,
          timestamp: Date.now()
        });

        // Mark worker as busy
        this.workerBusy.set(type, true);

      } catch (error) {
        reject(error);
      }
    });
  }

  // Handle messages from workers
  handleWorkerMessage(workerType, event) {
    const { type, taskId, data, progress, error, result } = event.data;

    const callbacks = this.workerPromises.get(workerType);
    if (!callbacks || !callbacks[taskId]) {
      return;
    }

    const { resolve, reject, onProgress } = callbacks[taskId];

    switch (type) {
      case 'progress':
        if (onProgress && typeof progress === 'number') {
          onProgress(progress);
        }
        break;

      case 'complete':
        // Clean up
        delete callbacks[taskId];
        this.workerPromises.set(workerType, callbacks);
        this.workerBusy.set(workerType, false);
        
        // Process next task in queue
        this.processNextTask(workerType);
        
        resolve(result);
        break;

      case 'error':
        // Clean up
        delete callbacks[taskId];
        this.workerPromises.set(workerType, callbacks);
        this.workerBusy.set(workerType, false);
        
        // Process next task in queue
        this.processNextTask(workerType);
        
        reject(new Error(error || 'Unknown worker error'));
        break;

      default:
        break;
    }
  }

  // Handle worker errors
  handleWorkerError(workerType, error) {
    console.error(`Worker ${workerType} error:`, error);
    
    // Terminate and recreate the worker
    this.terminateWorker(workerType);
    
    // Reject any pending promises
    const callbacks = this.workerPromises.get(workerType);
    if (callbacks) {
      Object.keys(callbacks).forEach(taskId => {
        if (callbacks[taskId].reject) {
          callbacks[taskId].reject(error);
        }
      });
      this.workerPromises.set(workerType, {});
    }
    
    this.workerBusy.set(workerType, false);
  }

  // Process next task in queue
  processNextTask(workerType) {
    const queue = this.workerQueue.get(workerType);
    if (queue && queue.length > 0 && !this.workerBusy.get(workerType)) {
      const nextTask = queue.shift();
      this.workerQueue.set(workerType, queue);
      
      if (nextTask) {
        this.process(workerType, nextTask.data, nextTask.onProgress)
          .then(nextTask.resolve)
          .catch(nextTask.reject);
      }
    }
  }

  // Queue a task
  queueTask(type, data, onProgress = null) {
    return new Promise((resolve, reject) => {
      const queue = this.workerQueue.get(type);
      if (queue) {
        queue.push({ data, onProgress, resolve, reject });
        this.workerQueue.set(type, queue);
        
        // Process immediately if worker is idle
        if (!this.workerBusy.get(type)) {
          this.processNextTask(type);
        }
      } else {
        reject(new Error(`Worker type "${type}" not initialized`));
      }
    });
  }

  // Terminate a specific worker
  terminateWorker(type) {
    const worker = this.workers.get(type);
    if (worker) {
      worker.terminate();
      this.workers.delete(type);
    }
  }

  // Terminate all workers
  terminateAll() {
    this.workers.forEach((worker, type) => {
      worker.terminate();
    });
    this.workers.clear();
    
    this.workerBusy.clear();
    this.workerQueue.clear();
    this.workerPromises.clear();
  }

  // Get worker status
  getStatus() {
    const status = {};
    this.workers.forEach((worker, type) => {
      status[type] = {
        exists: true,
        busy: this.workerBusy.get(type) || false,
        queueLength: (this.workerQueue.get(type) || []).length
      };
    });
    return status;
  }

  // Check if worker is available
  isAvailable(type) {
    return !this.workerBusy.get(type);
  }

  // Cancel a specific task
  cancelTask(type, taskId) {
    const callbacks = this.workerPromises.get(type);
    if (callbacks && callbacks[taskId]) {
      delete callbacks[taskId];
      this.workerPromises.set(type, callbacks);
      
      // Notify worker to cancel
      const worker = this.workers.get(type);
      if (worker) {
        worker.postMessage({ type: 'cancel', taskId });
      }
    }
  }
}

// Create global worker manager instance
window.workerManager = new WorkerManager();
