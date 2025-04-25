import { useState } from 'react';
import useGroupStore from '../store/useGroupStore';
import { useAuthStore } from '../store/useAuthStore';
import { useChatStore } from '../store/useChatStore';
import { X, Users, Trash2, Plus, UserMinus } from 'lucide-react';

const GroupInfo = ({ group, onClose }) => {
  const [showAddMember, setShowAddMember] = useState(false);
  const { authUser } = useAuthStore();
  const { users } = useChatStore();
  const { addMember, removeMember, deleteGroup } = useGroupStore();

  const isAdmin = group.admin._id === authUser._id;
  const potentialMembers = users.filter(
    (user) =>
      !group.members.some((member) => member._id === user._id) &&
      user._id !== authUser._id
  );

  const handleAddMember = async (userId) => {
    await addMember(group._id, userId);
    setShowAddMember(false);
  };

  const handleRemoveMember = async (userId) => {
    await removeMember(group._id, userId);
  };

  const handleDeleteGroup = async () => {
    if (window.confirm('Are you sure you want to delete this group?')) {
      await deleteGroup(group._id);
      onClose();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Users className="size-6" />
          Group Info
        </h2>
        <button onClick={onClose} className="text-gray-600 hover:text-gray-900">
          <X className="size-6" />
        </button>
      </div>

      <div className="p-4">
        <div className="mb-4">
          <h3 className="text-lg font-medium">{group.name}</h3>
          {group.description && (
            <p className="text-gray-600 mt-1">{group.description}</p>
          )}
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-medium">Members</h4>
            {isAdmin && (
              <button
                onClick={() => setShowAddMember(!showAddMember)}
                className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <Plus className="size-4" />
                Add Member
              </button>
            )}
          </div>

          {showAddMember && (
            <div className="mb-4 p-2 border rounded-md">
              <h5 className="text-sm font-medium mb-2">Select a user to add:</h5>
              <div className="max-h-40 overflow-y-auto">
                {potentialMembers.map((user) => (
                  <button
                    key={user._id}
                    onClick={() => handleAddMember(user._id)}
                    className="w-full flex items-center p-2 hover:bg-gray-100"
                  >
                    <img
                      src={user.profilePic || "/avatar.png"}
                      alt={user.fullName}
                      className="size-8 rounded-full mr-2"
                    />
                    <span>{user.fullName}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            {group.members.map((member) => (
              <div
                key={member._id}
                className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md"
              >
                <div className="flex items-center">
                  <img
                    src={member.profilePic || "/avatar.png"}
                    alt={member.fullName}
                    className="size-8 rounded-full mr-2"
                  />
                  <div>
                    <div className="font-medium">{member.fullName}</div>
                    {member._id === group.admin._id && (
                      <span className="text-xs text-blue-600">Admin</span>
                    )}
                  </div>
                </div>
                {isAdmin && member._id !== authUser._id && (
                  <button
                    onClick={() => handleRemoveMember(member._id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <UserMinus className="size-5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {isAdmin && (
        <div className="p-4 border-t">
          <button
            onClick={handleDeleteGroup}
            className="w-full flex items-center justify-center gap-2 text-red-600 hover:text-red-800"
          >
            <Trash2 className="size-5" />
            Delete Group
          </button>
        </div>
      )}
    </div>
  );
};

export default GroupInfo; 