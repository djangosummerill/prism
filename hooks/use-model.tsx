"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { aiLabs } from "@/lib/models";

type ModelContextType = {
  modelId: string;
  setModelId: (id: string) => void;
};

const ModelContext = createContext<ModelContextType | undefined>(undefined);

export function ModelProvider({ children }: { children: React.ReactNode }) {
  // Default to the first model's id
  const defaultModelId = aiLabs[0].models[0].id;

  const [modelId, setModelId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("modelId") || defaultModelId;
    }
    return defaultModelId;
  });

  useEffect(() => {
    localStorage.setItem("modelId", modelId);
  }, [modelId]);

  return (
    <ModelContext.Provider value={{ modelId, setModelId }}>
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
  return [context.modelId, context.setModelId] as const;
}
