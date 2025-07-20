import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

// Firebase configuration objects for different environments
const firebaseConfig = {
  development: {
    apiKey: "demo-key",
    authDomain: "styleai-dev.firebaseapp.com",
    projectId: "styleai-dev",
    storageBucket: "styleai-dev.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef123456"
  },
  staging: {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY_STAGING,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN_STAGING,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID_STAGING,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET_STAGING,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID_STAGING,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID_STAGING,
  },
  production: {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  }
};

// Get environment from Expo
const environment = process.env.EXPO_PUBLIC_ENVIRONMENT || 'development';
const config = firebaseConfig[environment as keyof typeof firebaseConfig];

// Initialize Firebase
const app = initializeApp(config);

// Initialize Firebase services
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

// Connect to emulators in development
if (__DEV__ && environment === 'development') {
  // Only connect to emulators if we haven't already
  try {
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    connectFirestoreEmulator(firestore, 'localhost', 8080);
    connectStorageEmulator(storage, 'localhost', 9199);
    connectFunctionsEmulator(functions, 'localhost', 5001);
    console.log('✅ Connected to Firebase emulators');
  } catch (error) {
    console.log('Firebase emulators already connected or not available');
  }
}

export default app;