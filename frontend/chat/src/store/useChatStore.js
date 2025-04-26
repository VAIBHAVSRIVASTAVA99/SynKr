import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios.js";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  users: [],
  messages: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isSendingMessage: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/api/users");
      set({ users: res.data });
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users", {
        style: {
          color: '#ffffff' 
        }
      });
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    if (!userId) return;
    
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/api/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Failed to load messages", {
        style: {
          color: '#ffffff' 
        }
      });
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  setSelectedUser: (user) => {
    set({ selectedUser: user });
  },

  sendMessage: async (message) => {
    const { selectedUser, socket } = get();
    if (!selectedUser || !socket?.connected) return;

    set({ isSendingMessage: true });
    try {
      const res = await axiosInstance.post("/api/messages", {
        recipientId: selectedUser._id,
        content: message.content
      });

      set((state) => ({
        messages: [...state.messages, res.data]
      }));

      socket.emit("sendMessage", {
        recipientId: selectedUser._id,
        content: message.content
      });
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message", {
        style: {
          color: '#ffffff' 
        }
      });
    } finally {
      set({ isSendingMessage: false });
    }
  },

  initializeSocket: () => {
    const { socket } = useAuthStore.getState();
    if (!socket) return;

    socket.on("newMessage", (message) => {
      set((state) => ({
        messages: [...state.messages, message]
      }));
    });

    socket.on("userOnline", (userId) => {
      set((state) => ({
        users: state.users.map(user => 
          user._id === userId ? { ...user, isOnline: true } : user
        )
      }));
    });

    socket.on("userOffline", (userId) => {
      set((state) => ({
        users: state.users.map(user => 
          user._id === userId ? { ...user, isOnline: false } : user
        )
      }));
    });
  },

  cleanupSocket: () => {
    const { socket } = useAuthStore.getState();
    if (!socket) return;

    socket.off("newMessage");
    socket.off("userOnline");
    socket.off("userOffline");
  }
}));