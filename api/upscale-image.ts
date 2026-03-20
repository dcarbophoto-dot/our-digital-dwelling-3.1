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

    const { imageBase64 } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Image data is required' });
    }

    // Execute Real-ESRGAN
    const output = await replicate.run(
      "nightmareai/real-esrgan:42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b",
      {
        input: {
          image: imageBase64,
          scale: 4,
          face_enhance: false
        }
      }
    );

    return res.status(200).json({ url: output });
  } catch (error: any) {
    console.error('Error during upscaling:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
