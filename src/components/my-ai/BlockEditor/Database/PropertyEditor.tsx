"use client";

import { useState, useEffect } from "react";
import { DatabaseProperty, DatabasePropertyType } from "@/types/database";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PropertyEditorProps {
  property?: DatabaseProperty;
  open: boolean;
  onClose: () => void;
  onSave: (property: DatabaseProperty) => void;
}

export function PropertyEditor({
  property,
  open,
  onClose,
  onSave,
}: PropertyEditorProps) {
  const [name, setName] = useState(property?.name || "");
  const [type, setType] = useState<DatabasePropertyType>(
    property?.type || "text"
  );
  const [options, setOptions] = useState<string>(
    property?.options?.join(", ") || ""
  );

  useEffect(() => {
    if (open) {
      setName(property?.name || "");
      setType(property?.type || "text");
      setOptions(property?.options?.join(", ") || "");
    }
  }, [open, property]);

  const handleSave = () => {
    const newProperty: DatabaseProperty = {
      id: property?.id || Math.random().toString(36).substring(2, 15),
      name,
      type,
      options:
        type === "select" || type === "multiSelect"
          ? options
              .split(",")
              .map((o) => o.trim())
              .filter(Boolean)
          : undefined,
    };
    onSave(newProperty);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {property ? "Edit Property" : "New Property"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Property Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter property name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Property Type</Label>
            <Select
              value={type}
              onValueChange={(v) => setType(v as DatabasePropertyType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="number">Number</SelectItem>
                <SelectItem value="select">Select</SelectItem>
                <SelectItem value="multiSelect">Multi-Select</SelectItem>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="checkbox">Checkbox</SelectItem>
                <SelectItem value="url">URL</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="phone">Phone</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {(type === "select" || type === "multiSelect") && (
            <div className="space-y-2">
              <Label htmlFor="options">Options (comma-separated)</Label>
              <Input
                id="options"
                value={options}
                onChange={(e) => setOptions(e.target.value)}
                placeholder="Option 1, Option 2, Option 3"
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim()}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
