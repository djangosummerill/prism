"use client";

import Chat from "@/components/chat";
import { loadMessages } from "@/lib/chat-store";
import { Message } from "ai";
import { useEffect, useState } from "react";

export default function ChatPage(props: { params: Promise<{ id: string }> }) {
  const [chatId, setChatId] = useState<string | null>(null);
  const [initialMessages, setInitialMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadChatData() {
      try {
        const { id } = await props.params;
        setChatId(id);

        const messages = await loadMessages(id);
        setInitialMessages(messages);
      } catch (error) {
        console.error("Failed to load chat data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadChatData();
  }, [props.params]);

  return (
    <Chat
      newChat={false}
      chatId={chatId || undefined}
      initialMessages={initialMessages}
    />
  );
}
