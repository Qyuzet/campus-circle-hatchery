"use client";

import { Database, DatabaseItem, DatabaseProperty } from "@/types/database";
import { Plus, Trash2, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TableViewProps {
  database: Database;
  onAddItem: () => void;
  onUpdateItem: (itemId: string, properties: Record<string, any>) => void;
  onDeleteItem: (itemId: string) => void;
  onAddProperty?: (property: DatabaseProperty) => void;
  onUpdateProperty?: (propertyId: string, updates: any) => void;
  onDeleteProperty?: (propertyId: string) => void;
}

export function TableView({
  database,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onAddProperty,
  onUpdateProperty,
  onDeleteProperty,
}: TableViewProps) {
  const [isAddingProperty, setIsAddingProperty] = useState(false);
  const [newPropertyName, setNewPropertyName] = useState("");
  const [newPropertyType, setNewPropertyType] = useState<string>("text");
  const [editingPropertyId, setEditingPropertyId] = useState<string | null>(
    null
  );
  const [editingPropertyName, setEditingPropertyName] = useState("");

  const handleCellChange = (itemId: string, propertyId: string, value: any) => {
    const item = database.items.find((i) => i.id === itemId);
    if (item) {
      onUpdateItem(itemId, {
        ...item.properties,
        [propertyId]: value,
      });
    }
  };

  const handleAddProperty = () => {
    if (!newPropertyName.trim() || !onAddProperty) return;

    const newProperty: DatabaseProperty = {
      id: Math.random().toString(36).substring(2, 15),
      name: newPropertyName.trim(),
      type: newPropertyType as any,
      options:
        newPropertyType === "select"
          ? ["Option 1", "Option 2", "Option 3"]
          : undefined,
    };

    onAddProperty(newProperty);
    setIsAddingProperty(false);
    setNewPropertyName("");
    setNewPropertyType("text");
  };

  const handleRenameProperty = (propertyId: string) => {
    if (!editingPropertyName.trim() || !onUpdateProperty) return;

    const property = database.properties.find((p) => p.id === propertyId);
    if (property) {
      onUpdateProperty(propertyId, {
        ...property,
        name: editingPropertyName.trim(),
      });
    }
    setEditingPropertyId(null);
    setEditingPropertyName("");
  };

  const startEditingProperty = (property: DatabaseProperty) => {
    setEditingPropertyId(property.id);
    setEditingPropertyName(property.name);
  };

  const renderCell = (item: DatabaseItem, propertyId: string) => {
    const property = database.properties.find((p) => p.id === propertyId);
    if (!property) return null;

    const value = item.properties[propertyId];

    switch (property.type) {
      case "checkbox":
        return (
          <Checkbox
            checked={value || false}
            onCheckedChange={(checked) =>
              handleCellChange(item.id, propertyId, checked)
            }
          />
        );
      case "select":
        return (
          <select
            value={value || ""}
            onChange={(e) =>
              handleCellChange(item.id, propertyId, e.target.value)
            }
            className="w-full px-2 py-1 text-sm border-0 bg-transparent focus:outline-none"
          >
            <option value="">Select...</option>
            {property.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );
      case "multiSelect":
        return (
          <select
            multiple
            value={Array.isArray(value) ? value : []}
            onChange={(e) => {
              const selected = Array.from(
                e.target.selectedOptions,
                (option) => option.value
              );
              handleCellChange(item.id, propertyId, selected);
            }}
            className="w-full px-2 py-1 text-sm border-0 bg-transparent focus:outline-none"
          >
            {property.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );
      case "date":
        return (
          <input
            type="date"
            value={value || ""}
            onChange={(e) =>
              handleCellChange(item.id, propertyId, e.target.value)
            }
            className="w-full px-2 py-1 text-sm border-0 bg-transparent focus:outline-none"
          />
        );
      case "number":
        return (
          <input
            type="number"
            value={value || ""}
            onChange={(e) =>
              handleCellChange(item.id, propertyId, e.target.value)
            }
            className="w-full px-2 py-1 text-sm border-0 bg-transparent focus:outline-none"
          />
        );
      case "url":
        return (
          <input
            type="url"
            value={value || ""}
            onChange={(e) =>
              handleCellChange(item.id, propertyId, e.target.value)
            }
            className="w-full px-2 py-1 text-sm border-0 bg-transparent focus:outline-none text-blue-600 underline"
            placeholder="https://"
          />
        );
      case "email":
        return (
          <input
            type="email"
            value={value || ""}
            onChange={(e) =>
              handleCellChange(item.id, propertyId, e.target.value)
            }
            className="w-full px-2 py-1 text-sm border-0 bg-transparent focus:outline-none"
            placeholder="email@example.com"
          />
        );
      case "phone":
        return (
          <input
            type="tel"
            value={value || ""}
            onChange={(e) =>
              handleCellChange(item.id, propertyId, e.target.value)
            }
            className="w-full px-2 py-1 text-sm border-0 bg-transparent focus:outline-none"
            placeholder="+1234567890"
          />
        );
      default:
        return (
          <input
            type="text"
            value={value || ""}
            onChange={(e) =>
              handleCellChange(item.id, propertyId, e.target.value)
            }
            className="w-full px-2 py-1 text-sm border-0 bg-transparent focus:outline-none"
            placeholder="Empty"
          />
        );
    }
  };

  return (
    <div className="overflow-x-auto">
      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {database.items.map((item) => (
          <div
            key={item.id}
            className="bg-white border border-gray-200 rounded-lg p-3 space-y-2"
          >
            {database.properties.map((prop) => {
              const value = item.properties[prop.id];
              if (!value && prop.type !== "checkbox") return null;

              return (
                <div key={prop.id} className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-600">
                    {prop.name}
                  </label>
                  {renderCell(item, prop.id)}
                </div>
              );
            })}
            <div className="flex justify-end pt-2 border-t border-gray-100">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDeleteItem(item.id)}
                className="h-7 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        ))}

        {onAddProperty && (
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddingProperty(true)}
              className="flex-1"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Property
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onAddItem}
              className="flex-1"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Row
            </Button>
          </div>
        )}
      </div>

      {/* Desktop Table View */}
      <table className="w-full hidden md:table">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            {database.properties.map((prop) => (
              <th
                key={prop.id}
                className="px-4 py-2 text-left text-xs font-medium text-gray-600 group relative"
              >
                {editingPropertyId === prop.id ? (
                  <div className="flex items-center gap-1">
                    <Input
                      value={editingPropertyName}
                      onChange={(e) => setEditingPropertyName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleRenameProperty(prop.id);
                        if (e.key === "Escape") {
                          setEditingPropertyId(null);
                          setEditingPropertyName("");
                        }
                      }}
                      className="h-6 text-xs"
                      autoFocus
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRenameProperty(prop.id)}
                      className="h-6 w-6 p-0"
                    >
                      <Check className="h-3 w-3 text-green-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingPropertyId(null);
                        setEditingPropertyName("");
                      }}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3 text-red-600" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span
                      className="cursor-pointer hover:text-gray-900"
                      onDoubleClick={() => startEditingProperty(prop)}
                      title="Double-click to rename"
                    >
                      {prop.name}
                    </span>
                    {onDeleteProperty && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteProperty(prop.id)}
                        className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete property"
                      >
                        <Trash2 className="h-3 w-3 text-red-600" />
                      </Button>
                    )}
                  </div>
                )}
              </th>
            ))}
            {isAddingProperty ? (
              <th className="px-4 py-2 min-w-[200px]">
                <div className="flex items-center gap-1">
                  <Input
                    value={newPropertyName}
                    onChange={(e) => setNewPropertyName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAddProperty();
                      if (e.key === "Escape") {
                        setIsAddingProperty(false);
                        setNewPropertyName("");
                      }
                    }}
                    placeholder="Property name"
                    className="h-6 text-xs flex-1"
                    autoFocus
                  />
                  <Select
                    value={newPropertyType}
                    onValueChange={setNewPropertyType}
                  >
                    <SelectTrigger className="h-6 text-xs w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="number">Number</SelectItem>
                      <SelectItem value="select">Select</SelectItem>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="checkbox">Checkbox</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="url">URL</SelectItem>
                      <SelectItem value="phone">Phone</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleAddProperty}
                    className="h-6 w-6 p-0"
                  >
                    <Check className="h-3 w-3 text-green-600" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsAddingProperty(false);
                      setNewPropertyName("");
                    }}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3 text-red-600" />
                  </Button>
                </div>
              </th>
            ) : null}
            <th className="w-12"></th>
          </tr>
        </thead>
        <tbody>
          {database.items.map((item) => (
            <tr
              key={item.id}
              className="border-b border-gray-100 hover:bg-gray-50"
            >
              {database.properties.map((prop) => (
                <td key={prop.id} className="px-4 py-2">
                  {renderCell(item, prop.id)}
                </td>
              ))}
              <td className="px-2 py-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDeleteItem(item.id)}
                  className="h-6 w-6 p-0 text-gray-400 hover:text-red-600"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Button
        variant="ghost"
        size="sm"
        onClick={onAddItem}
        className="w-full justify-start gap-2 text-gray-500 hover:text-gray-700 py-2 hidden md:flex"
      >
        <Plus className="h-4 w-4" />
        New
      </Button>

      {/* Mobile Property Modal */}
      {isAddingProperty && (
        <div className="md:hidden fixed inset-0 bg-black/50 flex items-end justify-center z-50">
          <div className="bg-white rounded-t-2xl p-6 w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Add Property</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsAddingProperty(false);
                  setNewPropertyName("");
                }}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  Property Name
                </label>
                <Input
                  value={newPropertyName}
                  onChange={(e) => setNewPropertyName(e.target.value)}
                  placeholder="Enter property name"
                  className="w-full"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  Property Type
                </label>
                <Select
                  value={newPropertyType}
                  onValueChange={setNewPropertyType}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="select">Select</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="checkbox">Checkbox</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="url">URL</SelectItem>
                    <SelectItem value="phone">Phone</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddingProperty(false);
                    setNewPropertyName("");
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button onClick={handleAddProperty} className="flex-1">
                  Add Property
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
