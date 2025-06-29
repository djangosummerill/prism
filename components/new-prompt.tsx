// new-prompt.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { Button, buttonVariants } from "./ui/button";
import { ModelSelector } from "./model-selector";
import { UploadButton } from "@/lib/uploadthing";
import { toast } from "sonner";
import { twMerge } from "tailwind-merge";
import { cn } from "@/lib/utils";
import { X, Eye, Download, Loader2 } from "lucide-react";
import ReasoningSelector from "./reasoning-selector";
import { useModel } from "@/hooks/use-model";

interface Attachment {
  id: string;
  url: string;
  name: string;
  size: number;
  type: string;
  isUploading?: boolean;
  uploadProgress?: number;
  optimisticUrl?: string; // Keep the blob URL for smooth transition
}

interface NewPromptProps {
  onSubmit: (
    e: React.FormEvent<HTMLFormElement>,
    attachments: Attachment[]
  ) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  input: string;
  isLoading?: boolean;
  onHeightChange?: (height: number) => void;
  attachments?: Attachment[];
  onAttachmentsChange?: (attachments: Attachment[]) => void;
  reasoning: boolean;
}

export default function NewPrompt({
  onSubmit,
  handleInputChange,
  input,
  isLoading = false,
  onHeightChange,
  attachments: externalAttachments,
  onAttachmentsChange,
  reasoning,
}: NewPromptProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const [attachments, setAttachments] = useState<Attachment[]>(
    externalAttachments || []
  );

  const [previewAttachment, setPreviewAttachment] = useState<Attachment | null>(
    null
  );

  const [preloadedImages, setPreloadedImages] = useState<Set<string>>(
    new Set()
  );

  const { reasoningLevel, setReasoningLevel } = useModel();

  // Use ResizeObserver for robust height tracking
  useEffect(() => {
    if (!containerRef.current || !onHeightChange) return;

    const handleResize = () => {
      onHeightChange(containerRef.current!.offsetHeight);
    };

    // Initial call
    handleResize();

    // Use ResizeObserver for dynamic changes
    const observer = new window.ResizeObserver(handleResize);
    observer.observe(containerRef.current);

    // Also listen for window resize (for responsive layouts)
    window.addEventListener("resize", handleResize);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", handleResize);
    };
  }, [input, isLoading, onHeightChange, attachments]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const form = e.currentTarget.closest("form");
      if (form) {
        form.requestSubmit();
      }
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => {
      const attachment = prev.find((att) => att.id === id);
      // Clean up blob URL if it exists
      if (attachment?.optimisticUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(attachment.optimisticUrl);
      }
      const newAttachments = prev.filter((attachment) => attachment.id !== id);
      onAttachmentsChange?.(newAttachments);
      return newAttachments;
    });
  };

  const openPreview = (attachment: Attachment) => {
    if (attachment.isUploading) return;
    setPreviewAttachment(attachment);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const isImage = (type: string) => type.startsWith("image/");

  const createOptimisticAttachment = (file: File): Attachment => {
    const blobUrl = URL.createObjectURL(file);
    return {
      id: `temp-${Date.now()}-${Math.random()}`,
      url: blobUrl,
      optimisticUrl: blobUrl,
      name: file.name,
      size: file.size,
      type: file.type,
      isUploading: true,
      uploadProgress: 0,
    };
  };

  const preloadImage = (url: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = url;
    });
  };

  const getDisplayUrl = (attachment: Attachment): string => {
    // If we have a server URL and it's preloaded, use it
    if (
      !attachment.isUploading &&
      attachment.url !== attachment.optimisticUrl &&
      preloadedImages.has(attachment.url)
    ) {
      return attachment.url;
    }
    // Otherwise use optimistic URL (blob or server URL)
    return attachment.optimisticUrl || attachment.url;
  };

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      attachments.forEach((attachment) => {
        if (attachment.optimisticUrl?.startsWith("blob:")) {
          URL.revokeObjectURL(attachment.optimisticUrl);
        }
      });
    };
  }, []);

  return (
    <>
      <div
        ref={containerRef}
        className="w-full absolute bottom-0 left-0 flex justify-center z-10"
      >
        <div className="bg-accent/10 backdrop-blur-sm w-3xl border-border border-1 rounded-md mb-4 p-1">
          <form onSubmit={(e) => onSubmit(e, attachments)}>
            {/* Attachments Preview */}
            {attachments.length > 0 && (
              <div className="p-2 border-b border-border/50">
                <div className="flex flex-wrap gap-2">
                  {attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className={cn(
                        "flex items-center gap-2 bg-background/50 rounded-md p-2 border border-border/30 relative",
                        attachment.isUploading && "opacity-70"
                      )}
                    >
                      {/* Upload Progress Overlay */}
                      {attachment.isUploading && (
                        <div className="absolute inset-0 bg-background/80 rounded-md flex items-center justify-center">
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                      )}

                      {isImage(attachment.type) ? (
                        <div className="relative">
                          <img
                            src={getDisplayUrl(attachment)}
                            alt={attachment.name}
                            className="w-8 h-8 object-cover rounded"
                          />
                        </div>
                      ) : (
                        <div className="w-8 h-8 bg-muted rounded flex items-center justify-center text-xs font-medium relative">
                          {attachment.name.split(".").pop()?.toUpperCase() ||
                            "FILE"}
                          {attachment.isUploading && (
                            <div className="absolute inset-0 bg-black/20 rounded flex items-center justify-center">
                              <Loader2 className="h-3 w-3 animate-spin" />
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {attachment.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {attachment.isUploading
                            ? "Uploading..."
                            : formatFileSize(attachment.size)}
                        </p>
                      </div>

                      <div className="flex gap-1">
                        {!attachment.isUploading && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => openPreview(attachment)}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                        )}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => removeAttachment(attachment.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <textarea
              value={input}
              onKeyDown={handleKeyDown}
              onChange={handleInputChange}
              disabled={isLoading}
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
              placeholder="Type your message..."
            />
            <div className="flex justify-between">
              <div className="flex justify-items-start">
                <ModelSelector />
                <UploadButton
                  endpoint="imageUploader"
                  appearance={{
                    container: {
                      margin: "0",
                      padding: "0",
                    },
                    button: {
                      marginTop: "2px",
                      marginLeft: "4px",
                    },
                  }}
                  content={{
                    allowedContent({ ready, fileTypes, isUploading }) {
                      return <div></div>;
                    },
                    button({ ready }) {
                      return (
                        <div
                          className={cn(
                            buttonVariants({
                              variant: "outline",
                              className: "text-foreground",
                            })
                          )}
                        >
                          Upload
                        </div>
                      );
                    },
                  }}
                  config={{ cn: twMerge }}
                  onBeforeUploadBegin={(files) => {
                    // Add optimistic attachments immediately
                    const optimisticAttachments = files.map(
                      createOptimisticAttachment
                    );
                    setAttachments((prev) => {
                      const newAttachments = [
                        ...prev,
                        ...optimisticAttachments,
                      ];
                      onAttachmentsChange?.(newAttachments);
                      return newAttachments;
                    });
                    return files;
                  }}
                  onClientUploadComplete={async (res) => {
                    // Preload images before updating state
                    const imagePreloadPromises = res
                      .filter((file) => isImage(file.type || ""))
                      .map(async (file) => {
                        try {
                          await preloadImage(file.url);
                          setPreloadedImages(
                            (prev) => new Set([...prev, file.url])
                          );
                        } catch (error) {
                          console.warn("Failed to preload image:", file.url);
                        }
                      });

                    // Wait for all images to preload (or fail)
                    await Promise.allSettled(imagePreloadPromises);

                    // Replace optimistic attachments with real ones
                    setAttachments((prev) => {
                      // Find uploading attachments and map them to uploaded ones
                      const uploadingAttachments = prev.filter(
                        (att) => att.isUploading
                      );

                      // Create mapping of uploaded files
                      const uploadedMap = new Map(
                        res.map((file, index) => [
                          uploadingAttachments[index]?.id,
                          {
                            id: `uploaded-${Date.now()}-${Math.random()}`,
                            url: file.url,
                            name: file.name,
                            size: file.size,
                            type: file.type || "application/octet-stream",
                            isUploading: false,
                            optimisticUrl:
                              uploadingAttachments[index]?.optimisticUrl,
                          },
                        ])
                      );

                      // Update attachments, replacing uploading ones with uploaded ones
                      const updatedAttachments = prev.map((att) => {
                        if (att.isUploading && uploadedMap.has(att.id)) {
                          const uploaded = uploadedMap.get(att.id)!;
                          // Keep blob URL for smooth transition
                          return uploaded;
                        }
                        return att;
                      });

                      onAttachmentsChange?.(updatedAttachments);
                      return updatedAttachments;
                    });

                    // Clean up blob URLs after a delay to allow smooth transition
                    setTimeout(() => {
                      setAttachments((prev) => {
                        prev.forEach((att) => {
                          if (
                            att.optimisticUrl?.startsWith("blob:") &&
                            !att.isUploading
                          ) {
                            URL.revokeObjectURL(att.optimisticUrl);
                          }
                        });
                        return prev.map((att) => ({
                          ...att,
                          optimisticUrl: att.isUploading
                            ? att.optimisticUrl
                            : undefined,
                        }));
                      });
                    }, 1000);

                    toast.success("Attachment uploaded!");
                  }}
                  onUploadError={(error: Error) => {
                    // Remove failed uploads and clean up blob URLs
                    setAttachments((prev) => {
                      const failedUploads = prev.filter(
                        (att) => att.isUploading
                      );
                      failedUploads.forEach((att) => {
                        if (att.optimisticUrl?.startsWith("blob:")) {
                          URL.revokeObjectURL(att.optimisticUrl);
                        }
                      });
                      const filteredAttachments = prev.filter(
                        (att) => !att.isUploading
                      );
                      onAttachmentsChange?.(filteredAttachments);
                      return filteredAttachments;
                    });
                    toast.error("Failed to upload attachment", {
                      description:
                        error instanceof Error
                          ? error.message
                          : "Failed to upload attachment.",
                      action: {
                        label: "Hide",
                        onClick: () => {},
                      },
                    });
                  }}
                  onUploadProgress={(progress) => {
                    // Update progress for uploading files
                    setAttachments((prev) =>
                      prev.map((att) =>
                        att.isUploading
                          ? { ...att, uploadProgress: progress }
                          : att
                      )
                    );
                  }}
                />
                {reasoning && (
                  <ReasoningSelector
                    showNone={false}
                    value={reasoningLevel}
                    onValueChange={setReasoningLevel}
                    className="mt-1 ml-2"
                  />
                )}
              </div>
              <Button
                type="submit"
                variant="outline"
                disabled={input.trim() === "" || isLoading}
                className={`m-0 fixed right-2 bottom-2 backdrop-blur-xl text-primary`}
              >
                Send
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Preview Modal */}
      {previewAttachment && !previewAttachment.isUploading && (
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
                  {formatFileSize(previewAttachment.size)}
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
              {isImage(previewAttachment.type) ? (
                <img
                  src={getDisplayUrl(previewAttachment)}
                  alt={previewAttachment.name}
                  className="max-w-full h-auto rounded"
                />
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4">
                    <span className="text-lg font-bold">
                      {previewAttachment.name.split(".").pop()?.toUpperCase() ||
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
      )}
    </>
  );
}
