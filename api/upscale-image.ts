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

    const { imageBase64, prompt, imageType } = req.body;
    
    if (!imageBase64) {
      return res.status(400).json({ error: 'Image data is required' });
    }

    let prediction;
    if (imageType === 'exterior') {
      const finalPrompt = prompt || "highly detailed, 8k resolution, photorealistic architectural real estate photography, crisp textures, perfect staging, stunning landscape";
      const model = await replicate.models.get("batouresearch", "high-resolution-controlnet-tile");
      prediction = await replicate.predictions.create({
        version: model.latest_version.id,
        input: {
          image: imageBase64,
          prompt: finalPrompt,
          resolution: 4096,
          creativity: 0.35
        }
      });
    } else {
      const finalPrompt = prompt || "highly detailed, 8k resolution, photorealistic architectural real estate photography, crisp textures, highly detailed interior styling";
      const model = await replicate.models.get("nightmareai", "real-esrgan");
      prediction = await replicate.predictions.create({
        version: model.latest_version.id,
        input: {
          image: imageBase64,
          scale: 4,
          face_enhance: false
        }
      });
    }

    return res.status(200).json({ predictionId: prediction.id });
  } catch (error: any) {
    console.error('Error in upscale-image:', error);
    return res.status(500).json({ error: error.message || 'Unknown error occurred' });
  }
}
