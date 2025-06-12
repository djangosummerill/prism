"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { ChatHeader } from "@/components/chat-header";
import Prompt from "@/components/prompt";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { createChat } from "@/lib/chat-store";
import { useChat } from "@ai-sdk/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface ChatProps {
  newChat: boolean;
  chatId?: string;
}

export default function Chat({ newChat, chatId }: ChatProps) {
  const router = useRouter();
  const [currentChatId, setCurrentChatId] = useState<string | undefined>(
    chatId
  );

  const { messages, input, handleInputChange, handleSubmit } = useChat({
    id: currentChatId, // This maintains state across navigation
  });

  // Update currentChatId when chatId prop changes
  useEffect(() => {
    if (chatId && chatId !== currentChatId) {
      setCurrentChatId(chatId);
    }
  }, [chatId, currentChatId]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    if (!newChat) {
      handleSubmit(e);
      return;
    }

    // Create the chat ID first
    const id = await createChat();
    setCurrentChatId(id);

    // Navigate to the new chat page
    router.push(`/chat/${id}`);

    // Now submit with the new chat ID
    handleSubmit(e);
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
        <ChatHeader chatName={chatId} />
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto">
            {messages.map((message) => (
              <div key={message.id}>
                {message.role === "user" ? "User: " : "AI: "}
                {message.content}
              </div>
            ))}
          </div>

          <div className="shrink-0">
            <Prompt
              input={input}
              handleInputChange={handleInputChange}
              handleSubmit={handleFormSubmit}
              isLoading={false}
            />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
