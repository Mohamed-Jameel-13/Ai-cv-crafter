import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useUser } from "./context/UserContext";
import { UserProvider } from "./context/UserContext";
import { Toaster } from "@/components/ui/sonner";
import Header from "./components/custom/Header";

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
      <Header />
      <Outlet />
      <Toaster />
    </UserProvider>
  );
}

export default App;
