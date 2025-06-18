// components/chat/chat-message.tsx

import Markdown from "marked-react";
import { MessageReasoning } from "../message-reasoning";
import ChatMessageActions from "./chat-message-actions";
import ChatAttachments from "./chat-attachments";
import { Message } from "@ai-sdk/react";
import { getModelById } from "@/lib/models";

interface ChatMessageProps {
  message: Message;
  isEditing: boolean;
  editingContent: string;
  onEditChange: (v: string) => void;
  onEditKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onRetry: () => void;
  onCopy: () => void;
  onBranch: () => void;
  openPreview: (att: any) => void;
  isLoading: boolean;
  modelId: string;
}

export default function ChatMessage({
  message,
  isEditing,
  editingContent,
  onEditChange,
  onEditKeyDown,
  onCancelEdit,
  onSaveEdit,
  onEdit,
  onDelete,
  onRetry,
  onCopy,
  onBranch,
  openPreview,
  isLoading,
  modelId,
}: ChatMessageProps) {
  const hasAttachments = message.experimental_attachments?.length ?? 0;

  return (
    <div className="relative mb-12 group">
      {hasAttachments > 0 && (
        <ChatAttachments
          attachments={message.experimental_attachments!}
          openPreview={openPreview}
        />
      )}
      <div
        className={`space-y-2 ${
          message.role === "user"
            ? isEditing
              ? "w-5/6 ml-auto"
              : "ml-auto w-fit max-w-5/6 rounded-2xl border border-muted-foreground/20 bg-muted p-4 text-primary outline-0"
            : "w-fit"
        }`}
      >
        {isEditing ? (
          <div className="bg-accent/20 backdrop-blur-sm border-border border rounded-md p-1">
            <textarea
              value={editingContent}
              onChange={(e) => onEditChange(e.target.value)}
              onKeyDown={onEditKeyDown}
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
                target.style.height = Math.min(target.scrollHeight, 240) + "px";
              }}
              autoFocus
              placeholder="Edit your message..."
            />
            <div className="flex justify-end pr-5 pb-2">
              <div className="flex gap-2">
                <button
                  className="h-7 px-2 text-xs"
                  onClick={onCancelEdit}
                  type="button"
                >
                  Cancel
                </button>
                <button
                  className="h-7 px-2 text-xs"
                  onClick={onSaveEdit}
                  disabled={!editingContent.trim()}
                  type="button"
                >
                  Save & Regenerate
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="prose max-w-none whitespace-pre-wrap leading-relaxed prose-stone dark:prose-invert">
            {message.parts?.map((part, idx) => {
              if (part.type === "reasoning") {
                return (
                  <MessageReasoning
                    key={idx}
                    isLoading={isLoading}
                    reasoning={part.reasoning}
                  />
                );
              }
              if (part.type === "text") {
                return <Markdown key={idx}>{part.text}</Markdown>;
              }
              return null;
            }) ||
              (message.content && <Markdown>{message.content}</Markdown>)}
          </div>
        )}
      </div>
      <ChatMessageActions
        message={message}
        isEditing={isEditing}
        onEdit={onEdit}
        onDelete={onDelete}
        onRetry={onRetry}
        onCopy={onCopy}
        onBranch={onBranch}
        modelId={modelId}
      />
    </div>
  );
}
