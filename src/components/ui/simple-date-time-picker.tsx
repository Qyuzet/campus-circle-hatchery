"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";

interface SimpleDateTimePickerProps {
  date?: Date;
  setDate: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
}

export function SimpleDateTimePicker({
  date,
  setDate,
  placeholder = "Pick a date and time",
  className,
}: SimpleDateTimePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [time, setTime] = React.useState<string>(
    date ? format(date, "HH:mm") : "00:00"
  );

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      const [hours, minutes] = time.split(":");
      selectedDate.setHours(parseInt(hours), parseInt(minutes));
      setDate(selectedDate);
    } else {
      setDate(undefined);
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    setTime(newTime);

    if (date) {
      const [hours, minutes] = newTime.split(":");
      const newDate = new Date(date);
      newDate.setHours(parseInt(hours), parseInt(minutes));
      setDate(newDate);
    }
  };

  return (
    <div className="relative">
      <Button
        type="button"
        variant="outline"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={cn(
          "w-full justify-start text-left font-normal",
          !date && "text-muted-foreground",
          className
        )}
      >
        <CalendarIcon className="mr-2 h-4 w-4" />
        {date ? format(date, "PPP HH:mm") : <span>{placeholder}</span>}
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-[150]"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 top-full mt-2 z-[200] bg-white rounded-md border shadow-lg w-auto">
            <div className="flex justify-between items-center px-3 py-2 border-b">
              <span className="text-sm font-medium">Select Date & Time</span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={handleDateSelect}
                initialFocus
                className="p-2"
                classNames={{
                  months: "flex flex-col",
                  month: "space-y-3",
                  caption: "flex justify-center pt-1 relative items-center",
                  caption_label: "text-xs font-medium",
                  nav: "space-x-1 flex items-center",
                  nav_button:
                    "h-6 w-6 bg-transparent p-0 opacity-50 hover:opacity-100",
                  nav_button_previous: "absolute left-1",
                  nav_button_next: "absolute right-1",
                  table: "w-full border-collapse space-y-1",
                  head_row: "flex",
                  head_cell:
                    "text-muted-foreground rounded-md w-7 font-normal text-[0.7rem]",
                  row: "flex w-full mt-1.5",
                  cell: "h-7 w-7 text-center text-xs p-0 relative",
                  day: "h-7 w-7 p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground rounded-md",
                  day_selected:
                    "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                  day_today: "bg-accent text-accent-foreground",
                  day_outside: "text-muted-foreground opacity-50",
                  day_disabled: "text-muted-foreground opacity-50",
                }}
              />
            </div>
            <div className="px-3 pb-3 border-t pt-3">
              <label className="text-sm font-medium mb-2 block">Time</label>
              <Input
                type="time"
                value={time}
                onChange={handleTimeChange}
                className="w-full"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
