"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Loader2, MessageSquarePlus, Trash2, X } from "lucide-react";
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

interface ChatSidebarProps {
  onClose?: () => void;
}

export default function ChatSidebar({ onClose }: ChatSidebarProps) {
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
    dispatch({ type: "RESET_CHAT" });
    router.push(`/chat`);
    onClose?.(); // Close sidebar on mobile after navigation
  };

  const handleChatHover = (chatId: string) => {
    prefetchChat(chatId);
  };

  const handleDeleteClick = (chatId: string) => {
    setChatToDelete(chatId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (chatToDelete) {
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
      <div className="bg-slate-900/95 backdrop-blur-xl border-r border-slate-700/50 flex flex-col h-full">
        <div className="p-3 sm:p-4 flex items-center justify-between border-b border-slate-700/50">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-blue-400" />
            <span className="font-semibold text-white text-sm sm:text-base">Elelem</span>
          </div>
          <div className="flex items-center space-x-1">
            <Button 
              variant="default"
              onClick={handleNewChat}
              disabled={createChatMutation.isPending}
              size="default"
              className="hover:bg-slate-700/50 px-3 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2 cursor-pointer"
            >
              {createChatMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <MessageSquarePlus className="h-4 w-4" />
                  <span className="text-sm hidden sm:inline">New chat</span>
                </>
              )}
            </Button>
            {onClose && (
              <Button 
                variant="ghost" 
                onClick={onClose}
                size="sm"
                className="lg:hidden text-white hover:bg-slate-700/50 p-2"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        <ScrollArea className="flex-1 p-2">
          {chatsLoading ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
              <span className="ml-2 text-white text-sm">Loading chats...</span>
            </div>
          ) : error ? (
            <div className="p-4 text-red-400 text-sm">Failed to load chats</div>
          ) : (
            <ul className="space-y-1">
              {chats.map((chat: { id: string; title: string; time: string }) => (
                <li key={chat.id} className="group relative">
                  <div 
                    className={`flex items-center justify-between p-3 rounded-xl hover:bg-slate-800/50 transition-all duration-200 ${
                      chat.id === activeChatId 
                        ? "bg-slate-800/70 border border-slate-600/50" 
                        : "border border-transparent"
                    }`}
                  >
                    <Link 
                      href={`/chat/${chat.id}`}
                      className="flex-1 truncate"
                      onMouseEnter={() => handleChatHover(chat.id)}
                      onClick={onClose} // Close sidebar on mobile after navigation
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-white truncate text-sm font-medium">
                          {chat.title}
                        </span>
                      </div>
                    </Link>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDeleteClick(chat.id);
                      }}
                      className="p-1.5 text-slate-400 hover:text-red-400 opacity-0 group-hover:opacity-100 sm:opacity-100 transition-all duration-200 cursor-pointer rounded-lg hover:bg-slate-700/50"
                      disabled={deleteChat.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              ))}
              {chats.length === 0 && (
                <div className="p-6 text-center text-slate-400 text-sm">
                  <div className="mb-2">No chats yet</div>
                  <div className="text-xs text-slate-500">Create your first chat to get started!</div>
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
