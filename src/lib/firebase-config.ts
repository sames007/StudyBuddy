export const firebaseConfig = {
  // Firebase web config is public. Authorization is enforced by Firebase Auth,
  // Firestore rules, Storage rules, and Google Cloud API key restrictions.
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyCRGYs29ItpcZSeGPzCwP4nw9kBzNXcTGQ',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'studybuddy-4f855.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'studybuddy-4f855',
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'studybuddy-4f855.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '32468092136',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:32468092136:web:aa3fb06cf7b4094e30755d',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-313GZQ2B6W',
};
