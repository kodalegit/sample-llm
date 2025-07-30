"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Loader2, MessageSquarePlus } from "lucide-react";
import { useChats, useCreateChat, usePrefetchChat } from "@/lib/queries";
import { useAuth } from "@/lib/authContext";
import { useChat } from "@/contexts/chat-context";

export default function ChatSidebar() {
  const { isLoading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const activeChatId = pathname?.split("/").pop();
  
  const { data: chats = [], isLoading: chatsLoading, error } = useChats();
  const createChatMutation = useCreateChat();
  const prefetchChat = usePrefetchChat();
  const { dispatch } = useChat();

  const handleNewChat = () => {
    // Reset the chat state to show the welcome screen
    dispatch({ type: "RESET_CHAT" });
    // Navigate to the main chat page
    router.push(`/chat`);
  };

  const handleChatHover = (chatId: string) => {
    // Prefetch chat data on hover for snappy navigation
    prefetchChat(chatId);
  };

  if (authLoading) {
    return (
      <div className="w-72 bg-slate-800/50 backdrop-blur-xl border-r border-slate-700/50 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="w-72 bg-slate-900 flex flex-col">
      <div className="p-4 flex items-center justify-between border-b border-slate-700">
        <div className="flex items-center space-x-2">
          <Sparkles className="h-5 w-5 text-white" />
          <span className="font-semibold text-white">AI Assistant</span>
        </div>
        <Button 
          variant="ghost" 
          onClick={handleNewChat}
          disabled={createChatMutation.isPending}
          className="text-white hover:bg-slate-300 cursor-pointer"
        >
          {createChatMutation.isPending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <MessageSquarePlus className="h-5 w-5" />
          )}
        </Button>
      </div>
      <ScrollArea className="flex-1 p-2">
        {chatsLoading ? (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="h-5 w-5 animate-spin text-white" />
            <span className="ml-2 text-white">Loading chats...</span>
          </div>
        ) : error ? (
          <div className="p-4 text-red-400">Failed to load chats</div>
        ) : (
          <ul className="space-y-1">
            {chats.map((chat: { id: string; title: string; time: string }) => (
              <li key={chat.id}>
                <Link href={`/chat/${chat.id}`}>
                  <div 
                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer hover:bg-slate-800 transition-colors ${chat.id === activeChatId ? "bg-slate-800" : ""}`}
                    onMouseEnter={() => handleChatHover(chat.id)}
                  >
                    <span className="text-white truncate text-sm">{chat.title}</span>
                    <span className="text-xs text-slate-400">{chat.time}</span>
                  </div>
                </Link>
              </li>
            ))}
            {chats.length === 0 && (
              <div className="p-4 text-center text-slate-400 text-sm">
                No chats yet. Create your first chat!
              </div>
            )}
          </ul>
        )}
      </ScrollArea>
    </div>
  );
}
