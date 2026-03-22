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

    // Execute SwinIR for high-frequency detail preservation on organic materials
    const output: any = await replicate.run(
      "jingyunliang/swinir:660d922d33153019e8c263a3bba265de882e7f4f70396546b6c9c8f9d47a021a",
      {
        input: {
          image: imageBase64,
          task: "Real-World Image Super-Resolution-Large"
        }
      }
    );
    
    // Specifically parse the output into a URI string regardless of Replicate NPM version data structures
    let finalUrl = "";
    if (Array.isArray(output)) {
      finalUrl = output[0];
    } else if (output && typeof output === 'object') {
      finalUrl = output.url ? (typeof output.url === 'function' ? output.url() : output.url) : String(output);
    } else {
      finalUrl = String(output);
    }

    return res.status(200).json({ url: finalUrl });
  } catch (error: any) {
    console.error('Error during upscaling:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
