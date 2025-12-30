"use client";

import { Block, BlockType } from "@/types/block";
import { Plus, GripVertical } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { BlockTypeMenu } from "./BlockTypeMenu";
import { BlockActionMenu } from "./BlockActionMenu";
import { toast } from "sonner";

interface BlockItemProps {
  block: Block;
  isFirst: boolean;
  onUpdate: (block: Block) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onAddBefore: (type: BlockType) => void;
  onAddAfter: (type: BlockType) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onConvertTo: (type: BlockType) => void;
}

export function BlockItem({
  block,
  isFirst,
  onUpdate,
  onDelete,
  onDuplicate,
  onAddBefore,
  onAddAfter,
  onMoveUp,
  onMoveDown,
  onConvertTo,
}: BlockItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const blockRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (
      contentRef.current &&
      contentRef.current.textContent !== block.content
    ) {
      contentRef.current.textContent = block.content;
    }
  }, [block.content]);

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const newContent = e.currentTarget.textContent || "";
    onUpdate({ ...block, content: newContent });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const content = contentRef.current?.textContent || "";

    // Enter key - create new block
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onAddAfter("text");
      setTimeout(() => {
        const nextBlock = blockRef.current?.nextElementSibling?.querySelector(
          "[contenteditable]"
        ) as HTMLElement;
        nextBlock?.focus();
      }, 10);
    }

    // Backspace on empty block - delete block
    if (e.key === "Backspace" && content === "") {
      e.preventDefault();
      onDelete();
    }

    // Slash command - open block type menu
    if (e.key === "/" && content === "") {
      e.preventDefault();
      setShowAddMenu(true);
    }

    // Markdown shortcuts
    if (e.key === " " && content.length > 0) {
      if (content === "#") {
        e.preventDefault();
        onConvertTo("heading1");
        if (contentRef.current) contentRef.current.textContent = "";
      } else if (content === "##") {
        e.preventDefault();
        onConvertTo("heading2");
        if (contentRef.current) contentRef.current.textContent = "";
      } else if (content === "###") {
        e.preventDefault();
        onConvertTo("heading3");
        if (contentRef.current) contentRef.current.textContent = "";
      } else if (content === "-" || content === "*") {
        e.preventDefault();
        onConvertTo("bulletList");
        if (contentRef.current) contentRef.current.textContent = "";
      } else if (content.match(/^\d+\.$/)) {
        e.preventDefault();
        onConvertTo("numberedList");
        if (contentRef.current) contentRef.current.textContent = "";
      } else if (content === "---") {
        e.preventDefault();
        onConvertTo("divider");
        if (contentRef.current) contentRef.current.textContent = "";
      }
    }
  };

  const handleCopyLink = () => {
    const url = `${window.location.href}#block-${block.id}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard");
  };

  const handleColorChange = (color: string) => {
    onUpdate({ ...block, color });
    setShowActionMenu(false);
  };

  const handleConvert = (type: BlockType) => {
    onConvertTo(type);
    setShowActionMenu(false);
  };

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", block.id);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData("text/plain");
    if (draggedId !== block.id) {
      // This would need to be handled by the parent BlockEditor
      console.log("Drop", draggedId, "onto", block.id);
    }
  };

  const getBlockClasses = () => {
    const baseClasses = "outline-none focus:outline-none w-full";
    const colorClass = block.color ? `text-${block.color}-600` : "";

    switch (block.type) {
      case "heading1":
        return `text-3xl font-bold ${baseClasses} ${colorClass}`;
      case "heading2":
        return `text-2xl font-bold ${baseClasses} ${colorClass}`;
      case "heading3":
        return `text-xl font-bold ${baseClasses} ${colorClass}`;
      case "bulletList":
      case "numberedList":
        return `text-base ${baseClasses} ${colorClass}`;
      default:
        return `text-base ${baseClasses} ${colorClass}`;
    }
  };

  const getPlaceholder = () => {
    switch (block.type) {
      case "heading1":
        return "Judul 1";
      case "heading2":
        return "Judul 2";
      case "heading3":
        return "Judul 3";
      default:
        return "Ketik '/' untuk perintah";
    }
  };

  if (block.type === "divider") {
    return (
      <div
        ref={blockRef}
        id={`block-${block.id}`}
        className="group relative py-2"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="absolute left-0 top-1/2 -translate-y-1/2 -ml-12 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setShowAddMenu(true)}
            className="p-1 hover:bg-gray-100 rounded"
            title="Add block"
          >
            <Plus className="h-4 w-4 text-gray-400" />
          </button>
          <button
            onClick={() => setShowActionMenu(true)}
            className="p-1 hover:bg-gray-100 rounded cursor-grab active:cursor-grabbing"
            title="Drag to move"
          >
            <GripVertical className="h-4 w-4 text-gray-400" />
          </button>
        </div>

        {showAddMenu && (
          <div className="absolute left-0 top-8 z-50">
            <BlockTypeMenu
              onSelect={(type) => {
                onAddAfter(type);
                setShowAddMenu(false);
              }}
              onClose={() => setShowAddMenu(false)}
            />
          </div>
        )}

        {showActionMenu && (
          <div className="absolute left-0 top-8 z-50">
            <BlockActionMenu
              block={block}
              onConvert={handleConvert}
              onColor={handleColorChange}
              onDuplicate={() => {
                onDuplicate();
                setShowActionMenu(false);
              }}
              onDelete={() => {
                onDelete();
                setShowActionMenu(false);
              }}
              onCopyLink={handleCopyLink}
              onAIAction={(action) => {
                toast.info(`AI action: ${action} (coming soon)`);
                setShowActionMenu(false);
              }}
              onClose={() => setShowActionMenu(false)}
            />
          </div>
        )}

        <hr className="border-t border-gray-300" />
      </div>
    );
  }

  return (
    <div
      ref={blockRef}
      id={`block-${block.id}`}
      className={`group relative py-1 ${isDragging ? "opacity-50" : ""}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {(isHovered || isFocused || showAddMenu || showActionMenu) && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 -ml-12 flex items-center gap-1">
          <button
            onClick={() => setShowAddMenu(!showAddMenu)}
            className="p-1 hover:bg-gray-100 rounded"
            title="Add block"
          >
            <Plus className="h-4 w-4 text-gray-400" />
          </button>
          <button
            onClick={() => setShowActionMenu(!showActionMenu)}
            className="p-1 hover:bg-gray-100 rounded cursor-grab active:cursor-grabbing"
            title="Drag to move"
          >
            <GripVertical className="h-4 w-4 text-gray-400" />
          </button>
        </div>
      )}

      {showAddMenu && (
        <div className="absolute left-0 top-8 z-50">
          <BlockTypeMenu
            onSelect={(type) => {
              onAddAfter(type);
              setShowAddMenu(false);
            }}
            onClose={() => setShowAddMenu(false)}
          />
        </div>
      )}

      {showActionMenu && (
        <div className="absolute left-0 top-8 z-50">
          <BlockActionMenu
            block={block}
            onConvert={handleConvert}
            onColor={handleColorChange}
            onDuplicate={() => {
              onDuplicate();
              setShowActionMenu(false);
            }}
            onDelete={() => {
              onDelete();
              setShowActionMenu(false);
            }}
            onCopyLink={handleCopyLink}
            onAIAction={(action) => {
              toast.info(`AI action: ${action} (coming soon)`);
              setShowActionMenu(false);
            }}
            onClose={() => setShowActionMenu(false)}
          />
        </div>
      )}

      {block.type === "bulletList" ? (
        <div className="flex items-start gap-2">
          <span className="mt-2 text-gray-600">•</span>
          <div
            ref={contentRef}
            contentEditable
            suppressContentEditableWarning
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={`flex-1 min-h-[28px] ${getBlockClasses()}`}
            data-placeholder={getPlaceholder()}
          />
        </div>
      ) : block.type === "numberedList" ? (
        <div className="flex items-start gap-2">
          <span className="mt-0 text-gray-600">1.</span>
          <div
            ref={contentRef}
            contentEditable
            suppressContentEditableWarning
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={`flex-1 min-h-[28px] ${getBlockClasses()}`}
            data-placeholder={getPlaceholder()}
          />
        </div>
      ) : (
        <div
          ref={contentRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`min-h-[28px] ${getBlockClasses()}`}
          data-placeholder={getPlaceholder()}
        />
      )}
    </div>
  );
}
