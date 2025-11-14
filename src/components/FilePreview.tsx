"use client";

import React from "react";
import { FileText, File } from "lucide-react";

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
  const fileExtension = fileName?.split(".").pop()?.toUpperCase() || "PDF";

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

  // PDF Files - Use Cloudinary transformation for thumbnails
  const isCloudinary = fileUrl.includes("cloudinary.com");
  const thumbnailUrl = isCloudinary
    ? fileUrl.replace(
        "/upload/",
        compact
          ? "/upload/pg_1,w_100,h_100,c_fill,f_jpg/"
          : "/upload/pg_1,w_600,h_400,c_fill,f_jpg/"
      )
    : fileUrl;

  return (
    <div className="relative w-full h-full bg-gray-100 overflow-hidden">
      {isCloudinary && !imageError ? (
        <img
          src={thumbnailUrl}
          alt={title}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <div
          className={`w-full h-full flex items-center justify-center ${getCategoryGradient()}`}
        >
          <div className="text-center">
            <FileText
              className={`${
                compact ? "h-5 w-5" : "h-8 w-8"
              } ${getCategoryIconColor()} mx-auto`}
            />
            {!compact && (
              <p className="text-[10px] font-semibold text-gray-700 mt-1">
                PDF
              </p>
            )}
          </div>
        </div>
      )}
      {!compact && (
        <div className="absolute bottom-1 left-1 bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] text-white font-medium flex items-center gap-1">
          <FileText className="h-2.5 w-2.5" />
          PDF
        </div>
      )}
    </div>
  );
}
