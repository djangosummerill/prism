"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { loadChats } from "@/lib/chat-store";
import { useRouter } from "next/navigation";

interface Chat {
  id: string;
  title?: string;
  created_at: string;
  user_id: string;
}

interface ChatContextType {
  chats: Chat[];
  refreshChats: () => Promise<void>;
  addChat: (chat: Chat) => void;
  updateChatTitle: (id: string, title: string) => void;
  currentChatId: string | undefined;
  setCurrentChatId: (id: string | undefined) => void;
  deleteChat: (id: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const CHAT_CACHE_KEY = "prism_cached_chats";

export function ChatProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | undefined>(
    undefined
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

  const updateChatTitle = (id: string, title: string) => {
    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat.id === id ? { ...chat, title: title } : chat
      )
    );

    const updatedChats = chats.map((chat) =>
      chat.id === id ? { ...chat, title: title } : chat
    );
    localStorage.setItem(CHAT_CACHE_KEY, JSON.stringify(updatedChats));
  };

  const deleteChat = async (id: string) => {
    try {
      setChats((prevChats) => prevChats.filter((chat) => chat.id !== id));
      const updatedChats = chats.filter((chat) => chat.id !== id);
      localStorage.setItem(CHAT_CACHE_KEY, JSON.stringify(updatedChats));

      if (currentChatId === id) {
        setCurrentChatId(undefined);
        router.push("/");
      }
    } catch (error) {
      console.error("Failed to delete chat:", error);
    }
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
      value={{
        chats,
        refreshChats,
        addChat,
        updateChatTitle,
        currentChatId,
        setCurrentChatId,
        deleteChat,
      }}
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
