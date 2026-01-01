"use client";

import { useState, useRef } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface MediaUploadProps {
  type: "image" | "video" | "audio" | "file";
  currentUrl?: string;
  onUpload: (url: string, file: File) => void;
  onRemove: () => void;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

export function MediaUpload({
  type,
  currentUrl,
  onUpload,
  onRemove,
  icon: Icon,
  label,
}: MediaUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptedTypes = {
    image: "image/*",
    video: "video/*",
    audio: "audio/*",
    file: "*/*",
  };

  const handleFileSelect = async (file: File) => {
    if (type !== "file") {
      const expectedType = type;
      if (!file.type.startsWith(expectedType)) {
        toast.error(`Please select a valid ${type} file`);
        return;
      }
    }

    setIsUploading(true);
    try {
      const url = URL.createObjectURL(file);
      onUpload(url, file);
      toast.success(`${label} uploaded successfully`);
    } catch (error) {
      toast.error(`Failed to upload ${type}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  if (currentUrl) {
    return (
      <div className="relative group">
        {type === "image" && (
          <img
            src={currentUrl}
            alt="Uploaded"
            className="max-w-full h-auto rounded-lg"
          />
        )}
        {type === "video" && (
          <video src={currentUrl} controls className="max-w-full rounded-lg" />
        )}
        {type === "audio" && (
          <audio src={currentUrl} controls className="w-full" />
        )}
        {type === "file" && (
          <div className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <Icon className="h-6 w-6 text-gray-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                {currentUrl.split("/").pop()}
              </p>
              <p className="text-xs text-gray-500">File attached</p>
            </div>
          </div>
        )}
        <button
          onClick={onRemove}
          className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
          title="Remove"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={() => fileInputRef.current?.click()}
      className={`p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-all ${
        isDragging
          ? "border-blue-500 bg-blue-50"
          : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes[type]}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelect(file);
        }}
        className="hidden"
      />
      {isUploading ? (
        <Loader2 className="h-8 w-8 text-blue-500 mx-auto mb-2 animate-spin" />
      ) : (
        <Icon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
      )}
      <p className="text-sm text-gray-600 font-medium mb-1">
        {isUploading ? "Uploading..." : `Click to upload ${label}`}
      </p>
      <p className="text-xs text-gray-400">or drag and drop</p>
    </div>
  );
}

