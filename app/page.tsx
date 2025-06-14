"use client";

import Chat from "@/components/chat";
import { useChatContext } from "@/lib/chat-context";
import { useEffect } from "react";

export default function Home() {
  const { setCurrentChatId } = useChatContext();

  useEffect(() => {
    setCurrentChatId(undefined);
  }, [setCurrentChatId]);

  return <Chat newChat={true} chatId={undefined} initialMessages={[]} />;
}
