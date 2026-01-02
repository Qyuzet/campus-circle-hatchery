"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Languages } from "lucide-react";
import { toast } from "sonner";

interface TranslateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  text: string;
  onTranslated: (translatedText: string) => void;
}

const languages = [
  { code: "id", name: "Indonesian" },
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "zh", name: "Chinese" },
  { code: "ar", name: "Arabic" },
  { code: "ru", name: "Russian" },
];

export function TranslateDialog({
  open,
  onOpenChange,
  text,
  onTranslated,
}: TranslateDialogProps) {
  const [selectedLanguage, setSelectedLanguage] = useState("id");
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedText, setTranslatedText] = useState("");

  const handleTranslate = async () => {
    setIsTranslating(true);
    try {
      const response = await fetch("/api/ai/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          targetLanguage: selectedLanguage,
        }),
      });

      if (!response.ok) throw new Error("Translation failed");

      const data = await response.json();
      setTranslatedText(data.translatedText);
    } catch (error) {
      console.error("Translation error:", error);
      toast.error("Failed to translate text");
    } finally {
      setIsTranslating(false);
    }
  };

  const handleApply = () => {
    if (translatedText) {
      onTranslated(translatedText);
      onOpenChange(false);
      setTranslatedText("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Languages className="h-5 w-5" />
            Translate Text
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Original Text
            </label>
            <div className="p-3 bg-gray-50 rounded border border-gray-200 text-sm text-gray-700 max-h-32 overflow-y-auto">
              {text}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Translate to
            </label>
            <div className="grid grid-cols-5 gap-2">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setSelectedLanguage(lang.code)}
                  className={`px-3 py-2 text-sm rounded border transition-colors ${
                    selectedLanguage === lang.code
                      ? "bg-blue-500 text-white border-blue-500"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {lang.name}
                </button>
              ))}
            </div>
          </div>

          {translatedText && (
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Translated Text
              </label>
              <div className="p-3 bg-green-50 rounded border border-green-200 text-sm text-gray-700 max-h-32 overflow-y-auto">
                {translatedText}
              </div>
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isTranslating}
            >
              Cancel
            </Button>
            {!translatedText ? (
              <Button onClick={handleTranslate} disabled={isTranslating}>
                {isTranslating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Translate
              </Button>
            ) : (
              <Button onClick={handleApply}>Apply Translation</Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

