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
    <Card className="hover:shadow-lg transition-shadow relative">
      <button
        onClick={handleSupportClick}
        className="absolute top-1 right-1 md:top-2 md:right-2 z-10 bg-white/90 hover:bg-white backdrop-blur-sm p-1 md:p-1.5 rounded-full shadow-sm transition-all hover:shadow-md group"
        title="Contact Support"
      >
        <HelpCircle className="h-3 w-3 md:h-4 md:w-4 text-gray-600 group-hover:text-blue-600 transition-colors" />
      </button>
      <CardHeader className="p-2 md:p-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-1 md:gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-xs md:text-lg line-clamp-2">
              {transaction.itemTitle}
            </CardTitle>
            <p className="text-[10px] md:text-sm text-muted-foreground mt-0.5 md:mt-1">
              {transaction.item?.category || "Study Material"}
            </p>
          </div>
          <Badge
            variant="secondary"
            className="text-[10px] md:text-xs h-4 md:h-5 px-1 md:px-2 flex-shrink-0 w-fit"
          >
            {transaction.item?.category || "Material"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-2 md:p-6 pt-0">
        <p className="text-[10px] md:text-sm text-muted-foreground line-clamp-2 md:line-clamp-3">
          {transaction.item?.description || "No description available"}
        </p>
        <div className="mt-2 md:mt-4 space-y-0.5 md:space-y-1">
          <div className="text-[10px] md:text-xs text-muted-foreground">
            {new Date(transaction.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-2 md:p-6 pt-0">
        <Button
          size="sm"
          className="w-full text-[10px] md:text-sm h-7 md:h-9"
          onClick={handleDownload}
          disabled={!transaction.item?.fileUrl || isDownloading}
        >
          {isDownloading ? (
            <>
              <Loader2 className="h-3 w-3 md:h-4 md:w-4 mr-0.5 md:mr-1 animate-spin" />
              <span className="hidden md:inline">Downloading...</span>
              <span className="md:hidden">...</span>
            </>
          ) : (
            <>
              <Download className="h-3 w-3 md:h-4 md:w-4 mr-0.5 md:mr-1" />
              <span className="hidden md:inline">Download</span>
              <span className="md:hidden">Get</span>
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
