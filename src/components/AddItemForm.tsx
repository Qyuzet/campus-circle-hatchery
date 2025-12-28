"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, X, Loader2, Sparkles, FileText } from "lucide-react";
import { toast } from "sonner";
import { fileAPI } from "@/lib/api";

interface AddItemFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export function AddItemForm({ onSubmit, onCancel }: AddItemFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "Notes",
    course: "",
  });
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiMetadata, setAiMetadata] = useState<any>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "image/jpeg",
        "image/jpg",
        "image/png",
      ];

      if (!allowedTypes.includes(file.type)) {
        toast.error(
          "Only PDF, Word (DOC/DOCX), and image files (JPG/PNG) are allowed."
        );
        e.target.value = "";
        return;
      }

      setUploadedFile(file);
      await analyzeWithAI(file);
    }
  };

  const analyzeWithAI = async (file: File) => {
    try {
      setIsAnalyzing(true);
      toast.info("Analyzing file with AI...", { duration: 2000 });

      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "study");

      const response = await fetch("/api/ai-autofill", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to analyze file");

      const result = await response.json();

      if (result.success && result.data) {
        const aiData = result.data;

        setFormData((prev) => ({
          ...prev,
          title: aiData.title || prev.title,
          description: aiData.description || prev.description,
          category: aiData.category || prev.category,
          course: aiData.course || prev.course,
        }));

        setAiMetadata({
          analyzedAt: new Date().toISOString(),
          aiModel: "gemini-2.5-flash",
          fileInfo: {
            originalName: file.name,
            fileType: file.type,
            fileSize: file.size,
          },
          extractedData: aiData,
          ...(aiData.metadata || {}),
        });

        toast.success("Form auto-filled with AI suggestions!", {
          description: "Review and adjust the information as needed.",
        });
      }
    } catch (error) {
      console.error("AI analysis error:", error);
      toast.error("Could not analyze file", {
        description: "Please fill in the form manually.",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateThumbnail = async (file: File): Promise<string | null> => {
    try {
      const isPdf = file.type === "application/pdf";

      if (!isPdf) {
        return null;
      }

      const pdfjsLib = (window as any).pdfjsLib;
      if (!pdfjsLib) {
        const script = document.createElement("script");
        script.src =
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
        script.onload = () => {
          (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc =
            "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
        };
        document.head.appendChild(script);
        await new Promise((res) => setTimeout(res, 2000));
      }

      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = (window as any).pdfjsLib.getDocument({
        data: arrayBuffer,
      });
      const pdf = await loadingTask.promise;
      const page = await pdf.getPage(1);

      const viewport = page.getViewport({ scale: 2.0 });
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({ canvasContext: context, viewport }).promise;

      const thumbnailBlob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error("Failed to create thumbnail"));
          },
          "image/jpeg",
          0.85
        );
      });

      const formData = new FormData();
      formData.append("file", thumbnailBlob, `thumbnail-${Date.now()}.jpg`);

      const response = await fetch("/api/upload-thumbnail", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      return data.success ? data.thumbnailUrl : null;
    } catch (error) {
      console.error("Thumbnail generation error:", error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.title ||
      !formData.description ||
      !formData.price ||
      !formData.course
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!uploadedFile) {
      toast.error("Please upload a file");
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(30);

      const uploadResult = await fileAPI.uploadFile(uploadedFile, false);
      setUploadProgress(50);

      if (!uploadResult.success || !uploadResult.url) {
        throw new Error("Upload failed");
      }

      setUploadProgress(60);
      const thumbnailUrl = await generateThumbnail(uploadedFile);
      setUploadProgress(80);

      const fileData = {
        fileUrl: uploadResult.url,
        fileName: uploadResult.fileName,
        fileSize: uploadResult.fileSize,
        fileType: uploadResult.fileType,
        thumbnailUrl: thumbnailUrl || undefined,
      };

      setUploadProgress(90);

      await onSubmit({
        ...formData,
        price: parseInt(formData.price),
        ...fileData,
        aiMetadata,
      });

      setUploadProgress(100);
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(error.message || "Failed to add item. Please try again.");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2.5">
      <div>
        <label className="flex items-center gap-1.5 text-xs font-medium text-dark-gray mb-0.5">
          Upload File (PDF, Word, or Image) *
          <span className="flex items-center gap-0.5 text-[10px] text-purple-600 font-normal">
            <Sparkles className="h-2.5 w-2.5" />
            AI Auto-fill enabled
          </span>
        </label>
        <div className="mt-0.5">
          <input
            type="file"
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png"
            className="w-full px-2 py-1 border border-light-gray rounded-md focus:outline-none focus:ring-1 focus:ring-dark-blue focus:border-dark-blue text-xs"
            required
          />
          {isAnalyzing && (
            <div className="mt-1.5 p-1.5 bg-purple-50 border border-purple-200 rounded-md flex items-center gap-1.5">
              <Loader2 className="h-3 w-3 text-purple-600 animate-spin" />
              <span className="text-xs text-purple-700">
                Analyzing document with AI...
              </span>
            </div>
          )}
          {uploadedFile && !isAnalyzing && (
            <div className="mt-1.5 p-1.5 bg-green-50 border border-green-200 rounded-md flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <FileText className="h-3 w-3 text-green-600" />
                <span className="text-xs text-green-700 truncate">
                  {uploadedFile.name}
                </span>
                <span className="text-[10px] text-green-600">
                  ({(uploadedFile.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              </div>
              <button
                type="button"
                onClick={() => setUploadedFile(null)}
                className="text-red-600 hover:text-red-800"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
        <p className="text-[10px] text-medium-gray mt-0.5">
          AI will automatically analyze your file and fill in the form. Max file
          size: 24MB.
        </p>
      </div>

      <div>
        <Label className="text-sm">Title *</Label>
        <Input
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="e.g., Data Structures Notes"
          required
          className="h-9"
        />
      </div>

      <div>
        <Label className="text-sm">Description *</Label>
        <Textarea
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          placeholder="Describe your item..."
          required
          rows={2}
          className="text-sm"
        />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div>
          <Label className="text-sm">Price (Rp) *</Label>
          <Input
            type="number"
            value={formData.price}
            onChange={(e) =>
              setFormData({ ...formData, price: e.target.value })
            }
            placeholder="50000"
            required
            className="h-9"
          />
        </div>

        <div>
          <Label className="text-sm">Category *</Label>
          <select
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
            className="w-full h-9 px-2.5 text-sm border border-light-gray rounded-md focus:outline-none focus:ring-1 focus:ring-dark-blue focus:border-dark-blue"
            required
          >
            <option value="Notes">Notes</option>
            <option value="Assignment">Assignment</option>
            <option value="Book">Book</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <Label className="text-sm">Course *</Label>
          <Input
            value={formData.course}
            onChange={(e) =>
              setFormData({ ...formData, course: e.target.value })
            }
            placeholder="e.g., COMP6048"
            required
            className="h-9"
          />
        </div>
      </div>

      {uploading && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-medium-gray">Uploading...</span>
            <span className="text-dark-blue font-medium">
              {uploadProgress}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-dark-blue h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      <div className="flex gap-2 pt-2">
        <Button
          type="submit"
          disabled={uploading}
          className="flex-1 bg-dark-blue hover:bg-blue-700 text-white h-9"
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            "Add Item"
          )}
        </Button>
        <Button
          type="button"
          onClick={onCancel}
          variant="outline"
          disabled={uploading}
          className="h-9"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
