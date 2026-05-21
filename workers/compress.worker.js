/**
 * BrowserTools - Image Compression/Conversion Worker
 * Handles image compression, format conversion, and size-targeted compression
 */

self.onmessage = function(e) {
  const { type, data, callbackId } = e.data;
  
  try {
    if (type === 'compress') {
      handleCompress(data, callbackId);
    } else if (type === 'convert') {
      handleConvert(data, callbackId);
    } else if (type === 'resize') {
      handleResize(data, callbackId);
    }
  } catch (error) {
    self.postMessage({ callbackId, error: error.message });
  }
};

// Handle compression
function handleCompress(data, callbackId) {
  const { files, filenames, settings } = data;
  const { quality = 0.8, format = 'jpeg', targetSizeKB = null } = settings;
  
  const results = [];
  
  // Process first file (single file processing)
  if (files && files.length > 0) {
    const imageData = files[0];
    const originalName = filenames[0];
    
    // Create image from data
    const img = new Image();
    img.onload = () => {
      const outputFormat = format === 'png' ? 'image/png' : format === 'webp' ? 'image/webp' : 'image/jpeg';
      const extension = format === 'png' ? 'png' : format === 'webp' ? 'webp' : 'jpg';
      
      // Calculate dimensions
      let width = img.width;
      let height = img.height;
      
      // Create canvas
      const canvas = new OffscreenCanvas(width, height);
      const ctx = canvas.getContext('2d');
      
      // For JPEG, fill white background
      if (outputFormat === 'image/jpeg') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
      }
      
      ctx.drawImage(img, 0, 0);
      
      // Compression logic
      let currentQuality = quality;
      let blob;
      
      if (targetSizeKB) {
        // Iterative compression to reach target size
        const targetBytes = targetSizeKB * 1024;
        
        while (currentQuality > 0.05) {
          blob = canvas.convertToBlob({
            type: outputFormat,
            quality: currentQuality
          });
          
          if (blob.size <= targetBytes) break;
          currentQuality -= 0.05;
        }
        
        // If still too large, reduce dimensions
        if (blob.size > targetBytes) {
          let scale = 0.9;
          while (scale > 0.1 && blob.size > targetBytes) {
            const newWidth = Math.floor(width * scale);
            const newHeight = Math.floor(height * scale);
            
            const smallCanvas = new OffscreenCanvas(newWidth, newHeight);
            const smallCtx = smallCanvas.getContext('2d');
            
            if (outputFormat === 'image/jpeg') {
              smallCtx.fillStyle = '#FFFFFF';
              smallCtx.fillRect(0, 0, newWidth, newHeight);
            }
            
            smallCtx.drawImage(img, 0, 0, newWidth, newHeight);
            
            blob = smallCanvas.convertToBlob({
              type: outputFormat,
              quality: currentQuality
            });
            
            scale -= 0.1;
          }
        }
      } else {
        // Standard compression
        blob = canvas.convertToBlob({
          type: outputFormat,
          quality: currentQuality
        });
      }
      
      // Convert blob to ArrayBuffer
      blob.arrayBuffer().then(buffer => {
        const baseName = originalName.substring(0, originalName.lastIndexOf('.'));
        
        self.postMessage({
          callbackId,
          result: {
            success: true,
            files: [{
              data: buffer,
              name: `${baseName}-compressed.${extension}`,
              size: buffer.byteLength,
              mimeType: outputFormat
            }]
          }
        });
      });
    };
    
    img.onerror = () => {
      self.postMessage({
        callbackId,
        result: { success: false, error: 'Failed to load image' }
      });
    };
    
    // Load image
    const blob = new Blob([imageData], { type: 'image/*' });
    img.src = URL.createObjectURL(blob);
  }
}

// Handle format conversion
function handleConvert(data, callbackId) {
  const { files, filenames, settings } = data;
  const { targetFormat = 'png' } = settings;
  
  if (files && files.length > 0) {
    const imageData = files[0];
    const originalName = filenames[0];
    
    const img = new Image();
    img.onload = () => {
      const outputFormat = targetFormat === 'png' ? 'image/png' : 
                          targetFormat === 'webp' ? 'image/webp' : 'image/jpeg';
      const extension = targetFormat;
      
      const canvas = new OffscreenCanvas(img.width, img.height);
      const ctx = canvas.getContext('2d');
      
      if (outputFormat === 'image/jpeg') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, img.width, img.height);
      }
      
      ctx.drawImage(img, 0, 0);
      
      canvas.convertToBlob({ type: outputFormat, quality: 0.95 }).then(blob => {
        blob.arrayBuffer().then(buffer => {
          const baseName = originalName.substring(0, originalName.lastIndexOf('.'));
          
          self.postMessage({
            callbackId,
            result: {
              success: true,
              files: [{
                data: buffer,
                name: `${baseName}.${extension}`,
                size: buffer.byteLength,
                mimeType: outputFormat
              }]
            }
          });
        });
      });
    };
    
    img.onerror = () => {
      self.postMessage({
        callbackId,
        result: { success: false, error: 'Failed to load image' }
      });
    };
    
    const blob = new Blob([imageData], { type: 'image/*' });
    img.src = URL.createObjectURL(blob);
  }
}

// Handle resize
function handleResize(data, callbackId) {
  const { files, filenames, settings } = data;
  const { width: targetWidth, height: targetHeight, maintainAspectRatio = true } = settings;
  
  if (files && files.length > 0) {
    const imageData = files[0];
    const originalName = filenames[0];
    
    const img = new Image();
    img.onload = () => {
      let width = targetWidth || img.width;
      let height = targetHeight || img.height;
      
      if (maintainAspectRatio) {
        if (targetWidth && !targetHeight) {
          height = Math.round((img.height / img.width) * targetWidth);
        } else if (!targetWidth && targetHeight) {
          width = Math.round((img.width / img.height) * targetHeight);
        } else if (targetWidth && targetHeight) {
          // Maintain aspect ratio fitting within bounds
          const ratio = Math.min(targetWidth / img.width, targetHeight / img.height);
          width = Math.round(img.width * ratio);
          height = Math.round(img.height * ratio);
        }
      }
      
      const canvas = new OffscreenCanvas(width, height);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.convertToBlob({ type: 'image/jpeg', quality: 0.9 }).then(blob => {
        blob.arrayBuffer().then(buffer => {
          const baseName = originalName.substring(0, originalName.lastIndexOf('.'));
          
          self.postMessage({
            callbackId,
            result: {
              success: true,
              files: [{
                data: buffer,
                name: `${baseName}-${width}x${height}.jpg`,
                size: buffer.byteLength,
                mimeType: 'image/jpeg'
              }]
            }
          });
        });
      });
    };
    
    img.onerror = () => {
      self.postMessage({
        callbackId,
        result: { success: false, error: 'Failed to load image' }
      });
    };
    
    const blob = new Blob([imageData], { type: 'image/*' });
    img.src = URL.createObjectURL(blob);
  }
}
