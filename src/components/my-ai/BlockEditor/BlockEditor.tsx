"use client";

import { Block, BlockType } from "@/types/block";
import { useState, useEffect } from "react";
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

  useEffect(() => {
    onChange(blocks);
  }, [blocks, onChange]);

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
    <div className="max-w-3xl mx-auto px-16 py-8">
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
