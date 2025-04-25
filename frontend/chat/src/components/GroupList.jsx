import React, { useEffect } from 'react';
import useGroupStore from '../store/useGroupStore';
import { useAuthStore } from '../store/useAuthStore';

const GroupList = ({ onGroupSelect }) => {
  const { groups, fetchGroups, loading } = useGroupStore();
  const { authUser } = useAuthStore();

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  return (
    <div className="flex flex-col h-full bg-[#3B5998]">
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button className="text-white px-4 py-2">Contacts</button>
          <button className="text-white px-4 py-2 bg-[#4B69A6] rounded">Groups</button>
        </div>
        <button className="bg-[#00F2EA] text-black px-4 py-2 rounded flex items-center gap-2">
          <span>+</span>
          Create Group
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="text-white text-center p-4">Loading groups...</div>
        ) : groups.length === 0 ? (
          <div className="text-white text-center p-4">No groups available</div>
        ) : (
          groups.map((group) => (
            <div
              key={group._id}
              onClick={() => onGroupSelect(group)}
              className="flex items-center gap-3 p-4 hover:bg-[#4B69A6] cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full bg-[#4B69A6] flex items-center justify-center">
                <span className="text-white text-xl uppercase">{group.name[0]}</span>
              </div>
              <div>
                <h3 className="text-white">{group.name}</h3>
                <p className="text-gray-300 text-sm">{group.members.length} members</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default GroupList; 