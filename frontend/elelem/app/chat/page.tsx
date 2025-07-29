"use client";

import { useState, useEffect } from "react";
import ChatSidebar from "@/components/ChatSidebar";
import ChatWindow, { ChatMessage } from "@/components/ChatWindow";
import ChatInput from "@/components/ChatInput";
import { getChats, getChat, createChat, sendMessage, sendMessageStream } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/authContext";

// Initial empty states
const initialChats: any[] = [];
const initialMessages: ChatMessage[] = [];

export default function ChatPage() {
  const [chats, setChats] = useState<any[]>(initialChats);
  const [activeChat, setActiveChat] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { isAuthenticated, token, isLoading, logout } = useAuth();
  
  // Check for authentication on component mount
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push("/auth");
        return;
      }
      
      // Load chats
      if (token) {
        loadChats(token);
      }
    }
  }, [isAuthenticated, isLoading, token, router]);
  
  const loadChats = async (authToken: string) => {
    try {
      const chatData = await getChats(authToken);
      const formattedChats = chatData.map((chat: any, index: number) => ({
        id: chat.id,
        title: chat.name || `Chat ${index + 1}`,
        time: new Date(chat.created_at).toLocaleDateString(),
        isActive: index === 0,
      }));
      // Ensure we're working with plain objects
      const plainChats = JSON.parse(JSON.stringify(formattedChats));
      setChats(plainChats);
      
      // Load first chat messages if available
      if (plainChats.length > 0) {
        setActiveChat(0);
        loadChatMessages(plainChats[0].id, authToken);
      }
    } catch (err) {
      console.error("Failed to load chats:", err);
      // If token is invalid, redirect to auth
      if (err instanceof Error && err.message.includes("401")) {
        localStorage.removeItem("token");
        router.push("/auth");
      }
    }
  };
  
  const loadChatMessages = async (chatId: string, authToken: string) => {
    try {
      const chatData = await getChat(chatId, authToken);
      const formattedMessages = chatData.messages.map((msg: any) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
      }));
      setMessages(formattedMessages);
    } catch (err) {
      console.error("Failed to load chat messages:", err);
    }
  };

  const handleNewChat = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      // Create a new chat with a placeholder message
      const newChatData = await createChat("New chat", token);
      
      // Format the new chat for the sidebar
      const newChat = {
        id: newChatData.id,
        title: newChatData.name || "New Chat",
        time: new Date().toLocaleDateString(),
        isActive: true,
      };
      
      // Update chats list
      const updatedChats = [
        ...chats.map((c) => ({ ...c, isActive: false })),
        newChat
      ];
      
      // Ensure we're working with plain objects
      const plainUpdatedChats = JSON.parse(JSON.stringify(updatedChats));
      setChats(plainUpdatedChats);
      setActiveChat(plainUpdatedChats.length - 1);
      setMessages([]);
    } catch (err) {
      console.error("Failed to create new chat:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectChat = async (index: number) => {
    if (!token) return;
    
    setActiveChat(index);
    
    // Update active chat in sidebar
    const updatedChats = chats.map((chat, i) => ({
      ...chat,
      isActive: i === index
    }));
    // Ensure we're working with plain objects
    const plainUpdatedChats = JSON.parse(JSON.stringify(updatedChats));
    setChats(plainUpdatedChats);
    
    // Load messages for selected chat
    const selectedChat = chats[index];
    if (selectedChat) {
      await loadChatMessages(selectedChat.id, token);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !token || activeChat === null) return;
    
    setLoading(true);
    
    try {
      // Add user message to UI immediately
      const userMsg: ChatMessage = {
        id: Date.now().toString(),
        role: "user",
        content: input,
      };
      setMessages((prev) => [...prev, userMsg]);
      
      // Get current chat ID
      const currentChatId = chats[activeChat].id;
      
      // Create a new message for the assistant response
      const assistantMsgId = `stream-${Date.now()}`;
      let assistantMsgContent = "";
      
      // Add placeholder assistant message to UI
      const assistantMsg: ChatMessage = {
        id: assistantMsgId,
        role: "assistant",
        content: "",
      };
      setMessages((prev) => [...prev, assistantMsg]);
      
      // Stream message from backend
      await sendMessageStream(currentChatId, input, token, (chunk) => {
        // Update the assistant message content with each chunk
        assistantMsgContent += chunk.content;
        setMessages((prev) => 
          prev.map((msg) => 
            msg.id === assistantMsgId ? { ...msg, content: assistantMsgContent } : msg
          )
        );
      });
      
      // Update chat title in sidebar if it was the first message
      if (messages.length === 0) {
        const updatedChats = [...chats];
        updatedChats[activeChat].title = input.substring(0, 30) + (input.length > 30 ? "..." : "");
        setChats(updatedChats);
      }
    } catch (err) {
      console.error("Failed to send message:", err);
      // Add error message to UI
      const errorMsg: ChatMessage = {
        id: Date.now().toString(),
        role: "assistant",
        content: "Sorry, I encountered an error processing your request.",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
      setInput("");
    }
  };

  // Show loading state while checking auth
  if (isLoading || (!isAuthenticated && !isLoading)) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }
  
  const handleLogout = () => {
    logout();
    router.push("/auth");
  };
  
  return (
    <div className="flex h-screen">
      <ChatSidebar
        chats={chats}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
      />
      <div className="flex-1 flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="flex justify-end p-4">
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        </div>
        <ChatWindow messages={messages} />
        <ChatInput
          value={input}
          onChange={setInput}
          onSend={handleSend}
          loading={loading}
        />
      </div>
    </div>
  );
}
