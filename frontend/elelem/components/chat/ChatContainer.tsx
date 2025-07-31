"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useChat } from "@/contexts/chat-context";
import ChatMessages from "@/components/chat/ChatMessages";
import ChatInput from "@/components/chat/ChatInput";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { useConversation } from "@/lib/queries";

export default function ChatContainer() {
  const { state, sendMessage, createNewConversation } = useChat();
  const pathname = usePathname();
  const { isLoading: isLoadingConversation } = useConversation(
    state.conversationId ?? undefined
  );

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

  const suggestions = [
    "Explain quantum computing simply",
    "How does photosynthesis work?",
    "Break down blockchain technology",
    "What is the theory of relativity?",
    "Describe how neural networks learn"
  ];
  
  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex-1 min-h-0 overflow-y-auto relative">
        {(state.messages.length > 0 || isLoadingConversation) ? (
          <ChatMessages />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 pb-24">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5"></div>
            <div className="absolute top-1/4 left-1/4 w-32 h-32 sm:w-48 sm:h-48 lg:w-64 lg:h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/4 right-1/4 w-32 h-32 sm:w-48 sm:h-48 lg:w-64 lg:h-64 bg-purple-500/10 rounded-full blur-3xl"></div>

            <div className="relative z-10 text-center mb-8 sm:mb-12 max-w-2xl">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-4 sm:mb-6 shadow-2xl">
                <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                Hi, I'm Elelem - Your AI Explainer
              </h1>
              <p className="text-slate-400 text-base sm:text-lg max-w-sm sm:max-w-md mx-auto px-2">
                I specialize in breaking down complex topics into simple, layered explanations. 
                Ask me anything and I'll explain it for different knowledge levels.
              </p>
            </div>

            <div className="w-full max-w-3xl relative z-10 px-2">
              <div className="flex flex-wrap gap-2 justify-center">
                {suggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    onClick={() => handleSendMessage(suggestion)}
                    disabled={state.isLoading}
                    className="text-slate-400 hover:text-white hover:bg-slate-700/50 border border-slate-600/30 hover:border-slate-500/50 rounded-full px-3 sm:px-4 py-2 text-xs sm:text-sm transition-all duration-200 disabled:opacity-50"
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="w-full sticky bottom-0 z-10 bg-slate-900/20 backdrop-blur-xl border-t border-slate-700/50">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
          <ChatInput
            onSend={handleSendMessage}
            isLoading={state.isLoading}
            isStreaming={state.isStreaming}
            placeholder="Ask anything..."
          />
        </div>
      </div>
    </div>
  );
}
