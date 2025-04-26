import React, { useState, useEffect, useRef } from 'react';
import { useSocketStore } from '../store/useSocketStore';
import { useAuthStore } from '../store/useAuthStore';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

const GroupChat = ({ groupId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [groupMembers, setGroupMembers] = useState([]);
  const messagesEndRef = useRef(null);
  const { socket, isConnected, joinGroup, leaveGroup, sendGroupMessage } = useSocketStore();
  const { user } = useAuthStore();

  useEffect(() => {
    if (socket && isConnected && groupId) {
      
      joinGroup(groupId, user._id);

      socket.on('groupMessage', (message) => {
        if (message.groupId === groupId) {
          setMessages((prev) => [...prev, message]);
        }
      });

      socket.on('groupMembers', (members) => {
        setGroupMembers(members);
      });

      return () => {
        socket.off('groupMessage');
        socket.off('groupMembers');
        leaveGroup(groupId, user._id);
      };
    }
  }, [socket, isConnected, groupId, user._id, joinGroup, leaveGroup]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    if (socket && isConnected) {
      const message = {
        content: newMessage,
        sender: user._id,
        senderName: user.name,
        timestamp: new Date(),
        groupId: groupId
      };

      sendGroupMessage(message);
      setNewMessage('');
    } else {
      toast.error('Not connected to server');
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-100">
      <div className="p-4 bg-white border-b">
        <h2 className="text-lg font-semibold mb-2">Group Members</h2>
        <div className="flex flex-wrap gap-2">
          {groupMembers.map((member) => (
            <div
              key={member._id}
              className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full"
            >
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-sm">{member.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`mb-4 ${
              message.sender === user._id ? 'text-right' : 'text-left'
            }`}
          >
            <div
              className={`inline-block max-w-[70%] p-3 rounded-lg ${
                message.sender === user._id
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-800'
              }`}
            >
              <div className="font-semibold mb-1">
                {message.sender === user._id ? 'You' : message.senderName}
              </div>
              <div className="text-sm">{message.content}</div>
              <div className="text-xs mt-1 opacity-70">
                {format(new Date(message.timestamp), 'h:mm a')}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="text-white p-4 bg-white border-t">
        <div className="flex gap-2 text-white">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default GroupChat; 