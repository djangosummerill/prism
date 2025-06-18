import { generateId, Message } from "ai";
import { createClient } from "@/lib/supabase/client";

export async function createChat(
  title?: string
): Promise<{ id: string; chat: any }> {
  const supabase = await createClient();

  // Get the current user's ID
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await supabase
    .from("chats")
    .insert({ user_id: user.id, title })
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to create chat: ${error.message}`);
  }

  return { id: data.id, chat: data };
}

export async function loadMessages(id: string): Promise<Message[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("chat_id", id)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch messages: ${error.message}`);
  }

  // If no messages, return an empty array
  if (!data) return [];

  // Map each message row to your Message type
  // @ts-ignore
  return data.map((msg) => ({
    id: msg.id,
    parts: msg.content.parts || msg.content,
    createdAt: msg.created_at,
    role: msg.role,
    annotations: [{ model: msg.model }],
    experimental_attachments: msg.content.experimental_attachments || [],
  })) as Message[];
}

export async function loadChats() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("chats")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch chats: ${error.message}`);
  }

  return data;
}

export async function deleteChat(id: string): Promise<void> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("User not authenticated");
  }

  const { error } = await supabase.from("chats").delete().eq("id", id);

  if (error) {
    throw new Error(`Failed to delete chat: ${error.message}`);
  }
}

export async function renameChat(id: string, title: string): Promise<void> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("User not authenticated");
  }

  const { error } = await supabase.from("chats").update({ title }).eq("id", id);

  if (error) {
    throw new Error(`Failed to rename chat: ${error.message}`);
  }
}

async function saveMessage(
  message: Message,
  chatId: string,
  model: string = ""
) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error("User not authenticated");
  }

  const content = {
    parts: message.parts || [],
    experimental_attachments: message.experimental_attachments || [],
  };

  const { error } = await supabase.from("messages").insert({
    chat_id: chatId,
    role: message.role,
    content: content,
    model: model,
    created_at: message.createdAt ?? new Date().toISOString(),
  });

  if (error) {
    throw new Error(`Failed to save message: ${error.message}`);
  }
}

export async function branchChat(
  messages: Message[],
  branchMessageId: string,
  originalTitle?: string // <-- add this
): Promise<{ id: string; chat: any }> {
  const branchIndex = messages.findIndex((m) => m.id === branchMessageId);
  if (branchIndex === -1) throw new Error("Message not found");

  const branchedMessages = messages.slice(0, branchIndex + 1);

  // Pass the original title to createChat
  const { id: newChatId, chat: newChat } = await createChat(
    `(BRANCH) ${originalTitle}`
  );

  for (const msg of branchedMessages) {
    // @ts-ignore
    await saveMessage(msg, newChatId, msg.annotations?.[0]?.model || "");
  }

  return { id: newChatId, chat: newChat };
}
