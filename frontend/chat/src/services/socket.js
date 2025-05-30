import { io } from "socket.io-client";

console.log('VITE_SOCKET_URL:', import.meta.env.VITE_SOCKET_URL);
console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
console.log('Default Socket URL:', "https://synkr-o8iz.onrender.com");
console.log('Final Socket URL being used:', import.meta.env.VITE_SOCKET_URL || "https://synkr-o8iz.onrender.com");

const SOCKET_URL = "https://synkr-o8iz.onrender.com";

const socket = io(SOCKET_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  timeout: 10000,
  transports: ['websocket', 'polling'],
  path: '/socket.io/',
  withCredentials: true
});

let isInitialized = false;
let connectionError = null;

socket.on("connect", () => {
  console.log("Socket connected successfully");
  connectionError = null;
});

socket.on("disconnect", (reason) => {
  console.log(`Socket disconnected: ${reason}`);
  if (reason === "io server disconnect") {
    console.log("Attempting reconnection...");
    socket.connect();
  }
});

socket.on("connect_error", (error) => {
  console.error("Socket connection error:", error.message);
  connectionError = error.message;
});

export const initializeSocket = (userId) => {
  if (isInitialized && socket.connected) {
    console.log("Socket already initialized and connected");
    return true;
  }

  try {
    if (!userId) {
      console.error("Cannot initialize socket: No userId available");
      connectionError = "User ID missing";
      return false;
    }
    
    socket.io.opts.query = {
      userId
    };
    
    console.log("Initializing socket connection...");
    socket.connect();
    isInitialized = true;
    
    return socket.connected;
  } catch (err) {
    console.error("Socket initialization error:", err);
    connectionError = `Initialization failed: ${err.message}`;
    return false;
  }
};

export const reconnectSocket = (userId) => {
  if (socket.connected) {
    socket.disconnect();
  }
  
  return initializeSocket(userId);
};

export const disconnectSocket = () => {
  if (socket.connected) {
    console.log("Disconnecting socket...");
    socket.disconnect();
  }
  isInitialized = false;
};

export const getSocketStatus = () => {
  return {
    initialized: isInitialized,
    connected: socket.connected,
    error: connectionError
  };
};

export const isSocketConnected = () => {
  return socket.connected;
};

export default socket;
