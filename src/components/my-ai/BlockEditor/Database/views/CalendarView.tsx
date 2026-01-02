"use client";

import { Database, DatabaseProperty } from "@/types/database";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  const dateProperty = database.properties.find((p) => p.type === "date");

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

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

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">
          {currentDate.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })}
        </h3>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-gray-600 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
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
              className={`aspect-square border rounded p-1 text-sm ${
                hasItems
                  ? "bg-blue-50 border-blue-200"
                  : "bg-white border-gray-200"
              } hover:border-blue-400 cursor-pointer`}
              onClick={() => {
                if (dateProperty) {
                  onAddItem();
                  setTimeout(() => {
                    const newItem = database.items[database.items.length - 1];
                    if (newItem) {
                      const dateStr = `${year}-${String(month + 1).padStart(
                        2,
                        "0"
                      )}-${String(day).padStart(2, "0")}`;
                      onUpdateItem(newItem.id, {
                        ...newItem.properties,
                        [dateProperty.id]: dateStr,
                      });
                    }
                  }, 100);
                }
              }}
            >
              <div className="font-medium text-gray-700">{day}</div>
              {hasItems && (
                <div className="mt-1 space-y-0.5">
                  {items.slice(0, 2).map((item) => {
                    const titleProp = database.properties[0];
                    const title = titleProp
                      ? item.properties[titleProp.id]
                      : "";
                    return (
                      <div
                        key={item.id}
                        className="text-[10px] bg-blue-500 text-white px-1 rounded truncate"
                      >
                        {title || "Event"}
                      </div>
                    );
                  })}
                  {items.length > 2 && (
                    <div className="text-[10px] text-blue-600">
                      +{items.length - 2} more
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
