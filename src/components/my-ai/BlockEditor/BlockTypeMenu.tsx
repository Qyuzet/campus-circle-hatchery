"use client";

import { BlockType } from "@/types/block";
import {
  Type,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Minus,
  Sparkles,
  CheckSquare,
  ChevronRight,
  Quote,
  MessageSquare,
  FileText,
  Table,
  Image,
  Video,
  Volume2,
  Code,
  Paperclip,
  Bookmark,
  LayoutGrid,
  Columns,
  LayoutList,
  Calendar,
  Rss,
  Languages,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useEffect, useRef } from "react";

interface BlockTypeOption {
  type: BlockType | "translate";
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  shortcut?: string;
  category: "suggested" | "basic" | "advanced" | "media" | "database" | "ai";
  badge?: string;
  isAction?: boolean;
}

const blockTypes: BlockTypeOption[] = [
  {
    type: "aiMeetingNotes",
    label: "AI Meeting Notes",
    icon: Sparkles,
    category: "suggested",
    badge: "Beta",
  },
  { type: "text", label: "Text", icon: Type, category: "basic" },
  {
    type: "heading1",
    label: "Heading 1",
    icon: Heading1,
    shortcut: "#",
    category: "basic",
  },
  {
    type: "heading2",
    label: "Heading 2",
    icon: Heading2,
    shortcut: "##",
    category: "basic",
  },
  {
    type: "heading3",
    label: "Heading 3",
    icon: Heading3,
    shortcut: "###",
    category: "basic",
  },
  {
    type: "bulletList",
    label: "Bulleted list",
    icon: List,
    shortcut: "-",
    category: "basic",
  },
  {
    type: "numberedList",
    label: "Numbered list",
    icon: ListOrdered,
    shortcut: "1.",
    category: "basic",
  },
  {
    type: "todoList",
    label: "To-do list",
    icon: CheckSquare,
    shortcut: "[]",
    category: "basic",
  },
  {
    type: "toggleList",
    label: "Toggle list",
    icon: ChevronRight,
    shortcut: ">",
    category: "basic",
  },
  { type: "page", label: "Page", icon: FileText, category: "advanced" },
  {
    type: "callout",
    label: "Callout",
    icon: MessageSquare,
    category: "advanced",
  },
  {
    type: "quote",
    label: "Quote",
    icon: Quote,
    shortcut: '"',
    category: "advanced",
  },
  { type: "table", label: "Table", icon: Table, category: "advanced" },
  {
    type: "divider",
    label: "Divider",
    icon: Minus,
    shortcut: "---",
    category: "advanced",
  },
  {
    type: "bookmark",
    label: "Link to page",
    icon: Bookmark,
    category: "advanced",
  },
  { type: "image", label: "Image", icon: Image, category: "media" },
  { type: "video", label: "Video", icon: Video, category: "media" },
  { type: "audio", label: "Audio", icon: Volume2, category: "media" },
  {
    type: "code",
    label: "Code",
    icon: Code,
    shortcut: "```",
    category: "media",
  },
  { type: "file", label: "File", icon: Paperclip, category: "media" },
  { type: "tableView", label: "Table view", icon: Table, category: "database" },
  {
    type: "boardView",
    label: "Board view",
    icon: Columns,
    category: "database",
  },
  {
    type: "galleryView",
    label: "Gallery view",
    icon: LayoutGrid,
    category: "database",
  },
  {
    type: "listView",
    label: "List view",
    icon: LayoutList,
    category: "database",
  },
  { type: "feedView", label: "Feed view", icon: Rss, category: "database" },
  {
    type: "calendarView",
    label: "Calendar view",
    icon: Calendar,
    category: "database",
  },
  {
    type: "translate",
    label: "Translate to",
    icon: Languages,
    category: "ai",
    isAction: true,
  },
];

interface BlockTypeMenuProps {
  onSelect: (type: BlockType) => void;
  onClose: () => void;
  initialSearch?: string;
}

export function BlockTypeMenu({
  onSelect,
  onClose,
  initialSearch = "",
}: BlockTypeMenuProps) {
  const [search, setSearch] = useState(initialSearch);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSearch(initialSearch);
  }, [initialSearch]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const filteredTypes = blockTypes.filter((type) =>
    type.label.toLowerCase().includes(search.toLowerCase())
  );

  const suggestedBlocks = filteredTypes.filter(
    (t) => t.category === "suggested"
  );
  const basicBlocks = filteredTypes.filter((t) => t.category === "basic");
  const advancedBlocks = filteredTypes.filter((t) => t.category === "advanced");
  const mediaBlocks = filteredTypes.filter((t) => t.category === "media");
  const databaseBlocks = filteredTypes.filter((t) => t.category === "database");
  const aiBlocks = filteredTypes.filter((t) => t.category === "ai");

  const renderBlockButton = (option: BlockTypeOption) => (
    <button
      key={option.type}
      onClick={() => {
        if (!option.isAction) {
          onSelect(option.type as BlockType);
          onClose();
        } else {
          onClose();
        }
      }}
      className="w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-2.5 py-1.5 sm:py-2 hover:bg-gray-100 rounded text-xs sm:text-sm text-left transition-colors"
    >
      <option.icon className="h-4 w-4 text-gray-600 flex-shrink-0" />
      <span className="flex-1 text-gray-900 truncate">{option.label}</span>
      {option.badge && (
        <span className="text-[10px] px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded font-medium">
          {option.badge}
        </span>
      )}
      {option.shortcut && (
        <span className="text-[10px] sm:text-xs text-gray-400 flex-shrink-0">
          {option.shortcut}
        </span>
      )}
    </button>
  );

  return (
    <div
      ref={menuRef}
      className="w-80 sm:w-96 bg-white rounded-lg shadow-2xl border border-gray-200 p-2"
    >
      {!initialSearch && (
        <Input
          type="text"
          placeholder="Filter..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-2 h-9 border-gray-300 text-sm"
          autoFocus
        />
      )}
      {initialSearch && search && (
        <div className="mb-2 px-3 py-2 bg-gray-50 rounded border border-gray-200 text-sm text-gray-600">
          Filtering: <span className="font-medium">/{search}</span>
        </div>
      )}

      <div className="max-h-96 overflow-y-auto space-y-3">
        {suggestedBlocks.length > 0 && (
          <div>
            <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Suggested
            </div>
            <div className="space-y-0.5">
              {suggestedBlocks.map(renderBlockButton)}
            </div>
          </div>
        )}

        {basicBlocks.length > 0 && (
          <div>
            <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Basic blocks
            </div>
            <div className="space-y-0.5">
              {basicBlocks.map(renderBlockButton)}
            </div>
          </div>
        )}

        {advancedBlocks.length > 0 && (
          <div>
            <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Advanced
            </div>
            <div className="space-y-0.5">
              {advancedBlocks.map(renderBlockButton)}
            </div>
          </div>
        )}

        {mediaBlocks.length > 0 && (
          <div>
            <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Media
            </div>
            <div className="space-y-0.5">
              {mediaBlocks.map(renderBlockButton)}
            </div>
          </div>
        )}

        {databaseBlocks.length > 0 && (
          <div>
            <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Database
            </div>
            <div className="space-y-0.5">
              {databaseBlocks.map(renderBlockButton)}
            </div>
          </div>
        )}

        {aiBlocks.length > 0 && (
          <div>
            <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Notion AI
            </div>
            <div className="space-y-0.5">{aiBlocks.map(renderBlockButton)}</div>
          </div>
        )}

        {filteredTypes.length === 0 && (
          <div className="px-2 py-8 text-sm text-gray-500 text-center">
            No results found
          </div>
        )}
      </div>

      <div className="mt-2 pt-2 border-t border-gray-200 px-2 py-1 text-xs text-gray-400">
        Type &quot;/&quot; on the page
      </div>
    </div>
  );
}
