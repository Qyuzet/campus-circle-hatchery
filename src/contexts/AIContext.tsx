"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface AIContextType {
  currentNote: any | null;
  setCurrentNote: (note: any | null) => void;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export function AIProvider({ children }: { children: ReactNode }) {
  const [currentNote, setCurrentNote] = useState<any | null>(null);

  return (
    <AIContext.Provider value={{ currentNote, setCurrentNote }}>
      {children}
    </AIContext.Provider>
  );
}

export function useAIContext() {
  const context = useContext(AIContext);
  if (context === undefined) {
    throw new Error("useAIContext must be used within an AIProvider");
  }
  return context;
}

