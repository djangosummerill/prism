"use client";

import { ChatHeader } from "@/components/chat-header";
import Prompt from "@/components/prompt";
import { createChat, renameChat } from "@/lib/chat-store";
import { Message, useChat } from "@ai-sdk/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useChatContext } from "@/lib/chat-context";
import { Button } from "@/components/ui/button";
import {
  Copy,
  Edit,
  GitBranch,
  GitBranchPlus,
  RefreshCcw,
  Split,
} from "lucide-react";
import { IconGitBranch, IconRefresh } from "@tabler/icons-react";
import IconButton from "./chat-button";
import Markdown from "marked-react";
import { toast } from "sonner";
import NewPrompt from "./new-prompt";
import { useModel } from "@/hooks/use-model";

interface ChatProps {
  newChat: boolean;
  chatId?: string;
  initialMessages?: Message[];
}

export default function Chat({ newChat, chatId, initialMessages }: ChatProps) {
  const router = useRouter();
  const { addChat, chats, currentChatId, setCurrentChatId, updateChatTitle } =
    useChatContext();

  const [modelId] = useModel();

  const pendingSubmit = useRef<React.FormEvent | null>(null);
  const titlesGenerated = useRef<Set<string>>(new Set());

  const generateTitle = async (message: string, chatId: string) => {
    try {
      const response = await fetch("/api/title", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          id: chatId,
        }),
      });

      if (response.ok) {
        const title = await response.text();
        updateChatTitle(chatId, title);
      } else {
        // Try to get error message from response, fallback to status text
        let errorMsg = response.statusText;
        try {
          const data = await response.json();
          errorMsg = data?.error || data?.message || errorMsg;
        } catch {
          // If not JSON, ignore
        }
        toast.error("Failed to generate title", {
          description: errorMsg || "An error occurred.",
          action: {
            label: "Hide",
            onClick: () => {},
          },
        });
      }
    } catch (error) {
      toast.error("Failed to generate title", {
        description:
          error instanceof Error ? error.message : "Failed to generate title.",
        action: {
          label: "Hide",
          onClick: () => {},
        },
      });
    }
  };

  const handleRenameChat = async (chatId: string, newTitle: string) => {
    const chat = chats.find((c) => c.id === chatId);
    if (chat) {
      chat.title = newTitle;
      await updateChatTitle(chatId, newTitle);
      await renameChat(chatId, newTitle);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error("Failed to copy text:", error);
    }
  };

  const chatHook = useChat({
    id: currentChatId,
    initialMessages,
    sendExtraMessageFields: true,
    body: { model: modelId },
    onError: (error) => {
      toast.error("Failed to generate chat", {
        description: error?.message || "An error occurred.",
        action: {
          label: "Hide",
          onClick: () => {},
        },
      });
    },
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

  // Generate title when first user message is sent
  useEffect(() => {
    if (
      currentChatId &&
      chatHook?.messages &&
      chatHook.messages.length === 1 &&
      chatHook.messages[0].role === "user" &&
      !titlesGenerated.current.has(currentChatId)
    ) {
      titlesGenerated.current.add(currentChatId);
      generateTitle(chatHook.messages[0].content, currentChatId);
    }
  }, [chatHook?.messages, currentChatId]);

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

  const currentChat = chats.find((chat) => chat.id === currentChatId);
  const chatName =
    currentChat?.title || (currentChatId ? "Untitled Chat" : "New Chat");

  return (
    <div className="flex flex-col h-[calc(100vh-1rem)]">
      <div className="flex-none">
        <ChatHeader
          chatName={chatName}
          newChat={newChat}
          onRename={(title) => {
            handleRenameChat(currentChatId || "", title);
          }}
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto w-full px-6 pt-6 pb-2">
          {chatHook?.messages.map((message) => (
            <div key={message.id} className="relative group mb-6">
              <div
                className={`space-y-2 ${
                  message.role === "user"
                    ? "ml-auto max-w-5/6 w-fit bg-muted outline-0 border border-muted-foreground/20 text-primary p-4 rounded-2xl"
                    : "w-fit"
                }`}
              >
                <div className="prose max-w-none leading-relaxed whitespace-pre-wrap dark:prose-invert prose-stone">
                  <Markdown>{message.content}</Markdown>
                </div>
              </div>
              <div
                className={`absolute top-full mt-1 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${
                  message.role === "user" ? "right-0" : "left-0"
                }`}
              >
                <IconButton
                  onClick={() => copyToClipboard(message.content)}
                  icon={Copy}
                  tabIndex={-1}
                  aria-label="Copy"
                />
                {message.role === "user" ? (
                  <IconButton
                    onClick={() => {}}
                    icon={Edit}
                    tabIndex={-1}
                    aria-label="Edit"
                  />
                ) : (
                  <IconButton
                    onClick={() => {}}
                    icon={Split}
                    tabIndex={-1}
                    aria-label="Split"
                  />
                )}
                <IconButton
                  onClick={() => {}}
                  icon={IconRefresh}
                  tabIndex={-1}
                  aria-label="Refresh"
                />
              </div>
            </div>
          ))}
        </div>
        <NewPrompt
          input={chatHook?.input ?? ""}
          handleInputChange={chatHook?.handleInputChange ?? (() => {})}
          onSubmit={handleFormSubmit}
          isLoading={chatHook.status == "streaming"}
        />
      </div>
    </div>
  );
}
