"use client";

import { AINote } from "@/types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Edit, Trash2, FileText } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { toast } from "sonner";

interface NoteCardProps {
  note: AINote;
  onEdit: (note: AINote) => void;
  onUpdated: (note: AINote) => void;
  onDeleted: (noteId: string) => void;
}

export function NoteCard({
  note,
  onEdit,
  onUpdated,
  onDeleted,
}: NoteCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this note?")) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/ai-notes/${note.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete note");

      toast.success("Note deleted successfully");
      onDeleted(note.id);
    } catch (error) {
      console.error("Error deleting note:", error);
      toast.error("Failed to delete note");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      className="relative bg-gray-50 hover:bg-white border border-gray-200 rounded-lg p-4 cursor-pointer transition-all duration-200 group"
      onClick={() => onEdit(note)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
              <MoreVertical className="h-4 w-4 text-gray-500" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onEdit(note);
              }}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
              disabled={isDeleting}
              className="text-red-600"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex flex-col h-full">
        <div className="mb-3">
          <FileText className="h-10 w-10 text-gray-400" strokeWidth={1.5} />
        </div>

        <h3 className="text-sm font-medium text-gray-900 mb-8 line-clamp-2 min-h-[2.5rem]">
          {note.title || "Halaman baru"}
        </h3>

        <div className="mt-auto">
          <p className="text-xs text-gray-500">
            R {format(new Date(note.createdAt), "d MMM yyyy")}
          </p>
        </div>
      </div>
    </div>
  );
}
