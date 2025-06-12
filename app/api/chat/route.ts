import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { openrouter } from "@openrouter/ai-sdk-provider";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

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

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openrouter("openai/gpt-4.1"),
    messages,
  });

  return result.toDataStreamResponse({
    getErrorMessage: errorHandler,
  });
}
