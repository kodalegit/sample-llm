"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Loader2, MessageSquarePlus, Trash2 } from "lucide-react";
import { useChats, useCreateChat, usePrefetchChat, useDeleteChat } from "@/lib/queries";
import { useAuth } from "@/lib/authContext";
import { useChat } from "@/contexts/chat-context";
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';

export default function ChatSidebar() {
  const { isLoading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const activeChatId = pathname?.split("/").pop();
  
  const { data: chats = [], isLoading: chatsLoading, error } = useChats();
  const createChatMutation = useCreateChat();
  const prefetchChat = usePrefetchChat();
  const deleteChat = useDeleteChat();
  const { dispatch } = useChat();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [chatToDelete, setChatToDelete] = useState<string | null>(null);

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

  const handleDeleteClick = (chatId: string) => {
    setChatToDelete(chatId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (chatToDelete) {
      // Immediately reset state if deleting active chat
      if (chatToDelete === activeChatId) {
        dispatch({ type: "RESET_CHAT" });
        window.history.replaceState({}, '', '/chat');
      }
      
      deleteChat.mutate(chatToDelete);
      setDeleteDialogOpen(false);
    }
  };


  if (authLoading) {
    return (
      <div className="w-72 bg-slate-800/50 backdrop-blur-xl border-r border-slate-700/50 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <>
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
                <li key={chat.id} className="group relative">
                  <div 
                    className={`flex items-center justify-between p-2 rounded-lg hover:bg-slate-800 transition-colors ${chat.id === activeChatId ? "bg-slate-800" : ""}`}
                  >
                    <Link 
                      href={`/chat/${chat.id}`}
                      className="flex-1 truncate"
                      onMouseEnter={() => handleChatHover(chat.id)}
                    >
                      <div className="flex items-center justify-between w-48">
                        <span className="text-white truncate text-sm">{chat.title}</span>
                      </div>
                    </Link>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDeleteClick(chat.id);
                      }}
                      className="p-1.5 text-slate-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      disabled={deleteChat.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
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

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Chat</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this chat? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button 
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleteChat.isPending}
            >
              {deleteChat.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
