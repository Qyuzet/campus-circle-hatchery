"use client";

import { Block, BlockType } from "@/types/block";
import { useState, useEffect, useRef } from "react";
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

  const convertBlock = (index: number, newType: BlockType) => {
    const newBlocks = [...blocks];
    newBlocks[index] = { ...newBlocks[index], type: newType };
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

  return (
    <div className="w-full">
      {blocks.map((block, index) => (
        <BlockItem
          key={block.id}
          block={block}
          isFirst={index === 0}
          onUpdate={(updatedBlock) => updateBlock(index, updatedBlock)}
          onDelete={() => deleteBlock(index)}
          onDuplicate={() => duplicateBlock(index)}
          onAddBefore={(type) => addBlockBefore(index, type)}
          onAddAfter={(type) => addBlockAfter(index, type)}
          onMoveUp={() => moveBlockUp(index)}
          onMoveDown={() => moveBlockDown(index)}
          onConvertTo={(type) => convertBlock(index, type)}
        />
      ))}
    </div>
  );
}
