import { create } from 'zustand';
import { io } from 'socket.io-client';
import { toast } from 'react-hot-toast';
import useCallStore from './useCallStore';
import useVideoStore from './useVideoStore';

export const useSocketStore = create((set, get) => ({
  socket: null,
  isConnected: false,
  onlineUsers: [],
  activeCalls: [],
  groupMessages: [],
  groupMembers: [],

  initializeSocket: (userId) => {
    const socket = io(import.meta.env.VITE_SOCKET_URL || 'https://synkr-o8iz.onrender.com', {
      query: { userId },
    });

    socket.on('connect', () => {
      set({ socket, isConnected: true });
      toast.success('Connected to server', {
        style: {
          color: '#ffffff' 
        }
      });
    });

    socket.on('disconnect', () => {
      set({ isConnected: false });
      toast.error('Disconnected from server', {
        style: {
          color: '#ffffff' 
        }
      });
    });

    socket.on('error', (error) => {
      toast.error(`Socket error: ${error.message}`, {
        style: {
          color: '#ffffff' 
        }
      });
    });

    socket.on('onlineUsers', (users) => {
      set({ onlineUsers: users });
    });

    socket.on('groupMessage', (message) => {
      set((state) => ({
        groupMessages: [...state.groupMessages, message],
      }));
    });

    socket.on('groupMembers', (members) => {
      set({ groupMembers: members });
    });

    socket.on('callRequest', ({ caller, callType }) => {
      useCallStore.getState().initializeCall(caller, userId, callType);
      toast.info(`Incoming ${callType} call from ${caller.name}`, {
        style: {
          color: '#ffffff' 
        }
      });
    });

    socket.on('callAccepted', () => {
      useCallStore.getState().acceptCall();
    });

    socket.on('callRejected', () => {
      useCallStore.getState().rejectCall();
    });

    socket.on('callEnded', () => {
      useCallStore.getState().endCall();
    });

    socket.on('iceCandidate', (candidate) => {
      const { peerConnection } = useVideoStore.getState();
      if (peerConnection) {
        peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });

    socket.on('offer', async (offer) => {
      const { peerConnection } = useVideoStore.getState();
      if (peerConnection) {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        get().socket.emit('answer', answer);
      }
    });

    socket.on('answer', async (answer) => {
      const { peerConnection } = useVideoStore.getState();
      if (peerConnection) {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
      }
    });

    set({ socket });
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null, isConnected: false });
    }
  },

  joinGroup: (groupId, userId) => {
    const { socket } = get();
    if (socket) {
      socket.emit('joinGroup', { groupId, userId });
    }
  },

  leaveGroup: (groupId, userId) => {
    const { socket } = get();
    if (socket) {
      socket.emit('leaveGroup', { groupId, userId });
    }
  },

  sendGroupMessage: (message) => {
    const { socket } = get();
    if (socket) {
      socket.emit('groupMessage', message);
    }
  },

  sendCallRequest: (receiverId, callType) => {
    const { socket } = get();
    if (socket) {
      socket.emit('callRequest', { receiverId, callType });
    }
  },

  acceptCall: (callerId) => {
    const { socket } = get();
    if (socket) {
      socket.emit('callAccepted', { callerId });
    }
  },

  rejectCall: (callerId) => {
    const { socket } = get();
    if (socket) {
      socket.emit('callRejected', { callerId });
    }
  },

  endCall: (userId) => {
    const { socket } = get();
    if (socket) {
      socket.emit('callEnded', { userId });
    }
  },

  sendIceCandidate: (candidate, userId) => {
    const { socket } = get();
    if (socket) {
      socket.emit('iceCandidate', { candidate, userId });
    }
  },

  sendOffer: (offer, userId) => {
    const { socket } = get();
    if (socket) {
      socket.emit('offer', { offer, userId });
    }
  },

  sendAnswer: (answer, userId) => {
    const { socket } = get();
    if (socket) {
      socket.emit('answer', { answer, userId });
    }
  },
})); 