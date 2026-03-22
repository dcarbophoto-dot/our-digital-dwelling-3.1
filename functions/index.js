/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {setGlobalOptions} = require("firebase-functions");
const {onRequest} = require("firebase-functions/https");
const logger = require("firebase-functions/logger");

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const { GoogleGenAI } = require("@google/genai");

const geminiApiKey = defineSecret("GEMINI_API_KEY");

exports.generateImage = onCall(
  { secrets: [geminiApiKey], memory: "1GiB" },
  async (request) => {
    try {
      const { imageBase64, prompt } = request.data;
      
      if (!imageBase64 || !prompt) {
        throw new HttpsError('invalid-argument', 'Missing required fields');
      }

      const ai = new GoogleGenAI({ apiKey: geminiApiKey.value() });
      const base64Data = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
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
      
      return { base64: outputBase64 };
    } catch (error) {
      logger.error('Error generating image in cloud function:', error);
      throw new HttpsError('internal', error.message || 'Error generating image');
    }
  }
);
