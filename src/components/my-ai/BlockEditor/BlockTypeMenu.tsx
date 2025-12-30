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
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface BlockTypeOption {
  type: BlockType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  shortcut?: string;
  category: "basic" | "ai";
}

const blockTypes: BlockTypeOption[] = [
  { type: "text", label: "Teks", icon: Type, category: "basic" },
  { type: "heading1", label: "Judul 1", icon: Heading1, shortcut: "#", category: "basic" },
  { type: "heading2", label: "Judul 2", icon: Heading2, shortcut: "##", category: "basic" },
  { type: "heading3", label: "Judul 3", icon: Heading3, shortcut: "###", category: "basic" },
  { type: "bulletList", label: "Daftar poin", icon: List, shortcut: "-", category: "basic" },
  { type: "numberedList", label: "Daftar bernomor", icon: ListOrdered, shortcut: "1.", category: "basic" },
  { type: "divider", label: "Divider", icon: Minus, shortcut: "---", category: "basic" },
];

interface BlockTypeMenuProps {
  onSelect: (type: BlockType) => void;
  onClose: () => void;
}

export function BlockTypeMenu({ onSelect, onClose }: BlockTypeMenuProps) {
  const [search, setSearch] = useState("");

  const filteredTypes = blockTypes.filter((type) =>
    type.label.toLowerCase().includes(search.toLowerCase())
  );

  const basicBlocks = filteredTypes.filter((t) => t.category === "basic");
  const aiBlocks = filteredTypes.filter((t) => t.category === "ai");

  return (
    <div className="w-80 bg-white rounded-lg shadow-lg border border-gray-200 p-2">
      <Input
        type="text"
        placeholder="ketik untuk memfilter..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-2 h-9 border-gray-300"
        autoFocus
      />

      <div className="max-h-96 overflow-y-auto">
        {basicBlocks.length > 0 && (
          <div className="mb-2">
            <div className="px-2 py-1 text-xs font-medium text-gray-500">
              Blok dasar
            </div>
            {basicBlocks.map((option) => (
              <button
                key={option.type}
                onClick={() => {
                  onSelect(option.type);
                  onClose();
                }}
                className="w-full flex items-center gap-3 px-2 py-2 hover:bg-gray-100 rounded text-sm text-left"
              >
                <option.icon className="h-4 w-4 text-gray-600" />
                <span className="flex-1 text-gray-900">{option.label}</span>
                {option.shortcut && (
                  <span className="text-xs text-gray-400">{option.shortcut}</span>
                )}
              </button>
            ))}
          </div>
        )}

        {aiBlocks.length > 0 && (
          <div>
            <div className="px-2 py-1 text-xs font-medium text-gray-500">
              Notion AI
            </div>
            {aiBlocks.map((option) => (
              <button
                key={option.type}
                onClick={() => {
                  onSelect(option.type);
                  onClose();
                }}
                className="w-full flex items-center gap-3 px-2 py-2 hover:bg-gray-100 rounded text-sm text-left"
              >
                <option.icon className="h-4 w-4 text-purple-600" />
                <span className="flex-1 text-gray-900">{option.label}</span>
              </button>
            ))}
          </div>
        )}

        {filteredTypes.length === 0 && (
          <div className="px-2 py-4 text-sm text-gray-500 text-center">
            Tidak ada hasil
          </div>
        )}
      </div>

      <div className="mt-2 pt-2 border-t border-gray-200 px-2 py-1 text-xs text-gray-400">
        Ketik &quot;/&quot; di halaman
      </div>
    </div>
  );
}

