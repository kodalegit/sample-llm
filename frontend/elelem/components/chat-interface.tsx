"use client"

import type React from "react"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Settings, PenSquare, ChevronDown, Plus, Send, Mic, Sparkles, MessageCircle, Zap } from "lucide-react"

export default function ChatInterface() {
  const [inputValue, setInputValue] = useState("")
  const [isPending, startTransition] = useTransition()

  const chatHistory = [
    { title: "Tax Advisory App Design", time: "2h ago", isActive: false },
    { title: "AI Tax Assistant Questions", time: "1d ago", isActive: true },
    { title: "Find Emails for Cold Outreach", time: "2d ago", isActive: false },
    { title: "Logo Refinement Request", time: "3d ago", isActive: false },
    { title: "Database Performance Optimization", time: "1w ago", isActive: false },
    { title: "React Component Architecture", time: "1w ago", isActive: false },
    { title: "API Integration Patterns", time: "2w ago", isActive: false },
    { title: "UI/UX Design Principles", time: "2w ago", isActive: false },
    { title: "Code Review Best Practices", time: "3w ago", isActive: false },
    { title: "Project Planning Strategy", time: "1m ago", isActive: false },
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim()) return

    startTransition(() => {
      // Simulate form submission
      console.log("Submitting:", inputValue)
      setInputValue("")
    })
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Sidebar */}
      <div className="w-72 bg-slate-800/50 backdrop-blur-xl border-r border-slate-700/50 flex flex-col">
        {/* Top Navigation */}
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold text-white">AI Assistant</span>
            </div>
            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-slate-700/50">
              <Settings className="h-4 w-4" />
            </Button>
          </div>

          <Button
            variant="ghost"
            className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-700/50 border border-slate-600/50 hover:border-slate-500/50 transition-all duration-200"
          >
            <PenSquare className="h-4 w-4 mr-3" />
            New conversation
            <div className="ml-auto text-xs bg-slate-600/50 px-2 py-1 rounded">⌘N</div>
          </Button>
        </div>

        {/* Chats Section */}
        <div className="flex-1 px-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Recent Chats</div>
            <div className="text-xs text-slate-500">{chatHistory.length}</div>
          </div>
          <ScrollArea className="h-full">
            <div className="space-y-1">
              {chatHistory.map((chat, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className={`w-full justify-start text-left hover:bg-slate-700/50 h-auto py-3 px-3 rounded-lg transition-all duration-200 group ${
                    chat.isActive ? "bg-slate-700/50 border border-slate-600/50" : ""
                  }`}
                >
                  <div className="flex items-start space-x-3 w-full">
                    <MessageCircle className="h-4 w-4 text-slate-400 mt-0.5 group-hover:text-slate-300" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-200 group-hover:text-white truncate">
                        {chat.title}
                      </div>
                      <div className="text-xs text-slate-500 group-hover:text-slate-400">{chat.time}</div>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-slate-700/50">
          <div className="flex items-center space-x-3 p-3 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-colors cursor-pointer">
            <Avatar className="h-9 w-9 ring-2 ring-slate-600/50">
              <AvatarImage src="/placeholder.svg?height=36&width=36" />
              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-semibold">
                JD
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white">John Doe</div>
              <div className="text-xs text-slate-400 flex items-center">
                <Zap className="h-3 w-3 mr-1" />
                Pro Plan
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50 bg-slate-800/30 backdrop-blur-sm">
          <div className="flex items-center space-x-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-white hover:bg-slate-700/50 font-medium">
                  GPT-4 Turbo
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-slate-800 border-slate-700">
                <DropdownMenuItem className="text-white hover:bg-slate-700">GPT-4 Turbo</DropdownMenuItem>
                <DropdownMenuItem className="text-white hover:bg-slate-700">GPT-4</DropdownMenuItem>
                <DropdownMenuItem className="text-white hover:bg-slate-700">GPT-3.5 Turbo</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="h-4 w-px bg-slate-600"></div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-slate-400">Online</span>
            </div>
          </div>

          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg">
            <Plus className="h-4 w-4 mr-2" />
            Upgrade to Pro
          </Button>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5"></div>
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>

          <div className="relative z-10 text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-6 shadow-2xl">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              {"What's on your mind?"}
            </h1>
            <p className="text-slate-400 text-lg max-w-md mx-auto">
              Start a conversation and let AI help you explore ideas, solve problems, or learn something new.
            </p>
          </div>

          <div className="w-full max-w-3xl relative z-10">
            <form onSubmit={handleSubmit} className="relative">
              <div className="relative group">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask me anything..."
                  disabled={isPending}
                  className="w-full bg-slate-800/50 backdrop-blur-sm border-slate-600/50 text-white placeholder-slate-400 pr-24 py-4 text-base rounded-2xl shadow-2xl focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 group-hover:bg-slate-800/70"
                />

                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-slate-400 hover:text-white hover:bg-slate-700/50 h-8 w-8 rounded-lg"
                  >
                    <Mic className="h-4 w-4" />
                  </Button>

                  <Button
                    type="submit"
                    disabled={!inputValue.trim() || isPending}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white h-8 w-8 rounded-lg p-0 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {isPending ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </form>

            {/* Quick suggestions */}
            <div className="mt-6 flex flex-wrap gap-2 justify-center">
              {["Explain quantum computing", "Write a Python function", "Plan a weekend trip", "Debug my code"].map(
                (suggestion, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    onClick={() => setInputValue(suggestion)}
                    className="text-slate-400 hover:text-white hover:bg-slate-700/50 border border-slate-600/30 hover:border-slate-500/50 rounded-full px-4 py-2 text-sm transition-all duration-200"
                  >
                    {suggestion}
                  </Button>
                ),
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
