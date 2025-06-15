import { createOpenRouter, openrouter } from "@openrouter/ai-sdk-provider";
import { createClient } from "./supabase/server";

async function getAPIKey(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("settings")
    .select("value")
    .eq("user_id", userId)
    .eq("key", "key")
    .single();
  if (error) {
    return undefined;
  }
  return typeof data.value === "string" ? data.value : undefined;
}

export async function getProvider(userId: string) {
  // Fetch the user's OpenRouter API key
  const apiKey = await getAPIKey(userId);

  // Choose the provider: user key or default
  const openRouterProvider = apiKey ? createOpenRouter({ apiKey }) : openrouter;
  return openRouterProvider;
}
