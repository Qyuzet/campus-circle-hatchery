"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, X, Loader2, FileText } from "lucide-react";
import { toast } from "sonner";
import { fileAPI } from "@/lib/api";

interface MarketplaceItem {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  course: string;
  imageUrl?: string;
  fileUrl?: string;
  fileName?: string;
  thumbnailUrl?: string;
}

interface EditItemFormProps {
  item: MarketplaceItem;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isSaving: boolean;
}

export function EditItemForm({
  item,
  onSubmit,
  onCancel,
  isSaving,
}: EditItemFormProps) {
  const [formData, setFormData] = useState({
    title: item.title,
    description: item.description,
    price: item.price.toString(),
    category: item.category,
    course: item.course,
    imageUrl: item.imageUrl || "",
    fileUrl: item.fileUrl || "",
    fileName: item.fileName || "",
    thumbnailUrl: item.thumbnailUrl || "",
  });

  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      ];

      if (!allowedTypes.includes(selectedFile.type)) {
        toast.error("Please upload a PDF, Word, or PowerPoint file");
        return;
      }

      if (selectedFile.size > 50 * 1024 * 1024) {
        toast.error("File size must be less than 50MB");
        return;
      }

      setFile(selectedFile);
    }
  };

  const uploadFile = async () => {
    if (!file) return null;

    setIsUploading(true);
    try {
      const result = await fileAPI.uploadFile(file);
      toast.success("File uploaded successfully!");
      return result;
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Failed to upload file. Please try again.");
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let fileData = {
      fileUrl: formData.fileUrl,
      fileName: formData.fileName,
      thumbnailUrl: formData.thumbnailUrl,
    };

    if (file) {
      const uploadedFile = await uploadFile();
      if (uploadedFile) {
        fileData = {
          fileUrl: uploadedFile.fileUrl,
          fileName: uploadedFile.fileName,
          thumbnailUrl: uploadedFile.thumbnailUrl,
        };
      } else {
        toast.error("Failed to upload file. Please try again.");
        return;
      }
    }

    onSubmit({
      ...formData,
      ...fileData,
      price: parseInt(formData.price),
    });
  };

  const handleRemoveFile = () => {
    setFile(null);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 max-h-[75vh] overflow-y-auto px-1"
    >
      <div>
        <Label>Title</Label>
        <Input
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
          className="text-sm"
        />
      </div>

      <div>
        <Label>Description</Label>
        <Textarea
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          required
          rows={3}
          className="text-sm"
        />
      </div>

      <div>
        <Label>Price (IDR)</Label>
        <Input
          type="number"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          required
          min="0"
          className="text-sm"
        />
      </div>

      <div>
        <Label>Category</Label>
        <select
          value={formData.category}
          onChange={(e) =>
            setFormData({ ...formData, category: e.target.value })
          }
          required
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="Notes">Notes</option>
          <option value="Assignment">Assignment</option>
          <option value="Book">Book</option>
          <option value="Tutorial">Tutorial</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div>
        <Label>Course Code</Label>
        <Input
          value={formData.course}
          onChange={(e) => setFormData({ ...formData, course: e.target.value })}
          required
          placeholder="e.g., COMP6048"
          className="text-sm"
        />
      </div>

      <div>
        <Label>Study Material File (Optional)</Label>
        <div className="mt-2">
          {file || formData.fileName ? (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <span className="text-sm text-gray-700">
                  {file?.name || formData.fileName}
                </span>
              </div>
              <button
                type="button"
                onClick={handleRemoveFile}
                className="text-red-500 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors">
              <div className="flex flex-col items-center justify-center">
                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">
                  Click to upload new file
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PDF, Word, or PowerPoint (Max 50MB)
                </p>
              </div>
              <input
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx,.ppt,.pptx"
                onChange={handleFileChange}
              />
            </label>
          )}
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSaving || isUploading}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSaving || isUploading}
          className="flex-1 bg-dark-blue hover:bg-blue-700"
        >
          {isSaving || isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isUploading ? "Uploading..." : "Saving..."}
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </form>
  );
}
