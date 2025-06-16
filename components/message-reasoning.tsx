"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDownIcon, LoaderIcon } from "lucide-react";
import Markdown from "marked-react";

interface MessageReasoningProps {
  isLoading: boolean;
  reasoning: string;
}

function formatDuration(ms: number) {
  // Format as "Xs" or "Xm Ys"
  const seconds = Math.floor(ms / 1000);
  if (seconds < 5) return "a few seconds";
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remSeconds = seconds % 60;
  return `${minutes}m ${remSeconds}s`;
}

export function MessageReasoning({
  isLoading,
  reasoning,
}: MessageReasoningProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [duration, setDuration] = useState<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (isLoading) {
      // Start timing
      startTimeRef.current = Date.now();
      setDuration(null);
    } else if (startTimeRef.current) {
      // Stop timing and set duration
      setDuration(Date.now() - startTimeRef.current);
      startTimeRef.current = null;
    }
  }, [isLoading]);

  const variants = {
    collapsed: {
      height: 0,
      opacity: 0,
      marginTop: 0,
      marginBottom: 0,
    },
    expanded: {
      height: "auto",
      opacity: 1,
      marginTop: "1rem",
      marginBottom: "0.5rem",
    },
  };

  return (
    <div className="flex flex-col">
      {isLoading ? (
        <div className="flex flex-row gap-2 items-center">
          <div className="font-medium">Reasoning</div>
          <div className="animate-spin mt-0.5">
            <LoaderIcon size={20} />
          </div>
        </div>
      ) : (
        <div className="flex flex-row gap-2 items-center">
          <div className="text-muted-foreground">
            Reasoned{" "}
            {duration !== null ? `for ${formatDuration(duration)}` : ""}
          </div>
          <button
            data-testid="message-reasoning-toggle"
            type="button"
            className="cursor-pointer"
            onClick={() => {
              setIsExpanded(!isExpanded);
            }}
          >
            <motion.div
              animate={{
                rotate: isExpanded ? 0 : -90,
              }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              style={{ display: "flex" }}
              className="mt-0.5 -ml-0.5"
            >
              <ChevronDownIcon
                strokeWidth={1.5}
                className="text-muted-foreground"
              />
            </motion.div>
          </button>
        </div>
      )}

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            data-testid="message-reasoning"
            key="content"
            initial="collapsed"
            animate="expanded"
            exit="collapsed"
            variants={variants}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
            className="pl-4 text-stone-600 dark:text-stone-400 border-l flex flex-col prose prose-stone dark:prose-invert prose-p:my-2 prose-ol:my-2"
          >
            <Markdown>{reasoning}</Markdown>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
