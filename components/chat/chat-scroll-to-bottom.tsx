// components/chat/chat-scroll-to-bottom.tsx

import { ChevronDown } from "lucide-react";

interface ChatScrollToBottomProps {
  onClick: () => void;
  promptHeight: number;
}

export default function ChatScrollToBottom({
  onClick,
  promptHeight,
}: ChatScrollToBottomProps) {
  return (
    <div
      className="w-full flex justify-center pointer-events-none"
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: promptHeight + 24,
        zIndex: 20,
      }}
    >
      <button
        className="pointer-events-auto flex items-center gap-2 px-4 py-2 rounded-full bg-background border shadow-md hover:bg-accent transition"
        onClick={onClick}
        aria-label="Scroll to bottom"
        type="button"
      >
        <ChevronDown className="w-5 h-5" />
        <span className="font-medium text-sm">Scroll to bottom</span>
      </button>
    </div>
  );
}
