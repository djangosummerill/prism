"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { ModelSelector } from "./model-selector";
import { Toggle } from "./ui/toggle";

interface NewPromptProps {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  input: string;
  isLoading?: boolean;
}

export default function NewPrompt({
  onSubmit,
  handleInputChange,
  input,
  isLoading = false,
}: NewPromptProps) {
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
    <div className="w-full fixed left-64 bottom-2 pr-64 flex justify-center">
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
              {/*<Toggle
                type="submit"
                variant="outline"
                className="mt-1 data-[state=on]:bg-primary/10"
              >
                <p className="px-2">Search</p>
              </Toggle>*/}
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
