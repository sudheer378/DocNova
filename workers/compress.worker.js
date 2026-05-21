/**
 * Image Compression Worker
 * Handles image compression in background thread
 */

self.onmessage = function(e) {
  const { type, data, callback } = e.data;
  
  if (type !== 'compress') return;
  
  try {
    const { imageData, quality, maxWidth, maxHeight, targetSize } = data;
    
    // Create image from data
    const img = new Image();
    img.onload = () => {
      // Calculate new dimensions
      let width = img.width;
      let height = img.height;
      
      if (maxWidth && width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      if (maxHeight && height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }
      
      // Create canvas
      const canvas = new OffscreenCanvas(width, height);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      
      // Compress
      let currentQuality = quality || 0.8;
      let blob;
      
      if (targetSize) {
        // Iterative compression to reach target size
        while (currentQuality > 0.1) {
          blob = canvas.convertToBlob({
            type: 'image/jpeg',
            quality: currentQuality
          });
          
          if (blob.size <= targetSize) break;
          currentQuality -= 0.1;
        }
      } else {
        blob = canvas.convertToBlob({
          type: 'image/jpeg',
          quality: currentQuality
        });
      }
      
      // Convert blob to ArrayBuffer
      blob.arrayBuffer().then(buffer => {
        callback({ 
          success: true, 
          result: buffer,
          originalSize: imageData.byteLength,
          compressedSize: buffer.byteLength,
          reduction: Math.round((1 - buffer.byteLength / imageData.byteLength) * 100)
        });
      });
    };
    
    img.onerror = () => {
      callback({ success: false, error: 'Failed to load image' });
    };
    
    // Convert ArrayBuffer to Blob URL for loading
    const blob = new Blob([imageData], { type: 'image/jpeg' });
    img.src = URL.createObjectURL(blob);
    
  } catch (error) {
    callback({ success: false, error: error.message });
  }
};
