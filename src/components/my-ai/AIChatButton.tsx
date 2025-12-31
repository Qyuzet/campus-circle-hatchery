"use client";

import { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";
import { AIChatModal } from "./AIChatModal";

export function AIChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "j") {
        e.preventDefault();
        setIsOpen(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <div className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-50">
        <div className="relative">
          {showTooltip && !isOpen && (
            <div className="hidden md:block absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap shadow-lg">
              Campus AI <span className="text-gray-400 ml-1">Ctrl+J</span>
            </div>
          )}
          <button
            onClick={() => setIsOpen(true)}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className="w-11 h-11 md:w-12 md:h-12 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center border border-gray-200 hover:scale-105 active:scale-95"
            aria-label="Open Campus AI"
          >
            <Sparkles className="h-4.5 w-4.5 md:h-5 md:w-5 text-gray-700" />
          </button>
        </div>
      </div>

      {isOpen && <AIChatModal onClose={() => setIsOpen(false)} />}
    </>
  );
}
