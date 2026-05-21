/**
 * BrowserTools - Internal Linking Engine
 * Automatic related tools, category links, and guide links generation
 */

const InternalLinks = {
  // Tool relationships database
  toolRelations: {
    'compress-image': ['resize-image', 'jpg-to-png', 'compress-image-to-20kb', 'webp-to-jpg'],
    'compress-image-to-20kb': ['compress-image', 'compress-image-to-50kb', 'compress-image-to-100kb'],
    'compress-image-to-50kb': ['compress-image-to-20kb', 'compress-image-to-100kb', 'compress-image'],
    'compress-image-to-100kb': ['compress-image-to-50kb', 'compress-image-to-20kb', 'compress-image'],
    'jpg-to-png': ['png-to-jpg', 'webp-to-jpg', 'convert-pdf-to-jpg'],
    'png-to-jpg': ['jpg-to-png', 'webp-to-jpg', 'convert-pdf-to-jpg'],
    'webp-to-jpg': ['jpg-to-png', 'png-to-jpg', 'jpg-to-webp'],
    'resize-image': ['crop-image', 'compress-image', 'image-upscaler'],
    'crop-image': ['resize-image', 'compress-image', 'remove-background'],
    'remove-background': ['compress-image', 'jpg-to-png', 'resize-image'],
    'image-upscaler': ['resize-image', 'compress-image', 'enhance-image'],
    'merge-pdf': ['split-pdf', 'compress-pdf', 'pdf-to-jpg', 'jpg-to-pdf'],
    'split-pdf': ['merge-pdf', 'extract-pages', 'compress-pdf'],
    'compress-pdf': ['merge-pdf', 'split-pdf', 'pdf-to-jpg'],
    'pdf-to-jpg': ['jpg-to-pdf', 'pdf-to-png', 'extract-pages'],
    'jpg-to-pdf': ['pdf-to-jpg', 'merge-pdf', 'png-to-pdf'],
    'rotate-pdf': ['merge-pdf', 'split-pdf', 'compress-pdf'],
    'watermark-pdf': ['merge-pdf', 'compress-pdf', 'unlock-pdf'],
    'extract-pages': ['split-pdf', 'merge-pdf', 'pdf-to-jpg'],
    'unlock-pdf': ['compress-pdf', 'merge-pdf', 'split-pdf'],
    'youtube-thumbnail-maker': ['resize-image', 'instagram-post-resizer', 'facebook-cover-resizer'],
    'instagram-post-resizer': ['youtube-thumbnail-maker', 'facebook-cover-resizer', 'resize-image'],
    'facebook-cover-resizer': ['youtube-thumbnail-maker', 'instagram-post-resizer', 'resize-image'],
    'whatsapp-dp-resizer': ['instagram-post-resizer', 'resize-image', 'crop-image']
  },
  
  // Category mappings
  categories: {
    pdf: ['merge-pdf', 'split-pdf', 'compress-pdf', 'pdf-to-jpg', 'jpg-to-pdf', 'rotate-pdf', 'watermark-pdf', 'extract-pages', 'unlock-pdf'],
    image: ['compress-image', 'jpg-to-png', 'png-to-jpg', 'webp-to-jpg', 'resize-image', 'crop-image', 'remove-background', 'image-upscaler'],
    compression: ['compress-image', 'compress-image-to-20kb', 'compress-image-to-50kb', 'compress-image-to-100kb', 'compress-pdf'],
    conversion: ['jpg-to-png', 'png-to-jpg', 'webp-to-jpg', 'pdf-to-jpg', 'jpg-to-pdf'],
    resize: ['resize-image', 'crop-image', 'image-upscaler'],
    social: ['youtube-thumbnail-maker', 'instagram-post-resizer', 'facebook-cover-resizer', 'whatsapp-dp-resizer']
  },
  
  // Guide mappings
  guides: {
    'compress-image': [
      'how-to-compress-image-without-losing-quality',
      'best-image-compression-settings-for-web',
      'reduce-image-file-size-for-email'
    ],
    'compress-image-to-20kb': [
      'how-to-compress-image-to-20kb',
      'compress-image-for-whatsapp-profile',
      'reduce-image-size-for-upload'
    ],
    'jpg-to-png': [
      'how-to-convert-jpg-to-png',
      'jpg-vs-png-when-to-use-each',
      'convert-image-to-transparent-png'
    ],
    'resize-image': [
      'how-to-resize-image-without-losing-quality',
      'best-image-dimensions-for-social-media',
      'resize-image-for-print'
    ],
    'merge-pdf': [
      'how-to-merge-multiple-pdfs',
      'combine-pdf-files-online-free',
      'merge-pdfs-in-correct-order'
    ],
    'pdf-to-jpg': [
      'how-to-convert-pdf-to-jpg-images',
      'extract-images-from-pdf',
      'save-pdf-pages-as-images'
    ]
  },
  
  // Generate related tools for a given tool
  getRelatedTools(toolId, limit = 4) {
    const related = this.toolRelations[toolId] || [];
    
    // If no specific relations, get from same category
    if (related.length === 0) {
      const category = this.getToolCategory(toolId);
      if (category) {
        const categoryTools = this.categories[category];
        return categoryTools
          .filter(t => t !== toolId)
          .slice(0, limit);
      }
    }
    
    return related.slice(0, limit);
  },
  
  // Get tool category
  getToolCategory(toolId) {
    for (const [category, tools] of Object.entries(this.categories)) {
      if (tools.includes(toolId)) {
        return category;
      }
    }
    return null;
  },
  
  // Generate related tools HTML
  generateRelatedToolsHTML(toolId, limit = 4) {
    const relatedIds = this.getRelatedTools(toolId, limit);
    
    if (relatedIds.length === 0) return '';
    
    const toolNames = {
      'compress-image': 'Compress Image',
      'compress-image-to-20kb': 'Compress to 20KB',
      'compress-image-to-50kb': 'Compress to 50KB',
      'compress-image-to-100kb': 'Compress to 100KB',
      'jpg-to-png': 'JPG to PNG',
      'png-to-jpg': 'PNG to JPG',
      'webp-to-jpg': 'WEBP to JPG',
      'resize-image': 'Resize Image',
      'crop-image': 'Crop Image',
      'remove-background': 'Remove Background',
      'image-upscaler': 'Image Upscaler',
      'merge-pdf': 'Merge PDF',
      'split-pdf': 'Split PDF',
      'compress-pdf': 'Compress PDF',
      'pdf-to-jpg': 'PDF to JPG',
      'jpg-to-pdf': 'JPG to PDF',
      'rotate-pdf': 'Rotate PDF',
      'watermark-pdf': 'Watermark PDF',
      'extract-pages': 'Extract Pages',
      'unlock-pdf': 'Unlock PDF',
      'youtube-thumbnail-maker': 'YouTube Thumbnail Maker',
      'instagram-post-resizer': 'Instagram Post Resizer',
      'facebook-cover-resizer': 'Facebook Cover Resizer',
      'whatsapp-dp-resizer': 'WhatsApp DP Resizer'
    };
    
    const categoryIcons = {
      pdf: '📄',
      image: '🖼️',
      compression: '🗜️',
      conversion: '🔄',
      resize: '📐',
      social: '📱'
    };
    
    return `
      <div class="related-tools-section mt-12">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Related Tools</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          ${relatedIds.map(id => {
            const category = this.getToolCategory(id);
            const name = toolNames[id] || id;
            const icon = categoryIcons[category] || '🛠️';
            
            return `
              <a href="/tools/${category}/${id}.html" 
                 class="related-tool-card glass-card p-4 rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div class="text-3xl mb-2">${icon}</div>
                <h3 class="font-semibold text-gray-900 dark:text-white">${name}</h3>
                <span class="text-sm text-purple-600 dark:text-purple-400">Free Tool →</span>
              </a>
            `;
          }).join('')}
        </div>
      </div>
    `;
  },
  
  // Generate related guides HTML
  generateRelatedGuidesHTML(toolId, limit = 3) {
    const guideIds = this.guides[toolId] || [];
    
    if (guideIds.length === 0) return '';
    
    const guideTitles = {
      'how-to-compress-image-without-losing-quality': 'How to Compress Image Without Losing Quality',
      'best-image-compression-settings-for-web': 'Best Image Compression Settings for Web',
      'reduce-image-file-size-for-email': 'Reduce Image File Size for Email',
      'how-to-compress-image-to-20kb': 'How to Compress Image to 20KB',
      'compress-image-for-whatsapp-profile': 'Compress Image for WhatsApp Profile',
      'reduce-image-size-for-upload': 'Reduce Image Size for Upload',
      'how-to-convert-jpg-to-png': 'How to Convert JPG to PNG',
      'jpg-vs-png-when-to-use-each': 'JPG vs PNG: When to Use Each',
      'convert-image-to-transparent-png': 'Convert Image to Transparent PNG',
      'how-to-resize-image-without-losing-quality': 'How to Resize Image Without Losing Quality',
      'best-image-dimensions-for-social-media': 'Best Image Dimensions for Social Media',
      'resize-image-for-print': 'Resize Image for Print',
      'how-to-merge-multiple-pdfs': 'How to Merge Multiple PDFs',
      'combine-pdf-files-online-free': 'Combine PDF Files Online Free',
      'merge-pdfs-in-correct-order': 'Merge PDFs in Correct Order',
      'how-to-convert-pdf-to-jpg-images': 'How to Convert PDF to JPG Images',
      'extract-images-from-pdf': 'Extract Images from PDF',
      'save-pdf-pages-as-images': 'Save PDF Pages as Images'
    };
    
    return `
      <div class="related-guides-section mt-12">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Related Guides</h2>
        <div class="space-y-4">
          ${guideIds.slice(0, limit).map(id => {
            const title = guideTitles[id] || id;
            return `
              <a href="/guides/${id}.html" 
                 class="guide-link block p-4 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors">
                <h3 class="font-semibold text-gray-900 dark:text-white">${title}</h3>
                <span class="text-sm text-purple-600 dark:text-purple-400">Read Guide →</span>
              </a>
            `;
          }).join('')}
        </div>
      </div>
    `;
  },
  
  // Generate category navigation HTML
  generateCategoryNavHTML(currentCategory) {
    const categories = [
      { id: 'pdf', name: 'PDF Tools', icon: '📄' },
      { id: 'image', name: 'Image Tools', icon: '🖼️' },
      { id: 'compression', name: 'Compression', icon: '🗜️' },
      { id: 'conversion', name: 'Conversion', icon: '🔄' },
      { id: 'resize', name: 'Resize', icon: '📐' },
      { id: 'social', name: 'Social Media', icon: '📱' }
    ];
    
    return `
      <nav class="category-nav mb-8">
        <ul class="flex flex-wrap gap-2">
          ${categories.map(cat => `
            <li>
              <a href="/tools/${cat.id}/" 
                 class="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors
                        ${currentCategory === cat.id 
                          ? 'bg-purple-600 text-white' 
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-purple-100 dark:hover:bg-purple-900/20'}">
                <span>${cat.icon}</span>
                <span>${cat.name}</span>
              </a>
            </li>
          `).join('')}
        </ul>
      </nav>
    `;
  },
  
  // Generate breadcrumb HTML
  generateBreadcrumbHTML(items) {
    return `
      <nav class="breadcrumb mb-6" aria-label="Breadcrumb">
        <ol class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          ${items.map((item, index) => `
            <li class="flex items-center gap-2">
              ${index > 0 ? '<span class="text-gray-400">/</span>' : ''}
              ${index === items.length - 1 
                ? `<span class="text-gray-900 dark:text-white font-medium">${item.name}</span>`
                : `<a href="${item.url}" class="hover:text-purple-600 dark:hover:text-purple-400">${item.name}</a>`}
            </li>
          `).join('')}
        </ol>
      </nav>
    `;
  },
  
  // Inject all internal links into page
  injectIntoPage(toolId, containerSelectors = {}) {
    const {
      relatedToolsContainer = '#relatedTools',
      relatedGuidesContainer = '#relatedGuides',
      categoryNavContainer = '#categoryNav',
      breadcrumbContainer = '#breadcrumb'
    } = containerSelectors;
    
    // Related tools
    if (relatedToolsContainer) {
      const el = document.querySelector(relatedToolsContainer);
      if (el) el.innerHTML = this.generateRelatedToolsHTML(toolId);
    }
    
    // Related guides
    if (relatedGuidesContainer) {
      const el = document.querySelector(relatedGuidesContainer);
      if (el) el.innerHTML = this.generateRelatedGuidesHTML(toolId);
    }
    
    // Category nav
    if (categoryNavContainer) {
      const el = document.querySelector(categoryNavContainer);
      const category = this.getToolCategory(toolId);
      if (el) el.innerHTML = this.generateCategoryNavHTML(category);
    }
    
    // Breadcrumb
    if (breadcrumbContainer) {
      const el = document.querySelector(breadcrumbContainer);
      const category = this.getToolCategory(toolId);
      if (el) {
        const breadcrumbs = [
          { name: 'Home', url: '/' },
          { name: 'Tools', url: '/tools/' },
          { name: category ? Config.categories[category]?.name : 'Tools', url: `/tools/${category}/` },
          { name: document.title.replace(' - BrowserTools', '') }
        ];
        el.innerHTML = this.generateBreadcrumbHTML(breadcrumbs);
      }
    }
  }
};
