/**
 * BrowserTools - UI Components
 * Toast, Modal, and Loader systems
 */

// ============================================
// TOAST NOTIFICATIONS
// ============================================

const Toast = {
  container: null,
  
  async init() {
    return new Promise((resolve) => {
      this.container = document.getElementById('toastContainer');
      
      if (!this.container) {
        this.container = document.createElement('div');
        this.container.id = 'toastContainer';
        this.container.className = 'toast-container fixed bottom-4 right-4 z-50 flex flex-col gap-2';
        document.body.appendChild(this.container);
      }
      
      resolve();
    });
  },
  
  show(message, type = 'success', duration = 3000) {
    if (!this.container) this.init();
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type} animate-slide-in-right`;
    toast.style.cssText = `
      background: ${type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#F59E0B'};
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 280px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      animation: slideInRight 0.3s ease-out;
    `;
    
    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };
    
    toast.innerHTML = `
      <span style="font-size: 18px;">${icons[type] || icons.info}</span>
      <span style="flex: 1;">${message}</span>
      <button onclick="this.parentElement.remove()" style="background:none;border:none;color:white;cursor:pointer;font-size:16px;">×</button>
    `;
    
    this.container.appendChild(toast);
    
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },
  
  success(message) { this.show(message, 'success'); },
  error(message) { this.show(message, 'error'); },
  warning(message) { this.show(message, 'warning'); },
  info(message) { this.show(message, 'info'); }
};

// ============================================
// MODAL SYSTEM
// ============================================

const Modal = {
  currentModal: null,
  
  create(options = {}) {
    const {
      title = '',
      content = '',
      showClose = true,
      onClose = null
    } = options;
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm';
    modal.style.cssText = 'animation: fadeIn 0.2s ease-out;';
    
    modal.innerHTML = `
      <div class="modal-content bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full mx-4 max-h-[90vh] overflow-auto animate-scale-in">
        ${title ? `
          <div class="modal-header px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">${title}</h3>
            ${showClose ? `<button class="modal-close text-gray-400 hover:text-gray-600" onclick="Modal.close()">×</button>` : ''}
          </div>
        ` : ''}
        <div class="modal-body p-6">
          ${typeof content === 'string' ? content : ''}
        </div>
        ${options.footer ? `
          <div class="modal-footer px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            ${options.footer}
          </div>
        ` : ''}
      </div>
    `;
    
    // Close on overlay click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) this.close();
    });
    
    // ESC to close
    const escHandler = (e) => {
      if (e.key === 'Escape') this.close();
      document.removeEventListener('keydown', escHandler);
    };
    document.addEventListener('keydown', escHandler);
    
    document.body.appendChild(modal);
    this.currentModal = modal;
    
    if (options.onOpen) options.onOpen(modal);
    
    return modal;
  },
  
  close() {
    if (!this.currentModal) return;
    
    const modal = this.currentModal;
    modal.style.opacity = '0';
    modal.style.transition = 'opacity 0.2s ease-out';
    
    setTimeout(() => {
      modal.remove();
      this.currentModal = null;
    }, 200);
  },
  
  confirm(options = {}) {
    return new Promise((resolve) => {
      const modal = this.create({
        title: options.title || 'Confirm',
        content: options.message || 'Are you sure?',
        footer: `
          <div class="flex gap-3 justify-end">
            <button class="btn btn-secondary" onclick="Modal.resolveConfirm(false)">Cancel</button>
            <button class="btn btn-primary" onclick="Modal.resolveConfirm(true)">Confirm</button>
          </div>
        `,
        onOpen: () => {
          this.confirmResolve = resolve;
        }
      });
    });
  },
  
  resolveConfirm(value) {
    if (this.confirmResolve) {
      this.confirmResolve(value);
      this.confirmResolve = null;
      this.close();
    }
  }
};

// ============================================
// LOADER SYSTEM
// ============================================

const Loader = {
  show(containerId, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const {
      message = 'Processing...',
      size = 'md'
    } = options;
    
    const sizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-8 h-8',
      lg: 'w-12 h-12'
    };
    
    container.innerHTML = `
      <div class="loader-container flex flex-col items-center justify-center py-8">
        <div class="spinner ${sizeClasses[size]} animate-spin rounded-full border-4 border-gray-200 border-t-purple-600"></div>
        ${message ? `<p class="mt-4 text-gray-600 dark:text-gray-300">${message}</p>` : ''}
      </div>
    `;
  },
  
  hide(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = '';
    }
  },
  
  inline(containerId, show = true) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (show) {
      container.innerHTML = `
        <div class="inline-loader flex items-center gap-2">
          <div class="w-4 h-4 animate-spin rounded-full border-2 border-gray-300 border-t-purple-600"></div>
          <span>Loading...</span>
        </div>
      `;
    } else {
      container.innerHTML = '';
    }
  }
};

// ============================================
// ANIMATIONS (CSS injected)
// ============================================

const UIAnimations = {
  init() {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      @keyframes scaleIn {
        from { opacity: 0; transform: scale(0.95); }
        to { opacity: 1; transform: scale(1); }
      }
      
      @keyframes slideInRight {
        from { opacity: 0; transform: translateX(100%); }
        to { opacity: 1; transform: translateX(0); }
      }
      
      @keyframes slideUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      .animate-fade-in { animation: fadeIn 0.2s ease-out; }
      .animate-scale-in { animation: scaleIn 0.2s ease-out; }
      .animate-slide-in-right { animation: slideInRight 0.3s ease-out; }
      .animate-slide-up { animation: slideUp 0.3s ease-out; }
    `;
    document.head.appendChild(style);
  }
};

// Initialize animations on load
if (typeof document !== 'undefined') {
  UIAnimations.init();
}
