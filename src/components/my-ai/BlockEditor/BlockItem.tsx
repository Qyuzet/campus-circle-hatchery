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
import { MediaUpload } from "./MediaUpload";
import { CodeBlock } from "./CodeBlock";
import { TableBlock } from "./TableBlock";
import { MermaidBlock } from "./MermaidBlock";
import { AIAssistantModal } from "./AIAssistantModal";
import { TranslateDialog } from "./TranslateDialog";
import { DatabaseBlock } from "./Database/DatabaseBlock";
import { AISpaceMenu } from "./AISpaceMenu";
import { AIPromptModal } from "./AIPromptModal";
import { Database } from "@/types/database";
import { toast } from "sonner";

interface BlockItemProps {
  block: Block;
  isFirst: boolean;
  listNumber?: number;
  onUpdate: (block: Block) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onAddBefore: (type: BlockType) => void;
  onAddAfter: (type: BlockType) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onConvertTo: (type: BlockType, clearContent?: boolean) => void;
}

export function BlockItem({
  block,
  isFirst,
  listNumber = 1,
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
  const [showTranslateDialog, setShowTranslateDialog] = useState(false);
  const [showAISpaceMenu, setShowAISpaceMenu] = useState(false);
  const [showAIPromptModal, setShowAIPromptModal] = useState(false);
  const [currentAIAction, setCurrentAIAction] = useState("");
  const [aiPromptTitle, setAIPromptTitle] = useState("");
  const [aiPromptPlaceholder, setAIPromptPlaceholder] = useState("");
  const [selectedText, setSelectedText] = useState("");
  const [aiModalPosition, setAIModalPosition] = useState({ top: 0, left: 0 });
  const [aiSpaceMenuPosition, setAISpaceMenuPosition] = useState({
    top: 0,
    left: 0,
  });
  const [aiPromptModalPosition, setAIPromptModalPosition] = useState({
    top: 0,
    left: 0,
  });
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
      top = rect.top - menuHeight - 4;
    } else {
      // Position below (default)
      top = rect.bottom + 4;
    }

    // Get the left position - align with the "/" character
    const left = rect.left;

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

    // Check for markdown shortcuts
    const shortcuts: Record<
      string,
      { type: BlockType; removePrefix: boolean }
    > = {
      "# ": { type: "heading1", removePrefix: true },
      "## ": { type: "heading2", removePrefix: true },
      "### ": { type: "heading3", removePrefix: true },
      "- ": { type: "bulletList", removePrefix: true },
      "* ": { type: "bulletList", removePrefix: true },
      "1. ": { type: "numberedList", removePrefix: true },
      "[] ": { type: "todoList", removePrefix: true },
      "> ": { type: "toggleList", removePrefix: true },
      '" ': { type: "quote", removePrefix: true },
      "--- ": { type: "divider", removePrefix: true },
      "``` ": { type: "code", removePrefix: true },
    };

    for (const [shortcut, config] of Object.entries(shortcuts)) {
      if (newContent === shortcut) {
        const contentToSet = config.removePrefix ? "" : newContent;
        if (contentRef.current) {
          contentRef.current.textContent = contentToSet;
        }
        onUpdate({ ...block, type: config.type, content: contentToSet });
        return;
      }
    }

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

    // Update block content
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
            top: rect.top - 48,
            left: rect.left + rect.width / 2 - 60,
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

  const handleAISpaceAction = (action: string, prompt?: string) => {
    const actionsNeedingPrompt = [
      "continue",
      "table",
      "flowchart",
      "write-custom",
      "brainstorm",
      "code-help",
      "ask-question",
      "ask-page",
      "draft-outline",
      "draft-email",
      "draft-agenda",
      "draft-custom",
      "summary",
      "action-items",
    ];

    if (actionsNeedingPrompt.includes(action) && !prompt) {
      setCurrentAIAction(action);

      const promptConfig: Record<
        string,
        { title: string; placeholder: string }
      > = {
        continue: {
          title: "What would you like me to continue writing about?",
          placeholder: "e.g., Continue writing about the benefits of exercise",
        },
        table: {
          title: "What's the table about? I'll help you make it.",
          placeholder:
            "e.g., Create a comparison table of programming languages",
        },
        flowchart: {
          title: "What's the flowchart about? I'll help you make it.",
          placeholder: "e.g., User authentication flow for a web app",
        },
        "write-custom": {
          title: "What would you like me to write?",
          placeholder: "e.g., Write a paragraph about climate change",
        },
        brainstorm: {
          title: "What would you like to brainstorm about?",
          placeholder: "e.g., Ideas for a mobile app startup",
        },
        "code-help": {
          title: "What code do you need help with?",
          placeholder: "e.g., How to implement a binary search in Python",
        },
        "ask-question": {
          title: "What's your question?",
          placeholder: "e.g., What is the difference between REST and GraphQL?",
        },
        "ask-page": {
          title: "What would you like to know about this page?",
          placeholder: "e.g., Summarize the main points of this note",
        },
        "draft-outline": {
          title: "What's the outline about?",
          placeholder: "e.g., Research paper on artificial intelligence",
        },
        "draft-email": {
          title: "What's the email about?",
          placeholder: "e.g., Follow-up email to a client about project status",
        },
        "draft-agenda": {
          title: "What's the meeting about?",
          placeholder: "e.g., Quarterly team planning meeting",
        },
        "draft-custom": {
          title: "What would you like me to draft?",
          placeholder: "e.g., A proposal for a new feature",
        },
        summary: {
          title: "What would you like me to summarize?",
          placeholder: "e.g., Summarize the key points from the content above",
        },
        "action-items": {
          title: "What context should I use for action items?",
          placeholder:
            "e.g., Extract action items from the meeting notes above",
        },
      };

      const config = promptConfig[action] || {
        title: "What would you like me to do?",
        placeholder: "Ask AI anything...",
      };

      setAIPromptTitle(config.title);
      setAIPromptPlaceholder(config.placeholder);

      const blockElement = blockRef.current;
      if (blockElement) {
        const rect = blockElement.getBoundingClientRect();
        setAIPromptModalPosition({
          top: rect.bottom + 4,
          left: rect.left,
        });
      }

      setShowAIPromptModal(true);
      return;
    }

    executeAIAction(action, prompt);
  };

  const executeAIAction = async (action: string, prompt?: string) => {
    setIsTyping(true);
    const currentContent = contentRef.current?.textContent || "";

    try {
      const response = await fetch("/api/ai/generate-blocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          prompt: prompt || "",
          context: currentContent,
        }),
      });

      if (!response.ok) throw new Error("AI processing failed");

      const data = await response.json();

      if (data.blockType === "table" && data.content) {
        onUpdate({
          ...block,
          type: "table",
          content: "",
          metadata: {
            ...block.metadata,
            tableData: data.content,
          },
        });
        toast.success("Table generated successfully");
      } else if (data.blockType === "mermaid" && data.content) {
        onUpdate({
          ...block,
          type: "mermaid",
          content: data.content,
        });
        toast.success("Flowchart generated successfully");
      } else {
        let newText;
        if (action === "continue") {
          newText = currentContent
            ? `${currentContent} ${data.content}`
            : data.content;
        } else {
          newText = currentContent
            ? `${currentContent}\n\n${data.content}`
            : data.content;
        }

        if (contentRef.current) {
          typeText(newText, contentRef.current, () => {
            onUpdate({ ...block, content: newText });
          });
        }
        toast.success("Content generated successfully");
      }
    } catch (error) {
      console.error("AI action error:", error);
      toast.error("Failed to generate content");
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const content = contentRef.current?.textContent || "";

    if (e.key === " " && content === "" && !showAISpaceMenu) {
      e.preventDefault();
      const blockElement = blockRef.current;
      if (blockElement) {
        const rect = blockElement.getBoundingClientRect();
        setAISpaceMenuPosition({
          top: rect.bottom + window.scrollY + 4,
          left: rect.left + window.scrollX,
        });
        setShowAISpaceMenu(true);
      }
      return;
    }

    // Enter key - create new block
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();

      // For list types, create same type of block
      const listTypes: BlockType[] = [
        "bulletList",
        "numberedList",
        "todoList",
        "toggleList",
      ];
      const newBlockType = listTypes.includes(block.type) ? block.type : "text";

      // If current block is empty and it's a list, convert to text instead
      if (content === "" && listTypes.includes(block.type)) {
        onUpdate({ ...block, type: "text" });
        return;
      }

      onAddAfter(newBlockType);
      setTimeout(() => {
        const nextBlock = blockRef.current?.nextElementSibling?.querySelector(
          "[contenteditable]"
        ) as HTMLElement;
        nextBlock?.focus();
      }, 10);
    }

    // Backspace on empty block - delete block or convert list to text
    if (e.key === "Backspace" && content === "") {
      e.preventDefault();
      const listTypes: BlockType[] = [
        "bulletList",
        "numberedList",
        "todoList",
        "toggleList",
      ];

      // If it's a list type, convert to text first
      if (listTypes.includes(block.type)) {
        onUpdate({ ...block, type: "text" });
      } else {
        onDelete();
      }
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
    if (!isHovered && !isFocused) {
      return "";
    }

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
            <span className="text-gray-600 leading-none mt-[6px]">•</span>
            <div {...baseEditableProps} className={`flex-1 ${baseClassName}`} />
          </div>
        );

      case "numberedList":
        return (
          <div className="flex items-start gap-2">
            <span className="text-gray-600 min-w-[24px] leading-none mt-[6px]">
              {listNumber}.
            </span>
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
              className="text-gray-600 hover:text-gray-900 transition-colors flex-shrink-0 mt-[4px]"
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
          <div>
            <div className="flex items-start gap-2">
              <button
                onClick={() => {
                  onUpdate({ ...block, isOpen: !block.isOpen });
                }}
                className="text-gray-600 hover:text-gray-900 transition-colors flex-shrink-0 mt-[4px]"
              >
                {block.isOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
              <div
                {...baseEditableProps}
                className={`flex-1 ${baseClassName} font-medium`}
              />
            </div>
            {block.isOpen && (
              <div className="ml-6 mt-2 pl-4 border-l-2 border-gray-200">
                <div
                  ref={(el) => {
                    if (
                      el &&
                      !el.textContent &&
                      block.metadata?.nestedContent
                    ) {
                      el.textContent = block.metadata.nestedContent;
                    }
                  }}
                  contentEditable
                  suppressContentEditableWarning
                  onInput={(e) => {
                    onUpdate({
                      ...block,
                      metadata: {
                        ...block.metadata,
                        nestedContent: e.currentTarget.textContent || "",
                      },
                    });
                  }}
                  className="text-sm text-gray-600 outline-none"
                  data-placeholder="Add nested content..."
                />
              </div>
            )}
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
          <CodeBlock
            content={block.content}
            language={block.language}
            onUpdate={(content, language) => {
              onUpdate({ ...block, content, language });
            }}
          />
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
          <MediaUpload
            type="image"
            currentUrl={block.url}
            onUpload={(url, file) => {
              onUpdate({
                ...block,
                url,
                metadata: { ...block.metadata, fileName: file.name },
              });
            }}
            onRemove={() => {
              onUpdate({ ...block, url: undefined });
            }}
            icon={ImageIcon}
            label="image"
          />
        );

      case "video":
        return (
          <MediaUpload
            type="video"
            currentUrl={block.url}
            onUpload={(url, file) => {
              onUpdate({
                ...block,
                url,
                metadata: { ...block.metadata, fileName: file.name },
              });
            }}
            onRemove={() => {
              onUpdate({ ...block, url: undefined });
            }}
            icon={VideoIcon}
            label="video"
          />
        );

      case "audio":
        return (
          <MediaUpload
            type="audio"
            currentUrl={block.url}
            onUpload={(url, file) => {
              onUpdate({
                ...block,
                url,
                metadata: { ...block.metadata, fileName: file.name },
              });
            }}
            onRemove={() => {
              onUpdate({ ...block, url: undefined });
            }}
            icon={Volume2}
            label="audio"
          />
        );

      case "file":
        return (
          <MediaUpload
            type="file"
            currentUrl={block.url}
            onUpload={(url, file) => {
              onUpdate({
                ...block,
                url,
                metadata: { ...block.metadata, fileName: file.name },
              });
            }}
            onRemove={() => {
              onUpdate({ ...block, url: undefined });
            }}
            icon={Paperclip}
            label="file"
          />
        );

      case "bookmark":
        return (
          <div className="border border-gray-300 rounded-lg overflow-hidden">
            {!block.url ? (
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <BookmarkIcon className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Add a link
                  </span>
                </div>
                <input
                  type="url"
                  placeholder="Paste a link..."
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const url = e.currentTarget.value;
                      if (url) {
                        onUpdate({ ...block, url });
                      }
                    }
                  }}
                  autoFocus
                />
              </div>
            ) : (
              <a
                href={block.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors group"
              >
                <BookmarkIcon className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div
                    contentEditable
                    suppressContentEditableWarning
                    onInput={(e) => {
                      onUpdate({
                        ...block,
                        content: e.currentTarget.textContent || "",
                      });
                    }}
                    className="text-sm font-medium text-gray-900 mb-1 outline-none"
                  >
                    {block.content || "Untitled"}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {block.url}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    onUpdate({ ...block, url: undefined });
                  }}
                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 transition-all"
                >
                  ×
                </button>
              </a>
            )}
          </div>
        );

      case "table":
        return (
          <TableBlock
            data={block.metadata?.tableData}
            onUpdate={(tableData) => {
              onUpdate({
                ...block,
                metadata: { ...block.metadata, tableData },
              });
            }}
          />
        );

      case "mermaid":
        return (
          <div>
            <div
              className="h-4 cursor-text hover:bg-gray-50 transition-colors rounded"
              onClick={() => onAddBefore("text")}
              title="Click to add block above"
            />
            <MermaidBlock
              code={block.content}
              onUpdate={(code) => {
                onUpdate({ ...block, content: code });
              }}
            />
            <div
              className="h-8 cursor-text hover:bg-gray-50 transition-colors rounded"
              onClick={() => onAddAfter("text")}
              title="Click to add block below"
            />
          </div>
        );

      case "database":
      case "tableView":
      case "boardView":
      case "galleryView":
      case "listView":
      case "feedView":
      case "calendarView":
        const database: Database = block.metadata?.database || {
          id: block.id,
          name: "Untitled Database",
          properties: [
            { id: "prop1", name: "Name", type: "text" },
            { id: "prop2", name: "Status", type: "select" },
            { id: "prop3", name: "Date", type: "date" },
          ],
          items: [],
          views: [
            { id: "view1", type: "table", name: "Table" },
            { id: "view2", type: "board", name: "Board" },
            { id: "view3", type: "gallery", name: "Gallery" },
            { id: "view4", type: "list", name: "List" },
            { id: "view5", type: "feed", name: "Feed" },
            { id: "view6", type: "calendar", name: "Calendar" },
          ],
          currentViewId: "view1",
        };

        return (
          <div className="relative z-50" style={{ pointerEvents: "auto" }}>
            <DatabaseBlock
              database={database}
              onChange={(updatedDatabase) => {
                onUpdate({
                  ...block,
                  type: "database",
                  metadata: {
                    ...block.metadata,
                    database: updatedDatabase,
                  },
                });
              }}
            />
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
                className="fixed z-[9999]"
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
              <div className="fixed sm:absolute left-2 sm:left-0 top-auto sm:top-6 bottom-2 sm:bottom-auto z-[9999]">
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
          <div className="fixed sm:absolute left-2 sm:left-0 top-auto sm:top-6 bottom-2 sm:bottom-auto z-[9999]">
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
                  if (action === "translate") {
                    setShowTranslateDialog(true);
                  } else {
                    const blockElement = blockRef.current;
                    if (blockElement) {
                      const rect = blockElement.getBoundingClientRect();
                      setAIModalPosition({
                        top: rect.top - 48,
                        left: rect.left + rect.width / 2 - 60,
                      });
                      setShowAIAssistant(true);
                    }
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
              className="fixed z-[9999]"
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
                  setShowAddMenu(false);
                  if (contentRef.current) {
                    contentRef.current.textContent = "";
                  }
                  onConvertTo(type, true);
                  setTimeout(() => {
                    contentRef.current?.focus();
                  }, 10);
                }}
                onClose={() => {
                  setShowAddMenu(false);
                }}
              />
            </div>
          ) : (
            <div className="fixed sm:absolute left-2 sm:left-0 top-auto sm:top-6 bottom-2 sm:bottom-auto z-[9999]">
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
        <div className="fixed sm:absolute left-2 sm:left-0 top-auto sm:top-6 bottom-2 sm:bottom-auto z-[9999]">
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
                if (action === "translate") {
                  setShowTranslateDialog(true);
                } else {
                  const blockElement = blockRef.current;
                  if (blockElement) {
                    const rect = blockElement.getBoundingClientRect();
                    setAIModalPosition({
                      top: rect.top - 48,
                      left: rect.left + rect.width / 2 - 60,
                    });
                    setShowAIAssistant(true);
                  }
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

      {showAISpaceMenu && (
        <AISpaceMenu
          onClose={() => setShowAISpaceMenu(false)}
          onSelect={(action, prompt) => {
            handleAISpaceAction(action, prompt);
            setShowAISpaceMenu(false);
          }}
          position={aiSpaceMenuPosition}
        />
      )}

      {showAIPromptModal && (
        <AIPromptModal
          action={currentAIAction}
          title={aiPromptTitle}
          placeholder={aiPromptPlaceholder}
          onClose={() => {
            setShowAIPromptModal(false);
            setCurrentAIAction("");
          }}
          onSubmit={(prompt) => {
            setShowAIPromptModal(false);
            executeAIAction(currentAIAction, prompt);
            setCurrentAIAction("");
          }}
          position={aiPromptModalPosition}
        />
      )}

      <TranslateDialog
        open={showTranslateDialog}
        onOpenChange={setShowTranslateDialog}
        text={selectedText}
        onTranslated={(translatedText) => {
          onUpdate({ ...block, content: translatedText });
          setSelectedText("");
        }}
      />
    </div>
  );
}
