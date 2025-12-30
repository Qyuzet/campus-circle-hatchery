import { Block, BlockType } from "@/types/block";

const generateId = () => Math.random().toString(36).substring(2, 15);

export function contentToBlocks(content: string): Block[] {
  if (!content.trim()) {
    return [{ id: generateId(), type: "text", content: "" }];
  }

  const lines = content.split("\n");
  const blocks: Block[] = [];

  for (const line of lines) {
    let type: BlockType = "text";
    let cleanContent = line;

    if (line.startsWith("# ")) {
      type = "heading1";
      cleanContent = line.substring(2);
    } else if (line.startsWith("## ")) {
      type = "heading2";
      cleanContent = line.substring(3);
    } else if (line.startsWith("### ")) {
      type = "heading3";
      cleanContent = line.substring(4);
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      type = "bulletList";
      cleanContent = line.substring(2);
    } else if (line.match(/^\d+\.\s/)) {
      type = "numberedList";
      cleanContent = line.replace(/^\d+\.\s/, "");
    } else if (line.trim() === "---") {
      type = "divider";
      cleanContent = "";
    }

    blocks.push({
      id: generateId(),
      type,
      content: cleanContent,
    });
  }

  return blocks.length > 0 ? blocks : [{ id: generateId(), type: "text", content: "" }];
}

export function blocksToContent(blocks: Block[]): string {
  return blocks
    .map((block) => {
      switch (block.type) {
        case "heading1":
          return `# ${block.content}`;
        case "heading2":
          return `## ${block.content}`;
        case "heading3":
          return `### ${block.content}`;
        case "bulletList":
          return `- ${block.content}`;
        case "numberedList":
          return `1. ${block.content}`;
        case "divider":
          return "---";
        default:
          return block.content;
      }
    })
    .join("\n");
}

