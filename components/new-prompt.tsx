// new-prompt.tsx
"use client";

import { useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { ModelSelector } from "./model-selector";

interface NewPromptProps {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  input: string;
  isLoading?: boolean;
  onHeightChange?: (height: number) => void;
}

export default function NewPrompt({
  onSubmit,
  handleInputChange,
  input,
  isLoading = false,
  onHeightChange,
}: NewPromptProps) {
  const containerRef = useRef<HTMLDivElement>(null);

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
  }, [input, isLoading, onHeightChange]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const form = e.currentTarget.closest("form");
      if (form) {
        form.requestSubmit();
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className="w-full fixed left-64 bottom-2 pr-64 flex justify-center z-10"
    >
      <div className="bg-accent/20 backdrop-blur-sm w-3xl border-border border-1 rounded-md mb-4 p-1">
        <form onSubmit={onSubmit}>
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
            </div>
            <Button
              type="submit"
              variant="outline"
              disabled={input.trim() === "" || isLoading}
              className="m-0 fixed right-2 bottom-2 backdrop-blur-xl"
            >
              Send
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
