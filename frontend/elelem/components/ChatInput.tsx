"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Square, Send } from "lucide-react";

interface ChatInputProps {
  onSend: (content: string) => void;
  onStop?: () => void;
  isLoading?: boolean;
  isStreaming?: boolean;
  placeholder?: string;
  className?: string;
  inputValue?: string;
  setInputValue?: (value: string) => void;
}

export default function ChatInput({
  onSend,
  onStop,
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
      <div className="relative w-full flex flex-col bg-muted/90 border border-border rounded-2xl overflow-hidden">
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full min-h-[60px] placeholder:text-sm placeholder:md:text-md max-h-[200px] bg-transparent border-none resize-none pr-4 py-4 pl-4 focus:ring-0 focus-visible:ring-0 focus-visible:outline-none text-foreground placeholder:text-muted-foreground"
          disabled={isLoading}
          rows={1}
          aria-label="Chat message input"
        />
        <div className="flex items-center justify-end px-3 py-2 bg-muted/20">
          {isLoading || isStreaming ? (
            <Button
              type="button"
              size="icon"
              onClick={onStop}
              className="h-8 w-8 rounded-full bg-foreground text-background"
              aria-label="Stop generating"
              disabled={!onStop}
            >
              <Square className="h-4 w-4" strokeWidth={0} fill="currentColor" />
            </Button>
          ) : (
            <Button
              type="submit"
              size="icon"
              variant="ghost"
              disabled={!input.trim()}
              className="h-8 w-8 rounded-full text-foreground bg-primary/20 hover:text-primary hover:bg-primary/30 transition-all duration-200"
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}
