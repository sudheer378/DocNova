/* ========================================
   SEO ENGINE
   Generate meta tags, OpenGraph, schema.org
   ======================================== */

class SEOEngine {
  constructor() {
    this.config = window.TOOLSAAS_CONFIG?.seo || {};
  }

  // Initialize SEO for a page
  init(options = {}) {
    const {
      title,
      description,
      keywords,
      canonical,
      ogImage,
      type = 'website',
      toolId = null
    } = options;

    // Set title
    if (title) {
      this.setTitle(title);
    }

    // Set meta description
    if (description) {
      this.setMeta('description', description);
    }

    // Set keywords
    if (keywords) {
      this.setMeta('keywords', keywords);
    }

    // Set canonical URL
    if (canonical) {
      this.setCanonical(canonical);
    }

    // Set OpenGraph tags
    this.setOpenGraph({
      title: title || document.title,
      description: description || this.config.defaultDescription,
      image: ogImage || '/assets/images/og-default.png',
      type,
      url: canonical || window.location.href,
      siteName: this.config.appName || 'BrowserTools'
    });

    // Set Twitter Card
    this.setTwitterCard({
      card: 'summary_large_image',
      title: title || document.title,
      description: description || this.config.defaultDescription,
      image: ogImage || '/assets/images/og-default.png',
      creator: this.config.twitterHandle || '@browsertools'
    });

    // Add structured data
    if (toolId) {
      this.addToolSchema(toolId);
    } else {
      this.addWebsiteSchema();
    }

    // Add FAQ schema if FAQs exist
    this.addFAQSchema();

    // Add HowTo schema if instructions exist
    this.addHowToSchema();

    // Add BreadcrumbList schema
    this.addBreadcrumbSchema(options.breadcrumb || []);
  }

  // Set page title
  setTitle(title) {
    document.title = `${title} - ${this.config.appName || 'BrowserTools'}`;
    
    const titleEl = document.querySelector('title');
    if (titleEl) {
      titleEl.textContent = document.title;
    } else {
      const newTitle = document.createElement('title');
      newTitle.textContent = document.title;
      document.head.appendChild(newTitle);
    }
  }

  // Set meta tag
  setMeta(name, content, property = false) {
    let meta = document.querySelector(`meta[name="${name}"]`);
    
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute(property ? 'property' : 'name', name);
      document.head.appendChild(meta);
    }
    
    meta.setAttribute(property ? 'property' : 'name', name);
    meta.content = content;
  }

  // Set OpenGraph meta tags
  setOpenGraph(og) {
    const ogTags = {
      'og:title': og.title,
      'og:description': og.description,
      'og:image': og.image,
      'og:type': og.type,
      'og:url': og.url,
      'og:site_name': og.siteName
    };

    Object.entries(ogTags).forEach(([property, content]) => {
      this.setMeta(property, content, true);
    });
  }

  // Set Twitter Card meta tags
  setTwitterCard(twitter) {
    const twitterTags = {
      'twitter:card': twitter.card,
      'twitter:title': twitter.title,
      'twitter:description': twitter.description,
      'twitter:image': twitter.image,
      'twitter:creator': twitter.creator
    };

    Object.entries(twitterTags).forEach(([name, content]) => {
      this.setMeta(name, content, false);
    });
  }

  // Set canonical URL
  setCanonical(url) {
    let link = document.querySelector('link[rel="canonical"]');
    
    if (!link) {
      link = document.createElement('link');
      link.rel = 'canonical';
      document.head.appendChild(link);
    }
    
    link.href = url;
  }

  // Add JSON-LD structured data
  addStructuredData(data) {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(data);
    document.head.appendChild(script);
  }

  // SoftwareApplication schema for tools
  addToolSchema(toolId) {
    const config = window.TOOLSAAS_CONFIG;
    const tool = config?.tools?.[toolId];
    
    if (!tool) return;

    const category = config?.categories?.find(c => c.id === tool.category);

    const schema = {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: tool.name,
      description: tool.description,
      applicationCategory: category?.name || 'Utility',
      operatingSystem: 'Web Browser',
      applicationSubCategory: tool.category,
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD'
      },
      featureList: [
        'Browser-based processing',
        'No server uploads',
        '100% free',
        'Privacy-focused',
        'Mobile compatible'
      ],
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.9',
        ratingCount: '1000',
        bestRating: '5',
        worstRating: '1'
      }
    };

    this.addStructuredData(schema);
  }

  // WebSite schema
  addWebsiteSchema() {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: this.config.appName || 'BrowserTools',
      description: this.config.defaultDescription,
      url: this.config.baseUrl || window.location.origin,
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${window.location.origin}/search?q={search_term_string}`
        },
        'query-input': 'required name=search_term_string'
      }
    };

    this.addStructuredData(schema);
  }

  // FAQPage schema
  addFAQSchema() {
    const faqSection = document.getElementById('faq-schema-data');
    if (!faqSection) return;

    const faqs = [];
    const faqItems = faqSection.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
      const question = item.querySelector('.faq-question')?.textContent?.trim();
      const answer = item.querySelector('.faq-answer')?.textContent?.trim();
      
      if (question && answer) {
        faqs.push({
          '@type': 'Question',
          name: question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: answer
          }
        });
      }
    });

    if (faqs.length > 0) {
      const schema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs
      };

      this.addStructuredData(schema);
    }
  }

  // HowTo schema
  addHowToSchema() {
    const howtoSection = document.getElementById('howto-schema-data');
    if (!howtoSection) return;

    const steps = [];
    const stepElements = howtoSection.querySelectorAll('.howto-step');
    
    stepElements.forEach((step, index) => {
      const text = step.querySelector('.howto-text')?.textContent?.trim();
      if (text) {
        steps.push({
          '@type': 'HowToStep',
          position: index + 1,
          text
        });
      }
    });

    if (steps.length > 0) {
      const toolName = document.querySelector('h1')?.textContent?.trim() || 'This Tool';
      
      const schema = {
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name: `How to use ${toolName}`,
        description: `Step-by-step guide for using ${toolName}`,
        step: steps
      };

      this.addStructuredData(schema);
    }
  }

  // BreadcrumbList schema
  addBreadcrumbSchema(items = []) {
    if (items.length === 0) {
      // Auto-generate from current path
      items = this.generateBreadcrumbFromPath();
    }

    if (items.length === 0) return;

    const schema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: item.url
      }))
    };

    this.addStructuredData(schema);
  }

  // Generate breadcrumb from URL path
  generateBreadcrumbFromPath() {
    const path = window.location.pathname;
    const segments = path.split('/').filter(Boolean);
    const breadcrumbs = [];
    
    const baseUrl = window.location.origin;
    
    // Home
    breadcrumbs.push({
      name: 'Home',
      url: baseUrl
    });

    // Build breadcrumbs from path
    let currentUrl = baseUrl;
    segments.forEach((segment, index) => {
      currentUrl += '/' + segment;
      
      // Format segment name
      const name = segment
        .replace(/-/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
      
      breadcrumbs.push({
        name,
        url: currentUrl
      });
    });

    return breadcrumbs;
  }

  // Organization schema
  addOrganizationSchema() {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: this.config.appName || 'BrowserTools',
      url: this.config.baseUrl || window.location.origin,
      logo: `${this.config.baseUrl || window.location.origin}/assets/images/logo.png`,
      sameAs: [
        'https://twitter.com/browsertools',
        'https://facebook.com/browsertools'
      ]
    };

    this.addStructuredData(schema);
  }

  // Clean up structured data (for SPA navigation)
  clearStructuredData() {
    const scripts = document.querySelectorAll('script[type="application/ld+json"]');
    scripts.forEach(script => script.remove());
  }

  // Get current SEO data
  getSEOData() {
    return {
      title: document.title,
      description: document.querySelector('meta[name="description"]')?.content || '',
      keywords: document.querySelector('meta[name="keywords"]')?.content || '',
      canonical: document.querySelector('link[rel="canonical"]')?.href || '',
      ogTitle: document.querySelector('meta[property="og:title"]')?.content || '',
      ogDescription: document.querySelector('meta[property="og:description"]')?.content || '',
      ogImage: document.querySelector('meta[property="og:image"]')?.content || ''
    };
  }
}

// Create global SEO engine instance
window.seoEngine = new SEOEngine();
