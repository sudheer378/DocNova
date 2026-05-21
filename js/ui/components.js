/* ========================================
   UI COMPONENTS
   Toast, Modal, Loader systems
   ======================================== */

/* ========== TOAST NOTIFICATIONS ========== */

class Toast {
  constructor(options = {}) {
    this.options = {
      position: 'top-right', // top-right, top-center, top-left, bottom-right, bottom-center, bottom-left
      duration: 3000,
      maxToasts: 5,
      ...options
    };

    this.container = null;
    this.toasts = [];
    this.init();
  }

  init() {
    // Create container if doesn't exist
    let container = document.getElementById('toast-container');
    
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = `toast-container toast-${this.options.position}`;
      document.body.appendChild(container);
    }
    
    this.container = container;
  }

  show(message, type = 'info', options = {}) {
    const toast = {
      id: `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      message,
      type,
      duration: options.duration || this.options.duration,
      dismissible: options.dismissible !== false,
      action: options.action || null,
      createdAt: Date.now()
    };

    // Remove oldest toasts if exceeding max
    while (this.toasts.length >= this.options.maxToasts) {
      this.remove(this.toasts[0].id);
    }

    this.toasts.push(toast);
    this.render(toast);

    // Auto-dismiss
    if (toast.duration > 0) {
      setTimeout(() => {
        this.remove(toast.id);
      }, toast.duration);
    }

    return toast.id;
  }

  success(message, options = {}) {
    return this.show(message, 'success', options);
  }

  error(message, options = {}) {
    return this.show(message, 'error', options);
  }

  warning(message, options = {}) {
    return this.show(message, 'warning', options);
  }

  info(message, options = {}) {
    return this.show(message, 'info', options);
  }

  render(toast) {
    const element = document.createElement('div');
    element.className = `toast toast-${toast.type}`;
    element.dataset.toastId = toast.id;
    element.innerHTML = `
      <div class="toast-icon">${this.getIcon(toast.type)}</div>
      <div class="toast-content">
        <div class="toast-message">${toast.message}</div>
        ${toast.action ? `<button class="toast-action">${toast.action.label}</button>` : ''}
      </div>
      ${toast.dismissible ? `<button class="toast-close" onclick="window.toastSystem.remove('${toast.id}')">&times;</button>` : ''}
    `;

    // Add click handler for action
    if (toast.action && toast.action.onClick) {
      const actionBtn = element.querySelector('.toast-action');
      actionBtn.addEventListener('click', () => {
        toast.action.onClick();
        this.remove(toast.id);
      });
    }

    this.container.appendChild(element);

    // Trigger animation
    requestAnimationFrame(() => {
      element.classList.add('toast-enter');
    });
  }

  getIcon(type) {
    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };
    return icons[type] || icons.info;
  }

  remove(id) {
    const index = this.toasts.findIndex(t => t.id === id);
    if (index === -1) return;

    const element = this.container.querySelector(`[data-toast-id="${id}"]`);
    if (element) {
      element.classList.remove('toast-enter');
      element.classList.add('toast-exit');
      
      setTimeout(() => {
        element.remove();
      }, 300);
    }

    this.toasts.splice(index, 1);
  }

  clear() {
    this.toasts.forEach(toast => this.remove(toast.id));
  }
}

/* ========== MODAL SYSTEM ========== */

class Modal {
  constructor() {
    this.activeModal = null;
    this.overlay = null;
    this.init();
  }

  init() {
    // Create overlay
    this.overlay = document.createElement('div');
    this.overlay.className = 'modal-overlay hidden';
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay && this.activeModal?.closable) {
        this.close();
      }
    });

    // Keyboard escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.activeModal?.closable) {
        this.close();
      }
    });

    document.body.appendChild(this.overlay);
  }

  open(content, options = {}) {
    this.activeModal = {
      content,
      closable: options.closable !== false,
      onClose: options.onClose || null
    };

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content ${options.size || 'medium'}">
        ${typeof content === 'string' ? content : content.outerHTML}
        ${options.closable !== false ? '<button class="modal-close">&times;</button>' : ''}
      </div>
    `;

    // Add close button handler
    const closeBtn = modal.querySelector('.modal-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }

    this.overlay.innerHTML = '';
    this.overlay.appendChild(modal);
    this.overlay.classList.remove('hidden');

    // Focus trap
    const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }
  }

  close() {
    if (!this.activeModal) return;

    this.overlay.classList.add('hidden');
    
    const onClose = this.activeModal.onClose;
    this.activeModal = null;

    setTimeout(() => {
      this.overlay.innerHTML = '';
      if (onClose) onClose();
    }, 300);
  }

  confirm(message, options = {}) {
    return new Promise((resolve) => {
      const content = `
        <div class="modal-confirm">
          <h3>${options.title || 'Confirm'}</h3>
          <p>${message}</p>
          <div class="modal-actions">
            <button class="btn btn-secondary" id="modal-cancel">${options.cancelText || 'Cancel'}</button>
            <button class="btn btn-primary" id="modal-confirm">${options.confirmText || 'Confirm'}</button>
          </div>
        </div>
      `;

      this.open(content, { size: 'small' });

      document.getElementById('modal-cancel').addEventListener('click', () => {
        this.close();
        resolve(false);
      });

      document.getElementById('modal-confirm').addEventListener('click', () => {
        this.close();
        resolve(true);
      });
    });
  }

  alert(message, options = {}) {
    return new Promise((resolve) => {
      const content = `
        <div class="modal-alert">
          <h3>${options.title || 'Alert'}</h3>
          <p>${message}</p>
          <div class="modal-actions">
            <button class="btn btn-primary" id="modal-ok">${options.okText || 'OK'}</button>
          </div>
        </div>
      `;

      this.open(content, { size: 'small' });

      document.getElementById('modal-ok').addEventListener('click', () => {
        this.close();
        resolve();
      });
    });
  }
}

/* ========== LOADER SYSTEM ========== */

class Loader {
  constructor() {
    this.activeLoaders = new Map();
  }

  show(target, options = {}) {
    const loaderId = `loader_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const loader = document.createElement('div');
    loader.className = 'loader-overlay';
    loader.dataset.loaderId = loaderId;
    loader.innerHTML = `
      <div class="loader ${options.style || 'spinner'}">
        ${this.getLoaderContent(options.style)}
      </div>
      ${options.text ? `<div class="loader-text">${options.text}</div>` : ''}
    `;

    if (target === 'body') {
      document.body.appendChild(loader);
    } else {
      const targetEl = typeof target === 'string' ? document.querySelector(target) : target;
      if (targetEl) {
        targetEl.style.position = 'relative';
        targetEl.appendChild(loader);
      }
    }

    this.activeLoaders.set(loaderId, { element: loader, target });
    return loaderId;
  }

  hide(loaderId) {
    const loader = this.activeLoaders.get(loaderId);
    if (loader) {
      loader.element.remove();
      this.activeLoaders.delete(loaderId);
    }
  }

  hideAll() {
    this.activeLoaders.forEach((loader, id) => {
      loader.element.remove();
    });
    this.activeLoaders.clear();
  }

  getLoaderContent(style) {
    switch (style) {
      case 'dots':
        return `
          <div class="loader-dot"></div>
          <div class="loader-dot"></div>
          <div class="loader-dot"></div>
        `;
      case 'bar':
        return `
          <div class="loader-bar"></div>
        `;
      case 'pulse':
        return `
          <div class="loader-pulse"></div>
        `;
      default: // spinner
        return `
          <div class="spinner"></div>
        `;
    }
  }

  // Static convenience methods
  static show(target, options) {
    return window.loaderSystem.show(target, options);
  }

  static hide(loaderId) {
    return window.loaderSystem.hide(loaderId);
  }
}

// Create global instances
window.toastSystem = new Toast();
window.modalSystem = new Modal();
window.loaderSystem = new Loader();

// Convenience aliases
window.toast = window.toastSystem.show.bind(window.toastSystem);
window.toast.success = window.toastSystem.success.bind(window.toastSystem);
window.toast.error = window.toastSystem.error.bind(window.toastSystem);
window.toast.warning = window.toastSystem.warning.bind(window.toastSystem);
window.toast.info = window.toastSystem.info.bind(window.toastSystem);
window.modal = window.modalSystem;
window.loader = window.loaderSystem;
