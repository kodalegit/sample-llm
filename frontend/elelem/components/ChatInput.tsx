"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2 } from "lucide-react";

interface ChatInputProps {
  onSend: (content: string) => void;
  isLoading?: boolean;
  isStreaming?: boolean;
  placeholder?: string;
  className?: string;
  inputValue?: string;
  setInputValue?: (value: string) => void;
}

export default function ChatInput({
  onSend,
  isLoading = false,
  isStreaming = false,
  placeholder = "Type your message...",
  className,
  inputValue,
  setInputValue,
}: ChatInputProps) {
  const isControlled = typeof inputValue === 'string' && typeof setInputValue === 'function';
  const [uncontrolledInput, setUncontrolledInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const input = isControlled ? inputValue! : uncontrolledInput;
  const setInput = isControlled ? setInputValue! : setUncontrolledInput;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSend(input);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !isLoading) {
      e.preventDefault();
      if (input.trim()) {
        onSend(input);
        setInput("");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`w-full ${className}`}>
      <div className="relative w-full flex flex-col bg-slate-800/50 border border-border rounded-2xl overflow-hidden">
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full min-h-[60px] placeholder:text-sm placeholder:md:text-md max-h-[200px] bg-transparent border-none resize-none pr-4 py-4 pl-4 focus:ring-0 focus-visible:ring-0 focus-visible:outline-none text-white placeholder:text-muted-foreground"
          disabled={isLoading}
          rows={1}
          aria-label="Chat message input"
        />
        <div className="flex items-center justify-end px-3 py-2 bg-slate-800/20">
          <Button
            type="submit"
            size="icon"
            className="h-8 w-8 rounded-full bg-slate-600 text-white"
            aria-label="Send message"
            disabled={isLoading || !input.trim()}
          >
            {isLoading || isStreaming ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
