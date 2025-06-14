"use client";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import OpenAI from "@/components/icons/openai";
import Anthropic from "@/components/icons/anthropic";
import Gemini from "@/components/icons/gemini";
import Qwen from "@/components/icons/qwen";

const aiLabs = [
  {
    name: "OpenAI",
    models: ["GPT-4", "GPT-3.5", "DALL-E 3"],
    icon: OpenAI,
  },
  {
    name: "Anthropic",
    models: ["Claude 3", "Claude 2"],
    icon: Anthropic,
  },
  {
    name: "Google",
    models: ["Gemini", "PaLM 2"],
    icon: Gemini,
  },
  {
    name: "Qwen",
    models: ["Qwen-1", "Qwen-2"],
    icon: Qwen,
  },
];

export function ModelSelector() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="px-4 py-2 bg-primary text-white rounded">
          Select AI Model
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {aiLabs.map((lab) => (
          <DropdownMenuSub key={lab.name}>
            <DropdownMenuSubTrigger>
              <span className="flex items-center gap-2">
                <lab.icon className="w-5 h-5 text-black shrink-0" />
                <span className="font-medium">{lab.name}</span>
              </span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              {lab.models.map((model) => (
                <DropdownMenuItem
                  key={model}
                  onClick={() => alert(`Selected: ${lab.name} - ${model}`)}
                >
                  {model}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
