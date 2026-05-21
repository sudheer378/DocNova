/* ========================================
   CONVERT WORKER
   Format conversion using Canvas API
   ======================================== */

self.onmessage = async function(e) {
  const { type, taskId, data } = e.data;

  if (type === 'process') {
    try {
      const result = await processConversion(data);
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

async function processConversion(data) {
  const { files, settings } = data;
  const { targetFormat = 'image/png', quality = 0.9 } = settings;

  if (!files || files.length === 0) {
    throw new Error('No files provided');
  }

  const results = [];

  for (const file of files) {
    const result = await convertFile(file, targetFormat, quality);
    results.push(result);
  }

  return {
    success: true,
    files: results,
    count: results.length
  };
}

async function convertFile(file, targetFormat, quality) {
  const originalSize = file.data.byteLength;

  // Create image from ArrayBuffer
  const blob = new Blob([file.data], { type: file.type });
  const img = await createImageBitmap(blob);

  const width = img.width;
  const height = img.height;

  // Create canvas and draw
  const offCanvas = new OffscreenCanvas(width, height);
  const offCtx = offCanvas.getContext('2d');
  offCtx.imageSmoothingEnabled = true;
  offCtx.imageSmoothingQuality = 'high';
  offCtx.drawImage(img, 0, 0, width, height);

  // Convert to target format
  const convertedBlob = await offCanvas.convertToBlob({
    type: targetFormat,
    quality: quality
  });

  const convertedSize = convertedBlob.size;
  const arrayBuffer = await convertedBlob.arrayBuffer();

  return {
    success: true,
    data: arrayBuffer,
    blobType: targetFormat,
    filename: generateFilename(file.name, targetFormat),
    originalSize,
    convertedSize,
    width,
    height,
    originalFormat: file.type,
    targetFormat
  };
}

function generateFilename(originalName, format) {
  const ext = format.split('/')[1] || 'png';
  const baseName = originalName.replace(/\.[^/.]+$/, '');
  const timestamp = Date.now();
  return `${baseName}_converted_${timestamp}.${ext}`;
}
