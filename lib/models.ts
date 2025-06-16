import Anthropic from "@/components/icons/anthropic";
import DeepSeek from "@/components/icons/deepseek";
import Gemini from "@/components/icons/gemini";
import Grok from "@/components/icons/grok";
import Meta from "@/components/icons/meta";
import OpenAI from "@/components/icons/openai";
import Qwen from "@/components/icons/qwen";

export type Model = {
  id: string;
  name: string;
  description: string;
};

export type Lab = {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  models: Model[];
};

export const aiLabs: Lab[] = [
  {
    id: "anthropic",
    name: "Anthropic",
    icon: Anthropic,
    models: [
      {
        id: "anthropic/claude-opus-4",
        name: "Claude 4 Opus",
        description: "Anthropic's most intelligent model yet.",
      },
      {
        id: "anthropic/claude-sonnet-4",
        name: "Claude 4 Sonnet",
        description: "Anthropic's flagship hybrid reasoning model.",
      },
      {
        id: "anthropic/claude-3.7-sonnet",
        name: "Claude 3.7 Sonnet",
        description: "Anthropic's previous flagship model.",
      },
      {
        id: "anthropic/claude-3.5-sonnet",
        name: "Claude 3.5 Sonnet",
        description: "Anthropic's previous flagship model.",
      },
    ],
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    icon: DeepSeek,
    models: [
      {
        id: "deepseek/deepseek-r1-0528",
        name: "DeepSeek R1 (05/28)",
        description: "Updated DeepSeek R1, released on May 28th.",
      },
      {
        id: "deepseek/deepseek-chat-v3-0324",
        name: "DeepSeek V3 (03/24)",
        description: "Updated DeepSeek R1, released on March 24th.",
      },
      {
        id: "deepseek/deepseek-r1",
        name: "DeepSeek R1",
        description: "Original DeepSeek R1.",
      },
      {
        id: "deepseek/deepseek-chat-v3",
        name: "DeepSeek V3",
        description: "Original DeepSeek V3.",
      },
    ],
  },
  {
    id: "google",
    name: "Google",
    icon: Gemini,
    models: [
      {
        id: "google/gemini-2.5-pro-preview",
        name: "Gemini 2.5 Pro",
        description: "Google's Gemini 2.5 Pro model.",
      },
      {
        id: "google/gemini-2.5-flash-preview-05-20",
        name: "Gemini 2.5 Flash",
        description: "Google's Gemini 2.5 Flash model.",
      },
      {
        id: "google/gemini-2.0-flash-001",
        name: "Gemini 2.0 Flash",
        description: "Google's Gemini 2.0 Flash model.",
      },
      {
        id: "google/gemini-2.0-flash-lite-001",
        name: "Gemini 2.0 Flash Lite",
        description: "Google's Gemini 2.0 Flash Lite model.",
      },
    ],
  },
  {
    id: "meta",
    name: "Meta",
    icon: Meta,
    models: [
      {
        id: "meta-llama/llama-4-maverick",
        name: "Llama 4 Maverick",
        description: "Meta's Llama 4 Maverick model.",
      },
      {
        id: "meta-llama/llama-4-scout",
        name: "Llama 4 Scout",
        description: "Meta's Llama 4 Scout model.",
      },
      {
        id: "meta-llama/llama-3.3-70b-instruct",
        name: "Llama 3.3 70B",
        description: "Meta's Llama 3.3 70B model.",
      },
      {
        id: "meta-llama/llama-3.2-90b-vision-instruct",
        name: "Llama 3.2 90B",
        description: "Meta's Llama 3.2 90B model.",
      },
      {
        id: "meta-llama/llama-3.2-11b-vision-instruct",
        name: "Llama 3.2 11B",
        description: "Meta's Llama 3.2 11B model.",
      },
      {
        id: "meta-llama/llama-3.2-3b-instruct",
        name: "Llama 3.2 3B",
        description: "Meta's Llama 3.2 3B model.",
      },
      {
        id: "meta-llama/llama-3.2-1b-instruct",
        name: "Llama 3.2 1B",
        description: "Meta's Llama 3.2 1B model.",
      },
      {
        id: "meta-llama/llama-3.1-405b-instruct",
        name: "Llama 3.1 405B",
        description: "Meta's Llama 3.1 405B model.",
      },
      {
        id: "meta-llama/llama-3.1-8b-instruct",
        name: "Llama 3.1 8B",
        description: "Meta's Llama 3.1 8B model.",
      },
    ],
  },
  {
    id: "openai",
    name: "OpenAI",
    icon: OpenAI,
    models: [
      {
        id: "openai/o3-pro",
        name: "o3 pro",
        description: "OpenAI's o3 pro model.",
      },
      {
        id: "openai/o1-pro",
        name: "o1 pro",
        description: "OpenAI's o1 pro model.",
      },
      {
        id: "openai/o3",
        name: "o3",
        description: "OpenAI's o3 model.",
      },
      {
        id: "openai/o1",
        name: "o1",
        description: "OpenAI's o1 model.",
      },
      {
        id: "openai/o4-mini",
        name: "o4 mini",
        description: "OpenAI's o4 mini model.",
      },
      {
        id: "openai/o3-mini",
        name: "o3 mini",
        description: "OpenAI's o3 mini model.",
      },
      {
        id: "openai/o1-mini",
        name: "o1 mini",
        description: "OpenAI's o1 mini model.",
      },
      {
        id: "openai/gpt-4.1",
        name: "GPT 4.1",
        description: "OpenAI's GPT 4.1 model.",
      },
      {
        id: "openai/gpt-4.1-mini",
        name: "GPT 4.1 Mini",
        description: "OpenAI's GPT 4.1 Mini model.",
      },
      {
        id: "openai/gpt-4.1-nano",
        name: "GPT 4.1 Nano",
        description: "OpenAI's GPT 4.1 Nano model.",
      },
      {
        id: "openai/gpt-4o",
        name: "GPT 4o",
        description: "OpenAI's GPT 4o model.",
      },
      {
        id: "openai/gpt-4o-mini",
        name: "GPT 4o Mini",
        description: "OpenAI's GPT 4o Mini model.",
      },
    ],
  },
  {
    id: "qwen",
    name: "Qwen",
    icon: Qwen,
    models: [
      {
        id: "qwen/qwen3-235b-a22b",
        name: "Qwen 3 235B A22B",
        description: "Qwen's 3 235B model.",
      },
      {
        id: "qwen/qwen3-32b",
        name: "Qwen 3 32B",
        description: "Qwen's 3 32B model.",
      },
      {
        id: "qwen/qwen3-30b-a3b",
        name: "Qwen 3 30B A3B",
        description: "Qwen's 3 30B model.",
      },
      {
        id: "qwen/qwen3-14b",
        name: "Qwen 3 14B",
        description: "Qwen's 3 14B model.",
      },
      {
        id: "qwen/qwen3-8b",
        name: "Qwen 3 8B",
        description: "Qwen's 3 8B model.",
      },
      {
        id: "qwen/qwen3-4b",
        name: "Qwen 3 4B",
        description: "Qwen's 3 4B model.",
      },
      {
        id: "qwen/qwen3-1.7b",
        name: "Qwen 3 1.7B",
        description: "Qwen's 3 1.7B model.",
      },
      {
        id: "qwen/qwen3-0.6b-04-28",
        name: "Qwen 3 0.6B",
        description: "Qwen's 3 0.6B model.",
      },
    ],
  },
  {
    id: "xai",
    name: "xAI",
    icon: Grok,
    models: [
      {
        id: "x-ai/grok-3-beta",
        name: "Grok 3",
        description: "xAI's Grok 3 model.",
      },
      {
        id: "x-ai/grok-3-mini-beta",
        name: "Grok 3 Mini",
        description: "xAI's Grok 3 Mini model.",
      },
    ],
  },
];

export function getModelById(id: string): Model | undefined {
  for (const lab of aiLabs) {
    const model = lab.models.find((model) => model.id === id);
    if (model) {
      return model;
    }
  }
  return undefined;
}
