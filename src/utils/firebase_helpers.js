import { getAuth } from "firebase/auth";
import { toast } from "sonner";

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
    localStorage.getItem('userEmail'),
    sessionStorage.getItem('userEmail')
  ];
  
  const userEmail = possibleEmails.find(email => email && email.length > 0);
  
  console.log('Debug - Authentication status:', {
    firebaseUser: currentUser,
    userContext: userContext?.user,
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
  
  return !!(currentUser && userEmail);
};

// Handle Firebase errors with user-friendly messages
export const handleFirebaseError = (error, operation = 'operation') => {
  console.error(`Firebase error during ${operation}:`, error);
  
  switch (error.code) {
    case 'permission-denied':
      toast.error('Permission denied. Please sign in and try again.');
      break;
    case 'not-found':
      toast.error('Document not found. Please refresh the page.');
      break;
    case 'unavailable':
      toast.error('Service temporarily unavailable. Please try again.');
      break;
    case 'unauthenticated':
      toast.error('Please sign in to continue.');
      break;
    case 'deadline-exceeded':
      toast.error('Request timeout. Please check your internet connection.');
      break;
    case 'resource-exhausted':
      toast.error('Too many requests. Please wait a moment and try again.');
      break;
    default:
      toast.error(`Failed to ${operation}. Please try again.`);
  }
};

// Debug function to check authentication state
export const debugAuthState = (userContext) => {
  const auth = getAuth();
  const currentUser = auth.currentUser;
  
  console.log('🔍 Authentication Debug Info:', {
    firebaseAuth: {
      user: currentUser,
      isSignedIn: !!currentUser,
      email: currentUser?.email,
      emailVerified: currentUser?.emailVerified
    },
    userContext: {
      user: userContext?.user,
      hasUser: !!userContext?.user
    },
    localStorage: {
      userEmail: localStorage.getItem('userEmail'),
      user: localStorage.getItem('user')
    }
  });
  
  return {
    isAuthenticated: isUserAuthenticated(userContext),
    userEmail: getCurrentUserEmail(userContext),
    firebaseUser: currentUser
  };
}; 