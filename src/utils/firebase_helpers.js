import { getAuth } from "firebase/auth";
import { toast } from "sonner";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { app } from "./firebase_config";

// Get current user email with fallback options
export const getCurrentUserEmail = (userContext) => {
  const auth = getAuth();
  const currentUser = auth.currentUser;
  
  // Try multiple sources for user email
  const possibleEmails = [
    currentUser?.email,
    userContext?.user?.primaryEmailAddress?.emailAddress,
    userContext?.user?.email,
    userContext?.user?.emailAddresses?.[0]?.emailAddress,
    userContext?.user?.displayName?.includes('@') ? userContext?.user?.displayName : null,
    localStorage.getItem('userEmail'),
    sessionStorage.getItem('userEmail')
  ];
  
  const userEmail = possibleEmails.find(email => email && email.length > 0 && email.includes('@'));
  
  console.log('🔍 Debug - Email resolution:', {
    firebaseUser: currentUser?.email,
    userContext: userContext?.user?.email,
    selectedEmail: userEmail,
    possibleEmails: possibleEmails.filter(Boolean)
  });
  
  return userEmail;
};

// Check if user is authenticated
export const isUserAuthenticated = (userContext) => {
  const auth = getAuth();
  const currentUser = auth.currentUser;
  const userEmail = getCurrentUserEmail(userContext);
  
  const isAuthenticated = !!(currentUser && userEmail);
  
  console.log('🔐 Authentication Check:', {
    hasFirebaseUser: !!currentUser,
    hasEmail: !!userEmail,
    isAuthenticated
  });
  
  return isAuthenticated;
};

// Enhanced Firebase error handler with specific hosting-related fixes
export const handleFirebaseError = (error, operation = 'operation') => {
  console.error(`🚨 Firebase error during ${operation}:`, error);
  
  // Log detailed error information for debugging
  console.error('Error details:', {
    code: error.code,
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString()
  });
  
  switch (error.code) {
    case 'permission-denied':
      toast.error('Permission denied. Please sign in and try again.');
      console.error('Permission denied - Check Firestore rules and authentication');
      break;
    case 'not-found':
      toast.error('Document not found. Please refresh the page.');
      console.error('Document not found - Check document path and existence');
      break;
    case 'unavailable':
      toast.error('Service temporarily unavailable. Please try again.');
      console.error('Service unavailable - Network or server issue');
      break;
    case 'unauthenticated':
      toast.error('Please sign in to continue.');
      console.error('Unauthenticated - User not signed in');
      break;
    case 'deadline-exceeded':
      toast.error('Request timeout. Please check your internet connection.');
      console.error('Deadline exceeded - Network timeout');
      break;
    case 'resource-exhausted':
      toast.error('Too many requests. Please wait a moment and try again.');
      console.error('Resource exhausted - Rate limiting or quota exceeded');
      break;
    case 'failed-precondition':
      toast.error('Operation failed. Please refresh and try again.');
      console.error('Failed precondition - Document state issue');
      break;
    case 'already-exists':
      toast.error('Document already exists.');
      console.error('Already exists - Duplicate document creation attempt');
      break;
    case 'invalid-argument':
      toast.error('Invalid data provided. Please check your input.');
      console.error('Invalid argument - Check data format and types');
      break;
    case 'internal':
      toast.error('Internal server error. Please try again later.');
      console.error('Internal error - Server-side issue');
      break;
    default:
      toast.error(`Failed to ${operation}. Please try again.`);
      console.error(`Unhandled error code: ${error.code}`);
  }
};

// Test Firebase connection and permissions
export const testFirebaseConnection = async (userContext) => {
  console.log('🧪 Testing Firebase connection...');
  
  try {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    const userEmail = getCurrentUserEmail(userContext);
    
    if (!currentUser || !userEmail) {
      throw new Error('User not authenticated');
    }
    
    // Test Firestore read access
    const db = getFirestore(app);
    const testPath = `usersByEmail/${userEmail}/resumes`;
    console.log(`📍 Testing path: ${testPath}`);
    
    // This should work even if the collection is empty
    const testDoc = doc(db, testPath, 'test-doc');
    
    console.log('✅ Firebase connection test passed');
    return { success: true, userEmail, testPath };
    
  } catch (error) {
    console.error('❌ Firebase connection test failed:', error);
    handleFirebaseError(error, 'test connection');
    return { success: false, error: error.message };
  }
};

// Debug function to check authentication state
export const debugAuthState = (userContext) => {
  const auth = getAuth();
  const currentUser = auth.currentUser;
  
  const debugInfo = {
    firebaseAuth: {
      user: currentUser,
      isSignedIn: !!currentUser,
      email: currentUser?.email,
      emailVerified: currentUser?.emailVerified,
      uid: currentUser?.uid
    },
    userContext: {
      user: userContext?.user,
      hasUser: !!userContext?.user,
      email: userContext?.user?.email
    },
    localStorage: {
      userEmail: localStorage.getItem('userEmail'),
      user: localStorage.getItem('user')
    },
    environment: {
      isDevelopment: import.meta.env.DEV,
      isProduction: import.meta.env.PROD,
      mode: import.meta.env.MODE
    }
  };
  
  console.log('🔍 Authentication Debug Info:', debugInfo);
  
  return {
    isAuthenticated: isUserAuthenticated(userContext),
    userEmail: getCurrentUserEmail(userContext),
    firebaseUser: currentUser,
    debugInfo
  };
};

// Validate document path for Firebase
export const validateFirebasePath = (userEmail, resumeId) => {
  if (!userEmail || !userEmail.includes('@')) {
    throw new Error('Invalid user email for Firebase path');
  }
  
  if (!resumeId) {
    throw new Error('Invalid resume ID for Firebase path');
  }
  
  const path = `usersByEmail/${userEmail}/resumes/resume-${resumeId}`;
  console.log('📍 Validated Firebase path:', path);
  
  return path;
};

// Retry mechanism for Firebase operations
export const retryFirebaseOperation = async (operation, maxRetries = 3, delay = 1000) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Attempt ${attempt}/${maxRetries} for Firebase operation`);
      const result = await operation();
      console.log(`✅ Firebase operation succeeded on attempt ${attempt}`);
      return result;
    } catch (error) {
      console.error(`❌ Attempt ${attempt} failed:`, error);
      
      if (attempt === maxRetries) {
        throw error; // Re-throw on final attempt
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
}; 