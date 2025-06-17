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
  apiKey: "AIzaSyARvwYhTqRXMEUbfUzQWdPasuSvy2A4mkY",
  authDomain: "ai-cv-builder-581c4.firebaseapp.com",
  projectId: "ai-cv-builder-581c4",
  storageBucket: "ai-cv-builder-581c4.firebasestorage.app",
  messagingSenderId: "991488890950",
  appId: "1:991488890950:web:30746f9d81de0e5724d247",
};

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