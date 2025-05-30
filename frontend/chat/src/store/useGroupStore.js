import { create } from 'zustand';
import { axiosInstance } from '../lib/axios';
import { toast } from 'react-hot-toast';
import { io } from 'socket.io-client';

const socket = io(import.meta.env.VITE_SOCKET_URL || "https://synkr-o8iz.onrender.com", {
  withCredentials: true,
});

const useGroupStore = create((set, get) => {
  return {
    groups: [], 
    selectedGroup: null,
    groupMessages: [],
    isGroupMessagesLoading: false,
    loading: false,
    error: null,
    socket,

    fetchGroups: async () => {
      try {
        set({ loading: true, error: null });
        const response = await axiosInstance.get('/api/groups');
        console.log('Fetched groups:', response.data); // Debug log
        set({ groups: response.data || [], loading: false });
      } catch (error) {
        console.error('Error fetching groups:', error); // Debug log
        set({ error: error.message, loading: false, groups: [] });
        toast.error('Failed to fetch groups', {
          style: {
            color: '#ffffff' 
          }
        });
      }
    },

    getGroupMessages: async (groupId) => {
      try {
        set({ isGroupMessagesLoading: true, error: null });
        const response = await axiosInstance.get(`/api/messages/group/${groupId}`);
        set({ groupMessages: response.data || [], isGroupMessagesLoading: false });
      } catch (error) {
        set({ error: error.message, isGroupMessagesLoading: false, groupMessages: [] });
        toast.error('Failed to fetch group messages', {
          style: {
            color: '#ffffff' 
          }
        });
      }
    },

    subscribeToGroupMessages: () => {
      const { socket, selectedGroup } = get();
      if (!socket || !selectedGroup) return;

      socket.on('groupMessage', (message) => {
        set((state) => ({
          groupMessages: [...(state.groupMessages || []), message],
        }));
      });
    },

    unsubscribeFromGroupMessages: () => {
      const { socket } = get();
      if (!socket) return;

      socket.off('groupMessage');
    },

    sendGroupMessage: async (messageData) => {
      try {
        const { socket, selectedGroup } = get();
        if (!socket || !selectedGroup) return;

        const response = await axiosInstance.post(
          `/api/messages/send/${selectedGroup._id}`,
          { ...messageData, groupId: selectedGroup._id }
        );

        socket.emit('groupMessage', response.data);
        set((state) => ({
          groupMessages: [...(state.groupMessages || []), response.data],
        }));
      } catch (error) {
        toast.error('Failed to send message', {
          style: {
            color: '#ffffff' 
          }
        });
      }
    },

    createGroup: async (groupData) => {
      try {
        set({ loading: true, error: null });
        const response = await axiosInstance.post('/api/groups', groupData);
        set((state) => ({
          groups: [...(state.groups || []), response.data],
          loading: false,
        }));
        toast.success('Group created successfully');
        return response.data;
      } catch (error) {
        set({ error: error.message, loading: false });
        toast.error('Failed to create group', {
          style: {
            color: '#ffffff' 
          }
        });
        return null;
      }
    },

    addMember: async (groupId, userId) => {
      try {
        set({ loading: true, error: null });
        const response = await axiosInstance.post(
          `/api/groups/${groupId}/members`,
          { userId }
        );
        set((state) => ({
          groups: (state.groups || []).map((group) =>
            group._id === groupId ? response.data : group
          ),
          loading: false,
        }));
        toast.success('Member added successfully');
      } catch (error) {
        set({ error: error.message, loading: false });
        toast.error('Failed to add member', {
          style: {
            color: '#ffffff' 
          }
        });
      }
    },

    removeMember: async (groupId, userId) => {
      try {
        set({ loading: true, error: null });
        const response = await axiosInstance.delete(
          `/api/groups/${groupId}/members`,
          { data: { userId } }
        );
        set((state) => ({
          groups: (state.groups || []).map((group) =>
            group._id === groupId ? response.data : group
          ),
          loading: false,
        }));
        toast.success('Member removed successfully');
      } catch (error) {
        set({ error: error.message, loading: false });
        toast.error('Failed to remove member', {
          style: {
            color: '#ffffff' 
          }
        });
      }
    },

    deleteGroup: async (groupId) => {
      try {
        set({ loading: true, error: null });
        await axiosInstance.delete(`/api/groups/${groupId}`);
        set((state) => ({
          groups: (state.groups || []).filter((group) => group._id !== groupId),
          selectedGroup: null,
          loading: false,
        }));
        toast.success('Group deleted successfully');
      } catch (error) {
        set({ error: error.message, loading: false });
        toast.error('Failed to delete group', {
          style: {
            color: '#ffffff' 
          }
        });
      }
    },

    setSelectedGroup: (group) => set({ selectedGroup: group }),
  };
});

export default useGroupStore; 