import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/api/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response.data.message, {
        style: {
          color: '#ffffff' 
        }
      });
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/api/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response.data.message, {
        style: {
          color: '#ffffff' 
        }
      });
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(`/api/messages/send/${selectedUser._id}`, messageData);
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error.response.data.message, {
        style: {
          color: '#ffffff' 
        }
      });
    }
  },

  initializeSocket: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    // Listen for all incoming messages
    socket.on("newMessage", (newMessage) => {
      const { selectedUser, messages } = get();
      
      // If we have a selected user and the message is from/to them, add it to messages
      if (selectedUser && 
          (newMessage.senderId === selectedUser._id || newMessage.receiverId === selectedUser._id)) {
        set({ messages: [...messages, newMessage] });
      }
    });

    // Listen for user online status updates
    socket.on("userOnline", (userId) => {
      set(state => ({
        users: state.users.map(user => 
          user._id === userId ? { ...user, isOnline: true } : user
        )
      }));
    });

    // Listen for user offline status updates
    socket.on("userOffline", (userId) => {
      set(state => ({
        users: state.users.map(user => 
          user._id === userId ? { ...user, isOnline: false } : user
        )
      }));
    });
  },

  cleanupSocket: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.off("newMessage");
    socket.off("userOnline");
    socket.off("userOffline");
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));