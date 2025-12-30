"use client";

import { useState } from "react";
import { AINote } from "@/types";
import { NotesTab } from "./NotesTab";
import { LiveLectureTab } from "./LiveLectureTab";
import { FileText, Mic } from "lucide-react";

interface MyAIClientProps {
  initialNotes: any[];
  hasSubmittedInterest: boolean;
  user: {
    id: string;
    email: string;
    name: string;
    faculty: string;
    major: string;
  };
  initialTab?: string;
}

export function MyAIClient({
  initialNotes,
  hasSubmittedInterest,
  user,
  initialTab = "notes",
}: MyAIClientProps) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [notes, setNotes] = useState<AINote[]>(
    initialNotes.map((note) => ({
      ...note,
      createdAt: note.createdAt.toISOString(),
      updatedAt: note.updatedAt.toISOString(),
      tags: note.tags || [],
    }))
  );

  const handleNoteCreated = (newNote: AINote) => {
    setNotes([newNote, ...notes]);
  };

  const handleNoteUpdated = (updatedNote: AINote) => {
    setNotes(
      notes.map((note) => (note.id === updatedNote.id ? updatedNote : note))
    );
  };

  const handleNoteDeleted = (noteId: string) => {
    setNotes(notes.filter((note) => note.id !== noteId));
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="border-b border-gray-200 bg-white">
        <div className="flex">
          <button
            onClick={() => setActiveTab("notes")}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "notes"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            <FileText className="h-4 w-4" />
            AI Notes
          </button>
          <button
            onClick={() => setActiveTab("live-lecture")}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "live-lecture"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            <Mic className="h-4 w-4" />
            Live Lecture
          </button>
        </div>
      </div>

      {activeTab === "notes" && (
        <NotesTab
          notes={notes}
          userId={user.id}
          onNoteCreated={handleNoteCreated}
          onNoteUpdated={handleNoteUpdated}
          onNoteDeleted={handleNoteDeleted}
        />
      )}

      {activeTab === "live-lecture" && (
        <LiveLectureTab
          hasSubmittedInterest={hasSubmittedInterest}
          user={user}
        />
      )}
    </div>
  );
}
