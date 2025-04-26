import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL = import.meta.env.VITE_API_URL || 
                (import.meta.env.MODE === "development" ? "http://localhost:5001" : "/");

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,
  isSocketConnecting: false,
  
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
    const { authUser, socket, isSocketConnecting } = get();
    
    // Don't try to connect if already connected or connecting
    if (!authUser || socket?.connected || isSocketConnecting) {
      return;
    }
    
    set({ isSocketConnecting: true });
    
    try {
      const newSocket = io(BASE_URL, {
        query: {
          userId: authUser._id,
        },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
        transports: ["websocket", "polling"],
        path: "/socket.io/",
        withCredentials: true,
        extraHeaders: {
          "Access-Control-Allow-Origin": "*"
        }
      });
      
      newSocket.on("connect", () => {
        console.log("Socket connected successfully");
        set({ socket: newSocket, isSocketConnecting: false });
        toast.success("Connected to chat server", {
          style: {
            color: '#ffffff' 
          }
        });
      });
      
      newSocket.on("connect_error", (err) => {
        console.error("Socket connection error:", err);
        set({ isSocketConnecting: false });
        toast.error("Failed to connect to chat server", {
          style: {
            color: '#ffffff' 
          }
        });
      });
      
      newSocket.on("disconnect", (reason) => {
        console.log("Socket disconnected:", reason);
        if (reason === "io server disconnect") {
          // Server initiated disconnect, try to reconnect
          newSocket.connect();
        }
      });
      
      newSocket.on("getOnlineUsers", (userIds) => {
        set({ onlineUsers: userIds });
      });
      
      newSocket.connect();
    } catch (error) {
      console.error("Failed to connect socket:", error);
      set({ isSocketConnecting: false });
      toast.error("Failed to initialize chat connection", {
        style: {
          color: '#ffffff' 
        }
      });
    }
  },
  
  disconnectSocket: () => {
    const { socket } = get();
    if (socket?.connected) {
      socket.disconnect();
      set({ socket: null, isSocketConnecting: false });
      console.log("Socket disconnected");
    }
  }
}));