/**
 * Format Conversion Worker
 * Handles image format conversions
 */

self.onmessage = function(e) {
  const { type, data, callback } = e.data;
  
  if (type !== 'convert') return;
  
  try {
    const { imageData, fromFormat, toFormat, quality } = data;
    
    const img = new Image();
    img.onload = () => {
      const canvas = new OffscreenCanvas(img.width, img.height);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      
      const mimeType = `image/${toFormat.toLowerCase()}`;
      const blob = canvas.convertToBlob({
        type: mimeType,
        quality: quality || 0.9
      });
      
      blob.arrayBuffer().then(buffer => {
        callback({ 
          success: true, 
          result: buffer,
          format: toFormat
        });
      });
    };
    
    img.onerror = () => {
      callback({ success: false, error: 'Failed to load image' });
    };
    
    const blob = new Blob([imageData], { type: `image/${fromFormat.toLowerCase()}` });
    img.src = URL.createObjectURL(blob);
    
  } catch (error) {
    callback({ success: false, error: error.message });
  }
};
