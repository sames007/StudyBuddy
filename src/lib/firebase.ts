import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCRGYs29ItpcZSeGPzCwP4nw9kBzNXcTGQ",
  authDomain: "studybuddy-4f855.firebaseapp.com",
  projectId: "studybuddy-4f855",
  storageBucket: "studybuddy-4f855.appspot.com",
  messagingSenderId: "32468092136",
  appId: "1:32468092136:web:aa3fb06cf7b4094e30755d",
  measurementId: "G-313GZQ2B6W"
};

// Initialize Firebase
let app: FirebaseApp;
// This guard is needed to prevent re-initialization on hot reloads.
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
