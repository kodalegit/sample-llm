"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import ChatInput from "@/components/ChatInput";

interface WelcomeScreenProps {
  onSendMessage: (message: string) => Promise<void>;
  isLoading?: boolean;
}

export default function WelcomeScreen({ onSendMessage, isLoading = false }: WelcomeScreenProps) {
  const [inputValue, setInputValue] = useState("");

  const handleSend = async (content: string) => {
    await onSendMessage(content);
    setInputValue("");
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
    <div className="flex-1 flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5"></div>
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>

      <div className="relative z-10 text-center mb-12">
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

      <div className="w-full max-w-3xl relative z-10">
        <ChatInput
          onSend={handleSend}
          isLoading={isLoading}
          placeholder="Ask anything..."
          className="bg-slate-800/50 backdrop-blur-sm border-slate-600/50 text-white placeholder-slate-400 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 hover:bg-slate-800/70 rounded-2xl shadow-2xl"
          inputValue={inputValue}
          setInputValue={setInputValue}
        />

        {/* Quick suggestions */}
        <div className="mt-6 flex flex-wrap gap-2 justify-center">
          {suggestions.map((suggestion, index) => (
            <Button
              key={index}
              variant="ghost"
              onClick={() => setInputValue(suggestion) }
              disabled={isLoading}
              className="text-slate-400 hover:text-white hover:bg-slate-700/50 border border-slate-600/30 hover:border-slate-500/50 rounded-full px-4 py-2 text-sm transition-all duration-200 disabled:opacity-50"
            >
              {suggestion}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
