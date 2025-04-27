import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "https://synkr-o8iz.onrender.com";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,
  
  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/api/auth/check");
      set({ authUser: res.data });
      get().connectSocket();
    } catch (error) {
      if (error?.response?.status !== 400 && error?.response?.status !== 401) {
        console.error("Error in checkAuth:", error?.response?.data?.message || error.message);
      }
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },
  
  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/api/auth/signup", data);
      set({ authUser: res.data });
      toast.success("Account created successfully");
      get().connectSocket();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to sign up", {
        style: {
          color: '#ffffff' 
        }
      });
    } finally {
      set({ isSigningUp: false });
    }
  },
  
  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/api/auth/login", data);
      set({ authUser: res.data });
      toast.success("Logged in successfully", {
        style: {
          color: '#ffffff' 
        }
      });
      get().connectSocket();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to log in", {
        style: {
          color: '#ffffff' 
        }
      });
    } finally {
      set({ isLoggingIn: false });
    }
  },
  
  logout: async () => {
    try {
    
      await axiosInstance.post("/api/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully", {
        style: {
          color: '#ffffff' 
        }
      });
      get().disconnectSocket();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to log out", {
        style: {
          color: '#ffffff' 
        }
      });
    }
  },
  
  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/api/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully", {
        style: {
          color: '#ffffff' 
        }
      });
    } catch (error) {
      console.error("Error in update profile:", error?.response?.data?.message || error.message);
      toast.error(error?.response?.data?.message || "Failed to update profile", {
        style: {
          color: '#ffffff' 
        }
      });
    } finally {
      set({ isUpdatingProfile: false });
    }
  },
  
  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;
    
    try {
      const socket = io(SOCKET_URL, {
        query: {
          userId: authUser._id,
        },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
        transports: ["websocket", "polling"]
      });
      
      socket.on("connect", () => {
        console.log("Socket connected successfully");
      });
      
      socket.on("connect_error", (err) => {
        console.error("Socket connection error:", err);
      });
      
      socket.on("getOnlineUsers", (userIds) => {
        set({ onlineUsers: userIds });
      });
      
      socket.connect();
      set({ socket: socket });
    } catch (error) {
      console.error("Failed to connect socket:", error);
    }
  },
  
  disconnectSocket: () => {
    const socket = get().socket;
    if (socket?.connected) {
      socket.disconnect();
      console.log("Socket disconnected");
    }
  }
}));