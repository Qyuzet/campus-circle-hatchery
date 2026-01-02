"use client";

import { Block, BlockType } from "@/types/block";
import {
  Trash2,
  Copy,
  Link,
  Palette,
  RefreshCw,
  Sparkles,
  Type,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Minus,
  ChevronRight,
  Languages,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useEffect, useRef } from "react";

interface BlockActionMenuProps {
  block: Block;
  onConvert: (type: BlockType) => void;
  onColor: (color: string) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onCopyLink: () => void;
  onAIAction: (action: string) => void;
  onClose: () => void;
}

type MenuView = "main" | "convert" | "color";

export function BlockActionMenu({
  block,
  onConvert,
  onColor,
  onDuplicate,
  onDelete,
  onCopyLink,
  onAIAction,
  onClose,
}: BlockActionMenuProps) {
  const [search, setSearch] = useState("");
  const [view, setView] = useState<MenuView>("main");
  const menuRef = useRef<HTMLDivElement>(null);

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

  const blockTypes = [
    { type: "text" as BlockType, label: "Teks", icon: Type },
    { type: "heading1" as BlockType, label: "Judul 1", icon: Heading1 },
    { type: "heading2" as BlockType, label: "Judul 2", icon: Heading2 },
    { type: "heading3" as BlockType, label: "Judul 3", icon: Heading3 },
    { type: "bulletList" as BlockType, label: "Daftar poin", icon: List },
    {
      type: "numberedList" as BlockType,
      label: "Daftar bernomor",
      icon: ListOrdered,
    },
    { type: "divider" as BlockType, label: "Divider", icon: Minus },
  ];

  const colors = [
    { value: "", label: "Default" },
    { value: "gray", label: "Abu-abu" },
    { value: "red", label: "Merah" },
    { value: "orange", label: "Oranye" },
    { value: "yellow", label: "Kuning" },
    { value: "green", label: "Hijau" },
    { value: "blue", label: "Biru" },
    { value: "purple", label: "Ungu" },
    { value: "pink", label: "Pink" },
  ];

  const actions = [
    {
      id: "convert",
      label: "Ubah menjadi",
      icon: RefreshCw,
      action: () => setView("convert"),
      hasSubmenu: true,
    },
    {
      id: "color",
      label: "Warna",
      icon: Palette,
      action: () => setView("color"),
      hasSubmenu: true,
    },
    {
      id: "copyLink",
      label: "Salin tautan ke blok",
      icon: Link,
      shortcut: "Alt+L",
      action: onCopyLink,
    },
    {
      id: "duplicate",
      label: "Duplikatkan",
      icon: Copy,
      shortcut: "Ctrl+D",
      action: onDuplicate,
    },
    {
      id: "delete",
      label: "Hapus",
      icon: Trash2,
      shortcut: "Del",
      action: onDelete,
      divider: true,
    },
    {
      id: "aiEdit",
      label: "Sarankan editan",
      icon: Sparkles,
      shortcut: "Ctrl+Alt+X",
      action: () => onAIAction("edit"),
      category: "ai",
    },
    {
      id: "aiAsk",
      label: "Tanya AI",
      icon: Sparkles,
      shortcut: "Ctrl+J",
      action: () => onAIAction("ask"),
      category: "ai",
    },
    {
      id: "translate",
      label: "Terjemahkan",
      icon: Languages,
      action: () => onAIAction("translate"),
      category: "ai",
    },
  ];

  const filteredActions = search
    ? actions.filter((a) =>
        a.label.toLowerCase().includes(search.toLowerCase())
      )
    : actions;

  const basicActions = filteredActions.filter((a) => !a.category);
  const aiActions = filteredActions.filter((a) => a.category === "ai");

  if (view === "convert") {
    return (
      <div
        ref={menuRef}
        className="w-64 sm:w-80 bg-white rounded-lg shadow-lg border border-gray-200 p-1.5 sm:p-2"
      >
        <div className="flex items-center gap-2 mb-1.5 sm:mb-2 px-1.5 sm:px-2 py-0.5 sm:py-1">
          <button
            onClick={() => setView("main")}
            className="text-gray-600 hover:text-gray-900 text-sm sm:text-base"
          >
            ←
          </button>
          <span className="text-xs sm:text-sm font-medium">Ubah menjadi</span>
        </div>
        <div className="max-h-64 sm:max-h-96 overflow-y-auto">
          {blockTypes.map((type) => (
            <button
              key={type.type}
              onClick={() => {
                onConvert(type.type);
              }}
              className="w-full flex items-center gap-2 sm:gap-3 px-1.5 sm:px-2 py-1.5 sm:py-2 hover:bg-gray-100 rounded text-xs sm:text-sm text-left"
            >
              <type.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-600 flex-shrink-0" />
              <span className="flex-1 text-gray-900 truncate">
                {type.label}
              </span>
              {block.type === type.type && (
                <span className="text-xs text-blue-600 flex-shrink-0">✓</span>
              )}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (view === "color") {
    return (
      <div
        ref={menuRef}
        className="w-64 sm:w-80 bg-white rounded-lg shadow-lg border border-gray-200 p-1.5 sm:p-2"
      >
        <div className="flex items-center gap-2 mb-1.5 sm:mb-2 px-1.5 sm:px-2 py-0.5 sm:py-1">
          <button
            onClick={() => setView("main")}
            className="text-gray-600 hover:text-gray-900 text-sm sm:text-base"
          >
            ←
          </button>
          <span className="text-xs sm:text-sm font-medium">Warna</span>
        </div>
        <div className="max-h-64 sm:max-h-96 overflow-y-auto">
          {colors.map((color) => (
            <button
              key={color.value}
              onClick={() => {
                onColor(color.value);
              }}
              className="w-full flex items-center gap-2 sm:gap-3 px-1.5 sm:px-2 py-1.5 sm:py-2 hover:bg-gray-100 rounded text-xs sm:text-sm text-left"
            >
              <div
                className={`h-3.5 w-3.5 sm:h-4 sm:w-4 rounded border flex-shrink-0 ${
                  color.value ? `bg-${color.value}-500` : "bg-gray-200"
                }`}
              />
              <span className="flex-1 text-gray-900 truncate">
                {color.label}
              </span>
              {block.color === color.value && (
                <span className="text-xs text-blue-600 flex-shrink-0">✓</span>
              )}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={menuRef}
      className="w-64 sm:w-80 bg-white rounded-lg shadow-lg border border-gray-200 p-1.5 sm:p-2"
    >
      <Input
        type="text"
        placeholder="Cari tindakan..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-1.5 sm:mb-2 h-8 sm:h-9 border-gray-300 text-xs sm:text-sm"
        autoFocus
      />

      <div className="max-h-64 sm:max-h-96 overflow-y-auto">
        {basicActions.length > 0 && (
          <div className="mb-1.5 sm:mb-2">
            <div className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium text-gray-500">
              Teks
            </div>
            {basicActions.map((action: any) => (
              <div key={action.id}>
                <button
                  onClick={() => {
                    action.action();
                    if (!action.hasSubmenu) {
                      onClose();
                    }
                  }}
                  className="w-full flex items-center gap-2 sm:gap-3 px-1.5 sm:px-2 py-1.5 sm:py-2 hover:bg-gray-100 rounded text-xs sm:text-sm text-left"
                >
                  <action.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-600 flex-shrink-0" />
                  <span className="flex-1 text-gray-900 truncate">
                    {action.label}
                  </span>
                  {action.hasSubmenu ? (
                    <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
                  ) : action.shortcut ? (
                    <span className="text-[10px] sm:text-xs text-gray-400 flex-shrink-0 hidden sm:inline">
                      {action.shortcut}
                    </span>
                  ) : null}
                </button>
                {action.divider && (
                  <div className="my-0.5 sm:my-1 border-t border-gray-200" />
                )}
              </div>
            ))}
          </div>
        )}

        {aiActions.length > 0 && (
          <div>
            <div className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium text-gray-500">
              AI
            </div>
            {aiActions.map((action: any) => (
              <button
                key={action.id}
                onClick={() => {
                  action.action();
                  onClose();
                }}
                className="w-full flex items-center gap-2 sm:gap-3 px-1.5 sm:px-2 py-1.5 sm:py-2 hover:bg-gray-100 rounded text-xs sm:text-sm text-left"
              >
                <action.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600 flex-shrink-0" />
                <span className="flex-1 text-gray-900 truncate">
                  {action.label}
                </span>
                {action.shortcut && (
                  <span className="text-[10px] sm:text-xs text-gray-400 flex-shrink-0 hidden sm:inline">
                    {action.shortcut}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {filteredActions.length === 0 && (
          <div className="px-1.5 sm:px-2 py-3 sm:py-4 text-xs sm:text-sm text-gray-500 text-center">
            Tidak ada hasil
          </div>
        )}
      </div>

      <div className="mt-1.5 sm:mt-2 pt-1.5 sm:pt-2 border-t border-gray-200 px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs text-gray-400">
        Terakhir diedit oleh Riki A<br />
        Hari ini pukul{" "}
        {new Date().toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </div>
    </div>
  );
}
