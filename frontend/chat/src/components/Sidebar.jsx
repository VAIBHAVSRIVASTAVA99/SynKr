import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import useGroupStore from "../store/useGroupStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import CreateGroupModal from "./CreateGroupModal";
import { Users, FolderPlus, Plus } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const { groups, selectedGroup, setSelectedGroup, fetchGroups } = useGroupStore();
  
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [activeTab, setActiveTab] = useState('contacts');
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);

  useEffect(() => {
    getUsers();
    if (activeTab === 'groups') {
      fetchGroups();
    }
  }, [getUsers, activeTab, fetchGroups]);

  const filteredUsers = showOnlineOnly
    ? users.filter((user) => onlineUsers.includes(user._id))
    : users;

  if (isUsersLoading) return <SidebarSkeleton />;

  const groupsList = Array.isArray(groups) ? groups : [];

  return (
    <>
      <aside className="h-full w-20 lg:w-72 border-r  border-gray-900 flex flex-col bg-gray-900 backdrop-blur-sm transition-all duration-200">
        <div className="border-b border-gray-900  w-full p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {activeTab === 'contacts' ? (
                <Users className="size-5 text-blue-400" />
              ) : (
                <FolderPlus className="size-5 text-blue-400" />
              )}
              <span className="font-medium hidden lg:block text-white">
                {activeTab === 'contacts' ? 'Contacts' : 'Groups'}
              </span>
            </div>
            
            <div className="hidden lg:flex gap-1">
              <Button
                onClick={() => setActiveTab('contacts')}
                variant={activeTab === 'contacts' ? 'default' : 'ghost'}
                size="sm"
                className={cn(
                  "text-sm",
                  activeTab === 'contacts' 
                    ? "bg-blue-500 hover:bg-blue-600 text-white" 
                    : "text-gray-300 hover:text-white hover:bg-gray-800"
                )}
              >
                Contacts
              </Button>
              <Button
                onClick={() => setActiveTab('groups')}
                variant={activeTab === 'groups' ? 'default' : 'ghost'}
                size="sm"
                className={cn(
                  "text-sm",
                  activeTab === 'groups' 
                    ? "bg-blue-500 hover:bg-blue-600 text-white" 
                    : "text-gray-300 hover:text-white hover:bg-gray-800"
                )}
              >
                Groups
              </Button>
            </div>
          </div>

          {activeTab === 'contacts' && (
            <div className="mt-3 hidden lg:flex items-center justify-between">
              <label className="cursor-pointer flex items-center gap-2 text-gray-300">
                <input
                  type="checkbox"
                  checked={showOnlineOnly}
                  onChange={(e) => setShowOnlineOnly(e.target.checked)}
                  className="rounded border-blue-400/20 text-blue-500 focus:ring-blue-500/30"
                />
                <span className="text-sm">Show online only</span>
              </label>
              <span className="text-xs text-gray-400">({onlineUsers.length - 1} online)</span>
            </div>
          )}

          {activeTab === 'groups' && (
            <div className="mt-3 hidden lg:flex items-center justify-end">
              <Button
                onClick={() => setIsCreateGroupModalOpen(true)}
                size="sm"
                className="gap-1 bg-blue-500 hover:bg-blue-600 text-white"
              >
                <Plus className="size-4" />
                Create Group
              </Button>
            </div>
          )}
        </div>

        <div className="overflow-y-auto w-full py-3 space-y-1">
          {activeTab === 'contacts' ? (
            <>
              {filteredUsers.map((user) => (
                <button
                  key={user._id}
                  onClick={() => {
                    setSelectedUser(user);
                    setSelectedGroup(null);
                  }}
                  className={cn(
                    "w-full p-3 flex items-center gap-3 transition-all",
                    "hover:bg-gray-900",
                    selectedUser?._id === user._id && "bg-blue-800"
                  )}
                >
                  <div className="relative mx-auto lg:mx-0">
                    <div className="size-12 rounded-full ring-2 ring-blue-500/20 overflow-hidden">
                      <img
                        src={user.profilePic || "/avatar.png"}
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {onlineUsers.includes(user._id) && (
                      <span
                        className="absolute bottom-0 right-0 size-3 bg-green-500
                         rounded-full ring-2 ring-gray-900"
                      />
                    )}
                  </div>

                  <div className="hidden lg:block text-left min-w-0">
                    <div className="font-medium truncate text-white">{user.fullName}</div>
                    <div className={cn(
                      "text-sm",
                      onlineUsers.includes(user._id) ? "text-green-500" : "text-gray-400"
                    )}>
                      {onlineUsers.includes(user._id) ? "Online" : "Offline"}
                    </div>
                  </div>
                </button>
              ))}

              {filteredUsers.length === 0 && (
                <div className="text-center text-gray-400 py-4">No online users</div>
              )}
            </>
          ) : (
            <div className="overflow-y-auto space-y-1">
              {groupsList.length === 0 ? (
                <div className="text-center text-gray-400 py-4">
                  No groups available
                </div>
              ) : (
                groupsList.map((group) => (
                  <button
                    key={group._id}
                    onClick={() => {
                      setSelectedGroup(group);
                      setSelectedUser(null);
                    }}
                    className={cn(
                      "w-full p-3 flex items-center gap-3 transition-all",
                      "hover:bg-gray-900",
                      selectedGroup?._id === group._id && "bg-blue-800"
                    )}
                  >
                    <div className="relative mx-auto lg:mx-0">
                      <div className="size-12 bg-blue-500/10 text-blue-400 rounded-full flex items-center justify-center ring-2 ring-blue-500/20">
                        {group.name.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <div className="hidden lg:block text-left min-w-0">
                      <div className="font-medium truncate text-white">{group.name}</div>
                      <div className="text-sm text-gray-400">
                        {group.members.length} members
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </aside>

      <CreateGroupModal
        isOpen={isCreateGroupModalOpen}
        onClose={() => setIsCreateGroupModalOpen(false)}
      />
    </>
  );
};

export default Sidebar;