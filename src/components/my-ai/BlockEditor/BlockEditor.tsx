"use client";

import { Block, BlockType } from "@/types/block";
import { useState, useEffect, useRef, useCallback } from "react";
import { BlockItem } from "./BlockItem";

const generateId = () => Math.random().toString(36).substring(2, 15);

interface BlockEditorProps {
  initialBlocks?: Block[];
  onChange: (blocks: Block[]) => void;
}

export function BlockEditor({
  initialBlocks = [],
  onChange,
}: BlockEditorProps) {
  const [blocks, setBlocks] = useState<Block[]>(
    initialBlocks.length > 0
      ? initialBlocks
      : [{ id: generateId(), type: "text", content: "" }]
  );
  const isFirstRender = useRef(true);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  const history = useRef<Block[][]>([]);
  const historyIndex = useRef(-1);
  const isUndoRedo = useRef(false);

  useEffect(() => {
    // Skip calling onChange on first render to prevent infinite loop
    if (isFirstRender.current) {
      isFirstRender.current = false;
      history.current = [JSON.parse(JSON.stringify(blocks))];
      historyIndex.current = 0;
      return;
    }

    // Add to history if not from undo/redo
    if (!isUndoRedo.current) {
      const newHistory = history.current.slice(0, historyIndex.current + 1);
      newHistory.push(JSON.parse(JSON.stringify(blocks)));

      // Limit history to 50 states
      if (newHistory.length > 50) {
        newHistory.shift();
      } else {
        historyIndex.current++;
      }

      history.current = newHistory;
    }
    isUndoRedo.current = false;

    // Debounce onChange to prevent excessive re-renders
    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Set new timer - only call onChange after 100ms of no changes
    debounceTimer.current = setTimeout(() => {
      onChange(blocks);
    }, 100);

    // Cleanup timer on unmount
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocks]);

  const undo = useCallback(() => {
    if (historyIndex.current > 0) {
      historyIndex.current--;
      isUndoRedo.current = true;
      setBlocks(
        JSON.parse(JSON.stringify(history.current[historyIndex.current]))
      );
    }
  }, []);

  const redo = useCallback(() => {
    if (historyIndex.current < history.current.length - 1) {
      historyIndex.current++;
      isUndoRedo.current = true;
      setBlocks(
        JSON.parse(JSON.stringify(history.current[historyIndex.current]))
      );
    }
  }, []);

  const clearAllBlocks = useCallback(() => {
    setBlocks([{ id: generateId(), type: "text", content: "" }]);
    setTimeout(() => {
      const firstBlock = editorRef.current?.querySelector(
        "[contenteditable]"
      ) as HTMLElement;
      firstBlock?.focus();
    }, 10);
  }, []);

  // Track if Ctrl+A was pressed
  const selectAllPressedRef = useRef(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Undo: Ctrl+Z or Cmd+Z
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
        return;
      }

      // Redo: Ctrl+Y or Cmd+Shift+Z
      if (
        ((e.ctrlKey || e.metaKey) && e.key === "y") ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "z")
      ) {
        e.preventDefault();
        redo();
        return;
      }

      // Ctrl+A: Select all content in editor
      if ((e.ctrlKey || e.metaKey) && e.key === "a") {
        if (editorRef.current) {
          const target = e.target as HTMLElement;

          // Only handle if target is inside editor
          if (editorRef.current.contains(target)) {
            e.preventDefault();
            selectAllPressedRef.current = true;

            const range = document.createRange();
            const selection = window.getSelection();

            range.selectNodeContents(editorRef.current);
            selection?.removeAllRanges();
            selection?.addRange(range);
          }
        }
        return;
      }

      // Delete/Backspace after Ctrl+A: Clear all blocks
      if (e.key === "Backspace" || e.key === "Delete") {
        if (selectAllPressedRef.current && editorRef.current) {
          e.preventDefault();
          e.stopPropagation();
          selectAllPressedRef.current = false;
          clearAllBlocks();
          return;
        }
      }

      // Reset flag on any other key
      if (!e.ctrlKey && !e.metaKey) {
        selectAllPressedRef.current = false;
      }
    };

    // Use capture phase to intercept before React handlers
    document.addEventListener("keydown", handleKeyDown, true);
    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [clearAllBlocks, undo, redo]);

  const updateBlock = (index: number, updatedBlock: Block) => {
    const newBlocks = [...blocks];
    newBlocks[index] = updatedBlock;
    setBlocks(newBlocks);
  };

  const deleteBlock = (index: number) => {
    if (blocks.length === 1) {
      setBlocks([{ id: generateId(), type: "text", content: "" }]);
      return;
    }
    const newBlocks = blocks.filter((_, i) => i !== index);
    setBlocks(newBlocks);

    // Focus previous block after deletion
    setTimeout(() => {
      const prevIndex = Math.max(0, index - 1);
      const prevBlock = document.querySelector(
        `#block-${newBlocks[prevIndex]?.id} [contenteditable]`
      ) as HTMLElement;
      prevBlock?.focus();
    }, 10);
  };

  const duplicateBlock = (index: number) => {
    const blockToDuplicate = blocks[index];
    const newBlock: Block = {
      id: generateId(),
      type: blockToDuplicate.type,
      content: blockToDuplicate.content,
      color: blockToDuplicate.color,
    };
    const newBlocks = [...blocks];
    newBlocks.splice(index + 1, 0, newBlock);
    setBlocks(newBlocks);
  };

  const convertBlock = (
    index: number,
    newType: BlockType,
    clearContent = false
  ) => {
    const newBlocks = [...blocks];
    newBlocks[index] = {
      ...newBlocks[index],
      type: newType,
      ...(clearContent && { content: "" }),
    };
    setBlocks(newBlocks);
  };

  const addBlockBefore = (index: number, type: BlockType) => {
    const newBlock: Block = {
      id: generateId(),
      type,
      content: "",
    };
    const newBlocks = [...blocks];
    newBlocks.splice(index, 0, newBlock);
    setBlocks(newBlocks);
  };

  const addBlockAfter = (index: number, type: BlockType) => {
    const newBlock: Block = {
      id: generateId(),
      type,
      content: "",
    };
    const newBlocks = [...blocks];
    newBlocks.splice(index + 1, 0, newBlock);
    setBlocks(newBlocks);
  };

  const moveBlockUp = (index: number) => {
    if (index === 0) return;
    const newBlocks = [...blocks];
    [newBlocks[index - 1], newBlocks[index]] = [
      newBlocks[index],
      newBlocks[index - 1],
    ];
    setBlocks(newBlocks);
  };

  const moveBlockDown = (index: number) => {
    if (index === blocks.length - 1) return;
    const newBlocks = [...blocks];
    [newBlocks[index], newBlocks[index + 1]] = [
      newBlocks[index + 1],
      newBlocks[index],
    ];
    setBlocks(newBlocks);
  };

  const getListNumber = (index: number): number => {
    if (blocks[index].type !== "numberedList") return 1;

    let number = 1;
    for (let i = index - 1; i >= 0; i--) {
      if (blocks[i].type === "numberedList") {
        number++;
      } else {
        break;
      }
    }
    return number;
  };

  return (
    <div ref={editorRef} className="w-full">
      {blocks.map((block, index) => (
        <BlockItem
          key={block.id}
          block={block}
          isFirst={index === 0}
          listNumber={getListNumber(index)}
          onUpdate={(updatedBlock) => updateBlock(index, updatedBlock)}
          onDelete={() => deleteBlock(index)}
          onDuplicate={() => duplicateBlock(index)}
          onAddBefore={(type) => addBlockBefore(index, type)}
          onAddAfter={(type) => addBlockAfter(index, type)}
          onMoveUp={() => moveBlockUp(index)}
          onMoveDown={() => moveBlockDown(index)}
          onConvertTo={(type, clearContent) =>
            convertBlock(index, type, clearContent)
          }
        />
      ))}
    </div>
  );
}
