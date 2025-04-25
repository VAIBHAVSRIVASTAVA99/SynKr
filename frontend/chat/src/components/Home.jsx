import React, { useState } from 'react';
import GroupList from './GroupList';
import GroupChatContainer from './GroupChatContainer';

const Home = () => {
  const [selectedGroup, setSelectedGroup] = useState(null);

  const handleGroupSelect = (group) => {
    setSelectedGroup(group);
  };

  return (
    <div className="flex h-screen">
      <div className="w-[400px] border-r border-[#2D4373]">
        <GroupList onGroupSelect={handleGroupSelect} />
      </div>

      <div className="flex-1">
        {selectedGroup ? (
          <GroupChatContainer group={selectedGroup} />
        ) : (
          <div className=" bg-gray-900 h-full flex flex-col items-center justify-center bg-[#3B5998] text-white">
            <h1 className="text-3xl font-semibold mb-4">Welcome to Synkr!</h1>
            <p className="text-gray-300">
              Select a conversation from the sidebar to start chatting
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home; 