"use client";

import { ChatHeader } from "@/components/chat-header";
import Prompt from "@/components/prompt";
import { createChat } from "@/lib/chat-store";
import { Message, useChat } from "@ai-sdk/react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useChatContext } from "@/lib/chat-context";

interface ChatProps {
  newChat: boolean;
  chatId?: string;
  initialMessages?: Message[];
}

export default function Chat({ newChat, chatId, initialMessages }: ChatProps) {
  const router = useRouter();
  const { addChat, currentChatId, setCurrentChatId } = useChatContext();

  const pendingSubmit = useRef<React.FormEvent | null>(null);

  const chatHook = useChat({
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
    if (currentChatId && pendingSubmit.current && chatHook) {
      chatHook.handleSubmit(pendingSubmit.current);
      pendingSubmit.current = null;
    }
  }, [currentChatId, chatHook]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newChat && currentChatId) {
      chatHook?.handleSubmit(e);
      return;
    }

    // 1. Save the pending event
    pendingSubmit.current = e;

    // 2. Create chat and set ID
    const { id, chat } = await createChat();
    setCurrentChatId(id);

    // 3. Update the sidebar with the new chat
    addChat(chat);

    // 4. Navigate to the new chat URL
    router.push(`/chat/${id}`);
  };

  return (
    <>
      <ChatHeader chatName={currentChatId} />

      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 overflow-y-auto">
          {chatHook?.messages.map((message) => (
            <div key={message.id}>
              {message.role === "user" ? "User: " : "AI: "}
              {message.content}
            </div>
          ))}
        </div>

        <div className="shrink-0">
          <Prompt
            input={chatHook?.input ?? ""}
            handleInputChange={chatHook?.handleInputChange ?? (() => {})}
            handleSubmit={handleFormSubmit}
            isLoading={false}
          />
        </div>
      </div>
    </>
  );
}
