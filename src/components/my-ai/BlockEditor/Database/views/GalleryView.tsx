"use client";

import { Database, DatabaseItem, DatabaseProperty } from "@/types/database";
import { Plus, Trash2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GalleryViewProps {
  database: Database;
  onAddItem: () => void;
  onUpdateItem: (itemId: string, properties: Record<string, any>) => void;
  onDeleteItem: (itemId: string) => void;
  onAddProperty?: (property: DatabaseProperty) => void;
  onUpdateProperty?: (propertyId: string, updates: any) => void;
  onDeleteProperty?: (propertyId: string) => void;
}

export function GalleryView({
  database,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onAddProperty,
  onUpdateProperty,
  onDeleteProperty,
}: GalleryViewProps) {
  const titleProperty = database.properties[0];

  return (
    <div className="p-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {database.items.map((item) => {
          const title = titleProperty
            ? item.properties[titleProperty.id] || "Untitled"
            : "Untitled";

          return (
            <div
              key={item.id}
              className="border border-gray-200 rounded-lg overflow-hidden group hover:shadow-lg transition-shadow"
            >
              <div className="aspect-video bg-gray-100 flex items-center justify-center relative">
                <ImageIcon className="h-12 w-12 text-gray-400" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDeleteItem(item.id)}
                  className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 bg-white text-gray-400 hover:text-red-600"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
              <div className="p-3">
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
              </div>
            </div>
          );
        })}
        <button
          onClick={onAddItem}
          className="aspect-video border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-gray-400 hover:bg-gray-50 transition-colors"
        >
          <Plus className="h-8 w-8 text-gray-400" />
        </button>
      </div>
    </div>
  );
}
