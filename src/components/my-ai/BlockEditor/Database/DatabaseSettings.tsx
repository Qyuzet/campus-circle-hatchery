"use client";

import { Database } from "@/types/database";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface DatabaseSettingsProps {
  database: Database;
  open: boolean;
  onClose: () => void;
  onUpdate: (updates: Partial<Database>) => void;
}

export function DatabaseSettings({
  database,
  open,
  onClose,
  onUpdate,
}: DatabaseSettingsProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Database Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="db-name">Database Name</Label>
            <Input
              id="db-name"
              value={database.name}
              onChange={(e) => onUpdate({ name: e.target.value })}
              placeholder="Enter database name"
            />
          </div>
          <div className="space-y-2">
            <Label>Statistics</Label>
            <div className="text-sm text-gray-600 space-y-1">
              <div>Total Properties: {database.properties.length}</div>
              <div>Total Items: {database.items.length}</div>
              <div>Total Views: {database.views.length}</div>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Database ID</Label>
            <div className="text-xs text-gray-500 font-mono bg-gray-50 p-2 rounded">
              {database.id}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

