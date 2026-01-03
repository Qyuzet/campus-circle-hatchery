"use client";

import { Database, DatabaseProperty, DatabaseItem } from "@/types/database";
import { ChevronLeft, ChevronRight, Plus, X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface CalendarViewProps {
  database: Database;
  onAddItem: () => void;
  onUpdateItem: (itemId: string, properties: Record<string, any>) => void;
  onDeleteItem: (itemId: string) => void;
  onAddProperty?: (property: DatabaseProperty) => void;
  onUpdateProperty?: (propertyId: string, updates: any) => void;
  onDeleteProperty?: (propertyId: string) => void;
}

export function CalendarView({
  database,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onAddProperty,
  onUpdateProperty,
  onDeleteProperty,
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<DatabaseItem | null>(null);
  const dateProperty = database.properties.find((p) => p.type === "date");

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handleCreateDateProperty = () => {
    if (onAddProperty) {
      const newProperty: DatabaseProperty = {
        id: Math.random().toString(36).substring(2, 15),
        name: "Date",
        type: "date",
      };
      onAddProperty(newProperty);
    }
  };

  const getItemsForDate = (day: number) => {
    if (!dateProperty) return [];
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;
    return database.items.filter(
      (item) => item.properties[dateProperty.id] === dateStr
    );
  };

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  if (!dateProperty) {
    return (
      <div className="p-8 flex flex-col items-center justify-center text-center">
        <div className="max-w-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Set up Calendar View
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Calendar view requires a Date property to display events. Create one
            to get started.
          </p>
          {onAddProperty && (
            <Button onClick={handleCreateDateProperty} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Date Property
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 md:p-4">
      <div className="flex items-center justify-between mb-3 md:mb-4">
        <h3 className="text-base md:text-lg font-semibold">
          {currentDate.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })}
        </h3>
        <div className="flex gap-1 md:gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={prevMonth}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={nextMonth}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 md:gap-2 mb-1 md:mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, idx) => (
          <div
            key={day}
            className="text-center text-[10px] md:text-xs font-medium text-gray-600 py-1 md:py-2"
          >
            <span className="hidden sm:inline">{day}</span>
            <span className="sm:hidden">{day.charAt(0)}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 md:gap-2">
        {Array.from({ length: firstDay }, (_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const items = getItemsForDate(day);
          const hasItems = items.length > 0;

          return (
            <div
              key={day}
              className={`aspect-square border rounded p-0.5 md:p-1 text-xs md:text-sm ${
                hasItems
                  ? "bg-blue-50 border-blue-200"
                  : "bg-white border-gray-200"
              } hover:border-blue-400 cursor-pointer`}
              onClick={() => {
                if (dateProperty) {
                  const dateStr = `${year}-${String(month + 1).padStart(
                    2,
                    "0"
                  )}-${String(day).padStart(2, "0")}`;
                  setSelectedDate(dateStr);
                }
              }}
            >
              <div className="font-medium text-gray-700 text-[10px] md:text-sm">
                {day}
              </div>
              {hasItems && (
                <div className="mt-0.5 md:mt-1 space-y-0.5">
                  {items.slice(0, 1).map((item) => {
                    const titleProp = database.properties[0];
                    const title = titleProp
                      ? item.properties[titleProp.id]
                      : "";
                    return (
                      <div
                        key={item.id}
                        className="text-[8px] md:text-[10px] bg-blue-500 text-white px-0.5 md:px-1 rounded truncate"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingItem(item);
                        }}
                      >
                        <span className="hidden md:inline">
                          {title || "Event"}
                        </span>
                        <span className="md:hidden">•</span>
                      </div>
                    );
                  })}
                  {items.length > 1 && (
                    <div className="text-[8px] md:text-[10px] text-blue-600">
                      <span className="hidden md:inline">
                        +{items.length - 1} more
                      </span>
                      <span className="md:hidden">+{items.length - 1}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selectedDate && dateProperty && (
        <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50">
          <div className="bg-white rounded-t-2xl md:rounded-lg p-4 md:p-6 max-w-md w-full md:mx-4 max-h-[85vh] md:max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <h3 className="text-base md:text-lg font-semibold">
                Events on {new Date(selectedDate).toLocaleDateString()}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedDate(null)}
                className="h-7 w-7 md:h-6 md:w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2 mb-3 md:mb-4">
              {getItemsForDate(parseInt(selectedDate.split("-")[2])).map(
                (item) => {
                  const titleProp = database.properties[0];
                  const title = titleProp ? item.properties[titleProp.id] : "";
                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        setEditingItem(item);
                        setSelectedDate(null);
                      }}
                    >
                      <span className="text-sm">
                        {title || "Untitled Event"}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteItem(item.id);
                        }}
                        className="h-6 w-6 p-0 text-red-600"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  );
                }
              )}
            </div>

            <Button
              onClick={() => {
                onAddItem();
                setTimeout(() => {
                  const newItem = database.items[database.items.length - 1];
                  if (newItem && dateProperty) {
                    onUpdateItem(newItem.id, {
                      ...newItem.properties,
                      [dateProperty.id]: selectedDate,
                    });
                    setEditingItem(newItem);
                    setSelectedDate(null);
                  }
                }, 100);
              }}
              className="w-full gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Event
            </Button>
          </div>
        </div>
      )}

      {editingItem && (
        <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50">
          <div className="bg-white rounded-t-2xl md:rounded-lg p-4 md:p-6 max-w-md w-full md:mx-4 max-h-[85vh] md:max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <h3 className="text-base md:text-lg font-semibold">Edit Event</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingItem(null)}
                className="h-7 w-7 md:h-6 md:w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-3">
              {database.properties.map((prop) => (
                <div key={prop.id}>
                  <label className="text-xs font-medium text-gray-600 block mb-1">
                    {prop.name}
                  </label>
                  <Input
                    type={prop.type === "date" ? "date" : "text"}
                    value={editingItem.properties[prop.id] || ""}
                    onChange={(e) => {
                      const updatedProperties = {
                        ...editingItem.properties,
                        [prop.id]: e.target.value,
                      };
                      onUpdateItem(editingItem.id, updatedProperties);
                      setEditingItem({
                        ...editingItem,
                        properties: updatedProperties,
                      });
                    }}
                    className="w-full"
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => setEditingItem(null)}
                className="flex-1"
              >
                Close
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  onDeleteItem(editingItem.id);
                  setEditingItem(null);
                }}
                className="flex-1"
              >
                Delete Event
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
