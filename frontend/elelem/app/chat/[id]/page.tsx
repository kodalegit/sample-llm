"use client";

import { useParams } from "next/navigation";
import ChatLayout from "@/components/chat/ChatLayout";

export default function ChatConversationPage() {
  const params = useParams();
  const chatId = Array.isArray(params.id) ? params.id[0] : params.id;

  return <ChatLayout initialConversationId={chatId} />;
}
