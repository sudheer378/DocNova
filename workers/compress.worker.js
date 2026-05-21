/**
 * Compress Worker - Image Compression Processing
 * Browser Tools Platform
 */

self.onmessage = async function(e) {
  const { id, type, data } = e.data;

  try {
    switch (type) {
      case 'COMPRESS_IMAGE':
        await compressImage(data);
        break;
      case 'COMPRESS_TO_SIZE':
        await compressToTargetSize(data);
        break;
      default:
        throw new Error(`Unknown message type: ${type}`);
    }
  } catch (error) {
    self.postMessage({ id, error: error.message });
  }
};

/**
 * Compress image with quality adjustment
 */
async function compressImage(data) {
  const { imageData, format, quality, maxWidth, maxHeight } = data;

  // Create image from data URL
  const img = await loadImage(imageData);
  
  // Calculate new dimensions
  let width = img.width;
  let height = img.height;
  
  if (maxWidth && width > maxWidth) {
    height = Math.round((height * maxWidth) / width);
    width = maxWidth;
  }
  
  if (maxHeight && height > maxHeight) {
    width = Math.round((width * maxHeight) / height);
    height = maxHeight;
  }

  // Create canvas and compress
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, width, height);
  
  // Compress to target format
  const mimeType = `image/${format === 'jpg' ? 'jpeg' : format}`;
  const compressedDataUrl = canvas.toDataURL(mimeType, quality / 100);
  
  // Convert to blob
  const response = await fetch(compressedDataUrl);
  const blob = await response.blob();
  
  // Calculate compression ratio
  const originalSize = data.originalSize || imageData.length;
  const compressedSize = blob.size;
  const compressionRatio = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);

  self.postMessage({
    id,
    result: {
      blob,
      dataUrl: compressedDataUrl,
      width,
      height,
      originalSize,
      compressedSize,
      compressionRatio,
      format
    }
  });
}

/**
 * Compress image to target file size
 */
async function compressToTargetSize(data) {
  const { imageData, targetSizeKB, format } = data;
  const targetSizeBytes = targetSizeKB * 1024;

  const img = await loadImage(imageData);
  
  let quality = 95;
  let step = 5;
  let lastValidResult = null;
  
  while (quality > 0) {
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    
    const mimeType = `image/${format === 'jpg' ? 'jpeg' : format}`;
    const compressedDataUrl = canvas.toDataURL(mimeType, quality / 100);
    
    const response = await fetch(compressedDataUrl);
    const blob = await response.blob();
    
    if (blob.size <= targetSizeBytes) {
      lastValidResult = {
        blob,
        dataUrl: compressedDataUrl,
        width: img.width,
        height: img.height,
        originalSize: data.originalSize || imageData.length,
        compressedSize: blob.size,
        compressionRatio: ((data.originalSize - blob.size) / data.originalSize * 100).toFixed(1),
        format,
        quality
      };
      
      // If we're close enough to target, return
      if (targetSizeBytes - blob.size < 1024) {
        break;
      }
      
      // Fine-tune with smaller steps
      if (step > 1) {
        step = 1;
        quality += step;
      } else {
        break;
      }
    } else {
      quality -= step;
    }
    
    // Report progress
    self.postMessage({
      id,
      type: 'PROGRESS',
      progress: ((95 - quality) / 95) * 100
    });
  }
  
  if (!lastValidResult) {
    // Return lowest quality version even if it exceeds target
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    
    const mimeType = `image/${format === 'jpg' ? 'jpeg' : format}`;
    const compressedDataUrl = canvas.toDataURL(mimeType, 0.05);
    
    const response = await fetch(compressedDataUrl);
    const blob = await response.blob();
    
    lastValidResult = {
      blob,
      dataUrl: compressedDataUrl,
      width: img.width,
      height: img.height,
      originalSize: data.originalSize || imageData.length,
      compressedSize: blob.size,
      compressionRatio: ((data.originalSize - blob.size) / data.originalSize * 100).toFixed(1),
      format,
      quality: 5,
      warning: 'Could not reach target size. This is the lowest quality possible.'
    };
  }

  self.postMessage({ id, result: lastValidResult });
}

/**
 * Load image from data URL
 */
function loadImage(dataUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = dataUrl;
  });
}

/**
 * Helper: Read file as data URL (for worker internal use)
 */
function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}
