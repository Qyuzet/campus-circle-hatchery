"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { AINote } from "@/types";
import { NotesTab } from "./NotesTab";
import { LiveLectureTab } from "./LiveLectureTab";
import { FileText, Mic } from "lucide-react";
import { usePageContext, NoteContext } from "@/contexts/PageContext";

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
  const { setPageContext } = usePageContext();
  const [notes, setNotes] = useState<AINote[]>(
    initialNotes.map((note) => ({
      ...note,
      createdAt: note.createdAt.toISOString(),
      updatedAt: note.updatedAt.toISOString(),
      tags: note.tags || [],
    }))
  );

  const handleNoteCreated = useCallback((newNote: AINote) => {
    setNotes((prevNotes) => [newNote, ...prevNotes]);
  }, []);

  const handleNoteUpdated = useCallback((updatedNote: AINote) => {
    setNotes((prevNotes) =>
      prevNotes.map((note) => (note.id === updatedNote.id ? updatedNote : note))
    );
  }, []);

  const handleNoteDeleted = useCallback((noteId: string) => {
    setNotes((prevNotes) => prevNotes.filter((note) => note.id !== noteId));
  }, []);

  // Set page context for AI chatbot
  useEffect(() => {
    const notesContext: NoteContext[] = notes.slice(0, 20).map((note) => ({
      id: note.id,
      title: note.title,
      content: note.content?.substring(0, 200),
      subject: note.subject,
      course: note.course,
      tags: note.tags,
    }));

    const subjects = [...new Set(notes.map((n) => n.subject).filter(Boolean))];
    const allTags = [
      ...new Set(notes.flatMap((n) => n.tags || []).filter(Boolean)),
    ];

    setPageContext({
      pageName: activeTab === "notes" ? "My AI Notes" : "Live Lecture",
      pageDescription:
        activeTab === "notes"
          ? "AI-powered note-taking and organization for your studies"
          : "Live lecture transcription and note-taking",
      currentSection: activeTab,
      notes: notesContext,
      stats: {
        totalNotes: notes.length,
        subjects: subjects.join(", ") || "None",
        tags: allTags.slice(0, 10).join(", ") || "None",
        recentNotes: notes
          .slice(0, 5)
          .map((n) => n.title)
          .join(", "),
      },
      customData: {
        userFaculty: user.faculty,
        userMajor: user.major,
      },
    });
  }, [activeTab, notes, user.faculty, user.major, setPageContext]);

  return (
    <div className="space-y-0">
      <div className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="flex">
          <button
            onClick={() => setActiveTab("notes")}
            className={`px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 sm:gap-2 ${
              activeTab === "notes"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline">AI Notes</span>
            <span className="xs:hidden">Notes</span>
          </button>
          <button
            onClick={() => setActiveTab("live-lecture")}
            className={`px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 sm:gap-2 ${
              activeTab === "live-lecture"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            <Mic className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline">Live Lecture</span>
            <span className="xs:hidden">Live</span>
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
