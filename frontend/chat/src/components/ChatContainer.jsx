import { useChatStore } from "../store/useChatStore";
import useGroupStore from "../store/useGroupStore";
import { useEffect, useRef, useState } from "react";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime, cn } from "../lib/utils";
import GroupInfo from "./GroupInfo";
import { Card } from "./ui/card";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();
  const { selectedGroup, getGroupMessages } = useGroupStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
  const [showGroupInfo, setShowGroupInfo] = useState(false);

  useEffect(() => {
    if (selectedUser) {
      getMessages(selectedUser._id);
      subscribeToMessages();
    } else if (selectedGroup) {
      getGroupMessages(selectedGroup._id);
      subscribeToMessages();
    }

    return () => unsubscribeFromMessages();
  }, [
    selectedUser?._id,
    selectedGroup?._id,
    getMessages,
    getGroupMessages,
    subscribeToMessages,
    unsubscribeFromMessages,
  ]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto w-full h-full max-w-none bg-gray-900">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-900 w-full h-full max-w-none">
      <ChatHeader onGroupInfoClick={() => setShowGroupInfo(true)} />

      <div className="w-full flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={message._id}
            className={cn(
              "flex gap-3",
              message.senderId._id === authUser._id ? "flex-row-reverse" : "flex-row"
            )}
            ref={index === messages.length - 1 ? messageEndRef : null}
          >
            <div className="flex-shrink-0">
              <div className="size-10 rounded-full border-2 border-blue-500/20 overflow-hidden">
                <img
                  src={
                    message.senderId._id === authUser._id
                      ? authUser.profilePic || "/avatar.png"
                      : message.senderId.profilePic || "/avatar.png"
                  }
                  alt="profile pic"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className={cn(
              "flex flex-col max-w-[80%]",
              message.senderId._id === authUser._id ? "items-end" : "items-start"
            )}>
              <div className="flex items-center gap-2 mb-1">
                {selectedGroup && (
                  <span className="text-sm font-medium text-blue-400">
                    {message.senderId._id === authUser._id ? "You" : message.senderId.fullName}
                  </span>
                )}
                <time className="text-xs text-gray-400">
                  {formatMessageTime(message.createdAt)}
                </time>
              </div>
              <Card className={cn(
                "shadow-lg px-4 py-3",
                message.senderId._id === authUser._id 
                  ? "bg-blue-500/10 border border-blue-500/20 text-white" 
                  : "bg-gray-800 border border-gray-700 text-white"
              )}>
                {message.image && (
                  <img
                    src={message.image}
                    alt="Attachment"
                    className="max-w-full sm:max-w-[400px] rounded-md mb-2"
                  />
                )}

                {message.video && (
                  <video
                    controls
                    className="max-w-full sm:max-w-[400px] rounded-md mb-2"
                  >
                    <source src={message.video} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                )}

                {message.text && <p className="text-sm">{message.text}</p>}
              </Card>
            </div>
          </div>
        ))}
      </div>

      <MessageInput />

      {showGroupInfo && selectedGroup && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
          <GroupInfo
            group={selectedGroup}
            onClose={() => setShowGroupInfo(false)}
          />
        </div>
      )}
    </div>
  );
};

export default ChatContainer;