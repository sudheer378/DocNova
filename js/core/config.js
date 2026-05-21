/* ========================================
   GLOBAL CONFIGURATION
   ======================================== */

window.TOOLSAAS_CONFIG = {
  appName: 'BrowserTools',
  appVersion: '1.0.0',
  baseUrl: window.location.origin,
  
  // Feature flags
  features: {
    darkMode: true,
    analytics: false,
    pwa: true
  },
  
  // File limits
  limits: {
    maxFileSize: 50 * 1024 * 1024, // 50MB
    maxFiles: 10,
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp', 'image/tiff'],
    allowedPdfTypes: ['application/pdf']
  },
  
  // Worker paths
  workers: {
    compress: '/workers/compress.worker.js',
    convert: '/workers/convert.worker.js',
    resize: '/workers/resize.worker.js',
    pdf: '/workers/pdf.worker.js'
  },
  
  // SEO defaults
  seo: {
    defaultTitle: 'Free Browser-Based PDF & Image Tools',
    defaultDescription: 'Compress, convert, resize, edit, and manage files instantly without uploading to servers. 100% free, secure, and private.',
    defaultKeywords: 'pdf tools, image tools, compress image, convert pdf, resize image, browser tools, free online tools',
    author: 'BrowserTools',
    twitterHandle: '@browsertools'
  },
  
  // Categories
  categories: [
    { id: 'pdf', name: 'PDF Tools', icon: '📄', color: '#6C5CE7' },
    { id: 'image-compression', name: 'Image Compression', icon: '🗜️', color: '#00C2FF' },
    { id: 'image-conversion', name: 'Image Conversion', icon: '🔄', color: '#FF6B6B' },
    { id: 'image-resize', name: 'Image Resize', icon: '📐', color: '#00D2A0' },
    { id: 'image-editing', name: 'Image Editing', icon: '✏️', color: '#FFA502' },
    { id: 'social-media', name: 'Social Media', icon: '📱', color: '#E056FD' },
    { id: 'utility', name: 'Utility Tools', icon: '🛠️', color: '#686DE0' }
  ],
  
  // Tool registry for programmatic generation
  tools: {
    // PDF Tools
    'merge-pdf': { category: 'pdf', name: 'Merge PDF', description: 'Combine multiple PDFs into one' },
    'split-pdf': { category: 'pdf', name: 'Split PDF', description: 'Extract pages from PDF' },
    'compress-pdf': { category: 'pdf', name: 'Compress PDF', description: 'Reduce PDF file size' },
    'pdf-to-jpg': { category: 'pdf', name: 'PDF to JPG', description: 'Convert PDF pages to images' },
    'jpg-to-pdf': { category: 'pdf', name: 'JPG to PDF', description: 'Convert images to PDF' },
    'rotate-pdf': { category: 'pdf', name: 'Rotate PDF', description: 'Rotate PDF pages' },
    'watermark-pdf': { category: 'pdf', name: 'Watermark PDF', description: 'Add watermark to PDF' },
    'extract-pages': { category: 'pdf', name: 'Extract Pages', description: 'Extract specific pages from PDF' },
    'unlock-pdf': { category: 'pdf', name: 'Unlock PDF', description: 'Remove PDF password' },
    'protect-pdf': { category: 'pdf', name: 'Protect PDF', description: 'Add password to PDF' },
    'reorder-pdf-pages': { category: 'pdf', name: 'Reorder PDF Pages', description: 'Rearrange PDF pages' },
    'delete-pdf-pages': { category: 'pdf', name: 'Delete PDF Pages', description: 'Remove pages from PDF' },
    'pdf-to-png': { category: 'pdf', name: 'PDF to PNG', description: 'Convert PDF to PNG images' },
    'png-to-pdf': { category: 'pdf', name: 'PNG to PDF', description: 'Convert PNG to PDF' },
    
    // Image Compression
    'compress-image': { category: 'image-compression', name: 'Compress Image', description: 'Reduce image file size' },
    'compress-image-to-10kb': { category: 'image-compression', name: 'Compress to 10KB', description: 'Compress image to 10KB' },
    'compress-image-to-20kb': { category: 'image-compression', name: 'Compress to 20KB', description: 'Compress image to 20KB' },
    'compress-image-to-30kb': { category: 'image-compression', name: 'Compress to 30KB', description: 'Compress image to 30KB' },
    'compress-image-to-50kb': { category: 'image-compression', name: 'Compress to 50KB', description: 'Compress image to 50KB' },
    'compress-image-to-100kb': { category: 'image-compression', name: 'Compress to 100KB', description: 'Compress image to 100KB' },
    'compress-image-to-200kb': { category: 'image-compression', name: 'Compress to 200KB', description: 'Compress image to 200KB' },
    'compress-image-to-500kb': { category: 'image-compression', name: 'Compress to 500KB', description: 'Compress image to 500KB' },
    'compress-image-to-1mb': { category: 'image-compression', name: 'Compress to 1MB', description: 'Compress image to 1MB' },
    
    // Image Conversion
    'jpg-to-png': { category: 'image-conversion', name: 'JPG to PNG', description: 'Convert JPG to PNG' },
    'png-to-jpg': { category: 'image-conversion', name: 'PNG to JPG', description: 'Convert PNG to JPG' },
    'webp-to-jpg': { category: 'image-conversion', name: 'WebP to JPG', description: 'Convert WebP to JPG' },
    'jpg-to-webp': { category: 'image-conversion', name: 'JPG to WebP', description: 'Convert JPG to WebP' },
    'png-to-webp': { category: 'image-conversion', name: 'PNG to WebP', description: 'Convert PNG to WebP' },
    'heic-to-jpg': { category: 'image-conversion', name: 'HEIC to JPG', description: 'Convert HEIC to JPG' },
    'svg-to-png': { category: 'image-conversion', name: 'SVG to PNG', description: 'Convert SVG to PNG' },
    'gif-to-png': { category: 'image-conversion', name: 'GIF to PNG', description: 'Convert GIF to PNG' },
    'bmp-to-jpg': { category: 'image-conversion', name: 'BMP to JPG', description: 'Convert BMP to JPG' },
    'tiff-to-jpg': { category: 'image-conversion', name: 'TIFF to JPG', description: 'Convert TIFF to JPG' },
    
    // Image Resize
    'resize-image': { category: 'image-resize', name: 'Resize Image', description: 'Change image dimensions' },
    'resize-image-for-instagram': { category: 'image-resize', name: 'Instagram Resizer', description: 'Resize for Instagram' },
    'resize-image-for-facebook': { category: 'image-resize', name: 'Facebook Resizer', description: 'Resize for Facebook' },
    'resize-image-for-youtube': { category: 'image-resize', name: 'YouTube Resizer', description: 'Resize for YouTube' },
    'resize-image-for-whatsapp': { category: 'image-resize', name: 'WhatsApp Resizer', description: 'Resize for WhatsApp' },
    'resize-image-for-linkedin': { category: 'image-resize', name: 'LinkedIn Resizer', description: 'Resize for LinkedIn' },
    'resize-image-to-passport-size': { category: 'image-resize', name: 'Passport Size', description: 'Resize to passport photo' },
    
    // Image Editing
    'crop-image': { category: 'image-editing', name: 'Crop Image', description: 'Crop image to desired area' },
    'rotate-image': { category: 'image-editing', name: 'Rotate Image', description: 'Rotate image' },
    'flip-image': { category: 'image-editing', name: 'Flip Image', description: 'Flip image horizontally/vertically' },
    'blur-image': { category: 'image-editing', name: 'Blur Image', description: 'Apply blur effect' },
    'pixelate-image': { category: 'image-editing', name: 'Pixelate Image', description: 'Apply pixelation effect' },
    'add-watermark': { category: 'image-editing', name: 'Add Watermark', description: 'Add text/image watermark' },
    'remove-background': { category: 'image-editing', name: 'Remove Background', description: 'Remove image background' },
    'image-upscaler': { category: 'image-editing', name: 'Image Upscaler', description: 'Increase image resolution' },
    'ai-image-enhancer': { category: 'image-editing', name: 'AI Image Enhancer', description: 'Enhance image quality with AI' },
    
    // Social Media
    'youtube-thumbnail-maker': { category: 'social-media', name: 'YouTube Thumbnail Maker', description: 'Create YouTube thumbnails' },
    'instagram-post-resizer': { category: 'social-media', name: 'Instagram Post Resizer', description: 'Resize for Instagram posts' },
    'instagram-story-resizer': { category: 'social-media', name: 'Instagram Story Resizer', description: 'Resize for Instagram stories' },
    'facebook-cover-maker': { category: 'social-media', name: 'Facebook Cover Maker', description: 'Create Facebook covers' },
    'twitter-banner-maker': { category: 'social-media', name: 'Twitter Banner Maker', description: 'Create Twitter banners' },
    'linkedin-banner-maker': { category: 'social-media', name: 'LinkedIn Banner Maker', description: 'Create LinkedIn banners' },
    'whatsapp-dp-maker': { category: 'social-media', name: 'WhatsApp DP Maker', description: 'Create WhatsApp profile pictures' },
    
    // Utility
    'qr-code-generator': { category: 'utility', name: 'QR Code Generator', description: 'Generate QR codes' },
    'barcode-generator': { category: 'utility', name: 'Barcode Generator', description: 'Generate barcodes' },
    'favicon-generator': { category: 'utility', name: 'Favicon Generator', description: 'Create favicons' },
    'base64-image-converter': { category: 'utility', name: 'Base64 Converter', description: 'Convert image to Base64' },
    'exif-remover': { category: 'utility', name: 'EXIF Remover', description: 'Remove EXIF metadata' },
    'image-metadata-viewer': { category: 'utility', name: 'Metadata Viewer', description: 'View image metadata' }
  }
};
