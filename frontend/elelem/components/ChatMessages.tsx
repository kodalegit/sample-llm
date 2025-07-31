"use client";

import ReactMarkdown, { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { useChatScroll } from "@/lib/useChatScroll";
import { useChat } from "@/contexts/chat-context";

interface ChatMessageProps {
  message: {
    id: string;
    role: "user" | "assistant" | "system";
    content: string;
    createdAt: string;
  };
}

function ChatMessage({ message }: ChatMessageProps) {
  const components: Components = {
    a: ({node, ...props}) => <a {...props} target="_blank" rel="noopener noreferrer" className="underline text-blue-400 hover:text-blue-300" />,
    code: ({node, className, children, ...props}) => {
      // Check if it's an inline code element
      const isInline = !className;
      if (isInline) {
        return (
          <code
            className="bg-[#23272e] text-blue-200 px-1.5 py-0.5 rounded font-mono text-sm"
            {...props}
          >
            {children}
          </code>
        );
      }
      return (
        <pre className="bg-[#23272e] text-blue-100 p-4 rounded-lg overflow-x-auto text-sm my-2 font-mono">
          <code className={className} {...props}>{children}</code>
        </pre>
      );
    },
    ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-4" {...props} />,
    ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-4" {...props} />,
    li: ({node, ...props}) => <li className="mb-1" {...props} />,
    blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-slate-400 pl-4 italic my-4" {...props} />,
    hr: ({node, ...props}) => <hr className="my-6 border-slate-400" {...props} />,
    p: ({node, ...props}) => <p className={message.role === "user" ? "mb-0" : "mb-4"} {...props} />,
    h1: ({node, ...props}) => <h1 className="text-2xl font-bold mb-4 mt-6" {...props} />,
    h2: ({node, ...props}) => <h2 className="text-xl font-bold mb-3 mt-5" {...props} />,
    h3: ({node, ...props}) => <h3 className="text-lg font-bold mb-3 mt-4" {...props} />,
  };

  // Assistant messages
  if (message.role === "assistant") {
    return (
      <div className="mb-4 sm:mb-6 max-w-4xl mx-auto w-full">
        <div className="bg-slate-800/30 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-700/30">
          <div className="prose dark:prose-invert max-w-none text-slate-200 prose-sm sm:prose-base">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={components}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    );
  }

  // User messages
  if (message.role === "user") {
    return (
      <div className="flex justify-end mb-4 sm:mb-6 max-w-4xl mx-auto w-full">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl sm:rounded-3xl px-4 sm:px-5 py-3 sm:py-4 text-sm sm:text-base whitespace-pre-wrap max-w-xs sm:max-w-md lg:max-w-2xl shadow-lg">
          <span className="prose dark:prose-invert max-w-none prose-sm sm:prose-base">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={components}
            >
              {message.content}
            </ReactMarkdown>
          </span>
        </div>
      </div>
    );
  }

  // System messages
  return (
    <div className="flex justify-start mb-4 sm:mb-6 max-w-4xl mx-auto w-full">
      <div className="bg-red-600/20 text-red-300 border border-red-500/30 rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base whitespace-pre-wrap max-w-xs sm:max-w-md lg:max-w-2xl">
        <span className="prose dark:prose-invert max-w-none prose-sm sm:prose-base">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={components}
          >
            {message.content}
          </ReactMarkdown>
        </span>
      </div>
    </div>
  );
}

function PulsingLoader() {
  return (
    <div className="mb-4 sm:mb-6 max-w-4xl mx-auto w-full">
      <div className="bg-slate-800/30 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-700/30">
        <div className="prose dark:prose-invert max-w-none text-slate-200">
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
            <span className="text-slate-400 text-sm">AI is thinking...</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ChatMessages() {
  const { state } = useChat();
  const { containerRef, bottomRef, showScrollButton, scrollToBottom } = useChatScroll(state.messages, state.isStreaming);

  const showPulsingLoader = state.isLoading && !state.isStreaming;

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
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M19 12l-7 7-7-7"/>
          </svg>
        </button>
      )}
    </div>
  );
}
