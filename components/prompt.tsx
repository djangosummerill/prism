"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Send, Paperclip, Mic } from "lucide-react";

interface PromptProps {
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isLoading?: boolean;
}

export default function Prompt({
  input,
  handleInputChange,
  handleSubmit,
  isLoading = false,
}: PromptProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [input]);

  return (
    <div className="flex-1 flex flex-col justify-end">
      <div className="max-w-3xl mx-auto w-full">
        <form onSubmit={handleSubmit}>
          {/* Backdrop blur container */}
          <div className="relative backdrop-blur-3xl outline-1 ps-4 pt-2 rounded-t-2xl">
            <div className="flex items-end gap-2">
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Ask me anything..."
                  className="w-full min-h-[44px] max-h-[120px] resize-none bg-transparent border-0 outline-none text-foreground placeholder:text-muted-foreground/50 text-[15px] leading-6 py-2.5 px-0 font-medium selection:bg-primary/20"
                  rows={2}
                  disabled={isLoading}
                  style={{
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                  }}
                />
                <style jsx>{`
                  textarea::-webkit-scrollbar {
                    display: none;
                  }
                `}</style>
              </div>
              <div className="pb-2 pr-2">
                <Button
                  type="submit"
                  size="sm"
                  disabled={!input.trim() || isLoading}
                  className="h-8 w-8 p-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
