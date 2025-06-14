"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { loadChats } from "@/lib/chat-store";

interface Chat {
  id: string;
  name?: string;
  created_at: string;
  user_id: string;
}

interface ChatContextType {
  chats: Chat[];
  refreshChats: () => Promise<void>;
  addChat: (chat: Chat) => void;
  currentChatId: string | undefined;
  setCurrentChatId: (id: string | undefined) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const CHAT_CACHE_KEY = "prism_cached_chats";

export function ChatProvider({ children }: { children: ReactNode }) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | undefined>(
    undefined,
  );

  const refreshChats = async () => {
    try {
      const loadedChats = await loadChats();
      setChats(loadedChats);
      localStorage.setItem(CHAT_CACHE_KEY, JSON.stringify(loadedChats));
    } catch (error) {
      console.error("Failed to refresh chats:", error);
    }
  };

  const addChat = (chat: Chat) => {
    setChats((prevChats) => [chat, ...prevChats]);
    const updatedChats = [chat, ...chats];
    localStorage.setItem(CHAT_CACHE_KEY, JSON.stringify(updatedChats));
  };

  useEffect(() => {
    // Load cached chats first
    const cached = localStorage.getItem(CHAT_CACHE_KEY);
    if (cached) {
      try {
        setChats(JSON.parse(cached));
      } catch {
        // Ignore parse errors
      }
    }

    // Then fetch latest chats
    refreshChats();
  }, []);

  return (
    <ChatContext.Provider
      value={{ chats, refreshChats, addChat, currentChatId, setCurrentChatId }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
}
