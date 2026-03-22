/**
 * Service to handle image upscaling requests to the backend API.
 */

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 2000;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const upscaleImage = async (base64Image: string, prompt?: string): Promise<string> => {
  let lastError: Error | unknown;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch('/api/upscale-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64: base64Image,
          prompt: prompt
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.url) {
        throw new Error("Invalid response from upscaler API");
      }

      return data.url;
    } catch (error: any) {
      lastError = error;
      console.error(`Upscale attempt ${attempt + 1} failed:`, error);
      
      if (attempt < MAX_RETRIES) {
        await delay(RETRY_DELAY_MS * (attempt + 1));
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error(String(lastError));
};
