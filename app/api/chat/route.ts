import { openai } from "@ai-sdk/openai";
import { appendResponseMessages, Message, streamText } from "ai";
import { openrouter } from "@openrouter/ai-sdk-provider";
import { createClient } from "@/lib/supabase/server";

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

  // Get the current user's ID
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
  const { messages, id } = await req.json();

  const message = messages[messages.length - 1];

  await saveMessage(message, id);

  const result = streamText({
    model: openrouter("openai/gpt-4.1"),
    messages,
    async onFinish({ response }) {
      /*await saveChat({
        id,
        messages: appendResponseMessages({
          messages,
          responseMessages: response.messages,
        }),
      });*/
      const updatedMessages = appendResponseMessages({
        messages,
        responseMessages: response.messages,
      });

      const message = updatedMessages[updatedMessages.length - 1];

      await saveMessage(message, id, response.modelId);
    },
  });

  return result.toDataStreamResponse({
    getErrorMessage: errorHandler,
  });
}
