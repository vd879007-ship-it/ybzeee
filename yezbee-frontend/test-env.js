const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env') });

console.log('--- Frontend Env Check ---');
console.log('FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID);
console.log('FIREBASE_CLIENT_EMAIL:', process.env.FIREBASE_CLIENT_EMAIL);
console.log('FIREBASE_PRIVATE_KEY length:', process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.length : 0);

if (process.env.FIREBASE_PRIVATE_KEY) {
  let cleanKey = process.env.FIREBASE_PRIVATE_KEY.trim();
  if (cleanKey.startsWith('"') && cleanKey.endsWith('"')) {
    cleanKey = cleanKey.slice(1, -1);
  }
  cleanKey = cleanKey.replace(/\\n/g, '\n');
  console.log('Private Key starts with:', JSON.stringify(cleanKey.slice(0, 40)));
  console.log('Private Key ends with:', JSON.stringify(cleanKey.slice(-40)));
} else {
  console.error('ERROR: FIREBASE_PRIVATE_KEY is undefined in frontend/.env');
}
