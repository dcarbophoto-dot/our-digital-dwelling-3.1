setTimeout(() => {}, 5000);
admin.firestore().collection('users').doc('KXot2m9FxtYpwoMdgHuNSE8e3K03').get().then(doc => admin.firestore().collection('users').doc('KXot2m9FxtYpwoMdgHuNSE8e3K03').update({credits: 50, plan: 'Pay as You Go'})).then(() => console.log('\n\nSUCCESS_CREDITS_UPDATED\n\n')).catch(console.error);
