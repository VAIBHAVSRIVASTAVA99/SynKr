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
    if (!socket) {
      console.warn("Socket not available for chat initialization");
      return;
    }

    console.log("Initializing chat socket events");

    socket.on("newMessage", (newMessage) => {
      console.log("New message received:", newMessage);
      const { selectedUser, messages } = get();
      
      if (selectedUser && 
          (newMessage.senderId === selectedUser._id || newMessage.receiverId === selectedUser._id)) {
        set({ messages: [...messages, newMessage] });
      }
    });

    socket.on("userOnline", (userId) => {
      console.log("User online:", userId);
      set(state => ({
        users: state.users.map(user => 
          user._id === userId ? { ...user, isOnline: true } : user
        )
      }));
    });

    socket.on("userOffline", (userId) => {
      console.log("User offline:", userId);
      set(state => ({
        users: state.users.map(user => 
          user._id === userId ? { ...user, isOnline: false } : user
        )
      }));
    });

    socket.on("error", (error) => {
      console.error("Socket error in chat:", error);
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error in chat:", error);
    });
  },

  cleanupSocket: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    console.log("Cleaning up chat socket events");

    socket.off("newMessage");
    socket.off("userOnline");
    socket.off("userOffline");
    socket.off("error");
    socket.off("connect_error");
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));