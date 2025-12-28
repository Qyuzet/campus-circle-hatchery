"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

type LeaveClubConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clubName: string;
  onConfirm: () => Promise<void>;
};

export function LeaveClubConfirmDialog({
  open,
  onOpenChange,
  clubName,
  onConfirm,
}: LeaveClubConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="bg-red-100 p-2 rounded-full">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <DialogTitle>Leave {clubName}?</DialogTitle>
          </div>
          <DialogDescription className="pt-2">
            Are you sure you want to leave this club? You will need to request to join again if you change your mind.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={async () => {
              await onConfirm();
              onOpenChange(false);
            }}
          >
            Leave Club
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

