"use server";

import { openrouter } from "@openrouter/ai-sdk-provider";
import { generateText } from "ai";

export async function generateTitle(message: string): Promise<string> {
  const { text } = await generateText({
    model: openrouter("google/gemini-2.5-flash-preview-05-20"),
    system:
      "You generate titles for AI chat messages." +
      "They must be short and sharp, and under 80 characters." +
      "You must only generate **1** title",
    prompt: `Generate a title for this message: ${message}`,
  });

  return text;
}
