"use client";

import { useState, useEffect, useRef } from "react";
import { Sparkles, Loader2 } from "lucide-react";

interface AIPromptModalProps {
  action: string;
  title: string;
  placeholder: string;
  onClose: () => void;
  onSubmit: (prompt: string) => void;
  position: { top: number; left: number };
}

export function AIPromptModal({
  action,
  title,
  placeholder,
  onClose,
  onSubmit,
  position,
}: AIPromptModalProps) {
  const [prompt, setPrompt] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    } else if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (prompt.trim() && !isSubmitting) {
      setIsSubmitting(true);
      onSubmit(prompt.trim());
    }
  };

  return (
    <div
      ref={modalRef}
      className="fixed bg-white rounded-lg shadow-2xl border border-gray-200 w-[600px] flex flex-col z-[9999]"
      style={{
        top: position.top,
        left: position.left,
      }}
      onKeyDown={handleKeyDown}
    >
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-5 w-5 text-purple-600" />
          <h3 className="text-base font-medium text-gray-900">{title}</h3>
        </div>
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={placeholder}
            disabled={isSubmitting}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <button className="px-2 py-1 text-xs text-gray-500 hover:bg-gray-100 rounded flex items-center gap-1">
              <span className="text-blue-600">📄</span>
              Current page
            </button>
            <button className="p-1 hover:bg-gray-100 rounded">
              <span className="text-gray-400">@</span>
            </button>
            <button className="p-1 hover:bg-gray-100 rounded">
              <span className="text-gray-400 text-xs">ℹ️</span>
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 flex items-center justify-between">
        <div className="text-xs text-gray-500">
          Press <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">Enter</kbd> to
          generate or <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">Esc</kbd> to
          cancel
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!prompt.trim() || isSubmitting}
            className="px-4 py-1.5 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

