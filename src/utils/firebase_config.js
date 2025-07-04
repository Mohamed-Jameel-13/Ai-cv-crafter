import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  initializeFirestore,
  enableIndexedDbPersistence,
  CACHE_SIZE_UNLIMITED,
} from "firebase/firestore";
import { getStorage } from "firebase/storage";
import Logger from "./logger.js";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

Logger.log("Auth Domain:", import.meta.env.VITE_FIREBASE_AUTH_DOMAIN);
// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services with enhanced configuration
const firestoreSettings = {
  cacheSizeBytes: CACHE_SIZE_UNLIMITED,
  experimentalForceLongPolling: true,
  useFetchStreams: false,
  ignoreUndefinedProperties: true,
};

let db;
try {
  db = initializeFirestore(app, firestoreSettings);
  enableIndexedDbPersistence(db).catch((error) => {
    if (error.code === "failed-precondition") {
      Logger.warn("Multiple tabs open, persistence enabled in another tab");
    } else if (error.code === "unimplemented") {
      Logger.warn("Browser doesn't support persistence");
    } else if (error.name === "BloomFilterError") {
      Logger.warn(
        "BloomFilter error detected, falling back to memory-only mode",
      );
      db = initializeFirestore(app, {
        ...firestoreSettings,
        memoryOnly: true,
      });
    }
  });
} catch (error) {
  Logger.error("Firestore initialization error:", error);
  db = getFirestore(app); // Fallback to default configuration
}

const auth = getAuth(app);
const storage = getStorage(app);

export { app, auth, db, storage };
