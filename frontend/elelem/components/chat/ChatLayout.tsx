"use client";

import { useEffect, useState, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/authContext";
import { ChatProvider } from "@/contexts/chat-context";
import ChatSidebar from "@/components/chat/ChatSidebar";
import ChatContainer from "@/components/chat/ChatContainer";
import { Button } from "@/components/ui/button";
import { Loader2, Menu, X } from "lucide-react";

interface ChatLayoutProps {
  children?: ReactNode;
  initialConversationId?: string;
}

export default function ChatLayout({ children, initialConversationId }: ChatLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth");
    }
  }, [authLoading, isAuthenticated, router]);

  // Close sidebar when route changes on mobile
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Close sidebar when screen size increases beyond mobile breakpoint
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) { // lg breakpoint
        setSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/auth");
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
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
    <ChatProvider initialConversationId={initialConversationId}>
      <div className="flex h-screen min-h-0 relative">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={closeSidebar}
          />
        )}
        
        {/* Sidebar - fixed width, absolute positioning on mobile, relative on desktop */}
        <div className={`
          w-72 sm:w-80
          transition-transform duration-300 ease-in-out
          fixed lg:relative lg:translate-x-0 z-50 lg:z-auto
          h-screen
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <ChatSidebar onClose={closeSidebar} />
        </div>
        
        {/* Main content - expands to fill available space */}
        <div className="flex-1 flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-0">
          {/* Header */}
          <div className="flex items-center justify-between p-3 sm:p-4 border-b border-slate-700/50">
            <div className="flex items-center space-x-3">
              <Button
                onClick={toggleSidebar}
                variant="ghost"
                size="sm"
                className="lg:hidden text-white hover:bg-slate-700/50 p-2"
              >
                {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
              <h1 className="text-white font-semibold text-lg sm:text-xl lg:hidden">Chat</h1>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="text-red-400 border-red-400/50 hover:text-red-300 hover:bg-transparent/25 cursor-pointer bg-transparent px-2.5 py-1.5 text-sm rounded-md transition-colors duration-200"
            >
              Logout
            </Button>
          </div>
          
          {/* Main chat area */}
          <div className="flex-1 flex flex-col min-h-0">
            {children || <ChatContainer />}
          </div>
        </div>
      </div>
    </ChatProvider>
  );
}
