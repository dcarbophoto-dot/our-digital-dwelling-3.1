/**
 * Service to handle image upscaling requests to the backend API.
 */

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 2000;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const upscaleImage = async (base64Image: string, prompt?: string, imageType: 'interior' | 'exterior' = 'interior'): Promise<string> => {
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
          prompt: prompt,
          imageType: imageType
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with ${response.status}`);
      }

      const data = await response.json();
      
      // If the API returns a direct URL (backward compatibility)
      if (data.url) {
        return data.url;
      }
      
      if (!data.predictionId) {
        throw new Error("Invalid response from upscaler API");
      }

      // Poll the prediction
      const predictionId = data.predictionId;
      let isProcessing = true;
      let finalUrl = '';
      
      while (isProcessing) {
        await delay(2000);
        const pollResponse = await fetch(`/api/poll-upscale?id=${predictionId}`);
        
        if (!pollResponse.ok) {
          throw new Error(`Polling failed with status ${pollResponse.status}`);
        }
        
        const pollData = await pollResponse.json();
        if (pollData.status === 'succeeded') {
          isProcessing = false;
          if (!pollData.url) {
            throw new Error("Polling succeeded but no URL was returned");
          }
          finalUrl = pollData.url;
        } else if (pollData.status === 'failed' || pollData.status === 'canceled') {
          throw new Error("Prediction failed during polling");
        }
      }
      
      return finalUrl;
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
