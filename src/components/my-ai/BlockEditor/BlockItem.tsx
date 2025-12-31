"use client";

import { Block, BlockType } from "@/types/block";
import {
  Plus,
  GripVertical,
  Sparkles,
  CheckSquare,
  Square,
  ChevronRight,
  ChevronDown,
  Info,
  FileText,
  Image as ImageIcon,
  Video as VideoIcon,
  Volume2,
  Code as CodeIcon,
  Paperclip,
  Bookmark as BookmarkIcon,
  Table as TableIcon,
  Columns,
  LayoutGrid,
  LayoutList,
  Calendar,
  Rss,
} from "lucide-react";
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
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
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

  useEffect(() => {
    if (showAddMenu && block.content.startsWith("/")) {
      calculateMenuPosition();
    }
  }, [block.content, showAddMenu]);

  const calculateMenuPosition = () => {
    if (!contentRef.current) return;

    const textContent = contentRef.current.textContent || "";
    if (!textContent.startsWith("/")) return;

    const menuHeight = 500;
    let rect: DOMRect;

    // Try to get the exact position of the "/" character
    const textNode = contentRef.current.firstChild;
    if (
      textNode &&
      textNode.nodeType === Node.TEXT_NODE &&
      textContent.length > 0
    ) {
      try {
        const range = document.createRange();
        range.setStart(textNode, 0);
        range.setEnd(textNode, 1);
        rect = range.getBoundingClientRect();
      } catch (error) {
        rect = contentRef.current.getBoundingClientRect();
      }
    } else {
      rect = contentRef.current.getBoundingClientRect();
    }

    // Check if menu would go off-screen at the bottom
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    let top: number;
    if (spaceBelow < menuHeight && spaceAbove > spaceBelow) {
      // Position above if not enough space below
      top = rect.top + window.scrollY - menuHeight - 4;
    } else {
      // Position below (default)
      top = rect.bottom + window.scrollY + 4;
    }

    // Get the left position - align with the "/" character
    const left = rect.left + window.scrollX;

    console.log("Menu position calculated:", {
      slashRect: {
        top: rect.top,
        bottom: rect.bottom,
        left: rect.left,
        right: rect.right,
      },
      menuPosition: { top, left },
      spaceBelow,
      spaceAbove,
      positionedAbove: spaceBelow < menuHeight && spaceAbove > spaceBelow,
    });

    setMenuPosition({
      top,
      left,
    });
  };

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const newContent = e.currentTarget.textContent || "";

    // Show menu when "/" is typed
    if (newContent.startsWith("/")) {
      if (!showAddMenu) {
        setShowAddMenu(true);
      }
      // Calculate position immediately and also after a short delay
      calculateMenuPosition();
      setTimeout(calculateMenuPosition, 0);
    } else {
      if (showAddMenu) {
        setShowAddMenu(false);
      }
    }

    // Update block content after menu state
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

    // Close menu on backspace if content becomes empty
    if (e.key === "Backspace" && content === "/" && showAddMenu) {
      setShowAddMenu(false);
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
      } else if (content === "[]") {
        e.preventDefault();
        onConvertTo("todoList");
        if (contentRef.current) contentRef.current.textContent = "";
      } else if (content === ">") {
        e.preventDefault();
        onConvertTo("toggleList");
        if (contentRef.current) contentRef.current.textContent = "";
      } else if (content === '"') {
        e.preventDefault();
        onConvertTo("quote");
        if (contentRef.current) contentRef.current.textContent = "";
      } else if (content === "```") {
        e.preventDefault();
        onConvertTo("code");
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
        return "Heading 1";
      case "heading2":
        return "Heading 2";
      case "heading3":
        return "Heading 3";
      case "bulletList":
        return "List";
      case "numberedList":
        return "List";
      case "todoList":
        return "To-do";
      case "toggleList":
        return "Toggle";
      case "quote":
        return "Empty quote";
      case "callout":
        return "Callout";
      case "code":
        return "Code";
      case "page":
        return "Untitled";
      default:
        return "Type '/' for commands";
    }
  };

  const renderBlockContent = () => {
    const baseEditableProps = {
      ref: contentRef,
      contentEditable: !isTyping,
      suppressContentEditableWarning: true,
      onInput: handleInput,
      onKeyDown: handleKeyDown,
      onFocus: () => setIsFocused(true),
      onBlur: () => setIsFocused(false),
      onMouseUp: handleTextSelection,
      "data-placeholder": getPlaceholder(),
    };

    const baseClassName = `min-h-[28px] ${getBlockClasses()} ${
      isTyping ? "pointer-events-none" : ""
    }`;

    switch (block.type) {
      case "bulletList":
        return (
          <div className="flex items-start gap-2">
            <span className="mt-2 text-gray-600">•</span>
            <div {...baseEditableProps} className={`flex-1 ${baseClassName}`} />
          </div>
        );

      case "numberedList":
        return (
          <div className="flex items-start gap-2">
            <span className="mt-0 text-gray-600">1.</span>
            <div {...baseEditableProps} className={`flex-1 ${baseClassName}`} />
          </div>
        );

      case "todoList":
        return (
          <div className="flex items-start gap-2">
            <button
              onClick={() => {
                onUpdate({ ...block, checked: !block.checked });
              }}
              className="mt-1 text-gray-600 hover:text-gray-900 transition-colors"
            >
              {block.checked ? (
                <CheckSquare className="h-4 w-4" />
              ) : (
                <Square className="h-4 w-4" />
              )}
            </button>
            <div
              {...baseEditableProps}
              className={`flex-1 ${baseClassName} ${
                block.checked ? "line-through text-gray-400" : ""
              }`}
            />
          </div>
        );

      case "toggleList":
        return (
          <div className="flex items-start gap-2">
            <button
              onClick={() => {
                onUpdate({ ...block, isOpen: !block.isOpen });
              }}
              className="mt-1 text-gray-600 hover:text-gray-900 transition-colors"
            >
              {block.isOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
            <div {...baseEditableProps} className={`flex-1 ${baseClassName}`} />
          </div>
        );

      case "quote":
        return (
          <div className="border-l-4 border-gray-300 pl-4 italic text-gray-700">
            <div {...baseEditableProps} className={baseClassName} />
          </div>
        );

      case "callout":
        return (
          <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div {...baseEditableProps} className={`flex-1 ${baseClassName}`} />
          </div>
        );

      case "code":
        return (
          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm">
            <div {...baseEditableProps} className={baseClassName} />
          </div>
        );

      case "page":
        return (
          <div className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
            <FileText className="h-4 w-4 text-gray-600" />
            <div {...baseEditableProps} className={`flex-1 ${baseClassName}`} />
          </div>
        );

      case "image":
        return (
          <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
            <ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Click to upload image</p>
          </div>
        );

      case "video":
        return (
          <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
            <VideoIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Click to upload video</p>
          </div>
        );

      case "audio":
        return (
          <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
            <Volume2 className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Click to upload audio</p>
          </div>
        );

      case "file":
        return (
          <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
            <Paperclip className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Click to upload file</p>
          </div>
        );

      case "bookmark":
        return (
          <div className="flex items-center gap-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50">
            <BookmarkIcon className="h-4 w-4 text-gray-600" />
            <div {...baseEditableProps} className={`flex-1 ${baseClassName}`} />
          </div>
        );

      case "table":
      case "tableView":
        return (
          <div className="p-8 border border-gray-300 rounded-lg text-center">
            <TableIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Table view</p>
          </div>
        );

      case "boardView":
        return (
          <div className="p-8 border border-gray-300 rounded-lg text-center">
            <Columns className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Board view</p>
          </div>
        );

      case "galleryView":
        return (
          <div className="p-8 border border-gray-300 rounded-lg text-center">
            <LayoutGrid className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Gallery view</p>
          </div>
        );

      case "listView":
        return (
          <div className="p-8 border border-gray-300 rounded-lg text-center">
            <LayoutList className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">List view</p>
          </div>
        );

      case "feedView":
        return (
          <div className="p-8 border border-gray-300 rounded-lg text-center">
            <Rss className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Feed view</p>
          </div>
        );

      case "calendarView":
        return (
          <div className="p-8 border border-gray-300 rounded-lg text-center">
            <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Calendar view</p>
          </div>
        );

      case "aiMeetingNotes":
        return (
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-900">
                AI Meeting Notes
              </span>
              <span className="text-xs px-1.5 py-0.5 bg-purple-200 text-purple-700 rounded">
                Beta
              </span>
            </div>
            <div {...baseEditableProps} className={`flex-1 ${baseClassName}`} />
          </div>
        );

      default:
        return <div {...baseEditableProps} className={baseClassName} />;
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
            draggable
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onClick={() => setShowActionMenu(true)}
            className="p-0.5 sm:p-1 hover:bg-gray-100 rounded cursor-grab active:cursor-grabbing transition-colors"
            title="Drag to move"
          >
            <GripVertical className="h-4 w-4 text-gray-400" />
          </button>
        </div>

        {showAddMenu && (
          <>
            {block.content.startsWith("/") ? (
              <div
                className="fixed z-50"
                style={{
                  top: menuPosition.top > 0 ? `${menuPosition.top}px` : "50%",
                  left:
                    menuPosition.left > 0 ? `${menuPosition.left}px` : "50%",
                  transform:
                    menuPosition.top === 0 ? "translate(-50%, -50%)" : "none",
                }}
              >
                <BlockTypeMenu
                  initialSearch={block.content.substring(1)}
                  onSelect={(type) => {
                    if (contentRef.current) {
                      contentRef.current.textContent = "";
                    }
                    onUpdate({ ...block, content: "" });
                    onAddAfter(type);
                    setShowAddMenu(false);
                  }}
                  onClose={() => {
                    if (contentRef.current && block.content.startsWith("/")) {
                      contentRef.current.textContent = "";
                      onUpdate({ ...block, content: "" });
                    }
                    setShowAddMenu(false);
                  }}
                />
              </div>
            ) : (
              <div className="fixed sm:absolute left-2 sm:left-0 top-auto sm:top-6 bottom-2 sm:bottom-auto z-50">
                <BlockTypeMenu
                  initialSearch=""
                  onSelect={(type) => {
                    onAddAfter(type);
                    setShowAddMenu(false);
                  }}
                  onClose={() => setShowAddMenu(false)}
                />
              </div>
            )}
          </>
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
            draggable
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onClick={() => setShowActionMenu(!showActionMenu)}
            className="p-0.5 sm:p-1 hover:bg-gray-100 rounded cursor-grab active:cursor-grabbing transition-colors"
            title="Drag to move"
          >
            <GripVertical className="h-4 w-4 text-gray-400" />
          </button>
        </div>
      )}

      {showAddMenu && (
        <>
          {block.content.startsWith("/") ? (
            <div
              className="fixed z-50"
              style={{
                top: menuPosition.top > 0 ? `${menuPosition.top}px` : "50%",
                left: menuPosition.left > 0 ? `${menuPosition.left}px` : "50%",
                transform:
                  menuPosition.top === 0 ? "translate(-50%, -50%)" : "none",
              }}
            >
              <BlockTypeMenu
                initialSearch={block.content.substring(1)}
                onSelect={(type) => {
                  if (contentRef.current) {
                    contentRef.current.textContent = "";
                  }
                  onUpdate({ ...block, content: "" });
                  onAddAfter(type);
                  setShowAddMenu(false);
                }}
                onClose={() => {
                  if (contentRef.current && block.content.startsWith("/")) {
                    contentRef.current.textContent = "";
                    onUpdate({ ...block, content: "" });
                  }
                  setShowAddMenu(false);
                }}
              />
            </div>
          ) : (
            <div className="fixed sm:absolute left-2 sm:left-0 top-auto sm:top-6 bottom-2 sm:bottom-auto z-50">
              <BlockTypeMenu
                initialSearch=""
                onSelect={(type) => {
                  onAddAfter(type);
                  setShowAddMenu(false);
                }}
                onClose={() => setShowAddMenu(false)}
              />
            </div>
          )}
        </>
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

      {renderBlockContent()}

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
