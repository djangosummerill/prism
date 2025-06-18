// components/chat/chat-preview-modal.tsx

import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";

function isImage(type: string) {
  return type.startsWith("image/");
}

interface ChatPreviewModalProps {
  previewAttachment: any;
  onClose: () => void;
}

export default function ChatPreviewModal({
  previewAttachment,
  onClose,
}: ChatPreviewModalProps) {
  if (!previewAttachment) return null;
  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
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
            <Button variant="outline" size="sm" onClick={onClose}>
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
                  {previewAttachment.name?.split(".").pop()?.toUpperCase() ||
                    "FILE"}
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
  );
}
