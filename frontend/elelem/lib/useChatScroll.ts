import { useRef, useState, useCallback, useEffect, useLayoutEffect } from "react";

export function useChatScroll(messages: any[], isStreaming: boolean) {
    const containerRef = useRef<HTMLDivElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const lastMessageIdRef = useRef<string | null>(null);
    const isAtBottomRef = useRef(true);
    const [showScrollButton, setShowScrollButton] = useState(false);
    
    // Check if scrolled to bottom
    const checkIfAtBottom = useCallback(() => {
      const container = containerRef.current;
      if (!container) return true;
      
      const { scrollTop, scrollHeight, clientHeight } = container;
      const threshold = 50;
      return scrollTop + clientHeight >= scrollHeight - threshold;
    }, []);
    
    // Scroll to bottom
    const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
      if (bottomRef.current) {
        bottomRef.current.scrollIntoView({ behavior });
        isAtBottomRef.current = true;
        setShowScrollButton(false);
      }
    }, []);
    
    // Handle scroll events
    const handleScroll = useCallback(() => {
      const atBottom = checkIfAtBottom();
      isAtBottomRef.current = atBottom;
      setShowScrollButton(!atBottom);
    }, [checkIfAtBottom]);
    
    // Set up scroll listener
    useEffect(() => {
      const container = containerRef.current;
      if (container) {
        container.addEventListener('scroll', handleScroll, { passive: true });
        return () => container.removeEventListener('scroll', handleScroll);
      }
    }, [handleScroll]);
    
    // Scroll when messages change
    useLayoutEffect(() => {
      if (messages.length === 0) return;
      
      const lastMessage = messages[messages.length - 1];
      
      // Initial load - scroll to bottom
      if (lastMessageIdRef.current === null) {
        lastMessageIdRef.current = lastMessage.id;
        scrollToBottom('instant');
        return;
      }
      
      const isNewMessage = lastMessage.id !== lastMessageIdRef.current;
      if (isNewMessage) {
        lastMessageIdRef.current = lastMessage.id;
        
        // For new messages, scroll to bottom if user was already at bottom
        if (isAtBottomRef.current) {
          scrollToBottom('smooth');
        }
      }
    }, [messages, scrollToBottom]);
  
    // Auto-scroll during streaming only if at bottom
    useLayoutEffect(() => {
      if (isStreaming && isAtBottomRef.current && bottomRef.current) {
        bottomRef.current.scrollIntoView({ behavior: 'instant' });
      }
    }, [messages, isStreaming]);
    
    return { containerRef, bottomRef, showScrollButton, scrollToBottom };
  }