"use client";

import { useState, useRef, useEffect } from "react";
import { AINote } from "@/types";
import { Block } from "@/types/block";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { BlockEditor } from "./BlockEditor";
import { contentToBlocks, blocksToContent } from "@/lib/blockUtils";

interface CreateNoteFormProps {
  userId: string;
  onNoteCreated: (note: AINote) => void;
  onCancel: () => void;
  initialNote?: AINote;
}

export function CreateNoteForm({
  userId,
  onNoteCreated,
  onCancel,
  initialNote,
}: CreateNoteFormProps) {
  const [title, setTitle] = useState(initialNote?.title || "Untitled");
  const [blocks, setBlocks] = useState<Block[]>(() =>
    contentToBlocks(initialNote?.content || "")
  );
  const [tags, setTags] = useState<string[]>(initialNote?.tags || []);
  const [isSaving, setIsSaving] = useState(false);

  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (titleRef.current && !initialNote) {
      titleRef.current.focus();
      titleRef.current.select();
    }
  }, [initialNote]);

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

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
      const method = initialNote ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          tags,
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
    <div className="h-full flex flex-col bg-white" onKeyDown={handleKeyDown}>
      <div className="border-b border-gray-200 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="text-gray-600 hover:text-gray-900 h-8"
          >
            <X className="h-4 w-4 mr-1" />
            Cancel
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-blue-600 hover:bg-blue-700 text-white h-8"
            size="sm"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto px-8 py-6">
          <input
            ref={titleRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Untitled"
            className="w-full text-4xl font-bold text-gray-900 placeholder-gray-300 border-none outline-none focus:ring-0 mb-2 bg-transparent"
          />

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {tags.map((tag, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 hover:text-gray-900"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          <BlockEditor
            initialBlocks={blocks}
            onChange={(newBlocks) => setBlocks(newBlocks)}
          />
        </div>
      </div>
    </div>
  );
}
