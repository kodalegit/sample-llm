import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Mic } from "lucide-react";

export interface ChatInputProps {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  loading?: boolean;
}

export default function ChatInput({
  value,
  onChange,
  onSend,
  loading,
}: ChatInputProps) {
  const [input, setInput] = useState(value);

  // Keep input in sync with parent
  // (for controlled input, but allow local typing)
  // This is optional, you can just use value/onChange directly if preferred
  // useEffect(() => setInput(value), [value])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    onChange(e.target.value);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    onSend();
    setInput("");
    onChange("");
  };

  return (
    <form
      onSubmit={handleSend}
      className="relative flex items-center gap-2 p-4 border-t border-slate-700/50 bg-slate-800/30"
    >
      <Input
        value={input}
        onChange={handleInputChange}
        placeholder="Type your message..."
        disabled={loading}
        className="flex-1 bg-slate-800/50 border-slate-600/50 text-white placeholder-slate-400 py-3 rounded-xl"
      />
      <Button
        type="submit"
        disabled={!input.trim() || loading}
        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white h-10 w-10 rounded-xl p-0 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <Send className="h-5 w-5" />
        )}
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="text-slate-400 hover:text-white hover:bg-slate-700/50 h-10 w-10 rounded-xl"
      >
        <Mic className="h-5 w-5" />
      </Button>
    </form>
  );
}
