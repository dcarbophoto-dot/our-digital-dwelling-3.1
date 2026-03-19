const MAX_RETRIES = 2;
const BASE_DELAY = 1500;
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

export const upscaleImage = async (base64Image: string): Promise<string> => {
  let lastError: Error | unknown;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch('/api/upscale-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64Image })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.url) {
        throw new Error("No image URL returned from upscaler API");
      }

      return data.url;

    } catch (error: any) {
      lastError = error;
      if (attempt < MAX_RETRIES) {
        await sleep(BASE_DELAY * Math.pow(2, attempt));
        continue;
      }
      break;
    }
  }

  throw lastError;
};
