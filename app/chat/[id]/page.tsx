"use client";

import Chat from "@/components/chat";
import { useParams } from "next/navigation";

export default function ChatPage() {
  const params = useParams<{ tag: string; item: string }>();
  // @ts-ignore
  return <Chat newChat={false} chatId={params.id} />;
}
