"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { useChatContext } from "@/lib/chat-context";
import { useModel } from "@/hooks/use-model";
import { getModelById } from "@/lib/models";
import { branchChat, createChat, renameChat } from "@/lib/chat-store";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { generateTitle, deleteMessagesFromIndex } from "@/lib/chat-api";
import { useScrollToBottom } from "@/hooks/use-scroll-to-bottom";
import { ChatHeader } from "./chat-header";
import ChatMessage from "./chat/chat-message";
import ChatPreviewModal from "./chat/chat-preview-modal";
import ChatScrollToBottom from "./chat/chat-scroll-to-bottom";
import NewPrompt from "./new-prompt";
import { DeleteDialog } from "./delete-dialog";
import { Attachment } from "@/lib/chat-types";

interface ChatProps {
  newChat: boolean;
  chatId?: string;
  initialMessages?: any[];
}

export default function Chat({ newChat, chatId, initialMessages }: ChatProps) {
  const router = useRouter();
  const { addChat, chats, currentChatId, setCurrentChatId, updateChatTitle } =
    useChatContext();
  const { modelId, reasoningLevel } = useModel();

  // State
  const [promptHeight, setPromptHeight] = useState(80);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [previewAttachment, setPreviewAttachment] = useState<any | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [openDeleteMessageDialog, setOpenDeleteMessageDialog] = useState(false);
  const [deletingMessageId, setDeletingMessageId] = useState<string | null>(
    null
  );

  // Pending submit for new chat
  const pendingSubmit = useRef<{
    text: string;
    attachments?: Attachment[];
  } | null>(null);

  // Chat hook
  const chatHook = useChat({
    id: currentChatId,
    initialMessages,
    sendExtraMessageFields: true,
    body: { model: modelId, reasoning: reasoningLevel },
    onFinish: (message) => {
      if (message.role === "assistant") {
        message.annotations = [{ model: modelId }];
      }
    },
    onError: (error) => {
      toast.error("Failed to generate chat", {
        description: error?.message || "An error occurred.",
        action: { label: "Hide", onClick: () => {} },
      });
    },
  });

  // Scroll
  const {
    ref: chatBodyRef,
    isAtBottom,
    setInstant,
    setStreaming,
  } = useScrollToBottom([chatHook.messages, chatHook.status]);

  // Effects
  useEffect(() => {
    if (chatId && chatId !== currentChatId) setCurrentChatId(chatId);
  }, [chatId, currentChatId, setCurrentChatId]);

  // Send pending message after new chat is created
  useEffect(() => {
    if (currentChatId && pendingSubmit.current) {
      const { text, attachments: pendingAtt } = pendingSubmit.current;
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
    // eslint-disable-next-line
  }, [currentChatId]);

  // Auto-title the first user message
  useEffect(() => {
    if (!currentChatId) return;
    const currentChat = chats.find((c) => c.id === currentChatId);
    if (
      currentChat &&
      (!currentChat.title || currentChat.title === "Untitled Chat") &&
      chatHook.messages?.length === 1 &&
      chatHook.messages[0].role === "user"
    ) {
      generateTitle(chatHook.messages[0].content, currentChatId)
        .then((title) => updateChatTitle(currentChatId, title))
        .catch((err) =>
          toast.error("Failed to generate title", {
            description:
              err instanceof Error ? err.message : "Failed to generate title.",
            action: { label: "Hide", onClick: () => {} },
          })
        );
    }
  }, [chatHook.messages, currentChatId, chats, updateChatTitle]);

  useEffect(() => {
    setStreaming(chatHook.status === "streaming");
  }, [chatHook.status]);

  // Handlers
  const handleRenameChat = async (id: string, title: string) => {
    const chat = chats.find((c) => c.id === id);
    if (!chat) return;
    chat.title = title;
    await updateChatTitle(id, title);
    await renameChat(id, title);
  };

  const handleBranch = async (messageId: string) => {
    try {
      const currentChat = chats.find((c) => c.id === currentChatId);
      const { id: newChatId, chat: newChat } = await branchChat(
        chatHook.messages,
        messageId,
        currentChat?.title
      );
      addChat(newChat);
      setCurrentChatId(newChatId);
      router.push(`/chat/${newChatId}`);
    } catch (error) {
      toast.error("Failed to branch chat", {
        description:
          error instanceof Error ? error.message : "An error occurred.",
        action: { label: "Hide", onClick: () => {} },
      });
    }
  };

  const handleFormSubmit = async (
    e: React.FormEvent,
    msgAttachments?: Attachment[]
  ) => {
    e.preventDefault();
    const text = chatHook.input || "";
    if (!text.trim() && !(msgAttachments?.length ?? 0)) return;
    chatHook.setInput("");
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
      setAttachments([]);
      return;
    }
    // For new chat, store the pending message
    pendingSubmit.current = { text, attachments: msgAttachments };
    try {
      const { id, chat } = await createChat();
      setCurrentChatId(id);
      addChat(chat);
      router.push(`/chat/${id}`);
    } catch (error) {
      chatHook.setInput(text);
      toast.error("Failed to create chat", {
        description:
          error instanceof Error ? error.message : "An error occurred.",
        action: { label: "Hide", onClick: () => {} },
      });
    }
  };

  // Edit message
  const handleEditMessage = (message: any) => {
    setEditingMessageId(message.id);
    const textContent =
      message.parts
        ?.filter((part: any) => part.type === "text")
        .map((part: any) => part.text)
        .join("") || message.content;
    setEditingContent(textContent);
  };

  const handleSaveEdit = async (messageId: string) => {
    if (!editingContent.trim()) return;
    const messageIndex = chatHook.messages.findIndex(
      (m: any) => m.id === messageId
    );
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

  // Copy, Delete, Retry helpers
  const copyToClipboard = async (message: any) => {
    try {
      await navigator.clipboard.writeText(
        message.parts[message.parts.length - 1].text
      );
    } catch (err: any) {
      toast.error("Failed to copy text", {
        description: err?.message || "An error occurred.",
        action: { label: "Hide", onClick: () => {} },
      });
    }
  };

  const handleDelete = async (messageId: string) => {
    const messageIndex = chatHook.messages.findIndex(
      (m: any) => m.id === messageId
    );
    if (messageIndex === -1) return;
    const originalMessages = [...chatHook.messages];
    const messagesToKeep = chatHook.messages.slice(0, messageIndex);
    chatHook.setMessages(messagesToKeep);
    try {
      if (currentChatId)
        await deleteMessagesFromIndex(currentChatId, messageIndex);
      if (
        messagesToKeep.length > 0 &&
        messagesToKeep[messagesToKeep.length - 1].role === "user"
      ) {
        chatHook.reload();
      }
    } catch (error) {
      chatHook.setMessages(originalMessages);
      toast.error("Failed to retry message", {
        description:
          error instanceof Error ? error.message : "An error occurred.",
        action: { label: "Hide", onClick: () => {} },
      });
    }
  };

  const handleRetry = async (messageId: string) => {
    const messageIndex = chatHook.messages.findIndex(
      (m: any) => m.id === messageId
    );
    if (messageIndex === -1) return;
    const originalMessages = [...chatHook.messages];
    const messagesToKeep = chatHook.messages.slice(0, messageIndex);
    chatHook.setMessages(messagesToKeep);
    try {
      if (currentChatId)
        await deleteMessagesFromIndex(currentChatId, messageIndex - 1);
      if (
        messagesToKeep.length > 0 &&
        messagesToKeep[messagesToKeep.length - 1].role === "user"
      ) {
        chatHook.reload();
      }
    } catch (error) {
      chatHook.setMessages(originalMessages);
      toast.error("Failed to retry message", {
        description:
          error instanceof Error ? error.message : "An error occurred.",
        action: { label: "Hide", onClick: () => {} },
      });
    }
  };

  // Render
  const currentChat = chats.find((c) => c.id === currentChatId);
  const chatName =
    currentChat?.title || (currentChatId ? "Untitled Chat" : "New Chat");
  const lastMessage = chatHook.messages[chatHook.messages.length - 1];
  const waitingForAssistant = lastMessage?.role === "user";

  return (
    <>
      <div className="flex h-[calc(100vh-1rem)] flex-col">
        <div className="flex-none">
          <ChatHeader
            chatName={chatName}
            newChat={newChat}
            onRename={(t) => handleRenameChat(currentChatId || "", t)}
          />
        </div>
        <div className="flex-1 overflow-y-auto" ref={chatBodyRef}>
          <div
            className="mx-auto w-full max-w-3xl px-6 pt-6"
            style={{
              paddingBottom: promptHeight + 10,
              transition: "padding-bottom 0.2s",
            }}
          >
            {chatHook.messages.map((message: any) => (
              <ChatMessage
                key={message.id}
                message={message}
                isEditing={editingMessageId === message.id}
                editingContent={editingContent}
                onEditChange={setEditingContent}
                onEditKeyDown={handleEditKeyDown}
                onCancelEdit={handleCancelEdit}
                onSaveEdit={() => handleSaveEdit(message.id)}
                onEdit={() => handleEditMessage(message)}
                onDelete={() => {
                  setDeletingMessageId(message.id);
                  setOpenDeleteMessageDialog(true);
                }}
                onRetry={() => handleRetry(message.id)}
                onCopy={() => copyToClipboard(message)}
                onBranch={() => handleBranch(message.id)}
                openPreview={setPreviewAttachment}
                isLoading={chatHook.status === "streaming"}
                modelId={modelId}
              />
            ))}
            {waitingForAssistant && (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading</span>
              </div>
            )}
          </div>
          {!isAtBottom && (
            <ChatScrollToBottom
              onClick={() => {
                if (chatBodyRef.current) {
                  chatBodyRef.current.scrollTo({
                    top: chatBodyRef.current.scrollHeight + 50,
                    behavior: "smooth",
                  });
                }
              }}
              promptHeight={promptHeight}
            />
          )}
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
      <ChatPreviewModal
        previewAttachment={previewAttachment}
        onClose={() => setPreviewAttachment(null)}
      />
      <DeleteDialog
        open={openDeleteMessageDialog}
        text="and all subsequent messages"
        setOpen={setOpenDeleteMessageDialog}
        onConfirm={async () => {
          if (deletingMessageId) {
            await handleDelete(deletingMessageId);
            setDeletingMessageId(null);
          }
        }}
      />
    </>
  );
}
