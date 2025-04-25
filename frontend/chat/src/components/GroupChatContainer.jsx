import React, { useState, useEffect, useRef } from 'react';
import { useSocketStore } from '../store/useSocketStore';
import { useAuthStore } from '../store/useAuthStore';
import { format } from 'date-fns';
import ChatHeader from './ChatHeader';
import MessageInput from './MessageInput';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';
import MessageSkeleton from './skeletons/MessageSkeleton';

const GroupChatContainer = ({ group }) => {
  console.log('GroupChatContainer rendered with group:', group);
  
  const [messages, setMessages] = useState([]);
  const [groupMembers, setGroupMembers] = useState(group.members || []);
  const [isLoading, setIsLoading] = useState(true);
  const [userDetails, setUserDetails] = useState({});
  const messagesEndRef = useRef(null);
  const { socket, isConnected } = useSocketStore();
  const { authUser } = useAuthStore();

  const fetchUserDetails = async (userId) => {
    try {
      const response = await axiosInstance.get(`/api/users/${userId}`);
      setUserDetails(prev => ({
        ...prev,
        [userId]: response.data
      }));
      return response.data;
    } catch (error) {
      console.error('Error fetching user details:', error);
      return null;
    }
  };

  const processMessage = async (message) => {
    const senderId = message.senderId?._id;
    if (!senderId) return message;

    if (message.senderId?.fullName) {
      return {
        ...message,
        senderName: message.senderId.fullName,
        sender: senderId
      };
    }

    if (userDetails[senderId]) {
      return {
        ...message,
        senderName: userDetails[senderId].fullName,
        sender: senderId
      };
    }

    try {
      const response = await axiosInstance.get(`/api/users/${senderId}`);
      const user = response.data;
      
      setUserDetails(prev => ({
        ...prev,
        [senderId]: user
      }));

      return {
        ...message,
        senderName: user.fullName,
        sender: senderId
      };
    } catch (error) {
      console.error('Error fetching user details:', error);
      return message;
    }
  };

  const handleSendMessage = (content) => {
    if (socket && isConnected) {
      const messageToSave = {
        text: content,
        senderId: authUser._id,
        senderInfo: {
          _id: authUser._id,
          fullName: authUser.fullName,
          profilePic: authUser.profilePic
        },
        groupId: group._id,
        groupInfo: {
          _id: group._id,
          name: group.name
        }
      };
      
      axiosInstance.post(`/api/messages/group/${group._id}`, messageToSave)
        .then((response) => {
          const savedMessage = response.data;
          socket.emit('groupMessage', savedMessage);
          setMessages(prev => [...prev, savedMessage]);
        })
        .catch((error) => {
          toast.error('Failed to send message');
          console.error('Error sending message:', error);
        });
    }
  };

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axiosInstance.get(`/api/messages/group/${group._id}`);
        console.log('Raw messages from server:', response.data);
        setMessages(response.data);
        setIsLoading(false);
      } catch (error) {
        toast.error('Failed to fetch messages');
        console.error('Error fetching messages:', error);
        setIsLoading(false);
      }
    };

    if (group._id) {
      fetchMessages();
    }
  }, [group._id]);

  useEffect(() => {
    if (socket && isConnected && group._id) {
      socket.on('groupMessage', (message) => {
        console.log('Received real-time message:', message);
        if (message.groupId === group._id) {
          setMessages(prev => [...prev, message]);
        }
      });

      socket.on('groupMembers', (members) => {
        setGroupMembers(members);
      });

      return () => {
        socket.off('groupMessage');
        socket.off('groupMembers');
      };
    }
  }, [socket, isConnected, group._id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
    }

  return (
    <div className="bg-gray-900 flex-1 flex flex-col text-white">
      <ChatHeader group={group} memberCount={groupMembers.length} />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => {
          const isOwnMessage = message.senderInfo?._id === authUser._id;
          
          return (
            <div
              key={message._id || index}
              className={`flex flex-col ${isOwnMessage ? "items-end" : "items-start"} mb-4`}
            >
              <div className={`flex items-center gap-2 mb-1 ${isOwnMessage ? "flex-row-reverse" : "flex-row"}`}>
                <div className="avatar">
                  <div className="size-8 rounded-full border">
                    <img
                      src={message.senderInfo?.profilePic || "/avatar.png"}
                      alt="profile pic"
                    />
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className={`text-sm font-medium ${isOwnMessage ? "text-blue-600" : "text-green-600"}`}>
                    {message.senderInfo?.fullName}
                  </span>
                  <span className="text-xs text-gray-500">
                    to {message.groupInfo?.name || group.name}
                  </span>
                </div>
              </div>
              
              <div className={`max-w-[80%] ${isOwnMessage ? "items-end" : "items-start"}`}>
                <div className={`rounded-lg p-3 ${
                  isOwnMessage 
                  ? "bg-blue-500 text-white rounded-tr-none" 
                  : "bg-gray-200 text-gray-800 rounded-tl-none"
                }`}>
                  <div className="flex flex-col">
                    {(message.content || message.text) && (
                      <p className="break-words">{message.content || message.text}</p>
                    )}
                    {message.image && (
                      <img
                        src={message.image}
                        alt="Attachment"
                        className="sm:max-w-[200px] rounded-md mb-2"
                      />
                    )}
                    {message.video && (
                      <video
                        controls
                        className="sm:max-w-[250px] rounded-md mb-2"
                      >
                        <source src={message.video} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    )}
                  </div>
                  <div className={`text-xs mt-1 ${isOwnMessage ? "text-white/70" : "text-gray-500"}`}>
                    {format(new Date(message.timestamp || message.createdAt), 'HH:mm')}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <MessageInput onSendMessage={handleSendMessage} />
    </div>
  );
};

export default GroupChatContainer; 