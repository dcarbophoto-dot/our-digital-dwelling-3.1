import Replicate from "replicate";
import type { VercelRequest, VercelResponse } from '@vercel/node';

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
      return res.status(500).json({ error: 'Replicate config missing.' });
    }

    const replicate = new Replicate({ auth: apiToken });
    const { imageBase64, prompt } = req.body;

    if (!imageBase64 || !prompt) {
      return res.status(400).json({ error: 'Image data and prompt are required' });
    }

    // Load the latest SDXL ControlNet architecture
    const model = await replicate.models.get("lucataco", "sdxl-controlnet");
    
    // Execute the generation with strict Canny Edge mapping to lock brick geometry perfectly
    const output: any = await replicate.run(
      `lucataco/sdxl-controlnet:${model.latest_version.id}`,
      {
        input: {
          image: imageBase64,
          condition_scale: 0.65, // Balances structural rigidity (bricks) with generative freedom (leaves)
          prompt: prompt,
          negative_prompt: "ugly, distorted, blurry, artifacts, low quality, bad architecture, deformed, warped, unnatural, blurred bricks, smeared geometry, painted look",
          num_inference_steps: 30
        }
      }
    );

    const imageUrl = Array.isArray(output) ? output[0] : output;
    if (!imageUrl) {
      throw new Error("Failed to extract valid image URL from SDXL response.");
    }

    // Convert the Replicate output URL back into a Base64 payload to conform to the app's standard rendering flow
    const imgRes = await fetch(imageUrl);
    const arrayBuffer = await imgRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const outputBase64 = buffer.toString('base64');
    const contentType = imgRes.headers.get('content-type') || 'image/jpeg';

    return res.status(200).json({ base64: outputBase64, mimeType: contentType });

  } catch (error: any) {
    console.error('Error during Structural Exterior Generation:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
