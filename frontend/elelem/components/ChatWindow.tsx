import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt?: string;
}

export interface ChatWindowProps {
  messages: ChatMessage[];
}

export default function ChatWindow({ messages }: ChatWindowProps) {
  return (
    <div className="flex-1 flex flex-col gap-4 p-8 overflow-y-auto">
      {messages.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
          <span className="text-lg">
            No messages yet. Start the conversation!
          </span>
        </div>
      ) : (
        messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`flex items-end gap-3 max-w-2xl ${
                msg.role === "user" ? "flex-row-reverse" : ""
              }`}
            >
              <Avatar className="h-8 w-8">
                {msg.role === "user" ? (
                  <AvatarFallback className="bg-blue-500 text-white">
                    U
                  </AvatarFallback>
                ) : (
                  <AvatarFallback className="bg-purple-500 text-white">
                    AI
                  </AvatarFallback>
                )}
              </Avatar>
              <div
                className={`rounded-xl px-4 py-2 text-base ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-700 text-white"
                }`}
              >
                {msg.content}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
