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

exports.adminUpdateCredits = onCall(async (request) => {
  const email = request.auth?.token?.email;
  
  if (!email || email !== "dcarbophoto@gmail.com") {
    throw new HttpsError('permission-denied', 'Only the admin can use this function.');
  }
  
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

const functions = require("firebase-functions/v1");

const CREDIT_MAP = {
  // Subscriptions
  'price_1T1OzEIY2wu1OpEHADGXvsXV': { credits: 20, plan: 'Basic' },
  'price_1T1OzVIY2wu1OpEHvMGvtAmL': { credits: 45, plan: 'Standard' },
  'price_1T1OzcIY2wu1OpEHcjoWtrdt': { credits: 100, plan: 'Premium' },
  // Payments (Top-up)
  'price_1T2dYXIY2wu1OpEHx43rE2WD': { credits: 25, plan: 'Pay as You Go' },
  'price_1T2dYdIY2wu1OpEHxhSwJWYO': { credits: 50, plan: 'Pay as You Go' },
  'price_1T2dYiIY2wu1OpEHxCsp12Cx': { credits: 100, plan: 'Pay as You Go' }
};

const handleStripeSync = async (change, type, context) => {
  const logger = require("firebase-functions/logger");
  logger.info("STRIPE SYNC FUNCTION FIRED", { type, params: context.params });

  const afterData = change.after ? change.after.data() : null;
  if (!afterData) {
    logger.info("Event data is deleted or null, skipping.");
    return; // Deleted
  }

  const { uid, docId } = context.params;
  logger.info(`Processing ${type} for user: ${uid}, docId: ${docId}, status: ${afterData.status}`);

  // Check if conditions met
  if (type === 'subscriptions') {
    if (afterData.status !== 'active' && afterData.status !== 'trialing') {
      logger.info(`Status ${afterData.status} not active/trialing, skipping.`);
      return;
    }
  } else {
    if (afterData.status !== 'succeeded') {
      logger.info(`Status ${afterData.status} not succeeded, skipping.`);
      return;
    }
  }

  // Determine priceId
  let priceId = "";
  if (type === 'subscriptions') {
    priceId = afterData.items?.[0]?.price?.id || afterData.price?.id;
  } else {
    let firstPrice = afterData.prices?.[0];
    priceId = afterData.items?.[0]?.price?.id || (typeof firstPrice === 'string' ? firstPrice : firstPrice?.id);
    
    const amount = afterData.amount || afterData.amount_received;
    if (!priceId && amount) {
      if (amount === 3999) priceId = 'price_1T2dYXIY2wu1OpEHx43rE2WD';
      else if (amount === 6999) priceId = 'price_1T2dYdIY2wu1OpEHxhSwJWYO';
      else if (amount === 11999) priceId = 'price_1T2dYiIY2wu1OpEHxCsp12Cx';
    }
  }

  logger.info(`Determined priceId: ${priceId}`);

  if (!priceId || !CREDIT_MAP[priceId]) {
    logger.error(`No matching priceId found in map for ${priceId}`);
    return;
  }

  const award = CREDIT_MAP[priceId];
  const userSyncRef = admin.firestore().collection('users').doc(uid).collection(type === 'subscriptions' ? 'subscriptions' : 'payment').doc(docId);

  try {
    logger.info(`Starting transaction for ${award.credits} credits to ${uid}`);
    await admin.firestore().runTransaction(async (transaction) => {
      const syncDoc = await transaction.get(userSyncRef);
      if (syncDoc.exists) {
        logger.info(`Sync doc already exists, already processed. Skipping.`);
        return; // Already processed
      }

      const userRef = admin.firestore().collection('users').doc(uid);
      const userSnap = await transaction.get(userRef);
      if (!userSnap.exists) {
        logger.error(`User document does not exist for uid ${uid}`);
        return;
      }

      const currentData = userSnap.data();
      const newCredits = (currentData.credits || 0) + award.credits;
      const updates = { credits: newCredits };
      
      if (award.plan) updates.plan = award.plan;

      transaction.update(userRef, updates);
      // Mark as synced immediately
      transaction.set(userSyncRef, {
        syncedAt: admin.firestore.FieldValue.serverTimestamp(),
        awardedCredits: award.credits,
        priceId
      });
      logger.info(`Transaction writes queued successfully`);
    });
    logger.info(`Successfully credited ${award.credits} credits to ${uid} for ${type} ${docId}`);
  } catch (err) {
    logger.error(`Error in handleStripeSync for ${uid} / ${docId}:`, err);
  }
};

exports.onStripeSubscriptionWrittenV1 = functions.firestore.document("customers/{uid}/subscriptions/{docId}").onWrite((change, context) => {
  return handleStripeSync(change, 'subscriptions', context);
});

exports.onStripePaymentWrittenV1 = functions.firestore.document("customers/{uid}/payments/{docId}").onWrite((change, context) => {
  return handleStripeSync(change, 'payments', context);
});
