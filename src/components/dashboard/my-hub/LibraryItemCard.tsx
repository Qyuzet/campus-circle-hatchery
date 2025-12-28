"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Loader2, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import { fileAPI } from "@/lib/api/file";

interface LibraryItemCardProps {
  transaction: {
    id: string;
    itemId: string | null;
    itemTitle: string;
    createdAt: Date;
    item: {
      id: string;
      title: string;
      description: string | null;
      category: string;
      fileUrl: string | null;
      fileName: string | null;
    } | null;
  };
  onSupportClick?: (data: {
    itemId: string | null;
    itemType: string;
    itemTitle: string;
  }) => void;
}

export function LibraryItemCard({
  transaction,
  onSupportClick,
}: LibraryItemCardProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!transaction.item?.fileUrl || !transaction.itemId) {
      toast.error("No file available");
      return;
    }

    if (isDownloading) return;

    try {
      setIsDownloading(true);
      await fileAPI.downloadFile(
        transaction.itemId,
        transaction.item.fileUrl,
        transaction.item.fileName || transaction.itemTitle
      );
      toast.success("Download started!");
    } catch (error) {
      toast.error("Download failed");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSupportClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSupportClick) {
      onSupportClick({
        itemId: transaction.itemId,
        itemType: "library",
        itemTitle: transaction.itemTitle,
      });
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow relative flex flex-col h-full">
      <button
        onClick={handleSupportClick}
        className="absolute top-2 right-2 z-10 bg-white/90 hover:bg-white backdrop-blur-sm p-1.5 rounded-full shadow-sm transition-all hover:shadow-md group"
        title="Contact Support"
      >
        <HelpCircle className="h-4 w-4 text-gray-600 group-hover:text-blue-600 transition-colors" />
      </button>
      <CardHeader className="p-3 sm:p-4 pb-2 sm:pb-3">
        <div className="flex flex-col gap-1.5 sm:gap-2">
          <div className="flex-1 min-w-0 pr-8">
            <CardTitle className="text-sm sm:text-base font-semibold line-clamp-2 mb-1.5 sm:mb-2">
              {transaction.itemTitle}
            </CardTitle>
            <div className="inline-flex items-center px-2 sm:px-2.5 py-0.5 sm:py-1 bg-blue-50 border-l-4 border-blue-600 rounded-sm w-fit">
              <span className="text-[10px] sm:text-xs font-semibold text-blue-800">
                {transaction.item?.category || "Material"}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 pt-0 flex-1">
        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-3 mb-2 sm:mb-3">
          {transaction.item?.description || "No description available"}
        </p>
        <div className="text-[10px] sm:text-xs text-muted-foreground">
          Added{" "}
          {new Date(transaction.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </div>
      </CardContent>
      <CardFooter className="p-3 sm:p-4 pt-0">
        <Button
          size="sm"
          className="w-full text-xs sm:text-sm h-8 sm:h-9"
          onClick={handleDownload}
          disabled={!transaction.item?.fileUrl || isDownloading}
        >
          {isDownloading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Downloading...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Download
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
