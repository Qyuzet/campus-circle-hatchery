"use client";

import { useState } from "react";
import { Database, DatabaseItem, DatabaseProperty } from "@/types/database";
import { Plus, Trash2, Settings2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface BoardViewProps {
  database: Database;
  onAddItem: () => void;
  onUpdateItem: (itemId: string, properties: Record<string, any>) => void;
  onDeleteItem: (itemId: string) => void;
  onAddProperty?: (property: DatabaseProperty) => void;
  onUpdateProperty?: (propertyId: string, updates: any) => void;
  onDeleteProperty?: (propertyId: string) => void;
}

export function BoardView({
  database,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onAddProperty,
  onUpdateProperty,
  onDeleteProperty,
}: BoardViewProps) {
  const [isEditingColumns, setIsEditingColumns] = useState(false);
  const [editingOptions, setEditingOptions] = useState<string[]>([]);
  const [newColumnName, setNewColumnName] = useState("");

  const statusProperty = database.properties.find((p) => p.type === "select");
  const statuses = statusProperty?.options || [];

  const handleStartEditingColumns = () => {
    setEditingOptions(
      statusProperty?.options || ["To Do", "In Progress", "Done"]
    );
    setIsEditingColumns(true);
  };

  const handleSaveColumns = () => {
    if (statusProperty && onUpdateProperty) {
      onUpdateProperty(statusProperty.id, {
        ...statusProperty,
        options: editingOptions.filter(Boolean),
      });
    } else if (onAddProperty) {
      const newProperty: DatabaseProperty = {
        id: Math.random().toString(36).substring(2, 15),
        name: "Status",
        type: "select",
        options: editingOptions.filter(Boolean),
      };
      onAddProperty(newProperty);
    }
    setIsEditingColumns(false);
    setNewColumnName("");
  };

  const handleAddColumn = () => {
    if (newColumnName.trim()) {
      setEditingOptions([...editingOptions, newColumnName.trim()]);
      setNewColumnName("");
    }
  };

  const handleRemoveColumn = (index: number) => {
    setEditingOptions(editingOptions.filter((_, i) => i !== index));
  };

  const handleRenameColumn = (index: number, newName: string) => {
    const updated = [...editingOptions];
    updated[index] = newName;
    setEditingOptions(updated);
  };

  const getItemsByStatus = (status: string) => {
    if (!statusProperty) return database.items;
    return database.items.filter(
      (item) => item.properties[statusProperty.id] === status
    );
  };

  const handleStatusChange = (itemId: string, newStatus: string) => {
    if (!statusProperty) return;
    const item = database.items.find((i) => i.id === itemId);
    if (item) {
      onUpdateItem(itemId, {
        ...item.properties,
        [statusProperty.id]: newStatus,
      });
    }
  };

  const renderCard = (item: DatabaseItem) => {
    const titleProperty = database.properties[0];
    const title = titleProperty
      ? item.properties[titleProperty.id] || "Untitled"
      : "Untitled";

    return (
      <div
        key={item.id}
        className="bg-white p-3 rounded border border-gray-200 shadow-sm hover:shadow-md transition-shadow group"
      >
        <div className="flex items-start justify-between gap-2">
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
            <div className="mt-2 space-y-1">
              {database.properties.slice(1).map((prop) => {
                const value = item.properties[prop.id];
                if (!value) return null;
                return (
                  <div key={prop.id} className="text-xs text-gray-500">
                    <span className="font-medium">{prop.name}:</span> {value}
                  </div>
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
  };

  if (statuses.length === 0 && !isEditingColumns) {
    return (
      <div className="p-8 flex flex-col items-center justify-center text-center">
        <div className="max-w-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Set up your Board
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Board view organizes items into columns. Create columns to get
            started.
          </p>
          <Button onClick={handleStartEditingColumns} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Columns
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {statuses.length > 0 && (
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-gray-600">
            {statusProperty ? (
              <span>
                Grouped by: <strong>{statusProperty.name}</strong>
              </span>
            ) : (
              <span>Board View</span>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleStartEditingColumns}
            className="gap-2"
          >
            <Settings2 className="h-4 w-4" />
            Edit Columns
          </Button>
        </div>
      )}

      {isEditingColumns && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-sm text-gray-900">
              Edit Board Columns
            </h4>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditingColumns(false)}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={handleSaveColumns}>
                Save
              </Button>
            </div>
          </div>
          <div className="space-y-2 mb-3">
            {editingOptions.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={option}
                  onChange={(e) => handleRenameColumn(index, e.target.value)}
                  className="flex-1"
                  placeholder="Column name"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveColumn(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={newColumnName}
              onChange={(e) => setNewColumnName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddColumn()}
              placeholder="New column name"
              className="flex-1"
            />
            <Button onClick={handleAddColumn} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <div className="flex gap-4 overflow-x-auto pb-4">
        {statuses.map((status) => (
          <div
            key={status}
            className="flex-shrink-0 w-72 bg-gray-50 rounded-lg p-3"
          >
            <h4 className="font-medium text-sm text-gray-700 mb-3">{status}</h4>
            <div className="space-y-2">
              {getItemsByStatus(status).map((item) => renderCard(item))}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onAddItem();
                if (statusProperty) {
                  setTimeout(() => {
                    const newItem = database.items[database.items.length - 1];
                    if (newItem) {
                      handleStatusChange(newItem.id, status);
                    }
                  }, 100);
                }
              }}
              className="w-full justify-start gap-2 text-gray-500 hover:text-gray-700 mt-2"
            >
              <Plus className="h-4 w-4" />
              New
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
