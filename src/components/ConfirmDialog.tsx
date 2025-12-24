"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertTriangle, Info, Trash2, UserMinus, Loader2 } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
  icon?: "trash" | "warning" | "info" | "user-minus";
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "warning",
  icon = "warning",
  isLoading = false,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    if (isLoading) return;
    onConfirm();
    if (!isLoading) {
      onClose();
    }
  };

  const getIcon = () => {
    switch (icon) {
      case "trash":
        return <Trash2 className="h-12 w-12 text-red-500" />;
      case "user-minus":
        return <UserMinus className="h-12 w-12 text-orange-500" />;
      case "info":
        return <Info className="h-12 w-12 text-blue-500" />;
      case "warning":
      default:
        return <AlertTriangle className="h-12 w-12 text-yellow-500" />;
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case "danger":
        return "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800";
      case "info":
        return "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800";
      case "warning":
      default:
        return "bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <Card className="w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">{getIcon()}</div>
          <CardTitle className="text-xl font-bold text-gray-900">
            {title}
          </CardTitle>
          <CardDescription className="text-sm text-gray-600 mt-2">
            {description}
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex gap-3 pt-4">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onClose}
            type="button"
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            className={`flex-1 ${getVariantStyles()}`}
            onClick={handleConfirm}
            type="button"
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {confirmText}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
