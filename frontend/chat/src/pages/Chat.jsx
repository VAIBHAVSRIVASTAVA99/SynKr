import { useEffect, useState, useCallback } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { ChatSidebar } from "../components/ChatSidebar";
import { ChatMessages } from "../components/ChatMessages";
import { ChatInput } from "../components/ChatInput";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

export const Chat = () => {
  const navigate = useNavigate();
  const { user, socket } = useAuthStore();
  const { 
    getUsers, 
    getMessages, 
    sendMessage, 
    setSelectedUser, 
    initializeSocket, 
    cleanupSocket,
    selectedUser,
    users,
    messages,
    isUsersLoading,
    isMessagesLoading
  } = useChatStore();

  const initializeChat = useCallback(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    // Initialize socket connection
    if (!socket?.connected) {
      console.warn("Socket not connected, attempting to connect...");
      return;
    }

    // Initialize chat functionality
    getUsers();
    initializeSocket();
  }, [user, navigate, getUsers, initializeSocket, socket]);

  useEffect(() => {
    initializeChat();

    return () => {
      cleanupSocket();
    };
  }, [initializeChat, cleanupSocket]);

  useEffect(() => {
    if (selectedUser) {
      getMessages(selectedUser._id);
    }
  }, [selectedUser, getMessages]);

  const handleSendMessage = useCallback(async (message) => {
    if (!selectedUser) {
      toast.error("Please select a user to chat with", {
        style: {
          color: '#ffffff' 
        }
      });
      return;
    }
    
    if (!socket?.connected) {
      toast.error("Not connected to chat server. Please refresh the page.", {
        style: {
          color: '#ffffff' 
        }
      });
      return;
    }

    try {
      await sendMessage({ content: message });
    } catch (error) {
      toast.error("Failed to send message", {
        style: {
          color: '#ffffff' 
        }
      });
    }
  }, [selectedUser, socket, sendMessage]);

  if (isUsersLoading) {
    return <div className="flex items-center justify-center h-screen">
      <div className="text-gray-500">Loading chat...</div>
    </div>;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <ChatSidebar 
        users={users} 
        selectedUser={selectedUser} 
        onSelectUser={setSelectedUser} 
      />
      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            <ChatMessages 
              messages={messages} 
              selectedUser={selectedUser} 
              isLoading={isMessagesLoading} 
            />
            <ChatInput onSendMessage={handleSendMessage} />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500">Select a user to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}; 