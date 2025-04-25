import { useChatStore } from "../store/useChatStore";
import useGroupStore from "../store/useGroupStore";
import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";
import GroupChatContainer from "../components/GroupChatContainer";

const HomePage = () => {
  const { selectedUser } = useChatStore();
  const { selectedGroup } = useGroupStore();

  return (
    <div className="h-screen bg-gray-900">
      <div className="h-screen flex  pt-20">
        <div className="bg-blue-900 rounded-lg shadow-cl w-full h-[calc(100vh-8rem)]">
          <div className="flex h-full rounded-lg overflow-hidden">
            <Sidebar />

            {selectedGroup ? (
              <GroupChatContainer group={selectedGroup} />
            ) : selectedUser ? (
              <ChatContainer />
            ) : (
              <NoChatSelected />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
