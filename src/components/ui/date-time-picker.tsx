"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

interface DateTimePickerProps {
  date?: Date;
  setDate: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
}

export function DateTimePicker({
  date,
  setDate,
  placeholder = "Pick a date and time",
  className,
}: DateTimePickerProps) {
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
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal pointer-events-auto",
              !date && "text-muted-foreground",
              className
            )}
            onClick={() => setIsOpen(true)}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP HH:mm") : <span>{placeholder}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 z-[200]" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            initialFocus
          />
          <div className="p-3 border-t border-border">
            <label className="text-sm font-medium mb-2 block">Time</label>
            <Input
              type="time"
              value={time}
              onChange={handleTimeChange}
              className="w-full"
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
