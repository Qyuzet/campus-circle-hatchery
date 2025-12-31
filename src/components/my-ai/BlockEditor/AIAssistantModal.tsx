"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sparkles,
  Wand2,
  CheckCircle,
  Languages,
  List,
  Minimize2,
  Maximize2,
  MessageSquare,
  Code,
  Search,
  ChevronRight,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface AIAssistantModalProps {
  selectedText: string;
  onClose: () => void;
  onApply: (newText: string) => void;
  position: { top: number; left: number };
}

type AIAction =
  | "improve"
  | "proofread"
  | "translate"
  | "shorter"
  | "longer"
  | "tone"
  | "simplify"
  | "custom";

type Tone =
  | "professional"
  | "casual"
  | "straightforward"
  | "confident"
  | "friendly";

export function AIAssistantModal({
  selectedText,
  onClose,
  onApply,
  position,
}: AIAssistantModalProps) {
  const [view, setView] = useState<"main" | "translate" | "tone" | "custom">(
    "main"
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");
  const [selectedTone, setSelectedTone] = useState<Tone>("professional");
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  const handleAIAction = async (action: AIAction, params?: any) => {
    setIsProcessing(true);
    try {
      const response = await fetch("/api/ai/text-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: selectedText,
          action,
          ...params,
        }),
      });

      if (!response.ok) throw new Error("AI processing failed");

      const data = await response.json();
      onApply(data.result);
      toast.success("Text updated successfully");
      onClose();
    } catch (error) {
      console.error("AI action error:", error);
      toast.error("Failed to process text. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCustomPrompt = async () => {
    if (!customPrompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }
    await handleAIAction("custom", { prompt: customPrompt });
  };

  if (view === "translate") {
    return (
      <div
        ref={modalRef}
        className="fixed bg-white rounded-lg shadow-2xl border border-gray-200 w-64 z-[100]"
        style={{ top: position.top, left: position.left }}
      >
        <div className="p-1.5">
          <button
            onClick={() => setView("main")}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 px-2.5 py-1.5 hover:bg-gray-50 rounded transition-colors mb-1"
            disabled={isProcessing}
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </button>
          {isProcessing && (
            <div className="px-2.5 py-2 text-sm text-gray-600 flex items-center gap-2">
              <span className="inline-block">Thinking</span>
              <span className="inline-flex gap-0.5">
                <span
                  className="inline-block w-1 h-1 bg-gray-600 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                ></span>
                <span
                  className="inline-block w-1 h-1 bg-gray-600 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                ></span>
                <span
                  className="inline-block w-1 h-1 bg-gray-600 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                ></span>
              </span>
            </div>
          )}
          <div className="border-t border-gray-100 pt-1.5 space-y-0.5">
            {[
              "English",
              "Indonesian",
              "Spanish",
              "French",
              "German",
              "Japanese",
              "Chinese",
            ].map((lang) => (
              <button
                key={lang}
                onClick={() => handleAIAction("translate", { language: lang })}
                disabled={isProcessing}
                className="w-full text-left px-2.5 py-1.5 text-sm hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
              >
                {lang}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (view === "tone") {
    return (
      <div
        ref={modalRef}
        className="fixed bg-white rounded-lg shadow-2xl border border-gray-200 w-64 z-[100]"
        style={{ top: position.top, left: position.left }}
      >
        <div className="p-1.5">
          <button
            onClick={() => setView("main")}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 px-2.5 py-1.5 hover:bg-gray-50 rounded transition-colors mb-1"
            disabled={isProcessing}
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </button>
          {isProcessing && (
            <div className="px-2.5 py-2 text-sm text-gray-600 flex items-center gap-2">
              <span className="inline-block">Thinking</span>
              <span className="inline-flex gap-0.5">
                <span
                  className="inline-block w-1 h-1 bg-gray-600 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                ></span>
                <span
                  className="inline-block w-1 h-1 bg-gray-600 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                ></span>
                <span
                  className="inline-block w-1 h-1 bg-gray-600 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                ></span>
              </span>
            </div>
          )}
          <div className="border-t border-gray-100 pt-1.5 space-y-0.5">
            {(
              [
                "professional",
                "casual",
                "straightforward",
                "confident",
                "friendly",
              ] as Tone[]
            ).map((tone) => (
              <button
                key={tone}
                onClick={() => handleAIAction("tone", { tone })}
                disabled={isProcessing}
                className="w-full text-left px-2.5 py-1.5 text-sm hover:bg-gray-100 rounded transition-colors disabled:opacity-50 capitalize"
              >
                {tone}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (view === "custom") {
    return (
      <div
        ref={modalRef}
        className="fixed bg-white rounded-lg shadow-2xl border border-gray-200 w-96 z-[100]"
        style={{ top: position.top, left: position.left }}
      >
        <div className="p-2">
          <button
            onClick={() => setView("main")}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 px-2 py-1.5 hover:bg-gray-50 rounded-md transition-colors mb-1"
            disabled={isProcessing}
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </button>
          {isProcessing && (
            <div className="px-2.5 py-2 text-sm text-gray-600 flex items-center gap-2">
              <span className="inline-block">Thinking</span>
              <span className="inline-flex gap-0.5">
                <span
                  className="inline-block w-1 h-1 bg-gray-600 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                ></span>
                <span
                  className="inline-block w-1 h-1 bg-gray-600 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                ></span>
                <span
                  className="inline-block w-1 h-1 bg-gray-600 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                ></span>
              </span>
            </div>
          )}
          <div className="border-t border-gray-100 pt-2 mt-1">
            <input
              type="text"
              placeholder="Ask AI anything..."
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleCustomPrompt();
                }
              }}
              className="w-full px-3 py-2 text-sm border-0 focus:outline-none focus:ring-0 placeholder:text-gray-400"
              autoFocus
              disabled={isProcessing}
            />
            {customPrompt.trim() && !isProcessing && (
              <div className="px-2 pb-2 pt-1">
                <button
                  onClick={handleCustomPrompt}
                  className="w-full px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors flex items-center justify-center gap-2"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Generate</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={modalRef}
      className="fixed bg-white rounded-lg shadow-2xl border border-gray-200 w-64 z-[100]"
      style={{ top: position.top, left: position.left }}
    >
      <div className="p-1.5">
        <div className="mb-1">
          <button
            onClick={() => setView("custom")}
            className="w-full text-left px-2.5 py-1.5 text-sm text-gray-500 hover:bg-gray-50 rounded transition-colors flex items-center gap-2"
            disabled={isProcessing}
          >
            <Sparkles className="h-4 w-4" />
            <span>Ask AI anything...</span>
          </button>
        </div>

        {isProcessing && (
          <div className="px-2.5 py-2 text-sm text-gray-600 flex items-center gap-2 border-t border-gray-100">
            <span className="inline-block">Thinking</span>
            <span className="inline-flex gap-0.5">
              <span
                className="inline-block w-1 h-1 bg-gray-600 rounded-full animate-bounce"
                style={{ animationDelay: "0ms" }}
              ></span>
              <span
                className="inline-block w-1 h-1 bg-gray-600 rounded-full animate-bounce"
                style={{ animationDelay: "150ms" }}
              ></span>
              <span
                className="inline-block w-1 h-1 bg-gray-600 rounded-full animate-bounce"
                style={{ animationDelay: "300ms" }}
              ></span>
            </span>
          </div>
        )}

        <div className="border-t border-gray-100 pt-1.5 mb-1.5">
          <div className="text-xs font-medium text-gray-400 px-2.5 py-1">
            Suggested
          </div>
          <div className="space-y-0.5">
            <button
              onClick={() => handleAIAction("improve")}
              disabled={isProcessing}
              className="w-full text-left px-2.5 py-1.5 text-sm hover:bg-gray-100 rounded transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Wand2 className="h-4 w-4 text-purple-600" />
              <span>Improve writing</span>
            </button>
            <button
              onClick={() => handleAIAction("proofread")}
              disabled={isProcessing}
              className="w-full text-left px-2.5 py-1.5 text-sm hover:bg-gray-100 rounded transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Proofread</span>
            </button>
            <button
              onClick={() => setView("translate")}
              disabled={isProcessing}
              className="w-full text-left px-2.5 py-1.5 text-sm hover:bg-gray-100 rounded transition-colors flex items-center gap-2 justify-between disabled:opacity-50"
            >
              <div className="flex items-center gap-2">
                <Languages className="h-4 w-4 text-blue-600" />
                <span>Translate to</span>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </button>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-1.5">
          <div className="text-xs font-medium text-gray-400 px-2.5 py-1">
            Edit
          </div>
          <div className="space-y-0.5">
            <button
              onClick={() => handleAIAction("shorter")}
              disabled={isProcessing}
              className="w-full text-left px-2.5 py-1.5 text-sm hover:bg-gray-100 rounded transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Minimize2 className="h-4 w-4 text-gray-600" />
              <span>Make shorter</span>
            </button>
            <button
              onClick={() => setView("tone")}
              disabled={isProcessing}
              className="w-full text-left px-2.5 py-1.5 text-sm hover:bg-gray-100 rounded transition-colors flex items-center gap-2 justify-between disabled:opacity-50"
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-gray-600" />
                <span>Change tone</span>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </button>
            <button
              onClick={() => handleAIAction("simplify")}
              disabled={isProcessing}
              className="w-full text-left px-2.5 py-1.5 text-sm hover:bg-gray-100 rounded transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Code className="h-4 w-4 text-gray-600" />
              <span>Simplify language</span>
            </button>
            <button
              onClick={() => handleAIAction("longer")}
              disabled={isProcessing}
              className="w-full text-left px-2.5 py-1.5 text-sm hover:bg-gray-100 rounded transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Maximize2 className="h-4 w-4 text-gray-600" />
              <span>Make longer</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
