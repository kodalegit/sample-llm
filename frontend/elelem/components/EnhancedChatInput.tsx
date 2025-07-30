"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Square } from "lucide-react";

interface EnhancedChatInputProps {
  onSend: (message: string) => Promise<void>;
  onStop?: () => void;
  isLoading?: boolean;
  isStreaming?: boolean;
  placeholder?: string;
}

export default function EnhancedChatInput({
  onSend,
  onStop,
  isLoading = false,
  isStreaming = false,
  placeholder = "Type your message...",
}: EnhancedChatInputProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const message = input.trim();
    setInput("");
    await onSend(message);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleStop = () => {
    if (onStop) {
      onStop();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  const canSend = input.trim() && !isLoading;
  const showStop = isStreaming || isLoading;

  return (
    <div className="border-t border-slate-700/50 bg-slate-800/30 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto px-6 sm:px-12 lg:px-16 py-4">
        <form onSubmit={handleSubmit} className="relative">
          <div className="relative group">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={isLoading}
              className="w-full bg-slate-800/50 backdrop-blur-sm border-slate-600/50 text-white placeholder-slate-400 pr-16 py-3 text-base rounded-xl shadow-lg focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 group-hover:bg-slate-800/70 resize-none min-h-[50px] max-h-[200px]"
              rows={1}
            />

            <div className="absolute right-3 bottom-3 flex items-center space-x-2">
              {showStop ? (
                <Button
                  type="button"
                  onClick={handleStop}
                  variant="ghost"
                  size="icon"
                  className="text-slate-400 hover:text-white hover:bg-slate-700/50 h-8 w-8 rounded-lg"
                >
                  <Square className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={!canSend}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white h-8 w-8 rounded-lg p-0 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
          </div>
          
          {/* Helper text */}
          <div className="mt-2 text-xs text-slate-500 text-center">
            Press Enter to send, Shift+Enter for new line
          </div>
        </form>
      </div>
    </div>
  );
}
