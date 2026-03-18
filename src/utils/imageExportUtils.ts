/**
 * Utilities for exporting images at specific resolutions and DPI.
 */

/**
 * Injects or replaces the EXIF/JFIF DPI headers in a base64 JPEG string.
 * @param base64 Output of canvas.toDataURL('image/jpeg')
 * @param dpi The DPI to set (e.g., 300)
 */
export const changeDpiDataUrl = (base64: string, dpi: number): string => {
  const dataParts = base64.split(',');
  if (dataParts.length !== 2) return base64;
  
  const headerString = dataParts[0];
  const isJpeg = headerString.includes('image/jpeg') || headerString.includes('image/jpg');
  
  if (!isJpeg) return base64; // DPI injection primarily implemented for JPEG here

  const binaryString = atob(dataParts[1]);
  const length = binaryString.length;
  const bytes = new Uint8Array(length);
  for (let i = 0; i < length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // JFIF marker check (FF E0 00 10 4A 46 49 46 00)
  if (
    bytes[0] === 0xFF && bytes[1] === 0xD8 && 
    bytes[2] === 0xFF && bytes[3] === 0xE0 &&
    bytes[6] === 0x4A && bytes[7] === 0x46 && bytes[8] === 0x49 && bytes[9] === 0x46 && bytes[10] === 0x00
  ) {
    // Modify JPEG JFIF headers in place
    // Byte 13: Units (1 = pixels/inch, 2 = pixels/cm)
    bytes[13] = 1; // dots per inch
    
    // Bytes 14/15: X density
    bytes[14] = Math.floor(dpi / 256);
    bytes[15] = dpi % 256;
    
    // Bytes 16/17: Y density
    bytes[16] = Math.floor(dpi / 256);
    bytes[17] = dpi % 256;
    
    // Reconstruct base64
    let modifiedBinary = '';
    const chunk = 8192;
    for (let i = 0; i < length; i += chunk) {
      modifiedBinary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunk)));
    }
    return `${headerString},${btoa(modifiedBinary)}`;
  }
  
  return base64; // Fallback if no valid JFIF block
};

/**
 * Loads an image from a URL or Base64 string, scales it so the longest edge 
 * matches the max dimension, and applies 300 DPI data.
 */
export const resizeAndFormatImage = async (
  sourceUrl: string,
  maxDimension: number,
  dpi: number = 300
): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    let src = sourceUrl;
    let isHttp = src.startsWith('http');
    
    if (isHttp) {
      try {
        const response = await fetch(src, { cache: 'no-cache' });
        if (!response.ok) throw new Error(`HTTP fetch failed: ${response.status}`);
        const blob = await response.blob();
        src = URL.createObjectURL(blob);
      } catch (err) {
        // Fallback to CORS proxy
        try {
          const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(src)}`;
          const response = await fetch(proxyUrl);
          const blob = await response.blob();
          src = URL.createObjectURL(blob);
        } catch (proxyErr) {
          return reject(proxyErr);
        }
      }
    }

    const img = new Image();
    if (isHttp) img.crossOrigin = "anonymous";
    
    img.onload = () => {
      if (isHttp && src.startsWith('blob:')) {
        URL.revokeObjectURL(src);
      }
      
      let { width, height } = img;
      
      // Calculate new dimensions to EXACTLY match maxDimension on the longest edge
      if (width > height) {
        height = Math.round((height * maxDimension) / width);
        width = maxDimension;
      } else {
        width = Math.round((width * maxDimension) / height);
        height = maxDimension;
      }
      
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return resolve(sourceUrl); // Fallback
      }
      
      ctx.drawImage(img, 0, 0, width, height);
      
      // Get highest quality JPEG base64
      const base64Jpeg = canvas.toDataURL('image/jpeg', 1.0);
      
      // Apply DPI
      const formattedBase64 = changeDpiDataUrl(base64Jpeg, dpi);
      resolve(formattedBase64);
    };
    
    img.onerror = () => {
      if (isHttp && src.startsWith('blob:')) {
        URL.revokeObjectURL(src);
      }
      reject(new Error("Failed to load image for resizing and formatting"));
    };
    
    img.src = src;
  });
};
