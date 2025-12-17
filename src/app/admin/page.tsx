"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Toaster } from "sonner";

interface Withdrawal {
  id: string;
  amount: number;
  status: string;
  paymentMethod: string;
  bankName?: string;
  accountNumber: string;
  accountName: string;
  notes?: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    studentId?: string;
  };
}

interface Stats {
  status: string;
  _count: { id: number };
  _sum: { amount: number };
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [stats, setStats] = useState<Stats[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("PENDING");
  const [processing, setProcessing] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingRole, setCheckingRole] = useState(true);
  const [activeSection, setActiveSection] = useState<
    "withdrawals" | "thumbnails"
  >("withdrawals");
  const [thumbnailProcessing, setThumbnailProcessing] = useState(false);
  const [thumbnailResults, setThumbnailResults] = useState<any[]>([]);
  const [thumbnailStatus, setThumbnailStatus] = useState("Ready to start...");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated") {
      checkAdminRole();
    }
  }, [status, router]);

  const checkAdminRole = async () => {
    try {
      const response = await fetch("/api/user/me");
      const data = await response.json();

      if (data.role !== "admin") {
        toast.error("Access denied. Admin only.");
        router.push("/dashboard");
        return;
      }

      setIsAdmin(true);
    } catch (error) {
      console.error("Failed to check role:", error);
      router.push("/dashboard");
    } finally {
      setCheckingRole(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated" && isAdmin) {
      loadWithdrawals();
    }
  }, [status, filter, isAdmin]);

  const loadWithdrawals = async () => {
    setLoading(true);
    try {
      const url = filter
        ? `/api/admin/withdrawals?status=${filter}`
        : "/api/admin/withdrawals";
      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setWithdrawals(data.withdrawals);
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Failed to load withdrawals:", error);
      toast.error("Failed to load withdrawals");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (
    withdrawalId: string,
    newStatus: string
  ) => {
    setProcessing(withdrawalId);
    try {
      const response = await fetch(`/api/withdrawals/${withdrawalId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update status");
      }

      toast.success(`Withdrawal ${newStatus.toLowerCase()}`);
      loadWithdrawals();
    } catch (error: any) {
      toast.error(error.message || "Failed to update withdrawal");
    } finally {
      setProcessing(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: "bg-yellow-100 text-yellow-800 border-yellow-300",
      APPROVED: "bg-blue-100 text-blue-800 border-blue-300",
      PROCESSING: "bg-purple-100 text-purple-800 border-purple-300",
      COMPLETED: "bg-green-100 text-green-800 border-green-300",
      REJECTED: "bg-red-100 text-red-800 border-red-300",
      FAILED: "bg-gray-100 text-gray-800 border-gray-300",
    };
    return <Badge className={`${colors[status] || ""} border`}>{status}</Badge>;
  };

  const getSummary = (status: string) => {
    const stat = stats.find((s) => s.status === status);
    return {
      count: stat?._count.id || 0,
      total: stat?._sum.amount || 0,
    };
  };

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

  if (status === "loading" || checkingRole || (loading && isAdmin)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {checkingRole ? "Checking permissions..." : "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-center" richColors />

      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push("/dashboard")}
                className="flex items-center hover:opacity-80"
              >
                <img
                  src="/campusCircle-logo.png"
                  alt="Logo"
                  className="h-8 w-8"
                />
                <span className="ml-2 text-xl font-bold">
                  <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                    Campus
                  </span>
                  <span className="text-gray-800">Circle</span>
                </span>
              </button>
              <Badge className="bg-red-600 text-white">ADMIN</Badge>
            </div>
            <div className="text-sm text-gray-600">
              {session?.user?.name || session?.user?.email}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Section Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveSection("withdrawals")}
            className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeSection === "withdrawals"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            Withdrawal Management
          </button>
          <button
            onClick={() => setActiveSection("thumbnails")}
            className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeSection === "thumbnails"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            Document Thumbnails
          </button>
        </div>

        {activeSection === "withdrawals" && (
          <>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">
                Withdrawal Management
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Approve or reject withdrawal requests
              </p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {["PENDING", "APPROVED", "COMPLETED", "REJECTED"].map(
                (status) => {
                  const summary = getSummary(status);
                  return (
                    <Card key={status} className="border">
                      <CardContent className="p-3">
                        <div className="text-xs text-gray-600 mb-1">
                          {status}
                        </div>
                        <div className="text-lg font-bold text-gray-900">
                          {summary.count}
                        </div>
                        <div className="text-[10px] text-gray-500">
                          Rp {summary.total.toLocaleString()}
                        </div>
                      </CardContent>
                    </Card>
                  );
                }
              )}
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-4 overflow-x-auto">
              {[
                "PENDING",
                "APPROVED",
                "PROCESSING",
                "COMPLETED",
                "REJECTED",
              ].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-3 py-1.5 text-xs font-medium rounded border transition-colors whitespace-nowrap ${
                    filter === status
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-700 border-gray-300 hover:border-blue-600"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            {/* Withdrawals List */}
            <div className="space-y-3">
              {withdrawals.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center text-gray-500">
                    No {filter.toLowerCase()} withdrawals
                  </CardContent>
                </Card>
              ) : (
                withdrawals.map((withdrawal) => (
                  <Card key={withdrawal.id} className="border">
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        {/* Left: User & Bank Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {getStatusBadge(withdrawal.status)}
                            <span className="text-xs text-gray-500">
                              {new Date(
                                withdrawal.createdAt
                              ).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="text-sm font-medium text-gray-900">
                            {withdrawal.user.name}
                          </div>
                          <div className="text-xs text-gray-600">
                            {withdrawal.user.email} •{" "}
                            {withdrawal.user.studentId || "No ID"}
                          </div>
                          <div className="mt-2 text-xs text-gray-700">
                            <div>
                              <strong>Method:</strong>{" "}
                              {withdrawal.paymentMethod === "GOPAY"
                                ? "GoPay"
                                : withdrawal.paymentMethod}
                              {withdrawal.bankName &&
                                ` - ${withdrawal.bankName}`}
                            </div>
                            <div>
                              <strong>Account:</strong>{" "}
                              {withdrawal.accountNumber} -{" "}
                              {withdrawal.accountName}
                            </div>
                            {withdrawal.notes && (
                              <div className="mt-1 text-gray-600">
                                <strong>Notes:</strong> {withdrawal.notes}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Right: Amount & Actions */}
                        <div className="flex flex-col items-end gap-2">
                          <div className="text-xl font-bold text-gray-900">
                            Rp {withdrawal.amount.toLocaleString()}
                          </div>

                          {withdrawal.status === "PENDING" && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleUpdateStatus(withdrawal.id, "REJECTED")
                                }
                                disabled={processing === withdrawal.id}
                                className="text-xs h-7 border-red-300 text-red-700 hover:bg-red-50"
                              >
                                Reject
                              </Button>
                              <Button
                                size="sm"
                                onClick={() =>
                                  handleUpdateStatus(withdrawal.id, "APPROVED")
                                }
                                disabled={processing === withdrawal.id}
                                className="text-xs h-7 bg-blue-600 hover:bg-blue-700"
                              >
                                {processing === withdrawal.id
                                  ? "Processing..."
                                  : "Approve"}
                              </Button>
                            </div>
                          )}

                          {withdrawal.status === "APPROVED" && (
                            <Button
                              size="sm"
                              onClick={() =>
                                handleUpdateStatus(withdrawal.id, "COMPLETED")
                              }
                              disabled={processing === withdrawal.id}
                              className="text-xs h-7 bg-green-600 hover:bg-green-700"
                            >
                              {processing === withdrawal.id
                                ? "Processing..."
                                : "Mark Completed"}
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </>
        )}

        {activeSection === "thumbnails" && (
          <div>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">
                Document Thumbnail Generator
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Generate thumbnails for PDFs and Word documents that don't have
                them yet
              </p>
            </div>

            <Card className="mb-6">
              <CardContent className="p-6">
                <Button
                  onClick={generateThumbnails}
                  disabled={thumbnailProcessing}
                  className="bg-blue-600 hover:bg-blue-700 mb-4"
                >
                  {thumbnailProcessing
                    ? "Processing..."
                    : "Start Generating Thumbnails"}
                </Button>

                <div className="bg-gray-100 p-4 rounded-lg">
                  <pre className="text-sm whitespace-pre-wrap">
                    {thumbnailStatus}
                  </pre>
                </div>
              </CardContent>
            </Card>

            {thumbnailResults.length > 0 && (
              <div className="space-y-4">
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
                      <div className="font-semibold">{result.title}</div>
                      <div className="text-sm text-gray-600">
                        {result.success
                          ? "✓ Success!"
                          : `✗ Error: ${result.error}`}
                      </div>
                      {result.success && result.thumbnailUrl && (
                        <img
                          src={result.thumbnailUrl}
                          alt={result.title}
                          className="mt-2 max-w-xs border rounded"
                        />
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
