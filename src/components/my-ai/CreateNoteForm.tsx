"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { AINote } from "@/types";
import { Block } from "@/types/block";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { BlockEditor } from "./BlockEditor";
import { contentToBlocks, blocksToContent } from "@/lib/blockUtils";
import { useAIContext } from "@/contexts/AIContext";

interface CreateNoteFormProps {
  userId: string;
  onNoteCreated: (note: AINote) => void;
  onCancel: () => void;
  initialNote?: AINote;
  onAutoSave?: (note: AINote) => void;
}

export function CreateNoteForm({
  userId,
  onNoteCreated,
  onCancel,
  initialNote,
  onAutoSave,
}: CreateNoteFormProps) {
  const { setCurrentNote } = useAIContext();
  const [title, setTitle] = useState(initialNote?.title || "");
  const [blocks, setBlocks] = useState<Block[]>(() => {
    if (initialNote?.aiMetadata && (initialNote.aiMetadata as any).blocks) {
      return (initialNote.aiMetadata as any).blocks as Block[];
    }
    return contentToBlocks(initialNote?.content || "");
  });
  const [tags, setTags] = useState<string[]>(initialNote?.tags || []);
  const [isSaving, setIsSaving] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const titleRef = useRef<HTMLInputElement>(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (titleRef.current && !initialNote) {
      titleRef.current.focus();
      titleRef.current.select();
    }
  }, [initialNote]);

  useEffect(() => {
    if (initialNote) {
      setCurrentNote(initialNote);
    }
    return () => {
      setCurrentNote(null);
    };
  }, [initialNote, setCurrentNote]);

  useEffect(() => {
    if (initialNote) {
      setCurrentNote({
        ...initialNote,
        title: title || "Untitled",
      });
    }
  }, [title, initialNote, setCurrentNote]);

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleBlocksChange = useCallback((newBlocks: Block[]) => {
    setBlocks(newBlocks);
  }, []);

  useEffect(() => {
    if (!initialNote) return;

    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    autoSaveTimeoutRef.current = setTimeout(async () => {
      const content = blocksToContent(blocks);

      if (!title.trim()) {
        console.log("Autosave skipped: empty title");
        return;
      }

      console.log("Autosaving note...", {
        title,
        contentLength: content.length,
        hasContent: !!content.trim(),
      });
      setIsAutoSaving(true);

      try {
        const response = await fetch(`/api/ai-notes/${initialNote.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            content,
            tags,
            aiMetadata: {
              blocks: blocks,
              wordCount: content.split(/\s+/).filter(Boolean).length,
              readingTime: Math.ceil(
                content.split(/\s+/).filter(Boolean).length / 200
              ),
            },
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Autosave failed:", errorData);
        } else {
          const updatedNote = await response.json();
          console.log("Autosave successful");
          setLastSaved(new Date());
          if (onAutoSave) {
            onAutoSave(updatedNote);
          }
        }
      } catch (error) {
        console.error("Autosave error:", error);
      } finally {
        setIsAutoSaving(false);
      }
    }, 2000);

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [title, blocks, tags, initialNote]);

  const handleSave = async () => {
    const content = blocksToContent(blocks);

    if (!title.trim() || !content.trim()) {
      toast.error("Please add a title and some content");
      return;
    }

    setIsSaving(true);
    try {
      const url = initialNote
        ? `/api/ai-notes/${initialNote.id}`
        : "/api/ai-notes";
      const method = initialNote ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          tags,
          aiMetadata: {
            blocks: blocks,
            wordCount: content.split(/\s+/).filter(Boolean).length,
            readingTime: Math.ceil(
              content.split(/\s+/).filter(Boolean).length / 200
            ),
          },
        }),
      });

      if (!response.ok)
        throw new Error(
          initialNote ? "Failed to update note" : "Failed to create note"
        );

      const savedNote = await response.json();
      toast.success(
        initialNote ? "Note updated successfully" : "Note saved successfully"
      );
      onNoteCreated(savedNote);
    } catch (error) {
      console.error("Error saving note:", error);
      toast.error("Failed to save note");
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "s") {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <div
      className="flex flex-col bg-white min-h-screen"
      onKeyDown={handleKeyDown}
    >
      <div className="border-b border-gray-200 px-2 sm:px-4 py-2 flex items-center justify-between sticky top-14 z-10 bg-white">
        <div className="flex items-center gap-1 sm:gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="text-gray-600 hover:text-gray-900 h-7 sm:h-8 px-2 sm:px-3"
          >
            <X className="h-3.5 w-3.5 sm:h-4 sm:w-4 sm:mr-1" />
            <span className="hidden sm:inline">Cancel</span>
          </Button>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          {initialNote && (
            <div className="flex items-center gap-2 mr-2">
              {isAutoSaving ? (
                <span className="text-xs text-blue-600 flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span className="hidden sm:inline">Saving...</span>
                </span>
              ) : lastSaved ? (
                <span className="text-xs text-green-600 hidden sm:inline">
                  Saved at {lastSaved.toLocaleTimeString()}
                </span>
              ) : null}
            </div>
          )}
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-blue-600 hover:bg-blue-700 text-white h-7 sm:h-8 px-2 sm:px-3 text-xs sm:text-sm"
            size="sm"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2 animate-spin" />
                <span className="hidden xs:inline">Saving...</span>
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5 sm:h-4 sm:w-4 sm:mr-2" />
                <span className="hidden xs:inline">Save</span>
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto px-3 sm:px-6 md:px-8 py-4 sm:py-6">
          <input
            ref={titleRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Halaman Saya"
            className="w-full text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 placeholder-gray-300 border-none outline-none focus:ring-0 mb-2 bg-transparent pl-10 sm:pl-16"
          />

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4 sm:mb-6">
              {tags.map((tag, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="bg-gray-100 text-gray-700 hover:bg-gray-200 text-xs"
                >
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 hover:text-gray-900"
                  >
                    <X className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          <BlockEditor initialBlocks={blocks} onChange={handleBlocksChange} />
        </div>
      </div>
    </div>
  );
}
