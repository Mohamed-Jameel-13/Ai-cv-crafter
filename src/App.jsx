import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useUser } from './context/UserContext';
import { UserProvider } from './context/UserContext';
import { Toaster } from './components/ui/sonner.jsx';

// Protected Route Wrapper
const ProtectedRoute = () => {
  const { user } = useUser();

  if (!user) {
    return <Navigate to="/auth/sign-in" replace />;
  }

  return <Outlet />;
};

// Main App Component
function App() {
  return (
    <UserProvider>
      <div 
        className="min-h-screen bg-background text-foreground" 
        tabIndex={-1}
        id="app-root"
        style={{ outline: 'none' }}
      >
        <Outlet />
        <Toaster />
      </div>
    </UserProvider>
  );
}

export default App;