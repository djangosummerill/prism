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
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { IconGitBranch, IconRefresh } from "@tabler/icons-react";
import IconButton from "./chat-button";
import Markdown from "marked-react";
import { toast } from "sonner";
import NewPrompt from "./new-prompt";
import { useModel } from "@/hooks/use-model";
import { MessageReasoning } from "./message-reasoning";
import { getModelById } from "@/lib/models";

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

  const pendingSubmit = useRef<{
    event: React.FormEvent;
    attachments?: any[];
  } | null>(null);
  const titlesGenerated = useRef<Set<string>>(new Set());

  const [promptHeight, setPromptHeight] = useState(80); // default height

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

  const copyToClipboard = async (message: Message) => {
    try {
      await navigator.clipboard.writeText(
        // @ts-ignore
        message.parts[message.parts?.length - 1].text,
      );
    } catch (error: any) {
      toast.error("Failed to copy text", {
        description: error.message || "An error occurred.",
        action: {
          label: "Hide",
          onClick: () => {},
        },
      });
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
      const { event, attachments } = pendingSubmit.current;

      // Always use append for optimistic UI in new chats too
      const currentInput = chatHook?.input || "";
      chatHook?.append({
        role: "user",
        content: currentInput,
        parts: [{ type: "text", text: currentInput }],
        experimental_attachments:
          attachments && attachments.length > 0
            ? attachments.map((att) => ({
                name: att.name,
                url: att.url,
                contentType: att.type,
              }))
            : undefined,
      });
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

  const handleFormSubmit = async (e: React.FormEvent, attachments?: any[]) => {
    e.preventDefault();

    const currentInput = chatHook?.input || "";

    // Don't proceed if no input and no attachments
    if (!currentInput.trim() && (!attachments || attachments.length === 0)) {
      return;
    }

    if (!newChat && currentChatId) {
      // Always use append for optimistic UI - it immediately shows the message
      chatHook?.append({
        role: "user",
        content: currentInput,
        parts: [{ type: "text", text: currentInput }],
        experimental_attachments:
          attachments && attachments.length > 0
            ? attachments.map((att) => ({
                name: att.name,
                url: att.url,
                contentType: att.type,
              }))
            : undefined,
      });
      return;
    }

    // For new chats, we still need to create the chat first
    // 1. Save the pending event and attachments
    pendingSubmit.current = { event: e, attachments };

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
        <div
          className="max-w-3xl mx-auto w-full px-6 pt-6"
          style={{
            paddingBottom: promptHeight + 10,
            transition: "padding-bottom 0.2s",
          }}
        >
          {chatHook?.messages.map((message) => (
            <div key={message.id} className="relative group mb-12">
              <div
                className={`space-y-2 ${
                  message.role === "user"
                    ? "ml-auto max-w-5/6 w-fit bg-muted outline-0 border border-muted-foreground/20 text-primary p-4 rounded-2xl"
                    : "w-fit"
                }`}
              >
                <div className="prose max-w-none leading-relaxed whitespace-pre-wrap dark:prose-invert prose-stone">
                  {message.experimental_attachments &&
                    message.experimental_attachments.length > 0 && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-3">
                          {message.experimental_attachments.map(
                            (attachment: any, index: number) => (
                              <div
                                key={index}
                                className="border rounded-lg overflow-hidden bg-muted/30"
                              >
                                {attachment.contentType?.startsWith(
                                  "image/",
                                ) ? (
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <div className="cursor-pointer group relative">
                                        <img
                                          src={attachment.url}
                                          alt={attachment.name}
                                          className="max-w-sm max-h-48 object-contain transition-transform group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                          <span className="text-white opacity-0 group-hover:opacity-100 text-sm font-medium">
                                            Click to view full size
                                          </span>
                                        </div>
                                      </div>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-5xl max-h-[90vh] p-2">
                                      <div className="flex flex-col items-center">
                                        <img
                                          src={attachment.url}
                                          alt={attachment.name}
                                          className="max-w-full max-h-[80vh] object-contain"
                                        />
                                        <p className="text-sm text-muted-foreground mt-2">
                                          {attachment.name}
                                        </p>
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                ) : (
                                  <div className="flex items-center gap-3 p-3 min-w-48">
                                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                      📄
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="font-medium text-sm truncate">
                                        {attachment.name}
                                      </div>
                                      <div className="text-xs text-muted-foreground">
                                        {attachment.contentType}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    )}
                  {message.parts?.map((part, index) => {
                    const { type } = part;
                    const key = `message-${message.id}-part-${index}`;
                    console.log(message);

                    if (type === "reasoning") {
                      return (
                        <MessageReasoning
                          key={key}
                          isLoading={chatHook.status == "streaming"}
                          reasoning={part.reasoning}
                        />
                      );
                    }

                    if (type === "text") {
                      return <Markdown key={key}>{part.text}</Markdown>;
                    }
                  })}
                  {/* Fallback for messages with content but no parts */}
                  {(!message.parts || message.parts.length === 0) &&
                    message.content && <Markdown>{message.content}</Markdown>}
                </div>
              </div>
              <div
                className={`absolute top-full mt-2 flex gap-2 items-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${
                  message.role === "user" ? "-right-2" : "-left-2.5"
                }`}
              >
                <IconButton
                  onClick={() => copyToClipboard(message)}
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
                {message.annotations && (
                  <span className="text-muted-foreground text-sm">
                    {/* @ts-ignore */}
                    {/*message.annotations[0].model as string*/}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
        <NewPrompt
          input={chatHook?.input ?? ""}
          handleInputChange={chatHook?.handleInputChange ?? (() => {})}
          onSubmit={handleFormSubmit}
          isLoading={chatHook.status == "streaming"}
          onHeightChange={setPromptHeight}
          onClearInput={() => {
            if (chatHook?.setInput) {
              chatHook.setInput("");
            }
          }}
        />
      </div>
    </div>
  );
}
