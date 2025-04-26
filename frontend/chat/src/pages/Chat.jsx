import { useEffect, useState } from "react";
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

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    // Initialize socket connection
    if (!socket?.connected) {
      toast.error("Not connected to chat server. Please refresh the page.", {
        style: {
          color: '#ffffff' 
        }
      });
      return;
    }

    // Initialize chat functionality
    getUsers();
    initializeSocket();

    return () => {
      cleanupSocket();
    };
  }, [user, navigate, getUsers, initializeSocket, cleanupSocket, socket]);

  useEffect(() => {
    if (selectedUser) {
      getMessages(selectedUser._id);
    }
  }, [selectedUser, getMessages]);

  const handleSendMessage = async (message) => {
    if (!selectedUser) return;
    if (!socket?.connected) {
      toast.error("Not connected to chat server. Please refresh the page.", {
        style: {
          color: '#ffffff' 
        }
      });
      return;
    }
    await sendMessage({ content: message });
  };

  if (isUsersLoading) {
    return <div>Loading...</div>;
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