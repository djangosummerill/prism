"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { aiLabs } from "@/lib/models";

type ModelContextType = {
  modelId: string;
  setModelId: (id: string) => void;
  reasoningLevel: string;
  setReasoningLevel: (level: string) => void;
};

const ModelContext = createContext<ModelContextType | undefined>(undefined);

export function ModelProvider({ children }: { children: ReactNode }) {
  const defaultModelId = aiLabs[0].models[0].id;
  const defaultReasoning: string = "medium";

  const [modelId, setModelId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("modelId") || defaultModelId;
    }
    return defaultModelId;
  });

  const [reasoningLevel, setReasoningLevel] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return (
        (localStorage.getItem("reasoningLevel") as string) || defaultReasoning
      );
    }
    return defaultReasoning;
  });

  // persist modelId
  useEffect(() => {
    localStorage.setItem("modelId", modelId);
  }, [modelId]);

  // persist reasoningLevel
  useEffect(() => {
    localStorage.setItem("reasoningLevel", reasoningLevel);
  }, [reasoningLevel]);

  return (
    <ModelContext.Provider
      value={{ modelId, setModelId, reasoningLevel, setReasoningLevel }}
    >
      {children}
    </ModelContext.Provider>
  );
}

// Custom hook for easy access
export function useModel() {
  const context = useContext(ModelContext);
  if (!context) {
    throw new Error("useModel must be used within a ModelProvider");
  }
  return context;
}
