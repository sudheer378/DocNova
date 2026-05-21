/**
 * Homepage JavaScript - Dynamic Content Loading
 * Browser Tools Platform
 */

// ========================================
// TOOL DATA
// ========================================

const TOOLS = {
  popular: [
    {
      id: 'compress-pdf',
      name: 'Compress PDF',
      description: 'Reduce PDF file size while maintaining quality',
      url: '/tools/pdf/compress-pdf.html',
      icon: '<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/></svg>',
      category: 'pdf'
    },
    {
      id: 'merge-pdf',
      name: 'Merge PDF',
      description: 'Combine multiple PDFs into one document',
      url: '/tools/pdf/merge-pdf.html',
      icon: '<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>',
      category: 'pdf'
    },
    {
      id: 'compress-image',
      name: 'Compress Image',
      description: 'Reduce image file size without losing quality',
      url: '/tools/image/compress-image.html',
      icon: '<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>',
      category: 'image'
    },
    {
      id: 'jpg-to-png',
      name: 'JPG to PNG',
      description: 'Convert JPG images to PNG format',
      url: '/tools/image/jpg-to-png.html',
      icon: '<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>',
      category: 'image'
    },
    {
      id: 'resize-image',
      name: 'Resize Image',
      description: 'Change image dimensions instantly',
      url: '/tools/image/resize-image.html',
      icon: '<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/></svg>',
      category: 'image'
    },
    {
      id: 'pdf-to-jpg',
      name: 'PDF to JPG',
      description: 'Extract pages from PDF as images',
      url: '/tools/pdf/pdf-to-jpg.html',
      icon: '<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
      category: 'pdf'
    }
  ],
  
  categories: [
    {
      id: 'pdf-tools',
      name: 'PDF Tools',
      description: 'Merge, split, compress, and convert PDFs',
      url: '/tools/pdf/',
      icon: '<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>',
      color: '#6C5CE7',
      tools: ['merge-pdf', 'split-pdf', 'compress-pdf', 'pdf-to-jpg', 'jpg-to-pdf', 'rotate-pdf', 'watermark-pdf', 'extract-pages', 'unlock-pdf']
    },
    {
      id: 'image-tools',
      name: 'Image Tools',
      description: 'Compress, convert, and edit images',
      url: '/tools/image/',
      icon: '<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>',
      color: '#00C2FF',
      tools: ['compress-image', 'jpg-to-png', 'png-to-jpg', 'webp-to-jpg', 'resize-image', 'crop-image']
    },
    {
      id: 'compression-tools',
      name: 'Compression Tools',
      description: 'Reduce file sizes for any format',
      url: '/tools/compression/',
      icon: '<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/></svg>',
      color: '#FF6B6B',
      tools: ['compress-pdf', 'compress-image', 'compress-image-to-20kb', 'compress-image-to-50kb', 'compress-image-to-100kb']
    },
    {
      id: 'conversion-tools',
      name: 'Conversion Tools',
      description: 'Convert between different formats',
      url: '/tools/conversion/',
      icon: '<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>',
      color: '#F59E0B',
      tools: ['pdf-to-jpg', 'jpg-to-pdf', 'jpg-to-png', 'png-to-jpg', 'webp-to-jpg']
    },
    {
      id: 'social-media-tools',
      name: 'Social Media Tools',
      description: 'Optimize images for social platforms',
      url: '/tools/social/',
      icon: '<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"/></svg>',
      color: '#EC4899',
      tools: ['youtube-thumbnail-maker', 'instagram-post-resizer', 'facebook-cover-resizer', 'whatsapp-dp-resizer']
    },
    {
      id: 'utility-tools',
      name: 'Utility Tools',
      description: 'Helpful utilities for everyday tasks',
      url: '/tools/utility/',
      icon: '<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>',
      color: '#10B981',
      tools: []
    }
  ],
  
  faqs: [
    {
      question: 'Are these tools really free?',
      answer: 'Yes! All our tools are 100% free with no hidden fees, subscriptions, or watermarks. You can use them as many times as you want without any limitations.'
    },
    {
      question: 'Are my files uploaded to a server?',
      answer: 'No! All processing happens entirely in your browser using Web Workers and modern web technologies. Your files never leave your device, ensuring complete privacy and security.'
    },
    {
      question: 'What file formats are supported?',
      answer: 'We support a wide range of formats including PDF, JPG, JPEG, PNG, WebP, GIF, and BMP. Different tools may have different format support - check individual tool pages for details.'
    },
    {
      question: 'Is there a file size limit?',
      answer: 'Since all processing happens in your browser, the main limitation is your device\'s available memory. Most modern browsers can handle files up to several hundred megabytes without issues.'
    },
    {
      question: 'Do I need to install anything?',
      answer: 'No installation required! Our tools run directly in your web browser. Just visit the website and start using the tools immediately. Works on Windows, Mac, Linux, iOS, and Android.'
    },
    {
      question: 'Can I use these tools offline?',
      answer: 'Some tools can work offline once the page has loaded, but an internet connection is recommended for the best experience and to access all features.'
    },
    {
      question: 'How does browser-based processing work?',
      answer: 'We use modern web technologies like WebAssembly, Canvas API, and Web Workers to process files directly in your browser. This provides fast processing while keeping your files private.'
    },
    {
      question: 'What browsers are supported?',
      answer: 'Our tools work on all modern browsers including Chrome, Firefox, Safari, Edge, and Opera. For the best experience, we recommend using the latest version of your preferred browser.'
    }
  ]
};

// ========================================
// DOM READY
// ========================================

document.addEventListener('DOMContentLoaded', () => {
  initToolSearch();
  renderPopularTools();
  renderCategories();
  renderFAQs();
  setupFAQAccordion();
});

// ========================================
// TOOL SEARCH
// ========================================

function initToolSearch() {
  const searchInput = document.getElementById('tool-search');
  if (!searchInput) return;

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    
    if (query.length < 2) {
      return;
    }
    
    // Simple search - in production, this would route to search results page
    console.log('Searching for:', query);
    // Could implement instant filtering or redirect to search page
  });
}

// ========================================
// RENDER POPULAR TOOLS
// ========================================

function renderPopularTools() {
  const container = document.getElementById('popular-tools');
  if (!container) return;

  container.innerHTML = TOOLS.popular.map(tool => createToolCard(tool)).join('');
}

// ========================================
// RENDER CATEGORIES
// ========================================

function renderCategories() {
  const container = document.getElementById('categories-grid');
  if (!container) return;

  container.innerHTML = TOOLS.categories.map(category => `
    <a href="${category.url}" class="glass-card category-card block">
      <div class="category-icon" style="background: linear-gradient(135deg, ${category.color} 0%, ${adjustColor(category.color, 20)} 100%)">
        ${category.icon}
      </div>
      <h3 class="mb-2">${category.name}</h3>
      <p class="text-gray-600 text-sm">${category.description}</p>
      <p class="text-xs text-gray-400 mt-2">${category.tools.length}+ tools</p>
    </a>
  `).join('');
}

// ========================================
// RENDER FAQs
// ========================================

function renderFAQs() {
  const container = document.getElementById('faq-container');
  if (!container) return;

  container.innerHTML = TOOLS.faqs.map((faq, index) => `
    <div class="faq-item glass-card p-4" data-index="${index}">
      <div class="faq-question">
        <span>${faq.question}</span>
        <svg class="w-5 h-5 transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
        </svg>
      </div>
      <div class="faq-answer">
        <p class="mt-3">${faq.answer}</p>
      </div>
    </div>
  `).join('');
}

// ========================================
// FAQ ACCORDION
// ========================================

function setupFAQAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    const icon = question.querySelector('svg');
    
    question.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      
      // Close all other items
      faqItems.forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.classList.remove('active');
          otherItem.querySelector('svg').style.transform = 'rotate(0deg)';
        }
      });
      
      // Toggle current item
      item.classList.toggle('active');
      icon.style.transform = isActive ? 'rotate(0deg)' : 'rotate(180deg)';
    });
  });
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Adjust color brightness
 */
function adjustColor(color, percent) {
  // Simple color adjustment - in production use a proper library
  return color;
}

/**
 * Create tool card HTML (imported from main.js if not available)
 */
function createToolCard(tool) {
  if (typeof window.createToolCard === 'function') {
    return window.createToolCard(tool);
  }
  
  return `
    <a href="${tool.url}" class="glass-card category-card block">
      <div class="category-icon">
        ${tool.icon}
      </div>
      <h3 class="mb-2">${tool.name}</h3>
      <p class="text-gray-600 text-sm">${tool.description}</p>
    </a>
  `;
}
