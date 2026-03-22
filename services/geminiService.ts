
// Removed GoogleGenAI client-side import
import { ALL_STYLES, ROOM_TYPES } from "../constants";
import { StagingStyle, RoomType } from "../types";
import { httpsCallable } from "firebase/functions";
import { functions } from "./firebase";

const MAX_RETRIES = 3;
const BASE_DELAY = 2000; // Start with 2 seconds

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

const resizeImage = async (base64Str: string, maxDimension: number): Promise<{base64: string, width: number, height: number}> => {
  return new Promise(async (resolve, reject) => {
    let src = base64Str;
    let isHttp = base64Str.startsWith('http');
    
    if (isHttp) {
      try {
        const response = await fetch(base64Str, { cache: 'no-cache' });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const blob = await response.blob();
        src = URL.createObjectURL(blob);
      } catch (err) {
        // Fallback to proxy if direct fetch fails (CORS)
        try {
          const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(base64Str)}`;
          const response = await fetch(proxyUrl);
          const blob = await response.blob();
          src = URL.createObjectURL(blob);
        } catch (proxyErr) {
          console.error("Failed to fetch image for resizing:", proxyErr);
          return reject(new Error("Failed to load image for resizing"));
        }
      }
    }

    const img = new Image();
    if (isHttp) {
      img.crossOrigin = "anonymous";
    }
    
    img.onload = () => {
      if (isHttp && src.startsWith('blob:')) {
        URL.revokeObjectURL(src);
      }
      
      let { width, height } = img;
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      } else {
        // If image is already smaller, return original to avoid quality loss
        // But if it's an HTTP URL, we must convert it to base64
        if (isHttp) {
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve({ base64: canvas.toDataURL('image/jpeg', 0.92), width, height });
            return;
          }
        }
        resolve({ base64: base64Str, width, height });
        return;
      }
      
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve({ base64: base64Str, width, height });
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      resolve({ base64: canvas.toDataURL('image/jpeg', 0.92), width, height });
    };
    
    img.onerror = (e) => {
      if (isHttp && src.startsWith('blob:')) {
        URL.revokeObjectURL(src);
      }
      reject(new Error("Failed to load image for resizing"));
    };
    
    img.src = src;
  });
};

const getClosestSupportedAspectRatio = (width: number, height: number): string => {
  const targetRatio = width / height;
  const supportedRatios = [
    { ratio: 1/1, str: "1:1" },
    { ratio: 3/4, str: "3:4" },
    { ratio: 4/3, str: "4:3" },
    { ratio: 9/16, str: "9:16" },
    { ratio: 16/9, str: "16:9" },
    { ratio: 3/2, str: "3:2" },
    { ratio: 2/3, str: "2:3" },
    { ratio: 1/4, str: "1:4" },
    { ratio: 1/8, str: "1:8" },
    { ratio: 4/1, str: "4:1" },
    { ratio: 8/1, str: "8:1" }
  ];
  
  let closest = supportedRatios[0];
  let minDiff = Math.abs(targetRatio - closest.ratio);
  
  for (const r of supportedRatios) {
    const diff = Math.abs(targetRatio - r.ratio);
    if (diff < minDiff) {
      minDiff = diff;
      closest = r;
    }
  }
  
  return closest.str;
};

export const stageRoom = async (
  base64Image: string, 
  styleId: StagingStyle, 
  roomType: RoomType,
  refinementPrompt?: string,
  isRefinement: boolean = false,
  imageSize: "1K" | "2K" | "4K" = "2K"
): Promise<string> => {
  const style = ALL_STYLES.find(s => s.id === styleId);
  const roomLabel = ROOM_TYPES.find(r => r.id === roomType)?.label || 'Room';
  
  if (!style) throw new Error("Invalid style selected");

  // Resize image based on requested output size to prevent "Unable to process input image" errors
  let maxDim = 1024;
  if (imageSize === "2K") maxDim = 2048;
  if (imageSize === "4K") maxDim = 4096;
  
  const { base64: processedBase64, width, height } = await resizeImage(base64Image, maxDim);
  const closestAspectRatio = getClosestSupportedAspectRatio(width, height);

  const architecturalPreservationInstruction = `
    CRITICAL ARCHITECTURAL PRESERVATION:
    - You MUST maintain absolute architectural fidelity. 
    - DO NOT change, warp, or distort the perspective of the room.
    - DO NOT crop or change the boundaries of the image.
    - DO NOT modify walls, floors, ceilings, windows, window frames, doors, baseboards, or crown molding.
    - All vertical lines in the architecture must remain perfectly vertical.
    - All built-in features like kitchen cabinetry, islands, and fireplaces must remain exactly as they appear in the original.
  `;

  const qualityInstruction = `
    QUALITY AND PHOTOREALISM TARGETS:
    - ALL generated content MUST be hyper-realistic and completely indistinguishable from real life.
    - Generate ultra-high resolution, razor-sharp textures for all added furniture, fabric, plants, and decor.
    - CRITICAL: Aggressively PREVENT any 'AI-smoothed', blurry, plastic, painted, or pixelated artifacts on new objects and environment.
    - CRITICAL EXTERIOR DETAIL: Foliage, grass blades, trees, and landscaping MUST be rendered with explicit micro-contrast, showing individual leaves and photographic crispness. Do NOT generate smeared or blobby green masses.
    - Match professional 8k real-estate photography standards with perfect focal sharpness, heavy realism, clean noise-free digital sensor output, and cinematic lighting.
  `;

  let prompt = '';

  // Special handling for Add/Remove Objects style
  if (styleId === 'add-remove') {
      if (!refinementPrompt || refinementPrompt.trim().length === 0) {
          throw new Error("You must enter a description in the Custom Refinement box for the 'Add/Remove Objects' style.");
      }

      prompt = `
        TASK: Precise Image Editing and Object Manipulation.
        CONTEXT: You are editing a photo of a ${roomLabel}.
        INSTRUCTION: "${refinementPrompt}"
        ${architecturalPreservationInstruction}
        ${qualityInstruction}
        STRICT RULES:
        1. EXECUTE the instruction precisely (add, remove, or change specific items).
        2. FREEZE all other parts of the image.
        3. Ensure new objects fit the exact perspective and lighting of the scene.
        4. PRESERVE the exact dimensions and aspect ratio of the source.
      `;
  } 
  else if (styleId === 'empty') {
      prompt = `
        TASK: Professional Architectural Room Emptying.
        OBJECTIVE: ${style.prompt}
        ${refinementPrompt ? `USER REFINEMENT INSTRUCTIONS: ${refinementPrompt}` : ''}
        ${architecturalPreservationInstruction}
        ${qualityInstruction}
        STRICT RULES:
        1. DELETE all loose furniture and clutter.
        2. MAINTAIN all architectural details with 100% fidelity.
        3. PRESERVE built-in features (cabinets, appliances, etc.).
        4. PRESERVE the exact dimensions and aspect ratio.
      `;
  }
  else if (isRefinement && refinementPrompt) {
      prompt = `
        TASK: Precise Image Editing for Real Estate.
        CONTEXT: You are editing a photo of a ${roomLabel}.
        INSTRUCTION: "${refinementPrompt}"
        ${architecturalPreservationInstruction}
        ${qualityInstruction}
        STRICT RULES:
        1. EXECUTE the instruction precisely.
        2. FREEZE all other parts of the image.
        3. Maintain photorealism.
        4. PRESERVE the exact dimensions and aspect ratio.
      `;
  } else {
      // Standard Staging
      if (style.category === 'interior') {
        prompt = `
          TASK: Professional Virtual Real Estate Staging for a ${roomLabel}.
          STYLE TO APPLY: ${style.label} - ${style.prompt}
          ${refinementPrompt ? `USER REFINEMENT INSTRUCTIONS: ${refinementPrompt}` : ''}
          ${architecturalPreservationInstruction}
          ${qualityInstruction}
          STRICT RULES:
          1. Add high-end, realistic furniture appropriate for a ${roomLabel}.
          2. Only add or replace "loose" items.
          3. Perfect integration of lighting and shadows.
          4. PRESERVE the exact dimensions and aspect ratio.
        `;
      } else {
        prompt = `
          TASK: Professional Real Estate Photo Editing - Outdoor/Exterior Enhancement.
          STYLE TO APPLY: ${style.label} - ${style.prompt}
          ${refinementPrompt ? `USER REFINEMENT INSTRUCTIONS: ${refinementPrompt}` : ''}
          ${architecturalPreservationInstruction}
          ${qualityInstruction}
          STRICT EXTERIOR RULES:
          1. Preserve the house architecture perfectly.
          2. Focus on environment, landscaping, and sky.
          3. Landscaping (grass, trees, plants) MUST be photorealistic, raw, and razor-sharp. Avoid any soft 'oil-painting' look on foliage at all costs.
          4. Maintain photorealistic outdoor lighting.
          5. PRESERVE the exact dimensions and aspect ratio.
        `;
      }
  }

  let lastError: Error | unknown;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      // Call the secure Firebase function
      const generateImage = httpsCallable<{imageBase64: string, prompt: string}, {base64: string}>(functions, 'generateImage');
      const result = await generateImage({
        imageBase64: processedBase64,
        prompt: prompt
      });

      const data = result.data;
      
      if (!data.base64) {
        throw new Error("No image data returned from Firebase API");
      }

      const outputData = `data:image/jpeg;base64,${data.base64}`;
      return outputData;

    } catch (error: any) {
      // Prevent circular reference errors by creating a clean error object with only primitive properties
      const errorMsg = String(error?.message || "Unknown error occurred during generation");
      const safeError = new Error(errorMsg);
      
      // Safely copy code/status if they exist and are primitives
      if (error?.code && (typeof error.code === 'string' || typeof error.code === 'number')) {
        (safeError as any).code = error.code;
      }
      if (error?.status && (typeof error.status === 'string' || typeof error.status === 'number')) {
        (safeError as any).status = error.status;
      }
      
      lastError = safeError;

      const status = (safeError as any).status || (safeError as any).code;
      const isRetryable = status === 503 || status === 429;
      
      if (isRetryable && attempt < MAX_RETRIES) {
        const delay = BASE_DELAY * Math.pow(2, attempt);
        await sleep(delay);
        continue;
      }
      break;
    }
  }

  throw lastError;
};
