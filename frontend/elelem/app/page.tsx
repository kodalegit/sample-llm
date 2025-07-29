"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/authContext";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  
  useEffect(() => {
    // Only redirect after auth state is loaded
    if (!isLoading) {
      if (isAuthenticated) {
        // User is authenticated, redirect to chat
        router.push("/chat");
      } else {
        // User is not authenticated, redirect to auth
        router.push("/auth");
      }
    }
  }, [isAuthenticated, isLoading, router]);
  
  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="text-white text-xl">{isLoading ? "Loading..." : "Redirecting..."}</div>
    </div>
  );
}
