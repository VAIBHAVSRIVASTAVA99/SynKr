import { create } from 'zustand';
import { toast } from 'react-hot-toast';
import useVideoStore from './useVideoStore';

const useCallStore = create((set, get) => ({
  callStatus: 'idle', 
  caller: null,
  receiver: null,
  callType: null, 
  callStartTime: null,
  callEndTime: null,
  callDuration: 0,
  callHistory: [],

  initializeCall: (caller, receiver, callType) => {
    set({
      callStatus: 'calling',
      caller,
      receiver,
      callType,
      callStartTime: new Date(),
    });
  },

  acceptCall: () => {
    set({ callStatus: 'in-call' });
    useVideoStore.getState().startCallTimer();
  },

  rejectCall: () => {
    const { callStartTime } = get();
    set({
      callStatus: 'ended',
      callEndTime: new Date(),
      callDuration: callStartTime ? (new Date() - callStartTime) / 1000 : 0,
    });
    useVideoStore.getState().resetVideoStore();
  },

  endCall: () => {
    const { callStartTime } = get();
    set({
      callStatus: 'ended',
      callEndTime: new Date(),
      callDuration: callStartTime ? (new Date() - callStartTime) / 1000 : 0,
    });
    useVideoStore.getState().resetVideoStore();
  },

  updateCallStatus: (status) => {
    set({ callStatus: status });
  },

  addCallToHistory: (call) => {
    set((state) => ({
      callHistory: [...state.callHistory, call],
    }));
  },

  resetCallStore: () => {
    set({
      callStatus: 'idle',
      caller: null,
      receiver: null,
      callType: null,
      callStartTime: null,
      callEndTime: null,
      callDuration: 0,
    });
  },
}));

export default useCallStore; 