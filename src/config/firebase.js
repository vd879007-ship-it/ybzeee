/**
 * Firebase Admin & Firestore Configuration
 * Connects to Firebase Firestore in africa-south1 using recommended Google Auth constructor.
 */

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { Firestore } = require('@google-cloud/firestore');
const { JWT } = require('google-auth-library');
const logger = require('../utils/logger');

dotenv.config();

let dbInstance = null;

/**
 * Resolves path to the Firebase service account JSON
 * @returns {string} Absolute path to service account file
 */
function resolveServiceAccountPath() {
  const envPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  const candidates = [
    envPath ? path.resolve(process.cwd(), envPath) : null,
    path.resolve(process.cwd(), 'serviceAccountKey.json'),
    path.resolve(process.cwd(), 'serviceAccountKey.json.txt')
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  throw new Error(
    `Firebase service account key not found. Looked in: ${candidates.join(', ')}.\n` +
    `Please place your serviceAccountKey.json in the project root or configure FIREBASE_SERVICE_ACCOUNT_PATH in .env.`
  );
}

/**
 * Initializes Firestore using recommended Google Auth (JWT) constructor
 * Resolves the deprecated credentials configuration warning.
 * 
 * @returns {Firestore}
 */
function initFirestore() {
  if (dbInstance) {
    return dbInstance;
  }

  const keyPath = resolveServiceAccountPath();
  let serviceAccount;

  try {
    const raw = fs.readFileSync(keyPath, 'utf8');
    serviceAccount = JSON.parse(raw);
  } catch (err) {
    throw new Error(`Invalid JSON in service account file at ${keyPath}: ${err.message}`);
  }

  if (!serviceAccount.project_id || !serviceAccount.client_email || !serviceAccount.private_key) {
    throw new Error(
      `Service account file is missing required fields (project_id, client_email, or private_key).`
    );
  }

  // Recommended Google Auth constructor to prevent deprecated credentials warning
  const authClient = new JWT({
    email: serviceAccount.client_email,
    key: serviceAccount.private_key,
    scopes: [
      'https://www.googleapis.com/auth/cloud-platform',
      'https://www.googleapis.com/auth/datastore'
    ]
  });

  dbInstance = new Firestore({
    projectId: serviceAccount.project_id,
    authClient,
    ignoreUndefinedProperties: true
  });

  return dbInstance;
}

/**
 * Validates connection to Firestore by testing a lightweight read
 * @returns {Promise<{ success: boolean, projectId: string, sampleFound?: boolean, message?: string, error?: string }>}
 */
async function validateFirebaseConnection() {
  try {
    const db = initFirestore();
    const keyPath = resolveServiceAccountPath();
    const key = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
    
    // Quick probe
    const testDoc = await db.collection('products').limit(1).get();
    
    return {
      success: true,
      projectId: key.project_id,
      sampleFound: !testDoc.empty,
      message: `Successfully connected to Firestore project "${key.project_id}" (Location: africa-south1)`
    };
  } catch (err) {
    return {
      success: false,
      error: err.message,
      message: `Failed to connect to Firebase Firestore: ${err.message}`
    };
  }
}

module.exports = {
  getDb: initFirestore,
  validateFirebaseConnection,
  resolveServiceAccountPath
};
