"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/lib/authContext";
import { ChatProvider } from "@/contexts/chat-context";
import ChatSidebar from "@/components/ChatSidebar";
import ChatContainer from "@/components/ChatContainer";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function ChatConversationPage() {
  const params = useParams();
  const chatId = Array.isArray(params.id) ? params.id[0] : params.id;
  const { isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const router = useRouter();

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth");
    }
  }, [authLoading, isAuthenticated, router]);

  const handleLogout = () => {
    logout();
    router.push("/auth");
  };

  // Show loading state while checking auth
  if (authLoading || (!isAuthenticated && !authLoading)) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="flex items-center space-x-2 text-white">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <ChatProvider initialConversationId={chatId}>
      <div className="flex h-screen min-h-0">
        <ChatSidebar />
        <div className="flex-1 flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-0">
          <div className="flex justify-end p-4">
            <Button
              onClick={handleLogout}
              variant="destructive"
              className="px-4 py-2"
            >
              Logout
            </Button>
          </div>
          
          {/* Main chat area */}
          <div className="flex-1 min-h-0">
            <ChatContainer />
          </div>
        </div>
      </div>
    </ChatProvider>
  );
}
