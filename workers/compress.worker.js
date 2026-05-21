/* ========================================
   COMPRESS WORKER
   Image compression using Canvas API
   ======================================== */

let ctx = null;
let canvas = null;

// Initialize OffscreenCanvas for better performance
function initCanvas() {
  if (typeof OffscreenCanvas !== 'undefined') {
    canvas = new OffscreenCanvas(1, 1);
    ctx = canvas.getContext('2d');
  }
}

initCanvas();

self.onmessage = async function(e) {
  const { type, taskId, data } = e.data;

  if (type === 'process') {
    try {
      const result = await processCompression(data);
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

async function processCompression(data) {
  const { files, settings } = data;
  const { quality = 0.8, maxWidth = null, maxHeight = null, format = 'image/jpeg', targetSizeKB = null } = settings;

  if (!files || files.length === 0) {
    throw new Error('No files provided');
  }

  const file = files[0];
  
  // If target size specified, use iterative compression
  if (targetSizeKB) {
    return compressToTargetSize(file, targetSizeKB, format);
  }

  const originalSize = file.data.byteLength;

  // Create image from ArrayBuffer
  const blob = new Blob([file.data], { type: file.type });
  const img = await createImageBitmap(blob);

  // Calculate dimensions
  let width = img.width;
  let height = img.height;

  if (maxWidth && width > maxWidth) {
    height = Math.round(height * maxWidth / width);
    width = maxWidth;
  }

  if (maxHeight && height > maxHeight) {
    width = Math.round(width * maxHeight / height);
    height = maxHeight;
  }

  // Create canvas and draw
  const offCanvas = new OffscreenCanvas(width, height);
  const offCtx = offCanvas.getContext('2d');
  offCtx.imageSmoothingEnabled = true;
  offCtx.imageSmoothingQuality = 'high';
  offCtx.drawImage(img, 0, 0, width, height);

  // Compress with quality setting
  const compressedBlob = await offCanvas.convertToBlob({
    type: format,
    quality: quality
  });

  const compressedSize = compressedBlob.size;
  const compressionRatio = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);

  // Convert blob to ArrayBuffer for transfer
  const arrayBuffer = await compressedBlob.arrayBuffer();

  return {
    success: true,
    data: arrayBuffer,
    blobType: format,
    filename: generateFilename(file.name, format),
    originalSize,
    compressedSize,
    compressionRatio,
    width,
    height,
    format
  };
}

// Iterative compression to reach target size
async function compressToTargetSize(file, targetSizeKB, format = 'image/jpeg') {
  const targetSize = targetSizeKB * 1024;
  const originalSize = file.data.byteLength;

  const blob = new Blob([file.data], { type: file.type });
  const img = await createImageBitmap(blob);

  let width = img.width;
  let height = img.height;
  let quality = 0.95;
  let attempts = 0;
  const maxAttempts = 20;

  let currentBlob = null;

  while (attempts < maxAttempts) {
    attempts++;

    // Create canvas
    const offCanvas = new OffscreenCanvas(width, height);
    const offCtx = offCanvas.getContext('2d');
    offCtx.imageSmoothingEnabled = true;
    offCtx.imageSmoothingQuality = 'high';
    offCtx.drawImage(img, 0, 0, width, height);

    currentBlob = await offCanvas.convertToBlob({
      type: format,
      quality: quality
    });

    if (currentBlob.size <= targetSize || quality <= 0.1) {
      break;
    }

    // Reduce quality
    quality -= 0.05;

    // If quality is too low, reduce dimensions
    if (quality < 0.3 && currentBlob.size > targetSize) {
      width = Math.round(width * 0.9);
      height = Math.round(height * 0.9);
      quality = 0.6;
    }
  }

  const arrayBuffer = await currentBlob.arrayBuffer();

  return {
    success: true,
    data: arrayBuffer,
    blobType: format,
    filename: generateFilename(file.name, format),
    originalSize,
    compressedSize: currentBlob.size,
    compressionRatio: ((originalSize - currentBlob.size) / originalSize * 100).toFixed(1),
    width,
    height,
    format,
    finalQuality: quality
  };
}

function generateFilename(originalName, format) {
  const ext = format.split('/')[1] || 'jpg';
  const baseName = originalName.replace(/\.[^/.]+$/, '');
  const timestamp = Date.now();
  return `${baseName}_compressed_${timestamp}.${ext}`;
}
