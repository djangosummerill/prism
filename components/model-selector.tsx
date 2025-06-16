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
import { ChevronDown } from "lucide-react";
import { Button } from "./ui/button";
import { aiLabs, Lab, Model } from "@/lib/models";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { useModel } from "@/hooks/use-model"; // Adjust path as needed

interface ModelSelectorProps {
  onModelSelect?: (lab: Lab, model: Model) => void;
}

export function ModelSelector({ onModelSelect }: ModelSelectorProps) {
  // Find the first lab and model for default selection
  const firstLab = aiLabs[0];
  const firstModel = firstLab.models[0];

  // Use the custom useModel hook to store the selected model id
  const [modelId, setModelId] = useModel();

  // Find the selected lab and model based on the current modelId
  const selected = (() => {
    for (const lab of aiLabs) {
      const model = lab.models.find((m) => m.id === modelId);
      if (model) return { lab, model };
    }
    // fallback to first if not found
    return { lab: firstLab, model: firstModel };
  })();

  const handleModelSelect = (lab: Lab, model: Model) => {
    setModelId(model.id);
    onModelSelect?.(lab, model);
  };

  const SelectedIcon = selected.lab.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 m-1">
          <SelectedIcon className="w-4 h-4 text-primary shrink-0" />
          <p className="text-sm font-bold">{selected.model.name}</p>
          <ChevronDown className="mt-0.5" size={16} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="flex flex-col gap-1">
        {aiLabs.map((lab) => (
          <DropdownMenuSub key={lab.id}>
            <DropdownMenuSubTrigger
              className={selected.lab.id === lab.id ? "bg-accent" : ""}
            >
              <span className="flex items-center gap-2">
                <lab.icon className="w-5 h-5 text-primary shrink-0" />
                <span className="font-medium mr-2">{lab.name}</span>
              </span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="flex flex-col gap-1">
              {lab.models.map((model) => (
                <Tooltip key={model.id}>
                  <TooltipTrigger asChild>
                    <DropdownMenuItem
                      onClick={() => handleModelSelect(lab, model)}
                      className={`cursor-pointer ${
                        selected.lab.id === lab.id &&
                        selected.model.id === model.id
                          ? "bg-accent"
                          : ""
                      }`}
                    >
                      <lab.icon className="w-5 h-5 text-primary shrink-0" />
                      <span>{model.name}</span>
                    </DropdownMenuItem>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <span>{model.description}</span>
                  </TooltipContent>
                </Tooltip>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
