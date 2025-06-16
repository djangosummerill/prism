import { appendResponseMessages, Message, streamText } from "ai";
import { createClient } from "@/lib/supabase/server";
import { getProvider } from "@/lib/provider";

// Allow streaming responses up to 5 minutes
export const maxDuration = 300;

export function errorHandler(error: unknown) {
  if (error == null) {
    return "unknown error";
  }
  if (typeof error === "string") {
    return error;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return JSON.stringify(error);
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
  const { error } = await supabase.from("messages").insert({
    chat_id: chatId,
    role: message.role,
    content: message.content,
    model: model,
    created_at: message.createdAt ?? new Date().toISOString(),
  });
  if (error) {
    throw new Error(`Failed to save message: ${error.message}`);
  }
}

export async function POST(req: Request) {
  const { messages, id, model } = await req.json();
  const message = messages[messages.length - 1];
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return new Response("User not authenticated", { status: 401 });
  }

  const openrouter = await getProvider(user.id);

  await saveMessage(message, id);

  const result = streamText({
    model: openrouter(model),
    messages,
    async onFinish({ response }) {
      const updatedMessages = appendResponseMessages({
        messages,
        responseMessages: response.messages,
      });
      const message = updatedMessages[updatedMessages.length - 1];
      await saveMessage(message, id, response.modelId);
    },
  });

  // consume the stream to ensure it runs to completion & triggers onFinish
  // even when the client response is aborted:
  result.consumeStream(); // no await

  return result.toDataStreamResponse({
    getErrorMessage: errorHandler,
  });
}
