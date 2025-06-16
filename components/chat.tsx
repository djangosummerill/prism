/* eslint-disable react/jsx-max-props-per-line */
"use client";

import { ChatHeader } from "@/components/chat-header";
import { createChat, renameChat } from "@/lib/chat-store";
import { Message, useChat } from "@ai-sdk/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useChatContext } from "@/lib/chat-context";
import { Copy, Edit, Split } from "lucide-react";
import { IconRefresh } from "@tabler/icons-react";
import IconButton from "./chat-button";
import Markdown from "marked-react";
import { toast } from "sonner";
import NewPrompt from "./new-prompt";
import { useModel } from "@/hooks/use-model";
import { MessageReasoning } from "./message-reasoning";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

interface Attachment {
  id: string;
  url: string;
  name: string;
  size: number;
  type: string;
  isUploading?: boolean;
  uploadProgress?: number;
  optimisticUrl?: string;
}

interface ChatProps {
  newChat: boolean;
  chatId?: string;
  initialMessages?: Message[];
}

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export default function Chat({ newChat, chatId, initialMessages }: ChatProps) {
  const router = useRouter();
  const { addChat, chats, currentChatId, setCurrentChatId, updateChatTitle } =
    useChatContext();

  const [modelId] = useModel();

  /* ---------------------------------------------------------------------- */
  /* Local state + refs                                                     */
  /* ---------------------------------------------------------------------- */

  const pendingSubmit = useRef<{
    event: React.FormEvent;
    attachments?: Attachment[];
  } | null>(null);

  const titlesGenerated = useRef<Set<string>>(new Set());

  const [promptHeight, setPromptHeight] = useState(80);
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  /* ---------------------------------------------------------------------- */
  /* Helpers                                                                */
  /* ---------------------------------------------------------------------- */

  const generateTitle = async (message: string, id: string) => {
    try {
      const res = await fetch("/api/title", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, id }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          data?.error || data?.message || res.statusText || "Unknown error"
        );
      }

      const title = await res.text();
      updateChatTitle(id, title);
    } catch (err) {
      toast.error("Failed to generate title", {
        description:
          err instanceof Error ? err.message : "Failed to generate title.",
        action: { label: "Hide", onClick: () => {} },
      });
    }
  };

  const handleRenameChat = async (id: string, title: string) => {
    const chat = chats.find((c) => c.id === id);
    if (!chat) return;
    chat.title = title;
    await updateChatTitle(id, title);
    await renameChat(id, title);
  };

  const copyToClipboard = async (message: Message) => {
    try {
      await navigator.clipboard.writeText(
        /* @ts-ignore */
        message.parts[message.parts.length - 1].text
      );
    } catch (err: any) {
      toast.error("Failed to copy text", {
        description: err?.message || "An error occurred.",
        action: { label: "Hide", onClick: () => {} },
      });
    }
  };

  /* ---------------------------------------------------------------------- */
  /* Chat hook                                                              */
  /* ---------------------------------------------------------------------- */

  const chatHook = useChat({
    id: currentChatId,
    initialMessages,
    sendExtraMessageFields: true,
    body: { model: modelId },
    onError: (error) =>
      toast.error("Failed to generate chat", {
        description: error?.message || "An error occurred.",
        action: { label: "Hide", onClick: () => {} },
      }),
  });

  /* ---------------------------------------------------------------------- */
  /* Effects                                                                */
  /* ---------------------------------------------------------------------- */

  /* keep prop/ctx in sync */
  useEffect(() => {
    if (chatId && chatId !== currentChatId) {
      setCurrentChatId(chatId);
    }
  }, [chatId, currentChatId, setCurrentChatId]);

  /* flush pending form submit once we have an id */
  useEffect(() => {
    if (currentChatId && pendingSubmit.current && chatHook) {
      const { attachments: pendingAtt } = pendingSubmit.current;

      const text = chatHook.input || "";

      chatHook.append({
        role: "user",
        content: text,
        parts: [{ type: "text", text }],
        experimental_attachments: pendingAtt?.length
          ? pendingAtt.map((a) => ({
              name: a.name,
              url: a.url,
              contentType: a.type,
            }))
          : undefined,
      });

      setAttachments([]);
      pendingSubmit.current = null;
    }
  }, [currentChatId, chatHook]);

  /* auto-title the very first user message */
  useEffect(() => {
    if (
      currentChatId &&
      chatHook.messages?.length === 1 &&
      chatHook.messages[0].role === "user" &&
      !titlesGenerated.current.has(currentChatId)
    ) {
      titlesGenerated.current.add(currentChatId);
      generateTitle(chatHook.messages[0].content, currentChatId);
    }
  }, [chatHook.messages, currentChatId]);

  /* ---------------------------------------------------------------------- */
  /* Handlers                                                               */
  /* ---------------------------------------------------------------------- */

  const handleFormSubmit = async (
    e: React.FormEvent,
    msgAttachments?: Attachment[]
  ) => {
    e.preventDefault();

    const text = chatHook.input || "";

    if (!text.trim() && !(msgAttachments?.length ?? 0)) return;

    if (!newChat && currentChatId) {
      chatHook.append({
        role: "user",
        content: text,
        parts: [{ type: "text", text }],
        experimental_attachments: msgAttachments?.length
          ? msgAttachments.map((a) => ({
              name: a.name,
              url: a.url,
              contentType: a.type,
            }))
          : undefined,
      });
      setAttachments([]);
      return;
    }

    /* new chat – create first */
    pendingSubmit.current = { event: e, attachments: msgAttachments };
    const { id, chat } = await createChat();
    setCurrentChatId(id);
    addChat(chat);
    router.push(`/chat/${id}`);
  };

  /* ---------------------------------------------------------------------- */
  /* Render                                                                 */
  /* ---------------------------------------------------------------------- */

  const currentChat = chats.find((c) => c.id === currentChatId);
  const chatName =
    currentChat?.title || (currentChatId ? "Untitled Chat" : "New Chat");

  return (
    <div className="flex h-[calc(100vh-1rem)] flex-col">
      {/* Header ---------------------------------------------------------- */}
      <div className="flex-none">
        <ChatHeader
          chatName={chatName}
          newChat={newChat}
          onRename={(t) => handleRenameChat(currentChatId || "", t)}
        />
      </div>

      {/* Body ------------------------------------------------------------ */}
      <div className="flex-1 overflow-y-auto">
        <div
          className="mx-auto w-full max-w-3xl px-6 pt-6"
          style={{
            paddingBottom: promptHeight + 10,
            transition: "padding-bottom 0.2s",
          }}
        >
          {chatHook.messages.map((message) => {
            const hasAttachments =
              message.experimental_attachments?.length ?? 0;

            return (
              <div key={message.id} className="relative mb-12 group">
                {/* ----------------------------------------------------- */}
                {/* Attachments – floated right                          */}
                {/* ----------------------------------------------------- */}
                {hasAttachments > 0 && (
                  <div className="mb-3 flex flex-wrap gap-3 justify-end">
                    {message.experimental_attachments!.map(
                      (att: any, idx: number) => (
                        <div
                          key={idx}
                          className="overflow-hidden rounded-lg border bg-muted/30"
                        >
                          {att.contentType?.startsWith("image/") ? (
                            <Dialog>
                              <DialogTrigger asChild>
                                <div className="group relative cursor-pointer">
                                  <img
                                    src={att.url}
                                    alt={att.name}
                                    className="max-h-48 max-w-[240px] object-contain transition-transform group-hover:scale-105"
                                  />
                                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20">
                                    <span className="text-sm font-medium text-white opacity-0 group-hover:opacity-100">
                                      Click to view full size
                                    </span>
                                  </div>
                                </div>
                              </DialogTrigger>
                              <DialogContent className="max-h-[90vh] max-w-5xl p-2">
                                <div className="flex flex-col items-center">
                                  <img
                                    src={att.url}
                                    alt={att.name}
                                    className="max-h-[80vh] max-w-full object-contain"
                                  />
                                  <p className="mt-2 text-sm text-muted-foreground">
                                    {att.name}
                                  </p>
                                </div>
                              </DialogContent>
                            </Dialog>
                          ) : (
                            <div className="flex min-w-48 items-center gap-3 p-3">
                              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                📄
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="truncate text-sm font-medium">
                                  {att.name}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {att.contentType}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    )}
                  </div>
                )}

                {/* ----------------------------------------------------- */}
                {/* Chat bubble                                           */}
                {/* ----------------------------------------------------- */}
                <div
                  className={`space-y-2 ${
                    message.role === "user"
                      ? "ml-auto w-fit max-w-5/6 rounded-2xl border border-muted-foreground/20 bg-muted p-4 text-primary outline-0"
                      : "w-fit"
                  }`}
                >
                  <div className="prose max-w-none whitespace-pre-wrap leading-relaxed prose-stone dark:prose-invert">
                    {message.parts?.map((part, idx) => {
                      const key = `msg-${message.id}-part-${idx}`;

                      if (part.type === "reasoning") {
                        return (
                          <MessageReasoning
                            key={key}
                            isLoading={chatHook.status === "streaming"}
                            reasoning={part.reasoning}
                          />
                        );
                      }

                      if (part.type === "text") {
                        return <Markdown key={key}>{part.text}</Markdown>;
                      }

                      return null;
                    })}
                  </div>
                </div>

                {/* ----------------------------------------------------- */}
                {/* Action buttons                                        */}
                {/* ----------------------------------------------------- */}
                <div
                  className={`absolute top-full mt-2 flex items-center gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100 ${
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
                </div>
              </div>
            );
          })}
        </div>

        {/* Prompt ------------------------------------------------------- */}
        <NewPrompt
          input={chatHook.input ?? ""}
          handleInputChange={chatHook.handleInputChange ?? (() => {})}
          onSubmit={handleFormSubmit}
          isLoading={chatHook.status === "streaming"}
          onHeightChange={setPromptHeight}
          attachments={attachments}
          onAttachmentsChange={setAttachments}
        />
      </div>
    </div>
  );
}
