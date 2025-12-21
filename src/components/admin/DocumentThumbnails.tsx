"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function DocumentThumbnails() {
  const [thumbnailProcessing, setThumbnailProcessing] = useState(false);
  const [thumbnailResults, setThumbnailResults] = useState<any[]>([]);
  const [thumbnailStatus, setThumbnailStatus] = useState("Ready to start...");

  const generatePdfThumbnail = async (pdfUrl: string): Promise<Blob> => {
    return new Promise(async (resolve, reject) => {
      try {
        const loadingTask = (window as any).pdfjsLib.getDocument(pdfUrl);
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1);

        const viewport = page.getViewport({ scale: 2.0 });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({ canvasContext: context, viewport: viewport })
          .promise;

        const targetWidth = 800;
        const scale = targetWidth / canvas.width;
        const targetHeight = canvas.height * scale;

        const resizedCanvas = document.createElement("canvas");
        resizedCanvas.width = targetWidth;
        resizedCanvas.height = targetHeight;
        const resizedContext = resizedCanvas.getContext("2d");
        resizedContext?.drawImage(canvas, 0, 0, targetWidth, targetHeight);

        resizedCanvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error("Failed to create blob"));
          },
          "image/jpeg",
          0.85
        );
      } catch (error) {
        reject(error);
      }
    });
  };

  const generateWordThumbnail = async (fileUrl: string): Promise<Blob> => {
    return new Promise(async (resolve, reject) => {
      try {
        const formData = new FormData();
        formData.append("fileUrl", fileUrl);

        const response = await fetch("/api/generate-word-thumbnail", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Failed to extract Word content");
        }

        const data = await response.json();
        const lines = data.lines || [];

        const canvas = document.createElement("canvas");
        canvas.width = 800;
        canvas.height = 1000;
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          reject(new Error("Failed to get canvas context"));
          return;
        }

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, 800, 1000);

        ctx.fillStyle = "#1e3a8a";
        ctx.fillRect(0, 0, 800, 60);

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 24px Arial";
        ctx.fillText("DOCX", 30, 38);

        ctx.fillStyle = "#000000";
        ctx.font = "16px Arial";

        let yPosition = 100;
        const lineHeight = 24;
        const maxWidth = 740;

        for (let i = 0; i < Math.min(lines.length, 25); i++) {
          const line = lines[i];
          if (line.length > 80) {
            const words = line.split(" ");
            let currentLine = "";

            for (const word of words) {
              const testLine = currentLine + word + " ";
              const metrics = ctx.measureText(testLine);

              if (metrics.width > maxWidth && currentLine !== "") {
                ctx.fillText(currentLine, 30, yPosition);
                yPosition += lineHeight;
                currentLine = word + " ";

                if (yPosition > 950) break;
              } else {
                currentLine = testLine;
              }
            }

            if (currentLine && yPosition <= 950) {
              ctx.fillText(currentLine, 30, yPosition);
              yPosition += lineHeight;
            }
          } else {
            ctx.fillText(line, 30, yPosition);
            yPosition += lineHeight;
          }

          if (yPosition > 950) break;
        }

        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error("Failed to create blob"));
          },
          "image/jpeg",
          0.85
        );
      } catch (error) {
        reject(error);
      }
    });
  };

  const generateThumbnails = async () => {
    setThumbnailProcessing(true);
    setThumbnailStatus("Fetching documents without thumbnails...");
    setThumbnailResults([]);

    try {
      const response = await fetch("/api/admin/check-pdfs");
      const data = await response.json();

      const docsWithoutThumbnails = data.allPdfs.filter(
        (doc: any) => !doc.thumbnailUrl
      );

      if (docsWithoutThumbnails.length === 0) {
        setThumbnailStatus("No documents need thumbnails!");
        setThumbnailProcessing(false);
        return;
      }

      setThumbnailStatus(
        `Found ${docsWithoutThumbnails.length} documents. Starting generation...`
      );

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
        await new Promise((res) => setTimeout(res, 1000));
      }

      for (let i = 0; i < docsWithoutThumbnails.length; i++) {
        const doc = docsWithoutThumbnails[i];
        setThumbnailStatus(
          `Processing ${i + 1}/${docsWithoutThumbnails.length}: ${doc.title}`
        );

        try {
          let thumbnailBlob: Blob;
          const isWordDoc =
            doc.fileType === "application/msword" ||
            doc.fileType ===
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

          if (isWordDoc) {
            thumbnailBlob = await generateWordThumbnail(doc.fileUrl);
          } else {
            thumbnailBlob = await generatePdfThumbnail(doc.fileUrl);
          }

          const formData = new FormData();
          formData.append(
            "file",
            thumbnailBlob,
            `thumbnail-${Date.now()}-${doc.fileName.replace(
              /\.(pdf|doc|docx)$/i,
              ".jpg"
            )}`
          );
          formData.append("itemId", doc.id);

          const uploadResponse = await fetch("/api/admin/upload-thumbnail", {
            method: "POST",
            body: formData,
          });

          const uploadData = await uploadResponse.json();

          if (uploadData.success) {
            setThumbnailResults((prev) => [
              ...prev,
              { ...doc, success: true, thumbnailUrl: uploadData.thumbnailUrl },
            ]);
          } else {
            throw new Error(uploadData.error || "Upload failed");
          }
        } catch (error: any) {
          setThumbnailResults((prev) => [
            ...prev,
            { ...doc, success: false, error: error.message },
          ]);
        }
      }

      setThumbnailStatus("All done!");
      toast.success("Thumbnail generation completed!");
    } catch (error: any) {
      setThumbnailStatus(`Error: ${error.message}`);
      toast.error("Failed to generate thumbnails");
    } finally {
      setThumbnailProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Document Thumbnail Generator
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Generate thumbnails for PDFs and Word documents that don&apos;t have
          them yet
        </p>
      </div>

      {/* Generator Card */}
      <Card>
        <CardContent className="p-6">
          <Button
            onClick={generateThumbnails}
            disabled={thumbnailProcessing}
            className="bg-blue-600 hover:bg-blue-700 mb-4"
          >
            {thumbnailProcessing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              "Start Generating Thumbnails"
            )}
          </Button>

          <div className="bg-gray-100 p-4 rounded-lg">
            <pre className="text-sm whitespace-pre-wrap">{thumbnailStatus}</pre>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {thumbnailResults.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Results</h3>
          {thumbnailResults.map((result, index) => (
            <Card
              key={index}
              className={`border-l-4 ${
                result.success
                  ? "border-green-500 bg-green-50"
                  : "border-red-500 bg-red-50"
              }`}
            >
              <CardContent className="p-4">
                <div className="font-semibold text-gray-900">
                  {result.title}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {result.success ? "✓ Success!" : `✗ Error: ${result.error}`}
                </div>
                {result.success && result.thumbnailUrl && (
                  <img
                    src={result.thumbnailUrl}
                    alt={result.title}
                    className="mt-3 max-w-xs border rounded shadow-sm"
                  />
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
