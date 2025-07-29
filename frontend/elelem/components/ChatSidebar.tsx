import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  PenSquare,
  Sparkles,
  MessageCircle,
  Settings,
  Zap,
} from "lucide-react";

export interface ChatSidebarProps {
  chats: { title: string; time: string; isActive: boolean }[];
  onNewChat: () => void;
  onSelectChat: (index: number) => void;
}

export default function ChatSidebar({
  chats,
  onNewChat,
  onSelectChat,
}: ChatSidebarProps) {
  return (
    <div className="w-72 bg-slate-800/50 backdrop-blur-xl border-r border-slate-700/50 flex flex-col">
      {/* Top Navigation */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-white">AI Assistant</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-slate-400 hover:text-white hover:bg-slate-700/50"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-700/50 border border-slate-600/50 hover:border-slate-500/50 transition-all duration-200"
          onClick={onNewChat}
        >
          <PenSquare className="h-4 w-4 mr-3" />
          New conversation
          <div className="ml-auto text-xs bg-slate-600/50 px-2 py-1 rounded">
            ⌘N
          </div>
        </Button>
      </div>
      {/* Chats Section */}
      <div className="flex-1 px-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">
            Recent Chats
          </div>
          <div className="text-xs text-slate-500">{chats.length}</div>
        </div>
        <ScrollArea className="h-full">
          <div className="space-y-1">
            {chats.map((chat, index) => (
              <Button
                key={index}
                variant="ghost"
                className={`w-full justify-start text-left hover:bg-slate-700/50 h-auto py-3 px-3 rounded-lg transition-all duration-200 group ${
                  chat.isActive
                    ? "bg-slate-700/50 border border-slate-600/50"
                    : ""
                }`}
                onClick={() => onSelectChat(index)}
              >
                <div className="flex items-start space-x-3 w-full">
                  <MessageCircle className="h-4 w-4 text-slate-400 mt-0.5 group-hover:text-slate-300" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-200 group-hover:text-white truncate">
                      {chat.title}
                    </div>
                    <div className="text-xs text-slate-500 group-hover:text-slate-400">
                      {chat.time}
                    </div>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>
      {/* User Profile */}
      <div className="p-4 border-t border-slate-700/50">
        <div className="flex items-center space-x-3 p-3 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-colors cursor-pointer">
          <Avatar className="h-9 w-9 ring-2 ring-slate-600/50">
            <AvatarImage src="/placeholder.svg?height=36&width=36" />
            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-semibold">
              JD
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-white">John Doe</div>
            <div className="text-xs text-slate-400 flex items-center">
              <Zap className="h-3 w-3 mr-1" />
              Pro Plan
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
