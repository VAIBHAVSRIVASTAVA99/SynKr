import { useEffect, useState, useRef, useCallback } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useChatStore } from '../store/useChatStore';

export const useWebRTC = () => {
  const [callStatus, setCallStatus] = useState('idle');
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [currentCallId, setCurrentCallId] = useState(null);
  const [callData, setCallData] = useState(null);
  const [mediaPermissionGranted, setMediaPermissionGranted] = useState(false);
  
  const peerConnection = useRef(null);
  const { authUser, socket } = useAuthStore();
  const { selectedUser } = useChatStore();
  
  useEffect(() => {
    const checkMediaPermissions = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        setMediaPermissionGranted(true);
        console.log('Media permissions granted');
      } catch (err) {
        console.error('Media permission check failed:', err);
        setMediaPermissionGranted(false);
        setError(`Media access error: ${err.message}. Please grant microphone access.`);
      }
    };
    
    checkMediaPermissions();
  }, []);
  
  useEffect(() => {
    let connectionCheckInterval;
    const checkConnectionStatus = () => {
      console.log('Socket state check:', {
        hasSocket: !!socket, 
        connected: socket?.connected, 
        hasAuthUser: !!authUser,
        readyState: socket?.readyState
      });
      if (!authUser || !socket) {
        setIsReady(false);
        setError('Waiting for authentication...');
        return;
      }
      if (socket.connected) {
        setIsReady(true);
        setError(null);
      } else {
        setIsReady(false);
        setError('Socket disconnected. Please refresh or login again.');
      }
      if (!navigator.mediaDevices || !window.RTCPeerConnection) {
        setError('Your browser does not support WebRTC');
        setIsReady(false);
        return;
      }
    };
    checkConnectionStatus();
    connectionCheckInterval = setInterval(checkConnectionStatus, 3000);
    return () => {
      clearInterval(connectionCheckInterval);
      cleanup();
    };
  }, [authUser, socket]);
  
  useEffect(() => {
    if (!socket || !authUser) {
      console.log('Socket not connected or user not authenticated, skipping event setup');
      return;
    }
    console.log('Setting up WebRTC socket event listeners');
    
    const handleIncomingCall = (data) => {
      console.log('Incoming call detected:', data);
      setCallStatus('incoming');
      setCallData(data);
      setCurrentCallId(data.callId);
      setIsVideoEnabled(data.isVideo);
    };
    
    const handleCallAccepted = async (data) => {
      console.log('Call accepted:', data);
      try {
        setCallStatus('active');
        await createPeerConnection(data);
      } catch (err) {
        console.error('Error in call accept:', err);
        setError(`Error setting up connection: ${err.message}`);
        cleanup();
      }
    };
    
    const handleCallRejected = (data) => {
      console.log('Call rejected:', data);
      setCallStatus('idle');
      setCurrentCallId(null);
      cleanup();
    };
    
    const handleCallEnded = (data) => {
      console.log('Call ended:', data);
      setCallStatus('idle');
      setCurrentCallId(null);
      cleanup();
    };
    
    const debugSocketEvent = (eventName, data) => {
      console.log(`Socket event ${eventName} received:`, data);
    };
    
    socket.on('incomingCall', (data) => {
      debugSocketEvent('incomingCall', data);
      handleIncomingCall(data);
    });
    
    socket.on('callAccepted', (data) => {
      debugSocketEvent('callAccepted', data);
      handleCallAccepted(data);
    });
    
    socket.on('callRejected', (data) => {
      debugSocketEvent('callRejected', data);
      handleCallRejected(data);
    });
    
    socket.on('callEnded', (data) => {
      debugSocketEvent('callEnded', data);
      handleCallEnded(data);
    });
    
    socket.on('iceCandidate', async (data) => {
      debugSocketEvent('iceCandidate', data);
      try {
        if (peerConnection.current && data.candidate) {
          await peerConnection.current.addIceCandidate(new RTCIceCandidate(data.candidate));
          console.log('ICE candidate added successfully');
        }
      } catch (err) {
        console.error('Error adding ICE candidate:', err);
      }
    });
    
    socket.on('sdpOffer', async (data) => {
      debugSocketEvent('sdpOffer', data);
      try {
        if (peerConnection.current) {
          console.log('Setting remote description from offer');
          await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.sdp));
          console.log('Creating answer');
          const answer = await peerConnection.current.createAnswer();
          console.log('Setting local description');
          await peerConnection.current.setLocalDescription(answer);
          console.log('Sending SDP answer');
          socket.emit('sdpAnswer', { 
            callId: currentCallId, 
            sdp: answer,
            recipientId: callData?.caller?.id
          });
        } else {
          console.error('Peer connection not available for SDP offer');
        }
      } catch (err) {
        console.error('Error handling SDP offer:', err);
        setError(`Connection negotiation error: ${err.message}`);
      }
    });
    
    // SDP Answer handling: set remote description.
    socket.on('sdpAnswer', async (data) => {
      debugSocketEvent('sdpAnswer', data);
      try {
        if (peerConnection.current) {
          console.log('Setting remote description from answer');
          await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.sdp));
          console.log('Remote description set successfully');
        } else {
          console.error('Peer connection not available for SDP answer');
        }
      } catch (err) {
        console.error('Error handling SDP answer:', err);
        setError(`Connection negotiation error: ${err.message}`);
      }
    });
    
    // Handle socket disconnections.
    socket.on('disconnect', (reason) => {
      console.log(`Socket disconnected during call: ${reason}`);
      if (callStatus !== 'idle') {
        setError(`Call disconnected: ${reason}`);
        cleanup();
        setCallStatus('idle');
      }
      setIsReady(false);
    });
    
    socket.on('connect', () => {
      console.log('Socket reconnected');
      setIsReady(true);
      setError(null);
    });
    
    console.log('Event listeners registered. Socket ID:', socket.id);
    
    return () => {
      socket.off('incomingCall');
      socket.off('callAccepted');
      socket.off('callRejected');
      socket.off('callEnded');
      socket.off('iceCandidate');
      socket.off('sdpOffer');
      socket.off('sdpAnswer');
    };
  }, [socket, authUser, currentCallId, callStatus, callData]);
  
  // Create RTCPeerConnection with media and ICE handling.
  const createPeerConnection = async (data) => {
    try {
      const configuration = {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' },
          { urls: 'stun:stun3.l.google.com:19302' },
          { urls: 'stun:stun4.l.google.com:19302' }
        ],
        iceCandidatePoolSize: 10
      };
      
      console.log('Creating peer connection with config:', configuration);
      
      if (peerConnection.current) {
        peerConnection.current.close();
      }
      
      peerConnection.current = new RTCPeerConnection(configuration);
      
      const mediaConstraints = {
        audio: true,
        video: isVideoEnabled ? { width: { ideal: 1280 }, height: { ideal: 720 } } : false
      };
      
      console.log('Requesting media with constraints:', mediaConstraints);
      
      try {
        const stream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
        console.log('Media stream obtained:', stream.getTracks().map(t => t.kind).join(', '));
        setLocalStream(stream);
        stream.getTracks().forEach(track => {
          console.log(`Adding ${track.kind} track to peer connection`);
          peerConnection.current.addTrack(track, stream);
        });
        setMediaPermissionGranted(true);
      } catch (mediaError) {
        console.error('Media access error:', mediaError);
        setMediaPermissionGranted(false);
        setError(`Media access error: ${mediaError.message}. Please grant required permissions.`);
        throw mediaError;
      }
      
      peerConnection.current.ontrack = (event) => {
        console.log('Received remote track:', event.track.kind);
        setRemoteStream(event.streams[0]);
      };
      
      peerConnection.current.onicecandidate = (event) => {
        if (event.candidate) {
          console.log('Generated ICE candidate:', event.candidate.candidate.substr(0, 50) + '...');
          socket.emit('iceCandidate', {
            callId: currentCallId,
            candidate: event.candidate,
            recipientId: selectedUser?._id || callData?.caller?.id
          });
        } else {
          console.log('ICE candidate gathering completed');
        }
      };
      
      peerConnection.current.onicegatheringstatechange = () => {
        console.log('ICE gathering state:', peerConnection.current.iceGatheringState);
      };
      
      peerConnection.current.oniceconnectionstatechange = () => {
        const state = peerConnection.current.iceConnectionState;
        console.log('ICE connection state changed to:', state);
        if (state === 'connected' || state === 'completed') {
          console.log('ICE connection established successfully');
          setError(null);
        } else if (state === 'disconnected') {
          console.log('ICE connection temporarily disconnected');
          setError('Connection unstable. Attempting to recover...');
        } else if (state === 'failed') {
          console.error('ICE connection failed');
          setError('Connection failed. Please end call and try again.');
          cleanup();
        }
      };
      
      peerConnection.current.onconnectionstatechange = () => {
        console.log('Connection state changed to:', peerConnection.current.connectionState);
        if (peerConnection.current.connectionState === 'connected') {
          setError(null);
          console.log('Peer connection established successfully');
        } else if (peerConnection.current.connectionState === 'failed') {
          setError('Call connection failed. Please try again.');
          cleanup();
        }
      };
      
      peerConnection.current.onsignalingstatechange = () => {
        console.log('Signaling state changed to:', peerConnection.current.signalingState);
      };
      
      // If we are the initiator, create and send the SDP offer.
      if (data.isInitiator) {
        console.log('Creating offer as initiator');
        try {
          const offer = await peerConnection.current.createOffer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: isVideoEnabled
          });
          console.log('Setting local description with offer');
          await peerConnection.current.setLocalDescription(offer);
          console.log('Sending SDP offer to peer');
          socket.emit('sdpOffer', { 
            callId: currentCallId, 
            sdp: offer,
            isVideo: isVideoEnabled,
            recipientId: selectedUser?._id
          }, (response) => {
            console.log('sdpOffer acknowledgement:', response);
          });
        } catch (offerError) {
          console.error('Error creating or sending offer:', offerError);
          throw offerError;
        }
      }
      
      return true;
    } catch (err) {
      console.error('Peer connection setup error:', err);
      setError(`Call setup error: ${err.message}`);
      cleanup();
      throw err;
    }
  };
  
  // Cleanup all media and connection resources.
  const cleanup = () => {
    console.log('Cleaning up WebRTC resources');
    if (localStream) {
      localStream.getTracks().forEach(track => {
        console.log(`Stopping ${track.kind} track`);
        track.stop();
      });
      setLocalStream(null);
    }
    if (peerConnection.current) {
      try {
        if (peerConnection.current.getTransceivers) {
          peerConnection.current.getTransceivers().forEach(transceiver => {
            if (transceiver.stop) transceiver.stop();
          });
        }
        peerConnection.current.close();
      } catch (err) {
        console.error('Error during peer connection cleanup:', err);
      }
      peerConnection.current = null;
    }
    setRemoteStream(null);
  };
  
  // --- Call-specific methods (initiator, answer, reject, and end) ---
  
  // Initiate a call by sending "initiateCall" over the socket.
  const startCall = useCallback((withVideo = false) => {
    console.log('startCall called with:', { 
      isReady, 
      selectedUser: selectedUser?._id, 
      authUser: authUser?._id, 
      callStatus,
      socketConnected: socket?.connected 
    });
    
    if (!isReady) {
      setError('Cannot start call - connection not ready');
      return false;
    }
    if (!selectedUser) {
      setError('Cannot start call - no recipient selected');
      return false;
    }
    if (callStatus !== 'idle') {
      setError('Cannot start call - already in a call');
      return false;
    }
    if (!socket || !socket.connected) {
      setError('Cannot start call - socket not connected');
      return false;
    }
    if (!mediaPermissionGranted) {
      navigator.mediaDevices.getUserMedia({ audio: true, video: withVideo })
        .then(stream => {
          stream.getTracks().forEach(track => track.stop());
          setMediaPermissionGranted(true);
          proceedWithCall(withVideo);
        })
        .catch(err => {
          console.error('Failed to get media permissions:', err);
          setError(`Media permission error: ${err.message}. Please grant required permissions.`);
          return false;
        });
    } else {
      proceedWithCall(withVideo);
    }
    return true;
  }, [isReady, selectedUser, authUser, callStatus, socket, mediaPermissionGranted]);
  
  // Proceed with call after permission checks.
  const proceedWithCall = useCallback((withVideo) => {
    setIsVideoEnabled(withVideo);
    setCallStatus('calling');
    const callId = `${authUser._id}-${selectedUser._id}-${Date.now()}`;
    setCurrentCallId(callId);
    console.log(`Starting ${withVideo ? 'video' : 'audio'} call to ${selectedUser._id} with ID ${callId}`);
    const callData = {
      recipientId: selectedUser._id,
      callId: callId,
      isVideo: withVideo,
      caller: {
        id: authUser._id,
        name: authUser.fullName || authUser.username || "User"
      }
    };
    console.log('Socket connected status:', socket.connected);
    console.log('Emitting initiateCall event');
    socket.emit("initiateCall", callData, (ack) => {
      console.log('initiateCall acknowledgement:', ack);
      if (!ack) {
        setTimeout(() => {
          if (callStatus === 'calling') {
            setError('No response from server. Please try again.');
            setCallStatus('idle');
          }
        }, 5000);
      }
    });
  }, [authUser, selectedUser, socket, callStatus]);
  
  // Answer an incoming call.
  const answerCall = useCallback(async () => {
    if (callStatus !== 'incoming' || !currentCallId || !socket) {
      console.error('Cannot answer call:', { callStatus, currentCallId, socketConnected: !!socket });
      return false;
    }
    try {
      console.log('Answering call with ID:', currentCallId);
      socket.emit("acceptCall", { 
        callId: currentCallId,
        recipientId: callData?.caller?.id
      }, (ack) => {
        console.log('acceptCall acknowledgement:', ack);
      });
      setCallStatus('active');
      await createPeerConnection({ isInitiator: false });
      return true;
    } catch (err) {
      console.error('Failed to answer call:', err);
      setError(`Failed to answer call: ${err.message}`);
      cleanup();
      return false;
    }
  }, [callStatus, currentCallId, socket, callData]);
  
  // Reject an incoming call.
  const rejectIncomingCall = useCallback(() => {
    if (callStatus !== 'incoming' || !currentCallId || !socket) return false;
    console.log('Rejecting call with ID:', currentCallId);
    socket.emit("rejectCall", { 
      callId: currentCallId, 
      recipientId: callData?.caller?.id 
    }, (ack) => {
      console.log('rejectCall acknowledgement:', ack);
    });
    setCallStatus('idle');
    setCurrentCallId(null);
    return true;
  }, [callStatus, currentCallId, socket, callData]);
  
  // End an active call.
  const endActiveCall = useCallback(() => {
    if (!currentCallId || !socket) return false;
    console.log('Ending call with ID:', currentCallId);
    socket.emit("endCall", { 
      callId: currentCallId,
      recipientId: selectedUser?._id || callData?.caller?.id
    }, (ack) => {
      console.log('endCall acknowledgement:', ack);
    });
    setCallStatus('idle');
    setCurrentCallId(null);
    cleanup();
    return true;
  }, [currentCallId, socket, selectedUser, callData]);
  
  // Optionally, retry connection if needed.
  const retryConnection = useCallback(() => {
    cleanup();
    if (!socket) {
      setError("Cannot reconnect - socket not available");
      return false;
    }
    setError("Attempting to reconnect...");
    const { connectSocket } = useAuthStore.getState();
    connectSocket();
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        stream.getTracks().forEach(track => track.stop());
        setMediaPermissionGranted(true);
        setError(null);
      })
      .catch(err => {
        setMediaPermissionGranted(false);
        setError(`Media permission error: ${err.message}`);
      });
    return true;
  }, [socket]);
  
  // Reconnect the socket if disconnected.
  const reconnectSocket = useCallback(() => {
    if (!socket) return false;
    console.log('Attempting to reconnect socket...');
    if (socket.disconnected) {
      socket.connect();
      console.log('Socket reconnect initiated');
    }
    return true;
  }, [socket]);
  
  return {
    callStatus,
    isVideoEnabled,
    isReady,
    error,
    localStream,
    remoteStream,
    callData,
    startCall,
    answerCall,
    rejectIncomingCall,
    endActiveCall,
    retryConnection,
    reconnectSocket,
    mediaPermissionGranted
  };
};
