/**
 * Image Resize Worker
 * Handles image resizing operations
 */

self.onmessage = function(e) {
  const { type, data, callback } = e.data;
  
  if (type !== 'resize') return;
  
  try {
    const { imageData, width, height, maintainAspectRatio, fitMode } = data;
    
    const img = new Image();
    img.onload = () => {
      let newWidth = width || img.width;
      let newHeight = height || img.height;
      
      if (maintainAspectRatio) {
        const ratio = Math.min(newWidth / img.width, newHeight / img.height);
        newWidth = img.width * ratio;
        newHeight = img.height * ratio;
      }
      
      const canvas = new OffscreenCanvas(newWidth, newHeight);
      const ctx = canvas.getContext('2d');
      
      // Better quality scaling
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      if (fitMode === 'contain') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, newWidth, newHeight);
        const x = (newWidth - img.width) / 2;
        const y = (newHeight - img.height) / 2;
        ctx.drawImage(img, x, y);
      } else if (fitMode === 'cover') {
        const scale = Math.max(newWidth / img.width, newHeight / img.height);
        const x = (newWidth - img.width * scale) / 2;
        const y = (newHeight - img.height * scale) / 2;
        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
      } else {
        ctx.drawImage(img, 0, 0, newWidth, newHeight);
      }
      
      canvas.convertToBlob({ type: 'image/jpeg', quality: 0.9 }).then(blob => {
        blob.arrayBuffer().then(buffer => {
          callback({ 
            success: true, 
            result: buffer,
            width: newWidth,
            height: newHeight
          });
        });
      });
    };
    
    img.onerror = () => {
      callback({ success: false, error: 'Failed to load image' });
    };
    
    const blob = new Blob([imageData], { type: 'image/jpeg' });
    img.src = URL.createObjectURL(blob);
    
  } catch (error) {
    callback({ success: false, error: error.message });
  }
};
