"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

type JoinClubConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clubName: string;
  joinMode: string;
  isApproved: boolean;
  onConfirm: () => Promise<void>;
};

export function JoinClubConfirmDialog({
  open,
  onOpenChange,
  clubName,
  joinMode,
  isApproved,
  onConfirm,
}: JoinClubConfirmDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Join {clubName}?</DialogTitle>
          <DialogDescription>
            {joinMode === "DIRECT"
              ? `You are about to join ${clubName}. You will receive a confirmation email.`
              : isApproved
              ? `Your request to join ${clubName} has been approved. Click confirm to complete your membership.`
              : `You are about to request to join ${clubName}. Your request will be reviewed by the club administrators.`}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
