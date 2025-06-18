// components/chat/chat-attachments.tsx

interface ChatAttachmentsProps {
  attachments: any[];
  openPreview: (att: any) => void;
}

export default function ChatAttachments({
  attachments,
  openPreview,
}: ChatAttachmentsProps) {
  return (
    <div className="mb-3 flex flex-wrap gap-3 justify-end">
      {attachments.map((att, idx) => (
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
                <div className="truncate text-sm font-medium">{att.name}</div>
                <div className="text-xs text-muted-foreground">
                  {att.contentType}
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
