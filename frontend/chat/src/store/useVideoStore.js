import { create } from 'zustand';
import { toast } from 'react-hot-toast';

const useVideoStore = create((set, get) => ({
  localStream: null,
  remoteStream: null,
  isVideoEnabled: true,
  isAudioEnabled: true,
  isScreenSharing: false,
  isCallActive: false,
  isCallInProgress: false,
  callDuration: 0,
  callTimer: null,

  setLocalStream: (stream) => set({ localStream: stream }),

  setRemoteStream: (stream) => set({ remoteStream: stream }),

  toggleVideo: () => {
    const { localStream, isVideoEnabled } = get();
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !isVideoEnabled;
      });
      set({ isVideoEnabled: !isVideoEnabled });
    }
  },

  toggleAudio: () => {
    const { localStream, isAudioEnabled } = get();
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !isAudioEnabled;
      });
      set({ isAudioEnabled: !isAudioEnabled });
    }
  },

  toggleScreenSharing: async () => {
    const { localStream, isScreenSharing } = get();
    if (!isScreenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        });
        set({ localStream: screenStream, isScreenSharing: true });
      } catch (error) {
        toast.error('Failed to start screen sharing');
        console.error('Screen sharing error:', error);
      }
    } else {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        set({ localStream: null, isScreenSharing: false });
      }
    }
  },

  startCallTimer: () => {
    const timer = setInterval(() => {
      set((state) => ({ callDuration: state.callDuration + 1 }));
    }, 1000);
    set({ callTimer: timer, isCallActive: true });
  },

  stopCallTimer: () => {
    const { callTimer } = get();
    if (callTimer) {
      clearInterval(callTimer);
      set({ callTimer: null, isCallActive: false, callDuration: 0 });
    }
  },

  resetVideoStore: () => {
    const { localStream, remoteStream, callTimer } = get();
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    if (remoteStream) {
      remoteStream.getTracks().forEach(track => track.stop());
    }
    if (callTimer) {
      clearInterval(callTimer);
    }
    set({
      localStream: null,
      remoteStream: null,
      isVideoEnabled: true,
      isAudioEnabled: true,
      isScreenSharing: false,
      isCallActive: false,
      isCallInProgress: false,
      callDuration: 0,
      callTimer: null
    });
  }
}));

export default useVideoStore; 