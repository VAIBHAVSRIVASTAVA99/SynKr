import { useState, useEffect } from 'react';
import useGroupStore from '../store/useGroupStore';
import { useChatStore } from '../store/useChatStore';
import { useAuthStore } from '../store/useAuthStore';
import { X, Users, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardHeader, CardContent, CardFooter } from './ui/card';
import { cn } from '../lib/utils';
import toast from 'react-hot-toast';

const CreateGroupModal = ({ isOpen, onClose }) => {
  const [groupName, setGroupName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const { users } = useChatStore();
  const { authUser } = useAuthStore();
  const { createGroup } = useGroupStore();

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setGroupName('');
      setSelectedUsers([]);
    }
  }, [isOpen]);

  // Filter out the current user from potential group members
  const potentialMembers = users.filter(user => user._id !== authUser._id);

  const toggleUserSelection = (user) => {
    setSelectedUsers(prev => 
      prev.find(u => u._id === user._id)
        ? prev.filter(u => u._id !== user._id)
        : [...prev, user]
    );
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      toast.error("Group name is required", {
        style: {
          color: '#ffffff' 
        }
      });
      return;
    }

    if (selectedUsers.length === 0) {
      toast.error("Please select at least one group member", {
        style: {
          color: '#ffffff' 
        }
      });
      return;
    }

    const groupData = {
      name: groupName,
      members: [
        authUser._id, 
        ...selectedUsers.map(user => user._id)
      ]
    };

    const createdGroup = await createGroup(groupData);
    
    if (createdGroup) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-background/95">
        <CardHeader className="flex flex-row items-center justify-between p-4 space-y-0">
          <h2 className="text-xl text-white font-semibold flex items-center gap-2">
            <Users className="size-5" />
            Create New Group
          </h2>
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="size-5 text-white" />
          </Button>
        </CardHeader>

        <CardContent className="p-4 space-y-4">
          <div>
            <label 
              htmlFor="groupName" 
              className="text-white block text-sm font-medium mb-2"
            >
              Group Name
            </label>
            <Input
              id="groupName"
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name"
              className="w-full text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Select Group Members
            </label>
            <div className="text-white max-h-60 overflow-y-auto rounded-lg border border-primary-600/20 divide-y divide-primary-600/10">
              {potentialMembers.map((user) => (
                <button
                  key={user._id}
                  onClick={() => toggleUserSelection(user)}
                  className={cn(
                    "w-full flex items-center p-3 transition-colors",
                    "hover:bg-primary-600/5",
                    selectedUsers.find(u => u._id === user._id) && "bg-primary-600/10"
                  )}
                >
                  <div className="relative mr-3">
                    <div className="size-10 rounded-full ring-2 ring-primary-600/20 overflow-hidden">
                      <img
                        src={user.profilePic || "/avatar.png"}
                        alt={user.fullName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {selectedUsers.find(u => u._id === user._id) && (
                      <span className="absolute -bottom-1 -right-1 bg-primary-600 text-white rounded-full size-5 flex items-center justify-center ring-2 ring-background">
                        <Check className="size-3" />
                      </span>
                    )}
                  </div>
                  <div className="text-left">
                    <div className="font-medium">{user.fullName}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </CardContent>

        <CardFooter className="bg-gray-900 text-white flex justify-end gap-2 p-4">
          <Button
            onClick={onClose}
            variant="ghost"
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateGroup}
            className="gap-2"
          >
            <Users className="size-4" />
            Create Group
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CreateGroupModal;