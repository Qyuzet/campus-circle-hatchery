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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
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
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

