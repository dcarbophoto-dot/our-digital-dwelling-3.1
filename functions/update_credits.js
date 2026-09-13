const admin = require('firebase-admin');
admin.initializeApp();

const targetUid = 'uPMcycSHM9YrlSY3hpsjDV880go2';

async function update() {
  try {
    const userRef = admin.firestore().collection('users').doc(targetUid);
    const doc = await userRef.get();
    if (!doc.exists) {
       console.log('User not found!');
       return;
    }
    const currentCredits = doc.data().credits || 0;
    const newCredits = currentCredits + 40;
    await userRef.update({ credits: newCredits });
    console.log(`Successfully added 40 credits! Old: ${currentCredits}, New: ${newCredits}`);
  } catch (err) {
    console.error('Error:', err.message);
  }
}

update();
