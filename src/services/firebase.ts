import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const missingConfig = Object.entries(firebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missingConfig.length > 0) {
  throw new Error(
    `Missing Firebase environment variables: ${missingConfig.join(', ')}. Copy .env.example to .env and fill in your Firebase Web App config.`
  );
}

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Use the default Firestore database for a normal Firebase project.
// If you intentionally created a named database, set VITE_FIREBASE_FIRESTORE_DATABASE_ID.
const databaseId = import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || '(default)';

export const db =
  databaseId === '(default)'
    ? getFirestore(app)
    : getFirestore(app, databaseId);

export default app;
