import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '../store/useAuthStore';


import VideoSDK from "@videosdk.live/js-sdk";


export const useVideoSDK = () => {
  const { user } = useAuthStore();
  const [callState, setCallState] = useState('idle'); 
  const [currentCallId, setCurrentCallId] = useState(null);
  const [participantId, setParticipantId] = useState(null);
  const [isSDKReady, setIsSDKReady] = useState(false);
  const [error, setError] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  
  const sdkInstance = useRef(null);
  const currentCall = useRef(null);
  const unmountingRef = useRef(false);
  
  const initializeSDK = useCallback(async () => {
    try {
      setError(null);
      console.log('Initializing Video SDK...');

      const sdk = await VideoSDK.initialize({
        apiKey: '67ac618e-cb0b-42dd-b3f9-6ba6282e97f4',
        secretKey: '0ecfe95fef3a5db871e87ff21f074658a1a78e2195d56a7aef31b76719faf94c',
        userId: user?._id || 'anonymous-user',
        userName: user?.fullName || 'Anonymous'
      });
      
      sdkInstance.current = sdk;
      setIsSDKReady(true);
      console.log('Video SDK initialized successfully');
      
    } catch (err) {
      console.error('Failed to initialize Video SDK:', err);
      setError(`Failed to initialize video services: ${err.message}`);
      setIsSDKReady(false);
    }
  }, [user]);
  
  const startVideoCall = useCallback((userId) => {
    if (!isSDKReady || !sdkInstance.current) {
      const errorMsg = 'SDK not initialized. Cannot start video call.';
      console.error(errorMsg);
      setError(errorMsg);
      return Promise.reject(new Error(errorMsg));
    }
    
    if (!userId) {
      const errorMsg = 'Invalid user ID. Cannot start video call.';
      console.error(errorMsg);
      setError(errorMsg);
      return Promise.reject(new Error(errorMsg));
    }
    
    try {
      console.log(`Initiating video call with user ${userId}...`);
      setCallState('connecting');
      setError(null);

      const currentUserId = user?._id || 'unknown-user';
      
      const call = sdkInstance.current.createCall({
        callType: 'video',
        metadata: {
          initiatedBy: currentUserId,
          timestamp: new Date().toISOString()
        }
      });
      
      currentCall.current = call;
      setCurrentCallId(call.id);
      setParticipantId(userId);
      setIsVideoEnabled(true);
      setIsAudioEnabled(true);
      
      call.addParticipant(userId);
      
      return call.connect()
        .then(() => {
          console.log(`Call connected successfully, waiting for ${userId} to join...`);
          setCallState('ongoing');
          return call;
        })
        .catch(err => {
          console.error('Failed to connect to call:', err);
          setError(`Connection failed: ${err.message}`);
          setCallState('idle');
          currentCall.current = null;
          throw err;
        });
    } catch (err) {
      console.error('Failed to start video call:', err);
      setError(`Failed to start video call: ${err.message}`);
      setCallState('idle');
      return Promise.reject(err);
    }
  }, [isSDKReady, user]);
  
  
  const startAudioCall = useCallback((userId) => {
    if (!isSDKReady || !sdkInstance.current) {
      const errorMsg = 'SDK not initialized. Cannot start audio call.';
      console.error(errorMsg);
      setError(errorMsg);
      return Promise.reject(new Error(errorMsg));
    }
    
    if (!userId) {
      const errorMsg = 'Invalid user ID. Cannot start audio call.';
      console.error(errorMsg);
      setError(errorMsg);
      return Promise.reject(new Error(errorMsg));
    }
    
    try {
      console.log(`Initiating audio call with user ${userId}...`);
      setCallState('connecting');
      setError(null);

      const currentUserId = user?._id || 'unknown-user';
      
      const call = sdkInstance.current.createCall({
        callType: 'audio',
        metadata: {
          initiatedBy: currentUserId,
          timestamp: new Date().toISOString()
        }
      });
      
      currentCall.current = call;
      setCurrentCallId(call.id);
      setParticipantId(userId);
      setIsVideoEnabled(false);
      setIsAudioEnabled(true);
      
      call.addParticipant(userId);
      
      return call.connect()
        .then(() => {
          console.log(`Audio call connected successfully, waiting for ${userId} to join...`);
          setCallState('ongoing');
          call.toggleVideo(false);
          return call;
        })
        .catch(err => {
          console.error('Failed to connect to audio call:', err);
          setError(`Audio connection failed: ${err.message}`);
          setCallState('idle');
          currentCall.current = null;
          throw err;
        });
    } catch (err) {
      console.error('Failed to start audio call:', err);
      setError(`Failed to start audio call: ${err.message}`);
      setCallState('idle');
      return Promise.reject(err);
    }
  }, [isSDKReady, user]);
  
  const endCall = useCallback(() => {
    if (currentCall.current && callState !== 'idle') {
      try {
        console.log('Ending current call...');
        currentCall.current.disconnect();
        setCallState('idle');
        setCurrentCallId(null);
        setParticipantId(null);
        currentCall.current = null;
        setLocalStream(null);
        setRemoteStream(null);
        console.log('Call ended successfully');
        return true;
      } catch (err) {
        console.error('Failed to end call:', err);
        setError(`Failed to end call: ${err.message}`);
        return false;
      }
    } else {
      console.log('No active call to end');
      return false;
    }
  }, [callState]);
  
  const toggleAudio = useCallback((enabled) => {
    if (currentCall.current && callState === 'ongoing') {
      try {
        currentCall.current.toggleAudio(enabled);
        setIsAudioEnabled(enabled);
        console.log(`Audio ${enabled ? 'enabled' : 'disabled'}`);
        return true;
      } catch (err) {
        console.error('Failed to toggle audio:', err);
        setError(`Failed to ${enabled ? 'enable' : 'disable'} audio: ${err.message}`);
        return false;
      }
    } else {
      console.warn('Cannot toggle audio: No active call');
      return false;
    }
  }, [callState]);
  
  const toggleVideo = useCallback((enabled) => {
    if (currentCall.current && callState === 'ongoing') {
      try {
        currentCall.current.toggleVideo(enabled);
        setIsVideoEnabled(enabled);
        console.log(`Video ${enabled ? 'enabled' : 'disabled'}`);
        return true;
      } catch (err) {
        console.error('Failed to toggle video:', err);
        setError(`Failed to ${enabled ? 'enable' : 'disable'} video: ${err.message}`);
        return false;
      }
    } else {
      console.warn('Cannot toggle video: No active call');
      return false;
    }
  }, [callState]);
  
  useEffect(() => {
    unmountingRef.current = false;
    if (!isSDKReady && !sdkInstance.current) {
      console.log('Initial SDK setup...');
      initializeSDK();
    }
    return () => {
      unmountingRef.current = true;
      if (currentCall.current && callState !== 'idle' && callState !== 'ongoing') {
        console.log('Component unmounting, ending active call...');
        currentCall.current.disconnect();
      }
    };
  }, [initializeSDK, isSDKReady, callState]);
  
  useEffect(() => {
    console.log('Local stream status:', localStream ? 'Available' : 'Not available');
    console.log('Remote stream status:', remoteStream ? 'Available' : 'Not available');
  }, [localStream, remoteStream]);
  
  return {
    isSDKReady,
    callState,
    currentCallId,
    participantId,
    error,
    localStream,
    remoteStream,
    isAudioEnabled,
    isVideoEnabled,
    initializeSDK,
    startVideoCall,
    startAudioCall,
    endCall,
    toggleAudio,
    toggleVideo
  };
};
