import { MessageSquare } from "lucide-react";
import { Card } from "./ui/card";

const NoChatSelected = () => {
  return (
    <div className="bg-gray-900 w-full flex flex-1 flex-col items-center justify-center p-16 bg-gradient-to-tr from-background via-background/95 to-background/90">
      <Card className="max-w-md text-center space-y-6 p-8 bg-background/50 backdrop-blur-sm border-primary-600/20">
        <div className="flex justify-center">
          <div className="relative">
            <div className="size-16 rounded-2xl bg-primary-600/10 ring-2 ring-primary-600/20 flex items-center justify-center">
              <MessageSquare className="size-8 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
            Welcome to Synkr!
          </h2>
          <p className="text-muted-foreground text-cyan-200">
            Select a conversation from the sidebar to start chatting
          </p>
        </div>
      </Card>
    </div>
  );
};

export default NoChatSelected;
