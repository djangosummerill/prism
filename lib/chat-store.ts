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
    .insert({ user_id: user.id })
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to create chat: ${error.message}`);
  }

  return { id: data.id, chat: data };
}

export async function loadMessages(chatId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("chat_id", chatId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch messages: ${error.message}`);
  }

  return data;
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

export async function deleteChat(chatId: string): Promise<void> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("User not authenticated");
  }

  const { error } = await supabase.from("chats").delete().eq("id", chatId);

  if (error) {
    throw new Error(`Failed to delete chat: ${error.message}`);
  }
}
