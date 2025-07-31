import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
} from "@tanstack/react-query";
import {
  getChats,
  getChat,
  createChat,
  sendMessage,
  sendMessageStream,
  deleteChat,
} from "./api";
import { useAuth } from "./authContext";

// Cache time constants in milliseconds
const CACHE_TIME = {
  CHATS: 5 * 60 * 1000, // 5 minutes
  CHAT: 5 * 60 * 1000, // 5 minutes for individual chat
  MESSAGES: 5 * 60 * 1000, // 5 minutes for messages
} as const;

// Chat list hooks
export function useChats() {
  const { token } = useAuth();
  
  return useQuery({
    queryKey: ["chats"],
    queryFn: async () => {
      if (!token) throw new Error("No auth token");
      const data = await getChats(token);
      return data
        .map((chat: any) => ({
          id: chat.id,
          title: chat.name || "Untitled Chat",
          time: new Date(chat.updated_at).toLocaleDateString(),
          created_at: new Date(chat.created_at).toISOString(),
          updated_at: new Date(chat.updated_at).toISOString(),
        }))
        .sort((a: { updated_at: string }, b: { updated_at: string }) => 
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        );
    },
    enabled: !!token,
    refetchOnWindowFocus: false,
    staleTime: CACHE_TIME.CHATS,
    gcTime: CACHE_TIME.CHATS * 2,
    retry: (failureCount, error: any) => {
      if (error.message.includes("401")) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

// Individual chat hook
export function useChat(chatId: string | undefined) {
  const { token } = useAuth();
  
  return useQuery({
    queryKey: ["chat", chatId],
    queryFn: async () => {
      if (!token || !chatId) throw new Error("No auth token or chat ID");
      const data = await getChat(chatId, token);
      return {
        id: data.id,
        name: data.name,
        created_at: data.created_at,
        updated_at: data.updated_at,
        messages: data.messages.map((msg: any) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          created_at: msg.created_at,
        })),
      };
    },
    enabled: !!token && !!chatId,
    refetchOnWindowFocus: false,
    staleTime: CACHE_TIME.CHAT,
    gcTime: CACHE_TIME.CHAT * 2,
    retry: (failureCount, error: any) => {
      if (error.message.includes("401") || error.message.includes("404")) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

// Create new chat mutation
export function useCreateChat() {
  const queryClient = useQueryClient();
  const { token } = useAuth();

  return useMutation({
    mutationFn: async (initialQuery: string) => {
      if (!token) throw new Error("No auth token");
      return await createChat(initialQuery, token);
    },
    onSuccess: (newChat) => {
      // Add the new chat to the chats list cache
      queryClient.setQueryData(["chats"], (oldChats: any[] = []) => [
        {
          id: newChat.id,
          title: newChat.name || "New Chat",
          time: new Date().toLocaleDateString(),
          created_at: new Date(newChat.created_at).toISOString(),
          updated_at: new Date(newChat.updated_at).toISOString(),
        },
        ...oldChats,
      ]);

      // Set the new chat data in cache
      queryClient.setQueryData(["chat", newChat.id], {
        id: newChat.id,
        name: newChat.name,
        created_at: newChat.created_at,
        updated_at: newChat.updated_at,
        messages: newChat.messages || [],
      });
    },
  });
}

// Send message mutation
export function useSendMessage() {
  const queryClient = useQueryClient();
  const { token } = useAuth();

  return useMutation({
    mutationFn: async ({ chatId, message }: { chatId: string; message: string }) => {
      if (!token) throw new Error("No auth token");
      return await sendMessage(chatId, message, token);
    },
    onSuccess: (response, { chatId }) => {
      // Invalidate the specific chat to refetch messages
      queryClient.invalidateQueries({ queryKey: ["chat", chatId] });
      // Also invalidate chats list to update last message time
      queryClient.invalidateQueries({ queryKey: ["chats"] });
    },
  });
}

// Stream message function with optimistic updates
export function useSendMessageStream() {
  const queryClient = useQueryClient();
  const { token } = useAuth();

  return {
    sendMessageStream: async (
      chatId: string,
      message: string,
      onChunk: (chunk: any) => void
    ) => {
      if (!token) throw new Error("No auth token");

      // Optimistically add user message to cache
      const userMessage = {
        id: `temp-user-${Date.now()}`,
        role: "user" as const,
        content: message,
        created_at: new Date().toISOString(),
      };

      queryClient.setQueryData(["chat", chatId], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          messages: [...(oldData.messages || []), userMessage],
        };
      });

      // Add placeholder assistant message
      const assistantId = `temp-assistant-${Date.now()}`;
      const assistantMessage = {
        id: assistantId,
        role: "assistant" as const,
        content: "",
        created_at: new Date().toISOString(),
      };

      queryClient.setQueryData(["chat", chatId], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          messages: [...(oldData.messages || []), assistantMessage],
        };
      });

      try {
        let assistantContent = "";
        await sendMessageStream(chatId, message, token, (chunk: any) => {
          assistantContent += chunk.content || "";
          
          // Update the assistant message in cache
          queryClient.setQueryData(["chat", chatId], (oldData: any) => {
            if (!oldData) return oldData;
            return {
              ...oldData,
              messages: oldData.messages.map((msg: any) =>
                msg.id === assistantId
                  ? { ...msg, content: assistantContent }
                  : msg
              ),
            };
          });

          // Call the onChunk callback for any additional UI updates
          onChunk(chunk);
        });

        // After streaming is complete, refetch to get the real message IDs
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ["chat", chatId] });
          queryClient.invalidateQueries({ queryKey: ["chats"] });
        }, 1000);

      } catch (error) {
        // Remove the optimistic messages on error
        queryClient.setQueryData(["chat", chatId], (oldData: any) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            messages: oldData.messages.filter(
              (msg: any) => msg.id !== userMessage.id && msg.id !== assistantId
            ),
          };
        });
        throw error;
      }
    },
  };
}

// Utility function to prefetch a chat
export function usePrefetchChat() {
  const queryClient = useQueryClient();
  const { token } = useAuth();

  return (chatId: string) => {
    if (!token) return;
    
    queryClient.prefetchQuery({
      queryKey: ["chat", chatId],
      queryFn: async () => {
        const data = await getChat(chatId, token);
        return {
          id: data.id,
          name: data.name,
          created_at: data.created_at,
          updated_at: data.updated_at,
          messages: data.messages.map((msg: any) => ({
            id: msg.id,
            role: msg.role,
            content: msg.content,
            created_at: msg.created_at,
          })),
        };
      },
      staleTime: CACHE_TIME.CHAT,
    });
  };
}

export function useDeleteChat() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  
  return useMutation({
    mutationFn: (chatId: string) => {
      if (!token) throw new Error('Not authenticated');
      return deleteChat(chatId, token);
    },
    onMutate: async (chatId) => {
      // Cancel any outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: ['chats'] });
      
      // Snapshot the previous value
      const previousChats = queryClient.getQueryData(['chats']);
      
      // Optimistically remove the chat
      queryClient.setQueryData(['chats'], (old: any) => 
        old?.filter((chat: any) => chat.id !== chatId)
      );
      
      return { previousChats };
    },
    onError: (err, chatId, context) => {
      // Rollback to previous chats on error
      queryClient.setQueryData(['chats'], context?.previousChats);
    },
    onSettled: () => {
      // Invalidate to confirm deletion
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    },
  });
}
