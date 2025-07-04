// Firebase Connection Test Script
// Run this script to verify Firebase configuration and connection

import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

async function testFirebaseConnection() {
  console.log("🚀 Starting Firebase Connection Test...");
  console.log("📋 Configuration:", {
    projectId: firebaseConfig.projectId,
    authDomain: firebaseConfig.authDomain,
    apiKey: firebaseConfig.apiKey ? "✓ Set" : "❌ Missing",
  });

  try {
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    console.log("✅ Firebase app initialized");

    // Test Authentication
    const auth = getAuth(app);
    console.log("🔐 Auth service initialized");

    // Test Firestore
    const db = getFirestore(app);
    console.log("📚 Firestore initialized");

    // Test document write/read
    const testDoc = doc(db, "test-collection", "test-doc");
    const testData = {
      message: "Firebase connection test",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "unknown",
    };

    console.log("📝 Attempting to write test document...");
    await setDoc(testDoc, testData);
    console.log("✅ Test document written successfully");

    console.log("📖 Attempting to read test document...");
    const docSnap = await getDoc(testDoc);

    if (docSnap.exists()) {
      console.log("✅ Test document read successfully:", docSnap.data());
    } else {
      console.log("❌ Test document not found");
    }

    console.log("🎉 Firebase connection test completed successfully!");
    return true;
  } catch (error) {
    console.error("❌ Firebase connection test failed:", error);
    console.error("Error details:", {
      code: error.code,
      message: error.message,
    });

    // Common error diagnostics
    if (error.code === "permission-denied") {
      console.log("💡 Suggestion: Check Firestore security rules");
    } else if (error.code === "unauthenticated") {
      console.log("💡 Suggestion: Ensure user is properly authenticated");
    } else if (error.code === "not-found") {
      console.log("💡 Suggestion: Check project ID and document paths");
    }

    return false;
  }
}

// Run the test
testFirebaseConnection()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error("🔥 Unexpected error:", error);
    process.exit(1);
  });
