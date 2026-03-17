import { GoogleGenAI } from "@google/genai";

export const config = {
  maxDuration: 60,
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { imageBase64, prompt } = req.body;

    if (!imageBase64 || !prompt) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY environment variable is not set");
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const ai = new GoogleGenAI({ apiKey });

    // Extract the base64 data without the data URI prefix if present
    const base64Data = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-image-preview',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: 'image/jpeg',
            },
          },
          { text: prompt }
        ]
      },
      config: {
        systemInstruction: "You are a professional real estate photo editor and virtual stager.",
      }
    });

    const outputBase64 = response?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!outputBase64) {
      throw new Error("No image data returned from Gemini API");
    }

    return res.status(200).json({ base64: outputBase64 });
  } catch (error: any) {
    console.error('Error generating image in API route:', error);
    return res.status(500).json({ error: error.message || 'Error generating image' });
  }
}
