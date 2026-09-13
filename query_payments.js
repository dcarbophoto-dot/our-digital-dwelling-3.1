const admin = require('firebase-admin');
const fs = require('fs');

if (!admin.apps.length) {
  // Try to find the service account key if needed, or use default application credentials
  // Wait, I can use the existing project initialization if I have a service account,
  // or I can just use firebase CLI!
}
