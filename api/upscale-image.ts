import Replicate from "replicate";

export const config = {
  maxDuration: 60, // Serverless timeout allowed up to 60s for slow upscales
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { imageBase64 } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Missing image Base64 data' });
    }

    const apiToken = process.env.REPLICATE_API_TOKEN;
    if (!apiToken) {
      return res.status(500).json({ error: 'Replicate API Token is missing from server configuration. Please check your .env file.' });
    }

    const replicate = new Replicate({
      auth: apiToken,
    });

    let dataUri = imageBase64;
    // Prepend correct formatting for Replicate input if it's missing
    if (!dataUri.startsWith('data:')) {
      dataUri = `data:image/jpeg;base64,${dataUri}`;
    }

    console.log("Starting Replicate ESRGAN Upscale process...");
    
    // Call the industry standard Real-ESRGAN model
    const output = await replicate.run(
      "nightmareai/real-esrgan:42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b",
      {
        input: {
          image: dataUri,
          scale: 4,               // Quadruple the size, taking ~1K to ~4K
          face_enhance: false     // Keeps architecture textures clean without misinterpreting
        }
      }
    );

    if (!output) {
      throw new Error("No output returned from the Replicate generation.");
    }
    
    return res.status(200).json({ url: output });

  } catch (error: any) {
    console.error('Error inside upscale API route:', error);
    return res.status(500).json({ error: error.message || 'Error expanding image resolution' });
  }
}
