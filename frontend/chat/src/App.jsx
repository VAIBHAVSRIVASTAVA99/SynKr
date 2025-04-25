import Navbar from "./components/Navbar";
import Homemain from "./pages/Homemain";
import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/tmk";
import LoginPage from "./pages/LoginPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";

import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore";
import { useThemeStore } from "./store/useThemeStore";
import { useEffect } from "react";
import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";

const App = () => {
  const { authUser, checkAuth, isCheckingAuth, onlineUsers } = useAuthStore();
  const { theme } = useThemeStore();
  
  console.log({ onlineUsers });
  
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);
  
  console.log({ authUser });
  
  if (isCheckingAuth && !authUser)
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-tr from-background via-background/95 to-background/90">
        <div className="relative">
          <div className="absolute -inset-0.5 rounded-lg bg-gradient-to-r from-primary-600 to-primary-400 opacity-75 blur" />
          <div className="relative bg-background/95 backdrop-blur-sm p-4 rounded-lg">
            <Loader className="size-10 animate-spin text-primary-600" />
          </div>
        </div>
      </div>
    );
  
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <Routes>
        <Route path="/" element={<Homemain />} />
        <Route path="/home" element={authUser ? <HomePage /> : <Navigate to="/login" />} />
        <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/home" />} />
        <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/home" />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
      </Routes>
      
     
      
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: 'hsl(var(--background))',
            color: 'hsl(var(--foreground))',
            border: '1px solid hsl(var(--primary) / 0.2)',
          },
        }}
      />
    </div>
  );
};

export default App;