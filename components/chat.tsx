"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { ChatHeader } from "@/components/chat-header";
import Prompt from "@/components/prompt";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { createChat } from "@/lib/chat-store";
import { Message, useChat } from "@ai-sdk/react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";

interface ChatProps {
  newChat: boolean;
  chatId?: string;
  initialMessages?: Message[];
}

export default function Chat({ newChat, chatId, initialMessages }: ChatProps) {
  const router = useRouter();
  const [currentChatId, setCurrentChatId] = useState<string | undefined>(
    newChat ? undefined : chatId
  );

  const pendingSubmit = useRef<React.FormEvent | null>(null);

  const chat = useChat({
    id: currentChatId,
    initialMessages,
    sendExtraMessageFields: true,
  });

  // Handle switching chats from prop
  useEffect(() => {
    if (chatId && chatId !== currentChatId) {
      setCurrentChatId(chatId);
    }
  }, [chatId, currentChatId]);

  // Once currentChatId is set and there's a pending form event, submit
  useEffect(() => {
    if (currentChatId && pendingSubmit.current && chat) {
      chat.handleSubmit(pendingSubmit.current);
      pendingSubmit.current = null;
    }
  }, [currentChatId, chat]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newChat && currentChatId) {
      chat?.handleSubmit(e);
      return;
    }

    // 1. Save the pending event
    pendingSubmit.current = e;

    // 2. Create chat and set ID
    const id = await createChat();
    setCurrentChatId(id);

    // 3. Navigate to the new chat URL
    router.push(`/chat/${id}`);
  };

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 64)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset className="flex flex-col">
        <ChatHeader chatName={currentChatId} />

        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto">
            {chat?.messages.map((message) => (
              <div key={message.id}>
                {message.role === "user" ? "User: " : "AI: "}
                {message.content}
              </div>
            ))}
          </div>

          <div className="shrink-0">
            <Prompt
              input={chat?.input ?? ""}
              handleInputChange={chat?.handleInputChange ?? (() => {})}
              handleSubmit={handleFormSubmit}
              isLoading={false}
            />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
