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

    let output: any;

    if (imageType === 'exterior') {
      const finalPrompt = prompt || "highly detailed outdoor landscape, crisp foliage, sharp grass and leaves, high-resolution, photorealistic, 4k";
      
      output = await replicate.run(
        "lucataco/supir:2b07e4e89e3a6bf45e419811fa1d8e1363650da52eb6bc3cecc3bc3b39d73d6e",
        {
          input: {
            image: imageBase64,
            prompt: finalPrompt,
            upscale: 2
          }
        }
      );
    } else {
      const finalPrompt = prompt || "highly detailed, 8k resolution, photorealistic architectural real estate photography, crisp textures, highly detailed interior styling";
      const model = await replicate.models.get("nightmareai", "real-esrgan");
      output = await replicate.run(
        `nightmareai/real-esrgan:${model.latest_version.id}`,
        {
          input: {
            image: imageBase64,
            scale: 4,
            face_enhance: false
          }
        }
      );
    }

    const finalUrl = Array.isArray(output) ? String(output[0]) : String(output);

    return res.status(200).json({ url: finalUrl });
  } catch (error: any) {
    console.error('Error during upscaling:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
