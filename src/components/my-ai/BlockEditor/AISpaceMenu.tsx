"use client";

import { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Pencil,
  Table,
  Workflow,
  FileText,
  ListChecks,
  Lightbulb,
  Code,
  Search,
  Mail,
  Calendar,
  ChevronRight,
  Clock,
} from "lucide-react";

interface AISpaceMenuProps {
  onClose: () => void;
  onSelect: (action: string, prompt?: string) => void;
  position: { top: number; left: number };
}

interface MenuItem {
  icon: any;
  label: string;
  action: string;
  category: string;
  hasSubmenu?: boolean;
}

export function AISpaceMenu({ onClose, onSelect, position }: AISpaceMenuProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const menuItems: MenuItem[] = [
    {
      icon: Pencil,
      label: "Continue writing",
      action: "continue",
      category: "Suggested",
    },
    {
      icon: Table,
      label: "Make a table...",
      action: "table",
      category: "Suggested",
      hasSubmenu: true,
    },
    {
      icon: Workflow,
      label: "Make a flowchart...",
      action: "flowchart",
      category: "Suggested",
      hasSubmenu: true,
    },
    {
      icon: FileText,
      label: "Add a summary",
      action: "summary",
      category: "Write",
    },
    {
      icon: ListChecks,
      label: "Add action items",
      action: "action-items",
      category: "Write",
    },
    {
      icon: Pencil,
      label: "Write anything...",
      action: "write-custom",
      category: "Write",
    },
    {
      icon: Lightbulb,
      label: "Brainstorm ideas...",
      action: "brainstorm",
      category: "Think, ask, chat",
    },
    {
      icon: Code,
      label: "Get help with code...",
      action: "code-help",
      category: "Think, ask, chat",
    },
    {
      icon: Search,
      label: "Ask a question...",
      action: "ask-question",
      category: "Find, search",
    },
    {
      icon: Search,
      label: "Ask about this page...",
      action: "ask-page",
      category: "Find, search",
      hasSubmenu: true,
    },
    {
      icon: FileText,
      label: "Draft an outline...",
      action: "draft-outline",
      category: "Draft",
    },
    {
      icon: Mail,
      label: "Draft an email...",
      action: "draft-email",
      category: "Draft",
    },
    {
      icon: Calendar,
      label: "Draft a meeting agenda...",
      action: "draft-agenda",
      category: "Draft",
    },
    {
      icon: Pencil,
      label: "Draft anything...",
      action: "draft-custom",
      category: "Draft",
    },
  ];

  const filteredItems = searchQuery
    ? menuItems.filter((item) =>
        item.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : menuItems;

  const groupedItems = filteredItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < filteredItems.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const selectedItem = filteredItems[selectedIndex];
      if (selectedItem) {
        handleSelect(selectedItem);
      }
    }
  };

  const handleSelect = (item: MenuItem) => {
    if (item.hasSubmenu) {
      onSelect(item.action, "");
    } else {
      onSelect(item.action);
    }
    onClose();
  };

  return (
    <div
      ref={menuRef}
      className="fixed bg-white rounded-lg shadow-2xl border border-gray-200 w-[440px] max-h-[500px] flex flex-col z-[9999]"
      style={{
        top: position.top,
        left: position.left,
      }}
      onKeyDown={handleKeyDown}
    >
      <div className="p-3 border-b border-gray-100">
        <div className="relative">
          <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Ask AI anything..."
            className="w-full pl-10 pr-4 py-2 text-sm border-none outline-none focus:ring-0"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <button className="px-2 py-1 text-xs text-gray-500 hover:bg-gray-100 rounded flex items-center gap-1">
              <span className="text-blue-600">📄</span>
              Current page
            </button>
            <button className="p-1 hover:bg-gray-100 rounded">
              <span className="text-gray-400">@</span>
            </button>
            <button className="p-1 hover:bg-gray-100 rounded">
              <span className="text-gray-400 text-xs">ℹ️</span>
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-y-auto flex-1 p-2">
        {Object.entries(groupedItems).map(
          ([category, items], categoryIndex) => (
            <div key={category} className={categoryIndex > 0 ? "mt-3" : ""}>
              <div className="px-2 py-1 text-xs font-medium text-gray-400">
                {category}
              </div>
              <div className="space-y-0.5">
                {items.map((item, itemIndex) => {
                  const globalIndex = filteredItems.indexOf(item);
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.action}
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setSelectedIndex(globalIndex)}
                      className={`w-full text-left px-2.5 py-2 text-sm rounded transition-colors flex items-center gap-2.5 group ${
                        selectedIndex === globalIndex
                          ? "bg-gray-100"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <Icon className="h-4 w-4 text-gray-600 flex-shrink-0" />
                      <span className="flex-1">{item.label}</span>
                      {item.hasSubmenu && (
                        <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )
        )}

        {filteredItems.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-gray-500">
            No results found
          </div>
        )}
      </div>

      <div className="border-t border-gray-100 p-2">
        <div className="flex items-center gap-2 px-2 py-1.5 text-xs text-gray-500">
          <Clock className="h-3.5 w-3.5" />
          <span>Recents</span>
        </div>
      </div>
    </div>
  );
}
