"use client";

import { useChatScroll } from "@/lib/useChatScroll";
import { useChat } from "@/contexts/chat-context";
import { PulsingLoader } from "./PulsingLoader";
import { ChatMessage } from "./Message";
import { Loader2 } from "lucide-react";
import { useConversation } from "@/lib/queries";

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-full w-full py-16">
      <div className="flex flex-col items-center gap-3 bg-slate-800/30 rounded-xl p-6 backdrop-blur-sm border border-slate-700/50">
        <Loader2 className="h-10 w-10 animate-spin text-blue-400" />
        <span className="text-sm font-medium text-slate-300">Loading conversation...</span>
      </div>
    </div>
  );
}

export default function ChatMessages() {
  const { state } = useChat();
  const { isLoading: isLoadingConversation } = useConversation(
    state.conversationId ?? undefined
  );
  const { containerRef, bottomRef, showScrollButton, scrollToBottom } =
    useChatScroll(state.messages, state.isStreaming);

  const showPulsingLoader = state.isLoading && !state.isStreaming;
  if (isLoadingConversation) {
    return (
      <div className="flex-1 flex flex-col min-h-0 relative">
        <div
          ref={containerRef}
          className="flex-1 overflow-y-auto px-3 sm:px-4 lg:px-6 pt-4 sm:pt-6 lg:pt-8"
        >
          <div className="max-w-4xl mx-auto w-full">
            <LoadingSpinner />
            <div ref={bottomRef} className="h-4" />
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="flex-1 flex flex-col min-h-0 relative">
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto px-3 sm:px-4 lg:px-6 pt-4 sm:pt-6 lg:pt-8"
      >
        <div className="max-w-4xl mx-auto w-full">
          {state.messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}

          {showPulsingLoader && <PulsingLoader />}
          <div ref={bottomRef} className="h-4" />
        </div>
      </div>

      {showScrollButton && (
        <button
          onClick={() => scrollToBottom()}
          className="fixed bottom-20 sm:bottom-24 right-4 sm:right-6 lg:right-8 bg-slate-700/90 hover:bg-slate-600 text-white rounded-full p-2.5 sm:p-3 shadow-lg backdrop-blur-sm transition-all z-10 border border-slate-600/50"
          aria-label="Scroll to bottom"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 5v14M19 12l-7 7-7-7" />
          </svg>
        </button>
      )}
    </div>
  );
}
