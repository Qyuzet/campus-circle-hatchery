export type BlockType = 
  | "text"
  | "heading1"
  | "heading2"
  | "heading3"
  | "bulletList"
  | "numberedList"
  | "divider";

export interface Block {
  id: string;
  type: BlockType;
  content: string;
  color?: string;
  metadata?: Record<string, any>;
}

export interface BlockAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  shortcut?: string;
  action: (block: Block) => void;
  divider?: boolean;
}

