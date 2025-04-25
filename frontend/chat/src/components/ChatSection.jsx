import { useChatStore } from "../store/useChatStore";
import useGroupStore from "../store/useGroupStore";
import ChatContainer from "./ChatContainer";
import GroupChatContainer from "./GroupChatContainer";

const ChatSection = () => {
  const { selectedUser } = useChatStore();
  const { selectedGroup } = useGroupStore();

  if (!selectedUser && !selectedGroup) {
    return (
      <div className="bg-gray-900 flex-1 flex items-center justify-center bg-base-200/50">
        <div className="text-center">
          <h3 className="text-xl font-medium mb-2">Welcome to Chat App</h3>
          <p className="text-zinc-500">
            Select a contact or group to start chatting
          </p>
        </div>
      </div>
    );
  }

  if (selectedGroup) {
    return <GroupChatContainer group={selectedGroup} />;
  }

  return <ChatContainer />;
};

export default ChatSection;