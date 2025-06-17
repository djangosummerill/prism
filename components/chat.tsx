/* eslint-disable react/jsx-max-props-per-line */
"use client";

import { ChatHeader } from "@/components/chat-header";
import { createChat, renameChat } from "@/lib/chat-store";
import { Message, useChat } from "@ai-sdk/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useChatContext } from "@/lib/chat-context";
import { Copy, Edit, Split, X, Download } from "lucide-react";
import { IconRefresh } from "@tabler/icons-react";
import IconButton from "./chat-button";
import Markdown from "marked-react";
import { toast } from "sonner";
import NewPrompt from "./new-prompt";
import { useModel } from "@/hooks/use-model";
import { MessageReasoning } from "./message-reasoning";
import { Button } from "@/components/ui/button";
import { getModelById } from "@/lib/models";

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

  const { modelId, reasoningLevel } = useModel();

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
  const [previewAttachment, setPreviewAttachment] = useState<any | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");

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

  const handleRetry = async (messageId: string) => {
    const messageIndex = chatHook.messages.findIndex((m) => m.id === messageId);
    if (messageIndex === -1) return;

    const message = chatHook.messages[messageIndex];

    if (message.role === "assistant") {
      // For assistant messages, remove this message and regenerate
      const messagesToKeep = chatHook.messages.slice(0, messageIndex);
      chatHook.setMessages(messagesToKeep);
      chatHook.reload();
    } else if (message.role === "user") {
      // For user messages, find the next assistant message and regenerate from this user message
      const nextAssistantIndex = chatHook.messages.findIndex(
        (m, idx) => idx > messageIndex && m.role === "assistant"
      );

      if (nextAssistantIndex !== -1) {
        // Remove the assistant message and all subsequent messages
        const messagesToKeep = chatHook.messages.slice(0, nextAssistantIndex);
        chatHook.setMessages(messagesToKeep);
        chatHook.reload();
      }
    }
  };

  const handleEditMessage = (message: Message) => {
    setEditingMessageId(message.id);
    // Extract text content from message parts
    const textContent =
      message.parts
        ?.filter((part) => part.type === "text")
        .map((part) => part.text)
        .join("") || message.content;
    setEditingContent(textContent);
  };

  // Add this helper function in your Chat component
  const deleteMessagesFromIndex = async (
    chatId: string,
    messageIndex: number
  ) => {
    try {
      const response = await fetch("/api/deletemessages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId,
          fromIndex: messageIndex,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete messages");
      }
    } catch (error) {
      console.error("Error deleting messages:", error);
      toast.error("Failed to delete old messages", {
        description:
          "The conversation will continue, but old messages may remain in history.",
        action: { label: "Hide", onClick: () => {} },
      });
    }
  };

  // Update your handleSaveEdit function
  const handleSaveEdit = async (messageId: string) => {
    if (!editingContent.trim()) return;

    const messageIndex = chatHook.messages.findIndex((m) => m.id === messageId);
    if (messageIndex === -1) return;

    // Delete messages from database starting from the edited message
    if (currentChatId) {
      await deleteMessagesFromIndex(currentChatId, messageIndex);
    }

    // Update the message content
    const updatedMessages = [...chatHook.messages];
    updatedMessages[messageIndex] = {
      ...updatedMessages[messageIndex],
      content: editingContent,
      parts: [{ type: "text", text: editingContent }],
    };

    // Remove all messages after the edited message
    const messagesToKeep = updatedMessages.slice(0, messageIndex + 1);

    // Update messages and regenerate response
    chatHook.setMessages(messagesToKeep);
    setEditingMessageId(null);
    setEditingContent("");

    // Trigger regeneration if this was a user message
    if (updatedMessages[messageIndex].role === "user") {
      chatHook.reload();
    }
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditingContent("");
  };

  const handleEditKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSaveEdit(editingMessageId!);
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancelEdit();
    } else if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit(editingMessageId!);
    }
  };

  const isImage = (type: string) => type.startsWith("image/");

  const openPreview = (attachment: any) => {
    setPreviewAttachment(attachment);
  };

  /* ---------------------------------------------------------------------- */
  /* Chat hook                                                              */
  /* ---------------------------------------------------------------------- */

  const chatHook = useChat({
    id: currentChatId,
    initialMessages,
    sendExtraMessageFields: true,
    body: { model: modelId, reasoning: reasoningLevel },
    onFinish: (message) => {
      // Add model annotation to the assistant message
      if (message.role === "assistant") {
        message.annotations = [{ model: modelId }];
      }
    },
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
        annotations: [{ model: modelId }],
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
    if (!currentChatId) return;

    // Find the current chat object
    const currentChat = chats.find((c) => c.id === currentChatId);

    // Only auto-title if:
    // - The chat exists
    // - The chat has no title or a default/untitled title
    // - The chat has exactly one user message
    // - That message is a user message
    if (
      currentChat &&
      (!currentChat.title || currentChat.title === "Untitled Chat") &&
      chatHook.messages?.length === 1 &&
      chatHook.messages[0].role === "user"
    ) {
      generateTitle(chatHook.messages[0].content, currentChatId);
    }
  }, [chatHook.messages, currentChatId, chats]);

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
        annotations: [{ model: modelId }],
        experimental_attachments: msgAttachments?.length
          ? msgAttachments.map((a) => ({
              name: a.name,
              url: a.url,
              contentType: a.type,
            }))
          : undefined,
      });

      // Add optimistic assistant message with loading indicator
      chatHook.append({
        role: "assistant",
        content: "",
        parts: [],
        annotations: [{ model: modelId }],
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
    <>
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
                            className="overflow-hidden rounded-lg border bg-muted/30 cursor-pointer transition-transform"
                            onClick={() => openPreview(att)}
                          >
                            {att.contentType?.startsWith("image/") ? (
                              <div className="group relative">
                                <img
                                  src={att.url}
                                  alt={att.name}
                                  className="max-h-48 max-w-[240px] object-contain"
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20">
                                  <span className="text-sm font-medium text-white opacity-0 group-hover:opacity-100">
                                    Click to view full size
                                  </span>
                                </div>
                              </div>
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
                        ? editingMessageId === message.id
                          ? "w-5/6 ml-auto"
                          : "ml-auto w-fit max-w-5/6 rounded-2xl border border-muted-foreground/20 bg-muted p-4 text-primary outline-0"
                        : "w-fit"
                    }`}
                  >
                    {editingMessageId === message.id ? (
                      // Edit mode - styled like the prompt
                      <div className="bg-accent/20 backdrop-blur-sm border-border border rounded-md p-1">
                        <textarea
                          value={editingContent}
                          onChange={(e) => setEditingContent(e.target.value)}
                          onKeyDown={handleEditKeyDown}
                          className="w-full resize-none bg-transparent border-none outline-none p-4"
                          rows={1}
                          style={{
                            minHeight: "1.5rem",
                            maxHeight: "13.5rem",
                            overflowY: "auto",
                          }}
                          onInput={(e) => {
                            const target = e.target as HTMLTextAreaElement;
                            target.style.height = "auto";
                            target.style.height =
                              Math.min(target.scrollHeight, 240) + "px";
                          }}
                          autoFocus
                          placeholder="Edit your message..."
                        />
                        <div className="flex justify-end pr-5 pb-2">
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleCancelEdit}
                              className="h-7 px-2 text-xs"
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleSaveEdit(message.id)}
                              disabled={!editingContent.trim()}
                              className="h-7 px-2 text-xs"
                            >
                              Save & Regenerate
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      // Display mode
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
                    )}
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
                        onClick={() => handleEditMessage(message)}
                        icon={Edit}
                        tabIndex={-1}
                        aria-label="Edit"
                        disabled={editingMessageId !== null}
                      />
                    ) : (
                      <IconButton
                        onClick={() => {}}
                        icon={Split}
                        tabIndex={-1}
                        aria-label="Branch"
                      />
                    )}
                    <IconButton
                      onClick={() => handleRetry(message.id)}
                      icon={IconRefresh}
                      tabIndex={-1}
                      aria-label="Retry"
                    />
                    {message.role == "assistant" && (
                      <span className="text-xs text-muted-foreground font-medium">
                        {(() => {
                          const messageModel = message.annotations?.[0]?.model;
                          if (messageModel) {
                            return (
                              getModelById(messageModel)?.name || messageModel
                            );
                          }
                          // Only show "Unknown" if no model is stored with the message
                          return getModelById(modelId)?.name || "Unknown";
                        })()}
                      </span>
                    )}
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
            reasoning={getModelById(modelId)?.reasoning || false}
          />
        </div>
      </div>

      {/* Preview Modal */}
      {previewAttachment && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setPreviewAttachment(null)}
        >
          <div
            className="bg-background rounded-lg max-w-4xl max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <h3 className="font-semibold">{previewAttachment.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {previewAttachment.contentType}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(previewAttachment.url, "_blank")}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPreviewAttachment(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="p-4 max-h-[70vh] overflow-auto">
              {isImage(previewAttachment.contentType || "") ? (
                <img
                  src={previewAttachment.url}
                  alt={previewAttachment.name}
                  className="max-w-full h-auto rounded"
                />
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4">
                    <span className="text-lg font-bold">
                      {previewAttachment.name
                        ?.split(".")
                        .pop()
                        ?.toUpperCase() || "FILE"}
                    </span>
                  </div>
                  <p className="text-muted-foreground">
                    Preview not available for this file type
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
