export type BlockType =
  | "text"
  | "heading1"
  | "heading2"
  | "heading3"
  | "bulletList"
  | "numberedList"
  | "todoList"
  | "toggleList"
  | "quote"
  | "callout"
  | "divider"
  | "page"
  | "table"
  | "image"
  | "video"
  | "audio"
  | "code"
  | "file"
  | "bookmark"
  | "aiMeetingNotes"
  | "database"
  | "tableView"
  | "boardView"
  | "galleryView"
  | "listView"
  | "feedView"
  | "calendarView";

export interface Block {
  id: string;
  type: BlockType;
  content: string;
  color?: string;
  checked?: boolean;
  isOpen?: boolean;
  language?: string;
  url?: string;
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
