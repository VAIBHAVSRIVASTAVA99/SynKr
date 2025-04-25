import { create } from 'zustand';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { io } from 'socket.io-client';

const useGroupStore = create((set, get) => {
  const socket = io(import.meta.env.VITE_SERVER_URL, {
    withCredentials: true,
  });

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
        const response = await axios.get('/api/groups', {
          withCredentials: true,
        });
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
        const response = await axios.get(`/api/messages/group/${groupId}`, {
          withCredentials: true,
        });
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

        const response = await axios.post(
          `/api/messages/send/${selectedGroup._id}`,
          { ...messageData, groupId: selectedGroup._id },
          { withCredentials: true }
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
        const response = await axios.post('/api/groups', groupData, {
          withCredentials: true,
        });
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
        const response = await axios.post(
          `/api/groups/${groupId}/members`,
          { userId },
          { withCredentials: true }
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
        const response = await axios.delete(
          `/api/groups/${groupId}/members`,
          { data: { userId }, withCredentials: true }
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
        await axios.delete(`/api/groups/${groupId}`, {
          withCredentials: true,
        });
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