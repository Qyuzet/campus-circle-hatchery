"use client";

import { Block, BlockType } from "@/types/block";
import { Plus, GripVertical, Sparkles } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { BlockTypeMenu } from "./BlockTypeMenu";
import { BlockActionMenu } from "./BlockActionMenu";
import { AIAssistantModal } from "./AIAssistantModal";
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
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [aiModalPosition, setAIModalPosition] = useState({ top: 0, left: 0 });
  const [isTyping, setIsTyping] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const blockRef = useRef<HTMLDivElement>(null);
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (
      contentRef.current &&
      contentRef.current.textContent !== block.content &&
      !isTyping
    ) {
      contentRef.current.textContent = block.content;
    }
  }, [block.content, isTyping]);

  useEffect(() => {
    return () => {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
    };
  }, []);

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const newContent = e.currentTarget.textContent || "";
    onUpdate({ ...block, content: newContent });
  };

  const handleTextSelection = () => {
    setTimeout(() => {
      const selection = window.getSelection();
      const text = selection?.toString().trim();

      if (text && text.length > 0) {
        const range = selection?.getRangeAt(0);
        const rect = range?.getBoundingClientRect();

        if (rect) {
          setSelectedText(text);
          setAIModalPosition({
            top: rect.top + window.scrollY - 48,
            left: rect.left + window.scrollX + rect.width / 2 - 60,
          });
        }
      } else {
        setSelectedText("");
      }
    }, 10);
  };

  const typeText = (
    text: string,
    targetElement: HTMLElement,
    callback?: () => void
  ) => {
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
    }

    let currentIndex = 0;
    targetElement.textContent = "";
    setIsTyping(true);

    const speed = 20;
    const cursorSpan = document.createElement("span");
    cursorSpan.className =
      "inline-block w-0.5 h-4 bg-blue-600 animate-pulse ml-0.5";
    cursorSpan.setAttribute("data-typing-cursor", "true");

    typingIntervalRef.current = setInterval(() => {
      if (currentIndex < text.length) {
        const existingCursor = targetElement.querySelector(
          '[data-typing-cursor="true"]'
        );
        if (existingCursor) {
          existingCursor.remove();
        }

        targetElement.textContent += text[currentIndex];
        targetElement.appendChild(cursorSpan);
        currentIndex++;
      } else {
        const existingCursor = targetElement.querySelector(
          '[data-typing-cursor="true"]'
        );
        if (existingCursor) {
          existingCursor.remove();
        }

        if (typingIntervalRef.current) {
          clearInterval(typingIntervalRef.current);
          typingIntervalRef.current = null;
        }
        setIsTyping(false);
        if (callback) callback();
      }
    }, speed);
  };

  const handleAIApply = (newText: string) => {
    if (contentRef.current) {
      const selection = window.getSelection();

      if (selectedText === block.content) {
        typeText(newText, contentRef.current, () => {
          onUpdate({ ...block, content: newText });
        });
      } else if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const startOffset = range.startOffset;
        const endOffset = range.endOffset;
        const textNode = range.startContainer;

        if (textNode.nodeType === Node.TEXT_NODE && textNode.textContent) {
          const beforeText = textNode.textContent.substring(0, startOffset);
          const afterText = textNode.textContent.substring(endOffset);
          const fullNewText = beforeText + newText + afterText;

          typeText(fullNewText, contentRef.current, () => {
            onUpdate({ ...block, content: fullNewText });
          });
        } else {
          typeText(newText, contentRef.current, () => {
            onUpdate({ ...block, content: newText });
          });
        }
      } else {
        typeText(newText, contentRef.current, () => {
          onUpdate({ ...block, content: newText });
        });
      }
    }
    setShowAIAssistant(false);
    setSelectedText("");
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
      } else if (content === "/") {
        e.preventDefault();
        setShowAddMenu(true);
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
        className="group relative py-2 pl-10 sm:pl-16"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center gap-0 sm:gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <button
            onClick={() => setShowAddMenu(true)}
            className="p-0.5 sm:p-1 hover:bg-gray-100 rounded transition-colors"
            title="Add block"
          >
            <Plus className="h-4 w-4 text-gray-400" />
          </button>
          <button
            onClick={() => setShowActionMenu(true)}
            className="p-0.5 sm:p-1 hover:bg-gray-100 rounded cursor-grab active:cursor-grabbing transition-colors"
            title="Drag to move"
          >
            <GripVertical className="h-4 w-4 text-gray-400" />
          </button>
        </div>

        {showAddMenu && (
          <div className="fixed sm:absolute left-2 sm:left-0 top-auto sm:top-6 bottom-2 sm:bottom-auto z-50">
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
          <div className="fixed sm:absolute left-2 sm:left-0 top-auto sm:top-6 bottom-2 sm:bottom-auto z-50">
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
                const blockContent = block.content || "";
                if (blockContent.trim()) {
                  setSelectedText(blockContent);
                  const blockElement = blockRef.current;
                  if (blockElement) {
                    const rect = blockElement.getBoundingClientRect();
                    setAIModalPosition({
                      top: rect.top + window.scrollY - 48,
                      left: rect.left + window.scrollX + rect.width / 2 - 60,
                    });
                    setShowAIAssistant(true);
                  }
                } else {
                  toast.error("No content to process");
                }
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
      className={`group relative py-1 pl-10 sm:pl-16 ${
        isDragging ? "opacity-50" : ""
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {(isHovered || isFocused || showAddMenu || showActionMenu) && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center gap-0 sm:gap-0.5 z-10">
          <button
            onClick={() => setShowAddMenu(!showAddMenu)}
            className="p-0.5 sm:p-1 hover:bg-gray-100 rounded transition-colors"
            title="Add block"
          >
            <Plus className="h-4 w-4 text-gray-400" />
          </button>
          <button
            onClick={() => setShowActionMenu(!showActionMenu)}
            className="p-0.5 sm:p-1 hover:bg-gray-100 rounded cursor-grab active:cursor-grabbing transition-colors"
            title="Drag to move"
          >
            <GripVertical className="h-4 w-4 text-gray-400" />
          </button>
        </div>
      )}

      {showAddMenu && (
        <div className="fixed sm:absolute left-2 sm:left-0 top-auto sm:top-6 bottom-2 sm:bottom-auto z-50">
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
        <div className="fixed sm:absolute left-2 sm:left-0 top-auto sm:top-6 bottom-2 sm:bottom-auto z-50">
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
              const blockContent = block.content || "";
              if (blockContent.trim()) {
                setSelectedText(blockContent);
                const blockElement = blockRef.current;
                if (blockElement) {
                  const rect = blockElement.getBoundingClientRect();
                  setAIModalPosition({
                    top: rect.top + window.scrollY - 48,
                    left: rect.left + window.scrollX + rect.width / 2 - 60,
                  });
                  setShowAIAssistant(true);
                }
              } else {
                toast.error("No content to process");
              }
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
            contentEditable={!isTyping}
            suppressContentEditableWarning
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onMouseUp={handleTextSelection}
            className={`flex-1 min-h-[28px] ${getBlockClasses()} ${
              isTyping ? "pointer-events-none" : ""
            }`}
            data-placeholder={getPlaceholder()}
          />
        </div>
      ) : block.type === "numberedList" ? (
        <div className="flex items-start gap-2">
          <span className="mt-0 text-gray-600">1.</span>
          <div
            ref={contentRef}
            contentEditable={!isTyping}
            suppressContentEditableWarning
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onMouseUp={handleTextSelection}
            className={`flex-1 min-h-[28px] ${getBlockClasses()} ${
              isTyping ? "pointer-events-none" : ""
            }`}
            data-placeholder={getPlaceholder()}
          />
        </div>
      ) : (
        <div
          ref={contentRef}
          contentEditable={!isTyping}
          suppressContentEditableWarning
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onMouseUp={handleTextSelection}
          className={`min-h-[28px] ${getBlockClasses()} ${
            isTyping ? "pointer-events-none" : ""
          }`}
          data-placeholder={getPlaceholder()}
        />
      )}

      {selectedText && !showAIAssistant && (
        <button
          onClick={() => setShowAIAssistant(true)}
          className="fixed bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-1.5 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 z-50 animate-in fade-in slide-in-from-bottom-2"
          style={{
            top: aiModalPosition.top,
            left: aiModalPosition.left,
          }}
        >
          <Sparkles className="h-4 w-4" />
          <span className="text-sm font-medium">Ask AI</span>
        </button>
      )}

      {showAIAssistant && selectedText && (
        <AIAssistantModal
          selectedText={selectedText}
          onClose={() => {
            setShowAIAssistant(false);
            setSelectedText("");
          }}
          onApply={handleAIApply}
          position={{
            top: aiModalPosition.top + 40,
            left: aiModalPosition.left,
          }}
        />
      )}
    </div>
  );
}
