"use client";

import {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useEffect,
  useRef,
} from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/authContext";
import { useChat as useChatQuery, useCreateChat, useSendMessageStream as useSendMessageStreamQuery } from "@/lib/queries";

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: string;
}

interface ChatState {
  messages: Message[];
  isLoading: boolean;
  conversationId: string | null;
  conversationName: string | null;
  isStreaming: boolean;
}

type ChatAction =
  | { type: "ADD_MESSAGE"; payload: Message }
  | { type: "UPDATE_MESSAGE"; payload: { id: string; content: string } }
  | { type: "SET_MESSAGES"; payload: Message[] }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_CONVERSATION"; payload: { id: string; name?: string } }
  | { type: "SET_STREAMING"; payload: boolean }
  | { type: "RESET_CHAT" }
  | { type: "REPLACE_MESSAGE_ID"; payload: { oldId: string; newId: string } };

const ChatContext = createContext<{
  state: ChatState;
  dispatch: React.Dispatch<ChatAction>;
  sendMessage: (content: string) => Promise<void>;
  createNewConversation: (initialQuery: string) => Promise<any>;
} | null>(null);

const initialState: ChatState = {
  messages: [],
  isLoading: false,
  conversationId: null,
  conversationName: null,
  isStreaming: false,
};

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case "ADD_MESSAGE":
      const messageExists = state.messages.some(
        (m) => m.id === action.payload.id
      );
      if (messageExists) {
        return state;
      }
      return {
        ...state,
        messages: [...state.messages, action.payload],
      };

    case "UPDATE_MESSAGE":
      return {
        ...state,
        messages: state.messages.map((m) =>
          m.id === action.payload.id
            ? { ...m, content: action.payload.content }
            : m
        ),
      };

    case "SET_LOADING":
      return { ...state, isLoading: action.payload };

    case "SET_CONVERSATION":
      return {
        ...state,
        conversationId: action.payload.id,
        conversationName: action.payload.name || state.conversationName,
      };

    case "SET_MESSAGES":
      return { ...state, messages: action.payload };

    case "SET_STREAMING":
      return { ...state, isStreaming: action.payload };

    case "REPLACE_MESSAGE_ID":
      // Change the message ID while preserving order and content
      return {
        ...state,
        messages: state.messages.map((m) =>
          m.id === action.payload.oldId ? { ...m, id: action.payload.newId } : m
        ),
      };

    case "RESET_CHAT":
      return { ...initialState };

    default:
      return state;
  }
}

interface ChatProviderProps {
  children: ReactNode;
  initialConversationId?: string;
}

export function ChatProvider({
  children,
  initialConversationId,
}: ChatProviderProps) {
  const [state, dispatch] = useReducer(chatReducer, {
    ...initialState,
    conversationId: initialConversationId || null,
  });

  const router = useRouter();
  const { token } = useAuth();
  const createChatMutation = useCreateChat();
  const { sendMessageStream } = useSendMessageStreamQuery();

  const {
    data: conversationData,
    isLoading: isLoadingConversation,
    error,
  } = useChatQuery(state.conversationId || initialConversationId || '');

  // Handle 404 errors
  useEffect(() => {
    if (error?.message?.includes("404") || error?.message?.includes("not found")) {
      router.replace("/chat");
    }
  }, [error, router]);

  useEffect(() => {
    dispatch({ type: "SET_LOADING", payload: isLoadingConversation });
    if (conversationData && !isLoadingConversation) {
      const formattedMessages = conversationData.messages.map(
        (msg: { id: string; role: "user" | "assistant" | "system"; content: string; created_at?: string; createdAt?: string; }) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          createdAt: msg.created_at || msg.createdAt || new Date().toISOString(),
        })
      );

      // Prioritize local messages and ignore server messages if they're the same
      // Get local message identifiers (role + content) for duplicate detection
      const localMessageKeys = new Set(
        state.messages.map((msg) => `${msg.role}|${msg.content}`)
      );

      // Filter out server messages that duplicate local messages
      const uniqueServerMessages = formattedMessages.filter(
        (serverMsg: Message) => !localMessageKeys.has(`${serverMsg.role}|${serverMsg.content}`)
      );

      // Combine local messages with unique server messages
      let mergedMessages = [...state.messages, ...uniqueServerMessages];

      // Sort messages by creation time to maintain correct order
      mergedMessages.sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

      // Remove internal duplicates (same role + content) while preserving order
      const dedupedMessages: Message[] = [];
      const seenKeysInner = new Set<string>();
      for (const msg of mergedMessages) {
        const key = `${msg.role}|${msg.content}`;
        if (!seenKeysInner.has(key)) {
          dedupedMessages.push(msg);
          seenKeysInner.add(key);
        }
      }

      // Update messages if they've changed
      if (JSON.stringify(dedupedMessages) !== JSON.stringify(state.messages)) {
        dispatch({ type: "SET_MESSAGES", payload: dedupedMessages });
      }
    }
  }, [conversationData, isLoadingConversation]);

  const abortControllerRef = useRef<AbortController | null>(null);

  const handleMessageChunk = (() => {
    // Buffer to accumulate tokens per streaming message
    const buffer: Record<string, string> = {};

    return (
      chunk: any,
      dispatch: React.Dispatch<ChatAction>,
      userMessageId: string
    ) => {
      const assistantMessageId = chunk.id ? chunk.id : `streaming-${userMessageId}`;

      if (chunk.type === "token") {
        // We received a new token – append it to the buffer
        dispatch({ type: "SET_LOADING", payload: false });
        dispatch({ type: "SET_STREAMING", payload: true });

        // Create assistant message if it doesn't exist yet
        if (buffer[assistantMessageId] === undefined) {
          buffer[assistantMessageId] = chunk.content || "";
          const assistantMessage: Message = {
            id: assistantMessageId,
            role: "assistant",
            content: buffer[assistantMessageId],
            createdAt: new Date().toISOString(),
          };
          dispatch({ type: "ADD_MESSAGE", payload: assistantMessage });
        } else {
          // Append subsequent tokens
          buffer[assistantMessageId] += chunk.content || "";
        }

        dispatch({
          type: "UPDATE_MESSAGE",
          payload: {
            id: assistantMessageId,
            content: buffer[assistantMessageId],
          },
        });
      } else if (chunk.type === "complete") {
        // Final chunk – stop streaming and render the full message
        dispatch({ type: "SET_STREAMING", payload: false });
        dispatch({ type: "SET_LOADING", payload: false });

        const finalContent =
          chunk.content !== undefined && chunk.content !== null
            ? chunk.content
            : buffer[assistantMessageId] || "";

        // Update assistant message content
        dispatch({
          type: "UPDATE_MESSAGE",
          payload: {
            id: assistantMessageId,
            content: finalContent,
          },
        });

        // Replace the temporary streaming ID with the real message ID from the server
        if (chunk.id && chunk.id !== assistantMessageId) {
          dispatch({
            type: "REPLACE_MESSAGE_ID",
            payload: { oldId: assistantMessageId, newId: chunk.id },
          });
        }

        // Clean up
        delete buffer[assistantMessageId];
        abortControllerRef.current = null;
      } else if (chunk.type === "error") {
        dispatch({ type: "SET_STREAMING", payload: false });
        dispatch({ type: "SET_LOADING", payload: false });

        // Create assistant message if it doesn't exist yet
        if (buffer[assistantMessageId] === undefined) {
          const assistantMessage: Message = {
            id: assistantMessageId,
            role: "assistant",
            content: "",
            createdAt: new Date().toISOString(),
          };
          dispatch({ type: "ADD_MESSAGE", payload: assistantMessage });
        }

        // Update the assistant message with error content
        dispatch({
          type: "UPDATE_MESSAGE",
          payload: {
            id: assistantMessageId,
            content: chunk.content || "An error occurred while processing your request.",
          },
        });

        delete buffer[assistantMessageId];
        abortControllerRef.current = null;
      }
    };
  })();

  const sendMessage = async (content: string) => {
    if (!content.trim() || state.isLoading || !token) return;

    try {
      dispatch({ type: "SET_LOADING", payload: true });

      const userMessageId = crypto.randomUUID();
      const userMessage: Message = {
        id: userMessageId,
        role: "user",
        content: content.trim(),
        createdAt: new Date().toISOString(),
      };
      dispatch({ type: "ADD_MESSAGE", payload: userMessage });

      let targetConversationId = state.conversationId;

      if (!targetConversationId) {
        const result = await createChatMutation.mutateAsync(content.trim());
        if (!result?.id) {
          throw new Error("Failed to create conversation");
        }

        targetConversationId = result.id;

        dispatch({
          type: "SET_CONVERSATION",
          payload: { id: targetConversationId!, name: result.name },
        });
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;

      await sendMessageStream(targetConversationId!, content, (chunk: any) =>
        handleMessageChunk(chunk, dispatch, userMessageId)
      );

      dispatch({ type: "SET_LOADING", payload: false });
      dispatch({ type: "SET_STREAMING", payload: false });
      abortControllerRef.current = null;
    } catch (error: any) {
      if (error.name !== "AbortError") {
        console.error("Error sending message:", error);
        const systemMessage: Message = {
          id: crypto.randomUUID(),
          role: "system",
          content:
            "Sorry, an error occurred while sending your message. Please try again.",
          createdAt: new Date().toISOString(),
        };
        dispatch({ type: "ADD_MESSAGE", payload: systemMessage });
      }
      dispatch({ type: "SET_LOADING", payload: false });
      dispatch({ type: "SET_STREAMING", payload: false });
      abortControllerRef.current = null;
    }
  };

  const createNewConversation = async (initialQuery: string) => {
    if (!initialQuery?.trim()) return null;

    try {
      dispatch({ type: "SET_LOADING", payload: true });

      const tempMessageId = crypto.randomUUID();
      const userMessage: Message = {
        id: tempMessageId,
        role: "user",
        content: initialQuery.trim(),
        createdAt: new Date().toISOString(),
      };
      dispatch({ type: "ADD_MESSAGE", payload: userMessage });

      const result = await createChatMutation.mutateAsync(initialQuery.trim());

      if (!result) {
        throw new Error("Failed to create conversation");
      }

      dispatch({
        type: "SET_CONVERSATION",
        payload: { id: result.id, name: result.name },
      });

      await sendMessageStream(result.id, initialQuery.trim(), (chunk: any) =>
        handleMessageChunk(chunk, dispatch, tempMessageId)
      );

      return result;
    } catch (error) {
      console.error("Error creating conversation:", error);
      dispatch({ type: "SET_LOADING", payload: false });
      throw error;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  useEffect(() => {
    if (state.conversationName) {
      document.title = state.conversationName;
    } else {
      document.title = "Chat";
    }
  }, [state.conversationName]);

  return (
    <ChatContext.Provider
      value={{
        state,
        dispatch,
        sendMessage,
        createNewConversation,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
