import { useVideoSDK } from './useVideosdk';

export const useCall = () => {
  const {
    isSDKReady,
    callState,
    currentCallId,
    participantId,
    error,
    localStream,
    remoteStream,
    isAudioEnabled,
    isVideoEnabled,
    startVideoCall,
    startAudioCall,
    endCall,
    toggleAudio,
    toggleVideo
  } = useVideoSDK();

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
    startVideoCall,
    startAudioCall,
    endCall,
    toggleAudio,
    toggleVideo
  };
};
