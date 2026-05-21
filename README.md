# BrowserTools - Premium SaaS Platform

Free browser-based PDF and image tools platform built for privacy, performance, and scalability.

## Features

- **100% Client-Side Processing**: All files processed in-browser, never uploaded to servers
- **Web Workers**: Background processing for optimal performance
- **Responsive Design**: Works on desktop, tablet, and mobile
- **SEO Optimized**: Complete schema markup, sitemaps, and AEO foundation
- **Privacy First**: No data collection, GDPR compliant

## Project Structure

```
/workspace
├── index.html              # Homepage
├── about.html              # About page
├── contact.html            # Contact page
├── robots.txt              # Robots configuration
├── sitemap.xml             # Main sitemap
├── llms.txt                # AI search optimization
├── vercel.json             # Vercel deployment config
├── css/
│   └── styles.css          # Global design system
├── js/
│   ├── main.js             # Core utilities
│   └── homepage.js         # Homepage scripts
├── workers/
│   ├── compress.worker.js  # Image compression
│   ├── convert.worker.js   # Format conversion
│   ├── resize.worker.js    # Image resizing
│   └── pdf.worker.js       # PDF operations
├── tools/
│   ├── image/              # Image tools
│   ├── pdf/                # PDF tools
│   └── social/             # Social media tools
├── templates/
│   └── tool-template.html  # Reusable tool template
├── legal/
│   ├── privacy-policy.html
│   ├── terms-of-service.html
│   ├── cookie-policy.html
│   └── disclaimer.html
└── assets/                 # Images and static files
```

## Quick Start

1. Clone the repository
2. Deploy to Vercel (zero configuration needed)
3. Or serve locally: `npx serve .`

## Deployment

```bash
# Deploy to Vercel
vercel deploy --prod

# Local development
npx serve .
```

## Technologies

- Vanilla JavaScript (ES6+)
- Web Workers for background processing
- OffscreenCanvas for image operations
- CSS Custom Properties for theming
- JSON-LD for structured data

## License

MIT License
