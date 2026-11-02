const admin = require('firebase-admin');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env') });

const projectId = (process.env.FIREBASE_PROJECT_ID || 'yezbee-5944b').replace(/^"|"$/g, '').trim();
let clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
let privateKey = process.env.FIREBASE_PRIVATE_KEY;

if (clientEmail) {
  clientEmail = clientEmail.trim();
  if (clientEmail.startsWith('"') && clientEmail.endsWith('"')) {
    clientEmail = clientEmail.slice(1, -1);
  }
}

if (privateKey) {
  let cleanKey = privateKey.trim();
  if (cleanKey.startsWith('"') && cleanKey.endsWith('"')) {
    cleanKey = cleanKey.slice(1, -1);
  }
  cleanKey = cleanKey.replace(/\\n/g, '\n').trim();
  while (cleanKey.endsWith('\\') || cleanKey.endsWith('\n') || cleanKey.endsWith('\r')) {
    cleanKey = cleanKey.slice(0, -1).trim();
  }
  privateKey = cleanKey;
}

try {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    })
  });
  console.log('Firebase Admin initialized.');
  const db = admin.firestore();
  
  const testProduct = {
    name: "Test Product " + Date.now(),
    slug: "test-product-" + Date.now(),
    price: 999,
    status: "DRAFT",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  console.log('Writing test document to "products" collection...');
  db.collection('products').add(testProduct)
    .then(docRef => {
      console.log('SUCCESS! Document written with ID:', docRef.id);
      process.exit(0);
    })
    .catch(err => {
      console.error('Firestore write FAILED:', err);
      process.exit(1);
    });
} catch (err) {
  console.error('Initialization failed:', err);
  process.exit(1);
}
