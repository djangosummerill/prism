// components/chat/chat-message-actions.tsx

import { Copy, Edit, Split, Trash } from "lucide-react";
import { IconRefresh } from "@tabler/icons-react";
import IconButton from "../chat-button";
import { getModelById } from "@/lib/models";
import { Message } from "@ai-sdk/react";

interface ChatMessageActionsProps {
  message: Message;
  isEditing: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onRetry: () => void;
  onCopy: () => void;
  onBranch: () => void;
  modelId: string;
}

export default function ChatMessageActions({
  message,
  isEditing,
  onEdit,
  onDelete,
  onRetry,
  onCopy,
  onBranch,
  modelId,
}: ChatMessageActionsProps) {
  return (
    <div
      className={`absolute top-full mt-2 flex items-center gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100 ${
        message.role === "user" ? "-right-2" : "-left-2.5"
      }`}
    >
      <IconButton
        onClick={onCopy}
        icon={Copy}
        tabIndex={-1}
        aria-label="Copy"
      />
      {message.role === "user" ? (
        <IconButton
          onClick={onEdit}
          icon={Edit}
          tabIndex={-1}
          aria-label="Edit"
          disabled={isEditing}
        />
      ) : (
        <IconButton
          onClick={onBranch}
          icon={Split}
          tabIndex={-1}
          aria-label="Branch"
        />
      )}
      {message.role === "user" ? (
        <IconButton
          onClick={onDelete}
          icon={Trash}
          tabIndex={-1}
          aria-label="Delete"
        />
      ) : (
        <IconButton
          onClick={onRetry}
          icon={IconRefresh}
          tabIndex={-1}
          aria-label="Retry"
        />
      )}
      {message.role === "assistant" && (
        <span className="text-xs text-muted-foreground font-medium">
          {(() => {
            // @ts-ignore
            const messageModel = message.annotations?.[0]?.model;
            if (messageModel) {
              return getModelById(messageModel)?.name || messageModel;
            }
            return getModelById(modelId)?.name || "Unknown";
          })()}
        </span>
      )}
    </div>
  );
}
