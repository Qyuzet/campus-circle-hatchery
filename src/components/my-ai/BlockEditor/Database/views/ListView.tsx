"use client";

import { Database, DatabaseProperty } from "@/types/database";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ListViewProps {
  database: Database;
  onAddItem: () => void;
  onUpdateItem: (itemId: string, properties: Record<string, any>) => void;
  onDeleteItem: (itemId: string) => void;
  onAddProperty?: (property: DatabaseProperty) => void;
  onUpdateProperty?: (propertyId: string, updates: any) => void;
  onDeleteProperty?: (propertyId: string) => void;
}

export function ListView({
  database,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onAddProperty,
  onUpdateProperty,
  onDeleteProperty,
}: ListViewProps) {
  const titleProperty = database.properties[0];

  return (
    <div className="divide-y divide-gray-200">
      {database.items.map((item) => {
        const title = titleProperty
          ? item.properties[titleProperty.id] || "Untitled"
          : "Untitled";

        return (
          <div
            key={item.id}
            className="p-4 hover:bg-gray-50 group flex items-center gap-3"
          >
            <div className="flex-1">
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
                className="w-full text-sm font-medium text-gray-700 border-0 p-0 focus:outline-none bg-transparent"
                placeholder="Untitled"
              />
              <div className="mt-1 flex flex-wrap gap-2">
                {database.properties.slice(1).map((prop) => {
                  const value = item.properties[prop.id];
                  if (!value) return null;
                  return (
                    <span
                      key={prop.id}
                      className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded"
                    >
                      {prop.name}: {value}
                    </span>
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
        );
      })}
      <Button
        variant="ghost"
        size="sm"
        onClick={onAddItem}
        className="w-full justify-start gap-2 text-gray-500 hover:text-gray-700 py-4"
      >
        <Plus className="h-4 w-4" />
        New
      </Button>
    </div>
  );
}
