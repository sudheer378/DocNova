/* ========================================
   INTERNAL LINKS ENGINE
   Generate related tools, guides, breadcrumbs
   ======================================== */

class InternalLinksEngine {
  constructor() {
    this.config = window.TOOLSAAS_CONFIG;
  }

  // Initialize all internal links for a page
  init(options = {}) {
    const { toolId, categoryId } = options;

    // Render related tools
    if (toolId) {
      this.renderRelatedTools(toolId);
    }

    // Render category links
    if (categoryId || toolId) {
      const catId = categoryId || this.getToolCategory(toolId);
      if (catId) {
        this.renderCategoryLinks(catId);
      }
    }

    // Render popular tools
    this.renderPopularTools();

    // Render recent tools (from history)
    this.renderRecentTools();

    // Render footer links
    this.renderFooterLinks();
  }

  // Get tool category
  getToolCategory(toolId) {
    const tool = this.config?.tools?.[toolId];
    return tool?.category || null;
  }

  // Get tools by category
  getToolsByCategory(categoryId, limit = 12) {
    const tools = Object.entries(this.config?.tools || {})
      .filter(([id, tool]) => tool.category === categoryId)
      .slice(0, limit);

    return tools.map(([id, tool]) => ({
      id,
      ...tool,
      url: `/tools/${this.categoryToPath(tool.category)}/${id}.html`
    }));
  }

  // Convert category ID to path
  categoryToPath(categoryId) {
    const parts = categoryId.split('-');
    
    if (parts[0] === 'image' && parts.length > 1) {
      return `image/${parts.slice(1).join('-')}`;
    }
    
    return categoryId;
  }

  // Render related tools section
  renderRelatedTools(currentToolId) {
    const container = document.getElementById('related-tools');
    if (!container) return;

    const currentTool = this.config?.tools?.[currentToolId];
    if (!currentTool) return;

    // Get tools from same category (excluding current)
    const categoryTools = this.getToolsByCategory(currentTool.category, 8)
      .filter(tool => tool.id !== currentToolId);

    // If not enough in category, add from other categories
    if (categoryTools.length < 4) {
      const allTools = Object.entries(this.config?.tools || {})
        .filter(([id]) => id !== currentToolId)
        .map(([id, tool]) => ({ id, ...tool }))
        .slice(0, 8 - categoryTools.length);
      
      categoryTools.push(...allTools);
    }

    container.innerHTML = `
      <h2 class="section-title">Related Tools</h2>
      <div class="tools-grid">
        ${categoryTools.map(tool => this.renderToolCard(tool)).join('')}
      </div>
    `;
  }

  // Render category links section
  renderCategoryLinks(categoryId) {
    const container = document.getElementById('category-links');
    if (!container) return;

    const category = this.config?.categories?.find(c => c.id === categoryId);
    if (!category) return;

    const tools = this.getToolsByCategory(categoryId, 6);

    container.innerHTML = `
      <div class="category-header">
        <span class="category-icon">${category.icon}</span>
        <h2>${category.name}</h2>
      </div>
      <ul class="category-tools-list">
        ${tools.map(tool => `
          <li>
            <a href="${tool.url}" class="category-tool-link">
              ${tool.name}
            </a>
          </li>
        `).join('')}
      </ul>
      <a href="/categories/${categoryId}.html" class="view-all-link">
        View all ${category.name} →
      </a>
    `;
  }

  // Render popular tools
  renderPopularTools() {
    const container = document.getElementById('popular-tools');
    if (!container) return;

    // Popular tools (hardcoded for now, could be dynamic based on analytics)
    const popularIds = [
      'compress-image',
      'merge-pdf',
      'jpg-to-png',
      'resize-image',
      'pdf-to-jpg',
      'compress-image-to-20kb'
    ];

    const popularTools = popularIds
      .map(id => {
        const tool = this.config?.tools?.[id];
        return tool ? { id, ...tool } : null;
      })
      .filter(Boolean);

    container.innerHTML = `
      <h2 class="section-title">Most Popular Tools</h2>
      <div class="tools-grid">
        ${popularTools.map(tool => this.renderToolCard(tool)).join('')}
      </div>
    `;
  }

  // Render recent tools from history
  renderRecentTools() {
    const container = document.getElementById('recent-tools');
    if (!container) return;

    const history = window.appState?.get('history') || [];
    
    if (history.length === 0) {
      container.classList.add('hidden');
      return;
    }

    // Get unique recent tool IDs
    const recentIds = [...new Set(history.map(h => h.tool))].slice(0, 4);
    
    const recentTools = recentIds
      .map(id => {
        const tool = this.config?.tools?.[id];
        return tool ? { id, ...tool } : null;
      })
      .filter(Boolean);

    if (recentTools.length === 0) {
      container.classList.add('hidden');
      return;
    }

    container.innerHTML = `
      <h3>Recently Used</h3>
      <div class="recent-tools-list">
        ${recentTools.map(tool => `
          <a href="/tools/${this.categoryToPath(tool.category)}/${tool.id}.html" class="recent-tool-item">
            <span class="recent-tool-icon">${tool.icon || '🛠️'}</span>
            <span class="recent-tool-name">${tool.name}</span>
          </a>
        `).join('')}
      </div>
    `;
  }

  // Render tool card HTML
  renderToolCard(tool) {
    const category = this.config?.categories?.find(c => c.id === tool.category);
    
    return `
      <a href="/tools/${this.categoryToPath(tool.category)}/${tool.id}.html" class="tool-card" data-tool-id="${tool.id}">
        <div class="tool-card-icon" style="background-color: ${category?.color || '#6C5CE7'}20;">
          <span class="tool-emoji">${tool.icon || category?.icon || '🛠️'}</span>
        </div>
        <div class="tool-card-content">
          <h3 class="tool-card-title">${tool.name}</h3>
          <p class="tool-card-description">${tool.description}</p>
        </div>
        <div class="tool-card-arrow">→</div>
      </a>
    `;
  }

  // Render footer links
  renderFooterLinks() {
    const containers = document.querySelectorAll('.footer-links-container');
    
    containers.forEach(container => {
      // Categories
      const categoriesList = container.querySelector('.footer-categories');
      if (categoriesList) {
        categoriesList.innerHTML = this.config?.categories?.map(cat => `
          <li><a href="/categories/${cat.id}.html">${cat.name}</a></li>
        `).join('') || '';
      }

      // All tools
      const toolsList = container.querySelector('.footer-tools');
      if (toolsList) {
        const allTools = Object.entries(this.config?.tools || {})
          .slice(0, 20)
          .map(([id, tool]) => `
            <li>
              <a href="/tools/${this.categoryToPath(tool.category)}/${id}.html">${tool.name}</a>
            </li>
          `).join('');
        
        toolsList.innerHTML = allTools;
      }
    });
  }

  // Render breadcrumb navigation
  renderBreadcrumb(items = []) {
    const container = document.getElementById('breadcrumb');
    if (!container) return;

    if (items.length === 0) {
      items = this.generateBreadcrumbFromPath();
    }

    container.innerHTML = `
      <nav aria-label="Breadcrumb">
        <ol class="breadcrumb-list">
          ${items.map((item, index) => `
            <li class="breadcrumb-item${index === items.length - 1 ? ' active' : ''}">
              ${index < items.length - 1 
                ? `<a href="${item.url}">${item.name}</a>`
                : `<span>${item.name}</span>`
              }
            </li>
          `).join('')}
        </ol>
      </nav>
    `;
  }

  // Generate breadcrumb from path
  generateBreadcrumbFromPath() {
    const path = window.location.pathname;
    const segments = path.split('/').filter(Boolean);
    const breadcrumbs = [];
    
    const baseUrl = window.location.origin;
    
    breadcrumbs.push({ name: 'Home', url: baseUrl });

    let currentUrl = baseUrl;
    segments.forEach((segment) => {
      currentUrl += '/' + segment;
      
      const name = segment
        .replace(/-/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
      
      breadcrumbs.push({ name, url: currentUrl });
    });

    return breadcrumbs;
  }

  // Get SEO-friendly internal links for content
  getContentLinks(context = 'default') {
    const links = {
      homepage: { text: 'Home', url: '/' },
      categories: [],
      popularTools: [],
      guides: []
    };

    // Category links
    links.categories = (this.config?.categories || []).slice(0, 5).map(cat => ({
      text: `${cat.icon} ${cat.name}`,
      url: `/categories/${cat.id}.html`
    }));

    // Popular tools
    const popularIds = ['compress-image', 'merge-pdf', 'jpg-to-png', 'resize-image'];
    links.popularTools = popularIds
      .map(id => {
        const tool = this.config?.tools?.[id];
        return tool ? {
          text: tool.name,
          url: `/tools/${this.categoryToPath(tool.category)}/${id}.html`
        } : null;
      })
      .filter(Boolean);

    // Guide links
    links.guides = [
      { text: 'How to Compress Images', url: '/guides/how-to-compress-image.html' },
      { text: 'PDF Tips & Tricks', url: '/guides/pdf-tips.html' },
      { text: 'Image Format Guide', url: '/guides/image-formats.html' }
    ];

    return links;
  }

  // Inject contextual links into content
  injectContentLinks(selector, context = 'default') {
    const container = document.querySelector(selector);
    if (!container) return;

    const links = this.getContentLinks(context);
    
    // Add "See also" section
    const seeAlso = document.createElement('div');
    seeAlso.className = 'see-also-section';
    seeAlso.innerHTML = `
      <h3>See Also</h3>
      <ul>
        ${links.popularTools.map(link => `
          <li><a href="${link.url}">${link.text}</a></li>
        `).join('')}
      </ul>
    `;

    container.appendChild(seeAlso);
  }
}

// Create global internal links engine instance
window.internalLinks = new InternalLinksEngine();
