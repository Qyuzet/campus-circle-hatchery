"use client";

import { useState } from "react";
import { AINote } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter, BookOpen, X } from "lucide-react";
import { NoteCard } from "./NoteCard";
import { CreateNoteForm } from "./CreateNoteForm";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface NotesTabProps {
  notes: AINote[];
  userId: string;
  onNoteCreated: (note: AINote) => void;
  onNoteUpdated: (note: AINote) => void;
  onNoteDeleted: (noteId: string) => void;
}

export function NotesTab({
  notes,
  userId,
  onNoteCreated,
  onNoteUpdated,
  onNoteDeleted,
}: NotesTabProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [editingNote, setEditingNote] = useState<AINote | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSubject, setFilterSubject] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("recent");

  const subjects = Array.from(
    new Set(notes.map((note) => note.subject).filter(Boolean))
  ) as string[];

  const filteredNotes = notes
    .filter((note) => {
      const matchesSearch =
        searchQuery === "" ||
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.tags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        );

      const matchesSubject =
        filterSubject === "all" || note.subject === filterSubject;

      return matchesSearch && matchesSubject;
    })
    .sort((a, b) => {
      if (sortBy === "recent") {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      } else if (sortBy === "oldest") {
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      } else if (sortBy === "title") {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

  const handleNoteCreated = (note: AINote) => {
    onNoteCreated(note);
    setIsCreating(false);
  };

  const handleNoteUpdated = (note: AINote) => {
    onNoteUpdated(note);
    setEditingNote(null);
  };

  const handleEditNote = (note: AINote) => {
    setEditingNote(note);
    setIsCreating(false);
  };

  return (
    <div className="h-full flex flex-col">
      {!isCreating && !editingNote && (
        <div className="border-b border-gray-200 px-2 sm:px-4 py-2 sm:py-3 bg-white">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <div className="relative flex-1 max-w-full sm:max-w-md">
              <Search className="absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 sm:pl-10 h-8 sm:h-9 border-gray-300 text-sm"
              />
            </div>

            <div className="flex items-center gap-2">
              <Select value={filterSubject} onValueChange={setFilterSubject}>
                <SelectTrigger className="flex-1 sm:w-[140px] h-8 sm:h-9 border-gray-300 text-xs sm:text-sm">
                  <Filter className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <SelectValue placeholder="Subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {subjects.map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="flex-1 sm:w-[130px] h-8 sm:h-9 border-gray-300 text-xs sm:text-sm">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="title">Title A-Z</SelectItem>
                </SelectContent>
              </Select>

              <Button
                onClick={() => setIsCreating(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white h-8 sm:h-9 px-2 sm:px-4"
                size="sm"
              >
                <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 sm:mr-2" />
                <span className="hidden sm:inline">New Note</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {isCreating && (
        <CreateNoteForm
          userId={userId}
          onNoteCreated={handleNoteCreated}
          onCancel={() => setIsCreating(false)}
        />
      )}

      {editingNote && (
        <CreateNoteForm
          userId={userId}
          onNoteCreated={handleNoteUpdated}
          onCancel={() => setEditingNote(null)}
          initialNote={editingNote}
        />
      )}

      {!isCreating && !editingNote && (
        <div className="flex-1 overflow-auto">
          {filteredNotes.length === 0 ? (
            <div className="flex items-center justify-center h-full px-4">
              <div className="text-center">
                <BookOpen className="h-10 w-10 sm:h-12 sm:w-12 text-gray-300 mx-auto mb-2 sm:mb-3" />
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-1">
                  {searchQuery || filterSubject !== "all"
                    ? "No notes found"
                    : "No notes yet"}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
                  {searchQuery || filterSubject !== "all"
                    ? "Try adjusting your search or filters"
                    : "Create your first note to get started"}
                </p>
                {!searchQuery && filterSubject === "all" && (
                  <Button
                    onClick={() => setIsCreating(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Note
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="p-2 sm:p-3 md:p-4 pb-24 sm:pb-6 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
              {filteredNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onEdit={handleEditNote}
                  onUpdated={onNoteUpdated}
                  onDeleted={onNoteDeleted}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
