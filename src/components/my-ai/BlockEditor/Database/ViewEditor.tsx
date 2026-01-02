"use client";

import { useState } from "react";
import { DatabaseView, DatabaseViewType } from "@/types/database";
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
import {
  Table,
  Columns,
  LayoutGrid,
  LayoutList,
  Rss,
  Calendar,
} from "lucide-react";

interface ViewEditorProps {
  view?: DatabaseView;
  open: boolean;
  onClose: () => void;
  onSave: (view: DatabaseView) => void;
}

const viewTypeIcons = {
  table: Table,
  board: Columns,
  gallery: LayoutGrid,
  list: LayoutList,
  feed: Rss,
  calendar: Calendar,
};

const viewTypeLabels = {
  table: "Table",
  board: "Board",
  gallery: "Gallery",
  list: "List",
  feed: "Feed",
  calendar: "Calendar",
};

export function ViewEditor({ view, open, onClose, onSave }: ViewEditorProps) {
  const [name, setName] = useState(view?.name || "");
  const [type, setType] = useState<DatabaseViewType>(view?.type || "table");

  const handleSave = () => {
    const newView: DatabaseView = {
      id: view?.id || Math.random().toString(36).substring(2, 15),
      name,
      type,
    };
    onSave(newView);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{view ? "Edit View" : "New View"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">View Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter view name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">View Type</Label>
            <Select
              value={type}
              onValueChange={(v) => setType(v as DatabaseViewType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(viewTypeLabels).map(([value, label]) => {
                  const Icon = viewTypeIcons[value as DatabaseViewType];
                  return (
                    <SelectItem key={value} value={value}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span>{label}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
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

