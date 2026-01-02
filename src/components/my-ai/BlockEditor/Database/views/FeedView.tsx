"use client";

import { Database, DatabaseProperty } from "@/types/database";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FeedViewProps {
  database: Database;
  onAddItem: () => void;
  onUpdateItem: (itemId: string, properties: Record<string, any>) => void;
  onDeleteItem: (itemId: string) => void;
  onAddProperty?: (property: DatabaseProperty) => void;
  onUpdateProperty?: (propertyId: string, updates: any) => void;
  onDeleteProperty?: (propertyId: string) => void;
}

export function FeedView({
  database,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onAddProperty,
  onUpdateProperty,
  onDeleteProperty,
}: FeedViewProps) {
  const titleProperty = database.properties[0];

  return (
    <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
      {database.items.map((item) => {
        const title = titleProperty
          ? item.properties[titleProperty.id] || "Untitled"
          : "Untitled";

        return (
          <div key={item.id} className="p-4 group">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium flex-shrink-0">
                {title.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => {
                      if (titleProperty) {
                        onUpdateItem(item.id, {
                          ...item.properties,
                          [titleProperty.id]: e.target.value,
                        });
                      }
                    }}
                    className="text-sm font-medium text-gray-700 border-0 p-0 focus:outline-none bg-transparent"
                    placeholder="Untitled"
                  />
                  <span className="text-xs text-gray-500 flex-shrink-0">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="mt-1 space-y-1">
                  {database.properties.slice(1).map((prop) => {
                    const value = item.properties[prop.id];
                    if (!value) return null;
                    return (
                      <p key={prop.id} className="text-sm text-gray-600">
                        {value}
                      </p>
                    );
                  })}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDeleteItem(item.id)}
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        );
      })}
      <Button
        variant="ghost"
        size="sm"
        onClick={onAddItem}
        className="w-full justify-start gap-2 text-gray-500 hover:text-gray-700 py-4"
      >
        <Plus className="h-4 w-4" />
        New Post
      </Button>
    </div>
  );
}
