/**
 * BrowserTools - SEO Engine
 * Centralized SEO metadata generation for tools, guides, and pages
 */

const SEOEngine = {
  config: {
    siteName: 'BrowserTools',
    siteUrl: 'https://browsertools.app',
    defaultTitle: 'Free Browser-Based PDF & Image Tools',
    defaultDescription: 'Compress, convert, resize, edit, and manage files instantly without uploading to servers. 100% browser-based, privacy-focused tools.'
  },
  
  // Generate complete SEO metadata
  generate(options = {}) {
    const {
      title,
      description,
      canonical,
      ogImage,
      type = 'website',
      keywords = [],
      toolData = null
    } = options;
    
    const meta = {
      title: title ? `${title} - ${this.config.siteName}` : this.config.defaultTitle,
      description: description || this.config.defaultDescription,
      canonical: canonical || window.location.href,
      keywords: keywords.join(', '),
      ogImage: ogImage || `${this.config.siteUrl}/assets/og-image.jpg`
    };
    
    return {
      ...meta,
      html: this.generateMetaTags(meta),
      jsonLd: toolData ? this.generateSchema(toolData) : this.generateWebsiteSchema()
    };
  },
  
  // Generate meta tags HTML
  generateMetaTags(meta) {
    return `
      <!-- Primary Meta Tags -->
      <title>${meta.title}</title>
      <meta name="description" content="${meta.description}" />
      <meta name="keywords" content="${meta.keywords}" />
      <link rel="canonical" href="${meta.canonical}" />
      
      <!-- Open Graph / Facebook -->
      <meta property="og:type" content="website" />
      <meta property="og:url" content="${meta.canonical}" />
      <meta property="og:title" content="${meta.title}" />
      <meta property="og:description" content="${meta.description}" />
      <meta property="og:image" content="${meta.ogImage}" />
      
      <!-- Twitter -->
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content="${meta.canonical}" />
      <meta name="twitter:title" content="${meta.title}" />
      <meta name="twitter:description" content="${meta.description}" />
      <meta name="twitter:image" content="${meta.ogImage}" />
      
      <!-- Additional SEO -->
      <meta name="robots" content="index, follow" />
      <meta name="author" content="${this.config.siteName}" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    `;
  },
  
  // Generate SoftwareApplication schema for tools
  generateSchema(toolData) {
    const {
      name,
      description,
      url,
      image,
      applicationCategory = 'UtilitiesApplication',
      operatingSystem = 'Web Browser',
      offers = { price: '0', priceCurrency: 'USD' },
      aggregateRating = null,
      reviewCount = null
    } = toolData;
    
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: name,
      description: description,
      url: url,
      image: image,
      applicationCategory: applicationCategory,
      operatingSystem: operatingSystem,
      offers: {
        '@type': 'Offer',
        price: offers.price,
        priceCurrency: offers.priceCurrency
      },
      isAccessibleForFree: true
    };
    
    if (aggregateRating) {
      schema.aggregateRating = {
        '@type': 'AggregateRating',
        ratingValue: aggregateRating.ratingValue,
        reviewCount: reviewCount || aggregateRating.reviewCount
      };
    }
    
    return JSON.stringify(schema);
  },
  
  // Generate FAQ schema
  generateFAQSchema(faqs) {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map(faq => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer
        }
      }))
    };
    
    return JSON.stringify(schema);
  },
  
  // Generate HowTo schema
  generateHowToSchema(howToData) {
    const {
      name,
      description,
      steps,
      totalTime = 'PT5M',
      supply = [],
      tool = []
    } = howToData;
    
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: name,
      description: description,
      totalTime: totalTime,
      step: steps.map((step, index) => ({
        '@type': 'HowToStep',
        position: index + 1,
        name: step.name,
        text: step.text,
        url: step.url || ''
      }))
    };
    
    if (supply.length > 0) {
      schema.supply = supply.map(s => ({ '@type': 'HowToSupply', name: s }));
    }
    
    if (tool.length > 0) {
      schema.tool = tool.map(t => ({ '@type': 'HowToTool', name: t }));
    }
    
    return JSON.stringify(schema);
  },
  
  // Generate Website schema
  generateWebsiteSchema() {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: this.config.siteName,
      url: this.config.siteUrl,
      description: this.config.defaultDescription,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${this.config.siteUrl}/?q={search_term_string}`,
        'query-input': 'required name=search_term_string'
      }
    };
    
    return JSON.stringify(schema);
  },
  
  // Generate BreadcrumbList schema
  generateBreadcrumbSchema(items) {
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
    
    return JSON.stringify(schema);
  },
  
  // Inject meta tags into document
  inject(meta) {
    // Set title
    document.title = meta.title;
    
    // Update or create meta description
    let descMeta = document.querySelector('meta[name="description"]');
    if (!descMeta) {
      descMeta = document.createElement('meta');
      descMeta.name = 'description';
      document.head.appendChild(descMeta);
    }
    descMeta.content = meta.description;
    
    // Update or create canonical
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = meta.canonical;
    
    // Inject JSON-LD
    if (meta.jsonLd) {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = meta.jsonLd;
      document.head.appendChild(script);
    }
  },
  
  // Tool-specific SEO generator
  generateToolSEO(toolConfig) {
    const {
      id,
      name,
      category,
      description,
      keywords,
      faqs = []
    } = toolConfig;
    
    const url = `${this.config.siteUrl}/tools/${category}/${id}.html`;
    const image = `${this.config.siteUrl}/assets/tools/${id}-og.jpg`;
    
    const meta = this.generate({
      title: name,
      description: description,
      canonical: url,
      keywords: keywords,
      ogImage: image,
      toolData: {
        name: name,
        description: description,
        url: url,
        image: image,
        applicationCategory: 'UtilitiesApplication'
      }
    });
    
    // Add FAQ schema if FAQs exist
    if (faqs.length > 0) {
      meta.jsonLd = [
        JSON.parse(meta.jsonLd),
        JSON.parse(this.generateFAQSchema(faqs))
      ];
    }
    
    return meta;
  }
};
