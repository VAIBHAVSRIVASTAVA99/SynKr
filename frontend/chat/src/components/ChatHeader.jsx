import React from 'react';
import { useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import useGroupStore from "../store/useGroupStore";
import { useVideoSDK } from "../hooks/useVideosdk";
import { Video, Phone, MoreVertical, Users } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";

const ChatHeader = ({ group, memberCount, onGroupInfoClick }) => {
  const { onlineUsers } = useAuthStore();
  const { selectedUser } = useChatStore();
  const { selectedGroup } = useGroupStore();
  
  
  // For individual user chat header
  if (selectedUser) {
    const isOnline = onlineUsers.includes(selectedUser._id);
   
   
    return (
      <div className="flex items-center justify-between p-4 border-b border-primary-600/10 bg-background/95 backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="flex items-center justify-center w-10 h-10 bg-primary-600/10 text-primary-600 font-semibold rounded-full ring-2 ring-primary-600/20">
              {selectedUser.fullName.charAt(0).toUpperCase()}
            </div>
            {isOnline && (
              <span className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full ring-2 ring-background" />
            )}
          </div>
          <div>
            <h2 className="font-semibold text-white">{selectedUser.fullName}</h2>
            <p className={cn(
              "text-sm",
              isOnline ? "text-green-500" : "text-muted-foreground text-white"
            )}>
              {isOnline ? "Online" : "Offline"}
            </p>
          </div>
        </div>
        
      </div>
    );
  }

  // For group chat header
  if (selectedGroup) {
    return (
      <div className="p-4 border-b border-primary-600/10 bg-background/95 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-600/10 ring-2 ring-primary-600/20 flex items-center justify-center">
              <span className="text-lg font-medium text-primary-600">
                {selectedGroup.name[0].toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="font-medium">{selectedGroup.name}</h2>
              <p className="text-sm text-muted-foreground">
                {selectedGroup.members.length} members
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-primary-600 hover:text-primary-700"
            onClick={onGroupInfoClick}
          >
            <Users className="size-5" />
          </Button>
        </div>
      </div>
    );
  }

  return null;
};

export default ChatHeader;