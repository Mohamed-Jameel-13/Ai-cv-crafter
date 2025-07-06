import React from "react";
import { Outlet } from "react-router-dom";
import { UserProvider } from "./context/UserContext";
import { Toaster } from "@/components/ui/sonner";
import Header from "./components/custom/Header";

// Main App Component
function App() {
  return (
    <UserProvider>
      <Header />
      {/* Responsive layout wrapper with proper header spacing */}
      <main className="pt-16 md:pt-20 min-h-screen">
        <Outlet />
      </main>
      <Toaster />
    </UserProvider>
  );
}

export default App;
