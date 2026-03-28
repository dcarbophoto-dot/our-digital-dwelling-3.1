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
      
      return { base64: outputBase64 };
    } catch (error) {
      logger.error('Error generating image in cloud function:', error);
      throw new HttpsError('internal', error.message || 'Error generating image');
    }
  }
);

const admin = require('firebase-admin');
admin.initializeApp();

async function verifyAdmin(request) {
  const email = request.auth?.token?.email;
  const uid = request.auth?.uid;
  
  if (!uid) {
    throw new HttpsError('unauthenticated', 'Must be logged in.');
  }
  
  if (email === "dcarbophoto@gmail.com") return true;

  const userDoc = await admin.firestore().collection('users').doc(uid).get();
  if (userDoc.exists && userDoc.data().isAdmin) return true;

  throw new HttpsError('permission-denied', 'Only admins can use this function.');
}

exports.adminUpdateCredits = onCall(async (request) => {
  await verifyAdmin(request);
  
  const { targetUid, credits, plan } = request.data;
  if (!targetUid || credits === undefined || !plan) {
    throw new HttpsError('invalid-argument', 'Missing required fields.');
  }
  
  try {
    await admin.firestore().collection('users').doc(targetUid).update({ credits, plan });
    return { success: true };
  } catch (error) {
    logger.error('Error in adminUpdateCredits:', error);
    throw new HttpsError('internal', 'Unable to update user credits.');
  }
});

exports.adminToggleRole = onCall(async (request) => {
  await verifyAdmin(request);
  
  const { targetUid, isAdmin } = request.data;
  if (!targetUid) {
    throw new HttpsError('invalid-argument', 'Missing targetUid.');
  }

  try {
    await admin.firestore().collection('users').doc(targetUid).update({ isAdmin });
    return { success: true };
  } catch (error) {
    logger.error('Error in adminToggleRole:', error);
    throw new HttpsError('internal', 'Unable to toggle role.');
  }
});

exports.adminGetUserProjectsAndFiles = onCall(async (request) => {
  await verifyAdmin(request);
  
  const { targetUid } = request.data;
  if (!targetUid) {
    throw new HttpsError('invalid-argument', 'Missing targetUid.');
  }

  try {
    const projectsSnap = await admin.firestore().collection('users').doc(targetUid).collection('projects').orderBy('createdAt', 'desc').get();
    const projects = projectsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const filesSnap = await admin.firestore().collection('users').doc(targetUid).collection('files').orderBy('timestamp', 'desc').get();
    const files = filesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return { projects, files };
  } catch (error) {
    logger.error('Error fetching admin data:', error);
    throw new HttpsError('internal', 'Unable to fetch user projects.');
  }
});

exports.adminDeleteProject = onCall(async (request) => {
  await verifyAdmin(request);
  
  const { targetUid, projectId } = request.data;
  if (!targetUid || !projectId) {
    throw new HttpsError('invalid-argument', 'Missing targetUid or projectId.');
  }

  try {
    const filesSnap = await admin.firestore().collection('users').doc(targetUid).collection('files').where('projectId', '==', projectId).get();
    
    // We only delete the documents. Storage must be handled by the client or a background trigger, or we can just let Firebase handle file deletion if they use a storage bucket extension.
    // However, our dbService client handles file storage deletion. We can run storage deletion from here via admin sdk.
    const bucket = admin.storage().bucket();
    
    const deletePromises = filesSnap.docs.map(async (fileDoc) => {
      const fileData = fileDoc.data();
      
      const deleteBlob = async (url) => {
        if (!url) return;
        // Parse the gs:// or URL path to get filepath
        try {
          const urlObj = new URL(url);
          const filePath = decodeURIComponent(urlObj.pathname.split('/o/')[1].split('?')[0]);
          await bucket.file(filePath).delete().catch(e => console.error("Missing file to delete:", e));
        } catch(e) {}
      };

      if (fileData.originalUrl) await deleteBlob(fileData.originalUrl);
      if (fileData.stagedUrl) await deleteBlob(fileData.stagedUrl);
      
      return admin.firestore().collection('users').doc(targetUid).collection('files').doc(fileDoc.id).delete();
    });

    await Promise.all(deletePromises);

    if (projectId !== 'unfiled') {
      await admin.firestore().collection('users').doc(targetUid).collection('projects').doc(projectId).delete();
    }

    return { success: true };
  } catch (error) {
    logger.error('Error in adminDeleteProject:', error);
    throw new HttpsError('internal', 'Unable to delete project.');
  }
});
