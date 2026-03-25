setInterval(() => {}, 1000); // keep alive
(async () => {
  try {
    const uid = 'KXot2m9FxtYpwoMdgHuNSE8e3K03';
    const ref = admin.firestore().collection('users').doc(uid);
    const doc = await ref.get();
    if (doc.exists) {
      await ref.update({ credits: 50, plan: 'Pay as You Go' });
      console.log('\n\n=== SUCCESS_CREDITS_UPDATED ===\n\n');
    } else {
      console.log('\n\n=== USER_NOT_FOUND ===\n\n');
    }
  } catch (e) {
    console.error('\n\n=== ERROR ===\n\n', e);
  } finally {
    process.exit(0);
  }
})();
