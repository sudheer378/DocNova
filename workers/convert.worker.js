/**
 * Convert Worker - Format Conversion Processing
 * Browser Tools Platform
 */

self.onmessage = async function(e) {
  const { id, type, data } = e.data;

  try {
    switch (type) {
      case 'CONVERT_IMAGE':
        await convertImage(data);
        break;
      case 'CONVERT_PDF_TO_JPG':
        await convertPdfToJpg(data);
        break;
      case 'CONVERT_JPG_TO_PDF':
        await convertJpgToPdf(data);
        break;
      default:
        throw new Error(`Unknown message type: ${type}`);
    }
  } catch (error) {
    self.postMessage({ id, error: error.message });
  }
};

/**
 * Convert image between formats
 */
async function convertImage(data) {
  const { imageData, fromFormat, toFormat, quality = 95 } = data;

  // Load source image
  const img = await loadImage(imageData);

  // Create canvas with original dimensions
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;

  const ctx = canvas.getContext('2d');
  
  // Handle transparency for PNG to JPG conversion
  if (toFormat === 'jpg' || toFormat === 'jpeg') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  
  ctx.drawImage(img, 0, 0);

  // Convert to target format
  const mimeType = `image/${toFormat === 'jpg' ? 'jpeg' : toFormat}`;
  const convertedDataUrl = canvas.toDataURL(mimeType, quality / 100);

  // Convert to blob
  const response = await fetch(convertedDataUrl);
  const blob = await response.blob();

  self.postMessage({
    id,
    result: {
      blob,
      dataUrl: convertedDataUrl,
      width: img.width,
      height: img.height,
      fromFormat,
      toFormat,
      size: blob.size
    }
  });
}

/**
 * Convert PDF pages to JPG images
 * Note: Full PDF parsing requires pdf.js library
 * This is a simplified version that would be enhanced with pdf.js
 */
async function convertPdfToJpg(data) {
  const { pdfData, quality = 90, scale = 2 } = data;
  const pages = [];

  // In production, this would use pdf.js to render PDF pages
  // For now, we'll return a placeholder structure
  
  // Example of how it would work with pdf.js:
  /*
  const loadingTask = pdfjsLib.getDocument({ data: pdfData });
  const pdf = await loadingTask.promise;
  
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale });
    
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    
    await page.render({
      canvasContext: context,
      viewport: viewport
    }).promise;
    
    const dataUrl = canvas.toDataURL('image/jpeg', quality / 100);
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    
    pages.push({
      pageNumber: pageNum,
      blob,
      dataUrl,
      width: canvas.width,
      height: canvas.height
    });
    
    self.postMessage({
      id,
      type: 'PROGRESS',
      progress: (pageNum / pdf.numPages) * 100
    });
  }
  */

  // Placeholder - in production implement with pdf.js
  self.postMessage({
    id,
    result: {
      pages,
      totalPages: pages.length,
      format: 'jpg',
      note: 'PDF conversion requires pdf.js library integration'
    }
  });
}

/**
 * Convert JPG images to PDF
 * Note: Full PDF generation requires pdf-lib or jsPDF library
 * This is a simplified version
 */
async function convertJpgToPdf(data) {
  const { imageData, pageSize = 'A4', orientation = 'portrait' } = data;

  // Load image to get dimensions
  const img = await loadImage(imageData);

  // In production, this would use pdf-lib or jsPDF to create PDF
  // For now, we'll return a placeholder structure
  
  // Example of how it would work with jsPDF:
  /*
  const { jsPDF } = window.jspdf;
  
  // Calculate page dimensions
  let pageWidth, pageHeight;
  if (pageSize === 'A4') {
    pageWidth = orientation === 'portrait' ? 210 : 297;
    pageHeight = orientation === 'portrait' ? 297 : 210;
  }
  
  // Calculate image dimensions to fit page
  const imgRatio = img.width / img.height;
  let drawWidth, drawHeight;
  
  if (imgRatio > pageWidth / pageHeight) {
    drawWidth = pageWidth - 20; // 10mm margin each side
    drawHeight = drawWidth / imgRatio;
  } else {
    drawHeight = pageHeight - 20;
    drawWidth = drawHeight * imgRatio;
  }
  
  const pdf = new jsPDF({
    orientation,
    unit: 'mm',
    format: pageSize.toLowerCase()
  });
  
  pdf.addImage(imageData, 'JPEG', 10, 10, drawWidth, drawHeight);
  const pdfBlob = pdf.output('blob');
  */

  // Placeholder - in production implement with pdf-lib or jsPDF
  self.postMessage({
    id,
    result: {
      blob: null,
      note: 'JPG to PDF conversion requires pdf-lib or jsPDF library integration',
      imageWidth: img.width,
      imageHeight: img.height
    }
  });
}

/**
 * Resize image to specific dimensions
 */
async function resizeImage(data) {
  const { imageData, width, height, maintainAspectRatio = true, fitMode = 'contain' } = data;

  const img = await loadImage(imageData);

  let newWidth = width;
  let newHeight = height;

  if (maintainAspectRatio) {
    const imgRatio = img.width / img.height;
    const targetRatio = width / height;

    if (fitMode === 'contain') {
      if (imgRatio > targetRatio) {
        newWidth = width;
        newHeight = Math.round(width / imgRatio);
      } else {
        newHeight = height;
        newWidth = Math.round(height * imgRatio);
      }
    } else if (fitMode === 'cover') {
      if (imgRatio > targetRatio) {
        newHeight = height;
        newWidth = Math.round(height * imgRatio);
      } else {
        newWidth = width;
        newHeight = Math.round(width / imgRatio);
      }
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Center the image for contain mode
  if (fitMode === 'contain') {
    const x = (width - newWidth) / 2;
    const y = (height - newHeight) / 2;
    ctx.drawImage(img, x, y, newWidth, newHeight);
  } else {
    ctx.drawImage(img, 0, 0, newWidth, newHeight);
  }

  const dataUrl = canvas.toDataURL('image/png');
  const response = await fetch(dataUrl);
  const blob = await response.blob();

  self.postMessage({
    id,
    result: {
      blob,
      dataUrl,
      width: canvas.width,
      height: canvas.height,
      actualWidth: newWidth,
      actualHeight: newHeight
    }
  });
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
