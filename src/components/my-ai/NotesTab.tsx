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
        <div className="border-b border-gray-200 px-4 py-3 flex items-center gap-3 bg-white">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-9 border-gray-300"
            />
          </div>

          <Select value={filterSubject} onValueChange={setFilterSubject}>
            <SelectTrigger className="w-[140px] h-9 border-gray-300">
              <Filter className="h-4 w-4 mr-2" />
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
            <SelectTrigger className="w-[130px] h-9 border-gray-300">
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
            className="bg-blue-600 hover:bg-blue-700 text-white h-9"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Note
          </Button>
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
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  {searchQuery || filterSubject !== "all"
                    ? "No notes found"
                    : "No notes yet"}
                </h3>
                <p className="text-sm text-gray-500 mb-4">
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
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
