"use client";

import { useEffect, useRef } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useChat } from "@/contexts/chat-context";
import ReactMarkdown, { Components } from "react-markdown";
import remarkGfm from "remark-gfm";

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
  };

  return (
    <div
      className={`flex ${
        message.role === "user" ? "justify-end" : "justify-start"
      } mb-6`}
    >
      <div
        className={`flex items-end gap-3 max-w-2xl ${
          message.role === "user" ? "flex-row-reverse" : ""
        }`}
      >
        <Avatar className="h-8 w-8">
          {message.role === "user" ? (
            <AvatarFallback className="bg-blue-500 text-white text-sm">
              U
            </AvatarFallback>
          ) : message.role === "assistant" ? (
            <AvatarFallback className="bg-purple-500 text-white text-sm">
              AI
            </AvatarFallback>
          ) : (
            <AvatarFallback className="bg-red-500 text-white text-sm">
              !
            </AvatarFallback>
          )}
        </Avatar>
        <div
          className={`rounded-xl px-4 py-3 text-base whitespace-pre-wrap ${
            message.role === "user"
              ? "bg-blue-600 text-white"
              : message.role === "assistant"
              ? "bg-slate-700 text-white"
              : "bg-red-600/20 text-red-300 border border-red-500/30"
          }`}
        >
          <span className="prose dark:prose-invert max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={components}
            >
              {message.content}
            </ReactMarkdown>
          </span>
        </div>
      </div>
    </div>
  );
}

function PulsingLoader() {
  return (
    <div className="flex justify-start mb-6">
      <div className="flex items-end gap-3 max-w-2xl">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-purple-500 text-white text-sm">
            AI
          </AvatarFallback>
        </Avatar>
        <div className="bg-slate-700 rounded-xl px-4 py-3">
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ChatMessages() {
  const { state } = useChat();
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive or when streaming
  useEffect(() => {
    if (bottomRef.current) {
      // Use instant scroll for better performance during streaming
      bottomRef.current.scrollIntoView({ behavior: state.isStreaming ? "instant" : "smooth" });
    }
  }, [state.messages, state.isStreaming]);

  const showPulsingLoader = state.isLoading && !state.isStreaming;

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div 
        ref={containerRef} 
        className="flex-1 overflow-y-auto px-6 sm:px-12 lg:px-16 pt-8"
      >
        <div className="max-w-4xl mx-auto">
          {state.messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          
          {/* Show the pulsing loader when needed */}
          {showPulsingLoader && <PulsingLoader />}
          
          {/* Scroll anchor */}
          <div ref={bottomRef} />
        </div>
      </div>
    </div>
  );
}
