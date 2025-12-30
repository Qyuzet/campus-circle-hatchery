"use client";

import { useState } from "react";
import { AINote } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sparkles, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { BlockEditor } from "./BlockEditor/BlockEditor";
import { Block } from "@/types/block";

interface CreateNoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  onNoteCreated: (note: AINote) => void;
}

export function CreateNoteDialog({
  open,
  onOpenChange,
  userId,
  onNoteCreated,
}: CreateNoteDialogProps) {
  const [title, setTitle] = useState("");
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [subject, setSubject] = useState("");
  const [course, setCourse] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleGenerateAI = async (content: string) => {
    if (!content.trim()) {
      toast.error("Please enter some content first");
      return;
    }

    setIsGeneratingAI(true);
    try {
      const response = await fetch("/api/ai-notes/generate-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) throw new Error("Failed to generate AI summary");

      const data = await response.json();
      toast.success("AI summary generated!");
      return data;
    } catch (error) {
      console.error("Error generating AI summary:", error);
      toast.error("Failed to generate AI summary");
      return null;
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const content = blocks.map((b) => b.content).join("\n");

    if (!title.trim() || !content.trim()) {
      toast.error("Please fill in title and content");
      return;
    }

    setIsSubmitting(true);
    try {
      let aiData = null;
      if (content.length > 100) {
        aiData = await handleGenerateAI(content);
      }

      const response = await fetch("/api/ai-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          subject: subject || undefined,
          course: course || undefined,
          tags,
          aiSummary: aiData?.summary,
          aiKeyPoints: aiData?.keyPoints,
          aiMetadata: aiData?.metadata,
        }),
      });

      if (!response.ok) throw new Error("Failed to create note");

      const newNote = await response.json();
      toast.success("Note created successfully!");
      onNoteCreated(newNote);
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error("Error creating note:", error);
      toast.error("Failed to create note");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setBlocks([]);
    setSubject("");
    setCourse("");
    setTags([]);
    setTagInput("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[85vh] overflow-hidden flex flex-col p-0">
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto px-12 py-8">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Untitled"
              className="w-full text-5xl font-bold text-dark-blue placeholder:text-gray-300 border-none outline-none focus:ring-0 bg-transparent mb-1 p-0"
              autoFocus
            />

            <div className="text-sm text-gray-400 mb-6">
              Press &apos;/&apos; for commands
            </div>

            <BlockEditor initialBlocks={blocks} onChange={setBlocks} />
          </div>

          <div className="border-t border-gray-200 bg-white px-6 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-1 text-sm">
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Subject"
                className="h-8 text-sm max-w-[140px]"
              />
              <Input
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                placeholder="Course"
                className="h-8 text-sm max-w-[120px]"
              />
              <div className="flex items-center gap-1">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder="Add tag"
                  className="h-8 text-sm max-w-[120px]"
                />
                <Button
                  type="button"
                  onClick={handleAddTag}
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2"
                >
                  Add
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex gap-1">
                  {tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="h-6 text-xs flex items-center gap-1"
                    >
                      {tag}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => handleRemoveTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
                size="sm"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || isGeneratingAI}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save"
                )}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
