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

  useEffect(() => {
    // Skip calling onChange on first render to prevent infinite loop
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

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

  const clearAllBlocks = useCallback(() => {
    setBlocks([{ id: generateId(), type: "text", content: "" }]);
    setTimeout(() => {
      const firstBlock = editorRef.current?.querySelector(
        "[contenteditable]"
      ) as HTMLElement;
      firstBlock?.focus();
    }, 10);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInEditor =
        target.isContentEditable ||
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA";

      if (!isInEditor) return;

      if ((e.ctrlKey || e.metaKey) && e.key === "a") {
        e.preventDefault();

        if (editorRef.current) {
          const range = document.createRange();
          const selection = window.getSelection();

          range.selectNodeContents(editorRef.current);
          selection?.removeAllRanges();
          selection?.addRange(range);
        }
      }

      if (e.key === "Backspace" || e.key === "Delete") {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;

        const range = selection.getRangeAt(0);

        if (
          editorRef.current &&
          editorRef.current.contains(range.commonAncestorContainer)
        ) {
          const selectedText = selection.toString();

          if (selectedText.length > 0) {
            const allText = editorRef.current.textContent || "";

            if (
              selectedText.length === allText.length ||
              selectedText.length > 100
            ) {
              e.preventDefault();
              clearAllBlocks();
            }
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [clearAllBlocks]);

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
