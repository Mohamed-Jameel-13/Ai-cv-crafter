import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { 
  getFirestore, 
  initializeFirestore, 
  enableIndexedDbPersistence,
  CACHE_SIZE_UNLIMITED 
} from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyARvwYhTqRXMEUbfUzQWdPasuSvy2A4mkY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "auth.writespark.tech",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "ai-cv-builder-581c4",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "ai-cv-builder-581c4.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "991488890950",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:991488890950:web:30746f9d81de0e5724d247",
};

console.log("Auth Domain:", import.meta.env.VITE_FIREBASE_AUTH_DOMAIN);
// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services with enhanced configuration
const firestoreSettings = {
  cacheSizeBytes: CACHE_SIZE_UNLIMITED,
  experimentalForceLongPolling: true,
  useFetchStreams: false,
  ignoreUndefinedProperties: true
};

let db;
try {
  db = initializeFirestore(app, firestoreSettings);
  enableIndexedDbPersistence(db).catch((error) => {
    if (error.code === 'failed-precondition') {
      console.warn('Multiple tabs open, persistence enabled in another tab');
    } else if (error.code === 'unimplemented') {
      console.warn('Browser doesn\'t support persistence');
    } else if (error.name === 'BloomFilterError') {
      console.warn('BloomFilter error detected, falling back to memory-only mode');
      db = initializeFirestore(app, {
        ...firestoreSettings,
        memoryOnly: true
      });
    }
  });
} catch (error) {
  console.error('Firestore initialization error:', error);
  db = getFirestore(app); // Fallback to default configuration
}

const auth = getAuth(app);
const storage = getStorage(app);

export { app, auth, db, storage };