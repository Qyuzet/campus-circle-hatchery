"use client";

import { AINote } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  BookOpen,
  Calendar,
  Tag,
  Sparkles,
  Lightbulb,
  FileText,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ViewNoteDialogProps {
  note: AINote;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewNoteDialog({
  note,
  open,
  onOpenChange,
}: ViewNoteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{note.title}</DialogTitle>
          <div className="flex flex-wrap items-center gap-3 text-sm text-medium-gray pt-2">
            {note.subject && (
              <div className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                <span>{note.subject}</span>
                {note.course && <span className="ml-1">({note.course})</span>}
              </div>
            )}
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{formatDistanceToNow(new Date(note.createdAt))} ago</span>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {note.tags.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Tag className="h-4 w-4 text-medium-gray" />
                <span className="text-sm font-medium text-dark-blue">Tags</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {note.tags.map((tag, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="bg-blue-50 text-blue-700"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {note.aiSummary && (
            <div className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border border-purple-100">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                <span className="font-semibold text-purple-900">
                  AI Summary
                </span>
              </div>
              <p className="text-purple-900">{note.aiSummary}</p>
            </div>
          )}

          {note.aiKeyPoints && (
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-100">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="h-5 w-5 text-yellow-600" />
                <span className="font-semibold text-yellow-900">
                  Key Points
                </span>
              </div>
              {note.aiKeyPoints.points && note.aiKeyPoints.points.length > 0 && (
                <ul className="list-disc list-inside space-y-1 text-yellow-900">
                  {note.aiKeyPoints.points.map((point, index) => (
                    <li key={index}>{point}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <Separator />

          <div>
            <div className="flex items-center gap-2 mb-3">
              <FileText className="h-5 w-5 text-dark-blue" />
              <span className="font-semibold text-dark-blue">Content</span>
            </div>
            <div className="prose prose-sm max-w-none">
              <p className="whitespace-pre-wrap text-medium-gray">
                {note.content}
              </p>
            </div>
          </div>

          {note.aiMetadata && (
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                {note.aiMetadata.wordCount && (
                  <div>
                    <span className="text-medium-gray">Word Count</span>
                    <p className="font-semibold text-dark-blue">
                      {note.aiMetadata.wordCount}
                    </p>
                  </div>
                )}
                {note.aiMetadata.readingTime && (
                  <div>
                    <span className="text-medium-gray">Reading Time</span>
                    <p className="font-semibold text-dark-blue">
                      {note.aiMetadata.readingTime} min
                    </p>
                  </div>
                )}
                {note.aiMetadata.difficulty && (
                  <div>
                    <span className="text-medium-gray">Difficulty</span>
                    <p className="font-semibold text-dark-blue">
                      {note.aiMetadata.difficulty}
                    </p>
                  </div>
                )}
                {note.aiMetadata.topics && note.aiMetadata.topics.length > 0 && (
                  <div>
                    <span className="text-medium-gray">Topics</span>
                    <p className="font-semibold text-dark-blue">
                      {note.aiMetadata.topics.length}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

