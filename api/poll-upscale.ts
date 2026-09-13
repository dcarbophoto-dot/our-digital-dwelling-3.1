import { VercelRequest, VercelResponse } from '@vercel/node';
import Replicate from 'replicate';

export const config = {
  maxDuration: 10,
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  try {
    const apiToken = process.env.REPLICATE_API_TOKEN;
    if (!apiToken) {
      return res.status(500).json({ error: 'Replicate API Token is missing' });
    }

    const { id } = req.query;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Prediction ID is required' });
    }

    const replicate = new Replicate({ auth: apiToken });
    const prediction = await replicate.predictions.get(id);

    if (prediction.status === 'failed' || prediction.status === 'canceled') {
      return res.status(500).json({ error: `Prediction failed: ${prediction.error}` });
    }

    if (prediction.status === 'succeeded') {
      const output = prediction.output;
      let finalUrl = '';
      
      const extractUrl = (obj: any) => {
        if (typeof obj === 'string') return obj;
        if (obj && typeof obj.url === 'function') {
          const u = obj.url();
          return typeof u === 'string' ? u : u.toString();
        }
        if (obj && typeof obj.url === 'string') return obj.url;
        return String(obj);
      };

      if (Array.isArray(output) && output.length > 0) {
        finalUrl = extractUrl(output[0]);
      } else {
        finalUrl = extractUrl(output);
      }

      return res.status(200).json({ status: 'succeeded', url: finalUrl });
    }

    // still processing
    return res.status(200).json({ status: prediction.status });
  } catch (error: any) {
    console.error('Error polling upscale:', error);
    return res.status(500).json({ error: error.message || 'Unknown error occurred' });
  }
}
