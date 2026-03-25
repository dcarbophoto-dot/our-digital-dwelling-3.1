const admin = require('firebase-admin');
const project = 'our-digital-dwelling';
process.env.GCLOUD_PROJECT = project;
admin.initializeApp({ projectId: project });
const db = admin.firestore();

async function run() {
  try {
    const uid = 'KXot2m9FxtYpwoMdgHuNSE8e3K03';
    const ref = db.collection('users').doc(uid);
    const doc = await ref.get();
    if (doc.exists) {
      const data = doc.data();
      await ref.update({ credits: (data.credits || 0) + 50, plan: 'Pay as You Go' });
      console.log('Successfully updated the user! Old credits:', data.credits);
    } else {
      console.log('User does not exist.');
    }
  } catch (err) {
    console.error("Error:", err);
  }
}
run();
