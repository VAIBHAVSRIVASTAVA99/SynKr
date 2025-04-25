import React from 'react';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import CallInterface from './CallInterface';

const ChatLayout = () => {
  return (
    <div className="flex flex-col h-full w-screen bg-gray-900">
      <ChatHeader />
      <MessageList />
      <MessageInput />
      <CallInterface />
    </div>
  );
};

export default ChatLayout;