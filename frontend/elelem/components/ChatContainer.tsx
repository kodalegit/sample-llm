"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useChat } from "@/contexts/chat-context";
import ChatMessages from "@/components/ChatMessages";
import ChatInput from "@/components/ChatInput";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";

export default function ChatContainer() {
  const { state, sendMessage, stopMessage, createNewConversation } = useChat();
  const router = useRouter();
  const pathname = usePathname();

  // Update URL when conversation ID is available without navigation
  useEffect(() => {
    const conversationId = state.conversationId;
    if (conversationId && pathname === "/chat") {
      const nextUrl = `/chat/${conversationId}`;
      window.history.pushState(
        { conversationId },
        "",
        nextUrl
      );
    }
  }, [state.conversationId, pathname]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || state.isLoading) return;
    
    try {
      if (!state.conversationId) {
        // Create new conversation
        await createNewConversation(content);
      } else {
        // Send message in existing conversation
        await sendMessage(content);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleStopMessage = () => {
    stopMessage();
  };

  const suggestions = [
    "Explain quantum computing",
    "Write a Python function",
    "Plan a weekend trip",
    "Debug my code",
    "Create a business plan",
    "Help with data analysis"
  ];

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex-1 min-h-0 overflow-y-auto relative">
        {/* Welcome content - only shown when no messages and not loading */}
        {state.messages.length === 0 && !state.isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5"></div>
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>

            <div className="relative z-10 text-center mb-12 max-w-2xl">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-6 shadow-2xl">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                What's on the agenda today?
              </h1>
              <p className="text-slate-400 text-lg max-w-md mx-auto">
                Start a conversation and let AI help you explore ideas, solve problems, or learn something new.
              </p>
            </div>

            {/* Quick suggestions */}
            <div className="w-full max-w-3xl relative z-10">
              <div className="flex flex-wrap gap-2 justify-center">
                {suggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    onClick={() => handleSendMessage(suggestion)}
                    disabled={state.isLoading}
                    className="text-slate-400 hover:text-white hover:bg-slate-700/50 border border-slate-600/30 hover:border-slate-500/50 rounded-full px-4 py-2 text-sm transition-all duration-200 disabled:opacity-50"
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Chat messages - shown when there are messages or when loading */}
        {(state.messages.length > 0 || state.isLoading) && <ChatMessages />}
        
        {/* Loading overlay when switching conversations */}
        {state.isLoading && state.messages.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
            <div className="flex flex-col items-center">
              <Loader2 className="h-8 w-8 animate-spin text-white" />
              <span className="mt-2 text-white">Loading conversation...</span>
            </div>
          </div>
        )}
      </div>
      <div className="w-full sticky bottom-0 z-10 bg-transparent/20 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <ChatInput
            onSend={handleSendMessage}
            onStop={handleStopMessage}
            isLoading={state.isLoading}
            isStreaming={state.isStreaming}
            placeholder="Ask anything..."
          />
        </div>
      </div>
    </div>
  );
}
