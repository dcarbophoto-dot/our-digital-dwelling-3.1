import Replicate from "replicate";
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Set Vercel execution timeout to max (60s) for Pro, hobby tier ignores this and caps at 10s.
export const config = {
  maxDuration: 60,
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const apiToken = process.env.REPLICATE_API_TOKEN;
    if (!apiToken) {
      return res.status(500).json({ error: 'Replicate API Token is missing from server configuration. Please check your .env file or Vercel dashboard.' });
    }

    const replicate = new Replicate({
      auth: apiToken,
    });

    const { imageBase64, prompt } = req.body;
    
    if (!imageBase64) {
      return res.status(400).json({ error: 'Image data is required' });
    }

    // Default macro-texture prompt safety net if UI prompt injection fails
    const finalPrompt = prompt || "highly detailed, 8k resolution, photorealistic architectural real estate photography, crisp textures, highly detailed exterior and interior styling, sharp crisp foliage and landscaping";

    // 1. Fetch latest model dynamically to bypass static version hash dependencies
    const model = await replicate.models.get("stability-ai", "stable-diffusion-x4-upscaler");
    
    // 2. Execute Stable Diffusion 4x Upscaler for true texture hallucination and detail addition
    const output: any = await replicate.run(
      `stability-ai/stable-diffusion-x4-upscaler:${model.latest_version.id}`,
      {
        input: {
          image: imageBase64,
          prompt: finalPrompt
        }
      }
    );
    // Stable Diffusion upscalers usually output arrays of image URIs natively
    const imageUrl = Array.isArray(output) ? output[0] : output;

    if (!imageUrl) {
      throw new Error("Failed to extract valid image URL from Stable Diffusion Replicate response.");
    }

    return res.status(200).json({ url: imageUrl });
  } catch (error: any) {
    console.error('Error during upscaling:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
