
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getStorage, type FirebaseStorage } from "firebase/storage";
import { getFirestore, type Firestore } from "firebase/firestore";

// Debug: Log environment variables
console.log("Firebase Environment Variables:");
console.log("API Key:", process.env.NEXT_PUBLIC_FIREBASE_API_KEY);
console.log("Auth Domain:", process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN);
console.log("Project ID:", process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
console.log("Storage Bucket:", process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET);
console.log("Messaging Sender ID:", process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID);
console.log("App ID:", process.env.NEXT_PUBLIC_FIREBASE_APP_ID);
console.log("Measurement ID:", process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID);

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

let app: FirebaseApp;
let auth: Auth;
let storage: FirebaseStorage;
let db: Firestore;

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

auth = getAuth(app);
storage = getStorage(app);
db = getFirestore(app);

export { app, auth, storage, db };
