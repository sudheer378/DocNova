/* ========================================
   RESIZE WORKER
   Image resizing using Canvas API
   ======================================== */

self.onmessage = async function(e) {
  const { type, taskId, data } = e.data;

  if (type === 'process') {
    try {
      const result = await processResize(data);
      self.postMessage({
        type: 'complete',
        taskId,
        result
      });
    } catch (error) {
      self.postMessage({
        type: 'error',
        taskId,
        error: error.message
      });
    }
  }
};

async function processResize(data) {
  const { files, settings } = data;
  const { 
    width = null, 
    height = null, 
    fitMode = 'contain', // contain, cover, fill, stretch
    maintainAspectRatio = true,
    format = null,
    quality = 0.9
  } = settings;

  if (!files || files.length === 0) {
    throw new Error('No files provided');
  }

  const results = [];

  for (const file of files) {
    const result = await resizeFile(file, { 
      width, 
      height, 
      fitMode, 
      maintainAspectRatio,
      format,
      quality
    });
    results.push(result);
  }

  return {
    success: true,
    files: results,
    count: results.length
  };
}

async function resizeFile(file, options) {
  const { width, height, fitMode, maintainAspectRatio, format, quality } = options;
  const originalSize = file.data.byteLength;

  // Create image from ArrayBuffer
  const blob = new Blob([file.data], { type: file.type });
  const img = await createImageBitmap(blob);

  const originalWidth = img.width;
  const originalHeight = img.height;

  // Calculate new dimensions
  let newWidth = width || originalWidth;
  let newHeight = height || originalHeight;

  if (maintainAspectRatio && width && height) {
    // Calculate based on fit mode
    const ratio = Math.min(width / originalWidth, height / originalHeight);
    
    if (fitMode === 'cover') {
      const ratioMax = Math.max(width / originalWidth, height / originalHeight);
      newWidth = Math.round(originalWidth * ratioMax);
      newHeight = Math.round(originalHeight * ratioMax);
    } else {
      // contain (default)
      newWidth = Math.round(originalWidth * ratio);
      newHeight = Math.round(originalHeight * ratio);
    }
  } else if (maintainAspectRatio && width && !height) {
    // Only width specified, maintain aspect ratio
    newHeight = Math.round(originalHeight * width / originalWidth);
  } else if (maintainAspectRatio && height && !width) {
    // Only height specified, maintain aspect ratio
    newWidth = Math.round(originalWidth * height / originalHeight);
  }

  // Create canvas and draw
  const offCanvas = new OffscreenCanvas(newWidth, newHeight);
  const offCtx = offCanvas.getContext('2d');
  offCtx.imageSmoothingEnabled = true;
  offCtx.imageSmoothingQuality = 'high';
  
  // Draw with proper scaling
  if (fitMode === 'cover' && width && height) {
    // Scale to cover entire area, then crop
    const scale = Math.max(width / originalWidth, height / originalHeight);
    const scaledWidth = originalWidth * scale;
    const scaledHeight = originalHeight * scale;
    const offsetX = (width - scaledWidth) / 2;
    const offsetY = (height - scaledHeight) / 2;
    
    offCtx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight);
  } else {
    // Standard scaling
    offCtx.drawImage(img, 0, 0, newWidth, newHeight);
  }

  // Determine output format
  const outputFormat = format || file.type;

  // Convert to blob
  const resizedBlob = await offCanvas.convertToBlob({
    type: outputFormat,
    quality: quality
  });

  const resizedSize = resizedBlob.size;
  const arrayBuffer = await resizedBlob.arrayBuffer();

  return {
    success: true,
    data: arrayBuffer,
    blobType: outputFormat,
    filename: generateFilename(file.name, outputFormat),
    originalSize,
    resizedSize,
    originalWidth,
    originalHeight,
    newWidth,
    newHeight,
    format: outputFormat
  };
}

// Preset sizes for social media platforms
const socialPresets = {
  'instagram-post': { width: 1080, height: 1080 },
  'instagram-story': { width: 1080, height: 1920 },
  'facebook-post': { width: 1200, height: 630 },
  'facebook-cover': { width: 820, height: 312 },
  'twitter-post': { width: 1200, height: 675 },
  'twitter-header': { width: 1500, height: 500 },
  'youtube-thumbnail': { width: 1280, height: 720 },
  'youtube-banner': { width: 2560, height: 1440 },
  'linkedin-post': { width: 1200, height: 627 },
  'linkedin-banner': { width: 1584, height: 396 },
  'whatsapp-dp': { width: 500, height: 500 },
  'passport-photo': { width: 600, height: 600 } // Approximate passport size
};

function generateFilename(originalName, format) {
  const ext = format.split('/')[1] || 'jpg';
  const baseName = originalName.replace(/\.[^/.]+$/, '');
  const timestamp = Date.now();
  return `${baseName}_resized_${timestamp}.${ext}`;
}
