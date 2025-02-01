import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useUser } from './context/UserContext';
import { UserProvider } from './context/UserContext';
import { ThemeProvider } from './context/ThemeContext';
import { Toaster } from './components/ui/sonner';

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
    <ThemeProvider>
      <UserProvider>
        <div className="min-h-screen bg-background text-foreground">
          <Outlet />
          <Toaster />
        </div>
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;