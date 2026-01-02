export type DatabasePropertyType =
  | "text"
  | "number"
  | "select"
  | "multiSelect"
  | "date"
  | "checkbox"
  | "url"
  | "email"
  | "phone";

export type DatabaseViewType =
  | "table"
  | "board"
  | "gallery"
  | "list"
  | "feed"
  | "calendar";

export interface DatabaseProperty {
  id: string;
  name: string;
  type: DatabasePropertyType;
  options?: string[];
}

export interface DatabaseItem {
  id: string;
  properties: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface DatabaseView {
  id: string;
  type: DatabaseViewType;
  name: string;
  groupBy?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  filters?: any[];
}

export interface Database {
  id: string;
  name: string;
  properties: DatabaseProperty[];
  items: DatabaseItem[];
  views: DatabaseView[];
  currentViewId: string;
}

