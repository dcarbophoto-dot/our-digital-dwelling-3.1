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

    // Execute Real-ESRGAN for extreme high-frequency architectural detail hallucination (fixes blurred shingles/grass)
    const model = await replicate.models.get("nightmareai", "real-esrgan");
    const output: any = await replicate.run(
      `nightmareai/real-esrgan:${model.latest_version.id}`,
      {
        input: {
          image: imageBase64,
          scale: 4,
          face_enhance: false
        }
      }
    );

    const finalUrl = String(output);

    return res.status(200).json({ url: finalUrl });
  } catch (error: any) {
    console.error('Error during upscaling:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
