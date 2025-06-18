// hooks/use-chat-helpers.ts

import { toast } from "sonner";
import { Message } from "@ai-sdk/react";
import { deleteMessagesFromIndex } from "@/lib/chat-api";

export function useChatHelpers(
  chatHook: any,
  currentChatId: string | undefined
) {
  const copyToClipboard = async (message: Message) => {
    try {
      await navigator.clipboard.writeText(
        // @ts-ignore
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

  return { copyToClipboard, handleDelete, handleRetry };
}
