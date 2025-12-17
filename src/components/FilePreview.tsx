"use client";

import React from "react";
import { FileText, File, Image as ImageIcon } from "lucide-react";

interface FilePreviewProps {
  fileUrl?: string;
  fileType?: string;
  fileName?: string;
  category?: string;
  title: string;
  compact?: boolean;
}

export default function FilePreview({
  fileUrl,
  fileType,
  fileName,
  category,
  title,
  compact = false,
}: FilePreviewProps) {
  const [imageError, setImageError] = React.useState(false);
  const fileExtension = fileName?.split(".").pop()?.toUpperCase() || "FILE";

  const isImage =
    fileType?.startsWith("image/") ||
    ["JPG", "JPEG", "PNG", "GIF", "WEBP"].includes(fileExtension);

  const isPDF = fileType === "application/pdf" || fileExtension === "PDF";

  const isWord =
    fileType === "application/msword" ||
    fileType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    ["DOC", "DOCX"].includes(fileExtension);

  const getCategoryGradient = () => {
    switch (category) {
      case "Notes":
        return "bg-gradient-to-br from-blue-100 to-blue-200";
      case "Assignment":
        return "bg-gradient-to-br from-orange-100 to-orange-200";
      case "Book":
        return "bg-gradient-to-br from-red-100 to-red-200";
      default:
        return "bg-gradient-to-br from-gray-100 to-gray-200";
    }
  };

  const getCategoryIconColor = () => {
    switch (category) {
      case "Notes":
        return "text-blue-600";
      case "Assignment":
        return "text-orange-600";
      case "Book":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  if (!fileUrl) {
    return (
      <div
        className={`w-full h-full flex items-center justify-center ${getCategoryGradient()}`}
      >
        <div className="text-center">
          <File
            className={`${
              compact ? "h-5 w-5" : "h-8 w-8 sm:h-12 sm:w-12 lg:h-7 lg:w-7"
            } ${getCategoryIconColor()} mx-auto`}
          />
          {!compact && (
            <p className="text-[10px] sm:text-xs lg:text-[11px] font-semibold text-gray-700 mt-1">
              No File
            </p>
          )}
        </div>
      </div>
    );
  }

  // Image Files - Show blurred preview
  if (isImage && !imageError) {
    return (
      <div className="relative w-full h-full bg-gray-100 overflow-hidden">
        <img
          src={fileUrl}
          alt={title}
          className="w-full h-full object-cover"
          style={{ filter: "blur(0.8px)" }}
          onError={(e) => {
            console.error("Image load error:", fileUrl);
            setImageError(true);
          }}
          loading="lazy"
        />
        <div className="absolute inset-0 bg-white/5"></div>
        {!compact && (
          <div className="absolute bottom-1 left-1 bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] text-white font-medium flex items-center gap-1 z-10">
            <ImageIcon className="h-2.5 w-2.5" />
            {fileExtension}
          </div>
        )}
      </div>
    );
  }

  // PDF Files - Show embedded PDF preview (blurred)
  if (isPDF) {
    return (
      <div className="relative w-full h-full bg-white overflow-hidden">
        <iframe
          src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=0`}
          className="w-full h-full border-0 scale-110 pointer-events-none"
          style={{ filter: "blur(0.8px)" }}
          title={title}
        />
        <div className="absolute inset-0 bg-white/5 pointer-events-none"></div>
        {!compact && (
          <div className="absolute bottom-1 left-1 bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] text-white font-medium flex items-center gap-1 z-10">
            <FileText className="h-2.5 w-2.5" />
            PDF
          </div>
        )}
      </div>
    );
  }

  // Word Files - Show blurred document preview (simulated)
  if (isWord) {
    return (
      <div className="relative w-full h-full bg-white overflow-hidden">
        <div
          className="w-full h-full bg-white p-3 sm:p-4"
          style={{ filter: "blur(0.8px)" }}
        >
          <div className="space-y-1.5 sm:space-y-2">
            <div className="h-3 sm:h-3.5 bg-gray-800 rounded-sm w-2/3"></div>
            <div className="h-2 sm:h-2.5 bg-gray-600 rounded-sm w-1/2 mb-3"></div>
            <div className="h-1.5 sm:h-2 bg-gray-700 rounded-sm w-full"></div>
            <div className="h-1.5 sm:h-2 bg-gray-700 rounded-sm w-full"></div>
            <div className="h-1.5 sm:h-2 bg-gray-700 rounded-sm w-11/12"></div>
            <div className="h-1.5 sm:h-2 bg-gray-700 rounded-sm w-full"></div>
            <div className="h-1.5 sm:h-2 bg-gray-700 rounded-sm w-10/12"></div>
            {!compact && (
              <>
                <div className="h-1.5 sm:h-2 bg-gray-700 rounded-sm w-full mt-2"></div>
                <div className="h-1.5 sm:h-2 bg-gray-700 rounded-sm w-full"></div>
                <div className="h-1.5 sm:h-2 bg-gray-700 rounded-sm w-9/12"></div>
                <div className="h-1.5 sm:h-2 bg-gray-700 rounded-sm w-full"></div>
              </>
            )}
          </div>
        </div>
        <div className="absolute inset-0 bg-white/5 pointer-events-none"></div>
        {!compact && (
          <div className="absolute bottom-1 left-1 bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] text-white font-medium flex items-center gap-1 z-10">
            <FileText className="h-2.5 w-2.5" />
            {fileExtension}
          </div>
        )}
      </div>
    );
  }

  // Other Files - Show generic file icon
  return (
    <div className="relative w-full h-full bg-gray-100 overflow-hidden">
      <div
        className={`w-full h-full flex items-center justify-center ${getCategoryGradient()}`}
      >
        <div className="text-center">
          <div
            className={`${
              compact ? "h-10 w-10" : "h-16 w-16"
            } rounded-full ${getCategoryIconColor()
              .replace("text-", "bg-")
              .replace(
                "-600",
                "-100"
              )} flex items-center justify-center mx-auto mb-2`}
          >
            <File
              className={`${
                compact ? "h-5 w-5" : "h-8 w-8"
              } ${getCategoryIconColor()}`}
            />
          </div>
          {!compact && (
            <>
              <p className="text-sm font-bold text-gray-800">{fileExtension}</p>
              <p className="text-[10px] text-gray-600">File</p>
            </>
          )}
        </div>
      </div>
      {!compact && (
        <div className="absolute bottom-1 left-1 bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] text-white font-medium flex items-center gap-1">
          <File className="h-2.5 w-2.5" />
          {fileExtension}
        </div>
      )}
    </div>
  );
}
