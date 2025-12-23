"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Loader2, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

export default function AIMetadataGenerator() {
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [status, setStatus] = useState("Ready to start...");
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    processed: 0,
    successful: 0,
    failed: 0,
  });

  const generateMetadata = async () => {
    try {
      setProcessing(true);
      setResults([]);
      setStatus("Fetching items without AI metadata...");
      setProgress(0);

      const response = await fetch("/api/admin/generate-ai-metadata", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to start metadata generation");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("No response body");
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter((line) => line.trim());

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.type === "stats") {
                setStats(data.stats);
                setStatus(
                  `Found ${data.stats.total} items without AI metadata`
                );
              } else if (data.type === "progress") {
                setStatus(data.message);
                setProgress((data.current / data.total) * 100);
              } else if (data.type === "result") {
                setResults((prev) => [...prev, data.result]);
                setStats((prev) => ({
                  ...prev,
                  processed: data.result.index,
                  successful: prev.successful + (data.result.success ? 1 : 0),
                  failed: prev.failed + (data.result.success ? 0 : 1),
                }));
              } else if (data.type === "complete") {
                setStatus("Metadata generation complete!");
                setProgress(100);
                toast.success("AI Metadata Generation Complete", {
                  description: `Successfully generated metadata for ${data.stats.successful} items`,
                });
              } else if (data.type === "error") {
                throw new Error(data.message);
              }
            } catch (e) {
              console.error("Error parsing SSE data:", e);
            }
          }
        }
      }
    } catch (error: any) {
      console.error("Error generating metadata:", error);
      toast.error("Failed to generate metadata", {
        description: error.message,
      });
      setStatus("Error: " + error.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          AI Metadata Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Generate AI metadata for existing items that do not have it yet.
            This will analyze study materials, food items, and events to create
            searchable metadata for future AI features.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Button
            onClick={generateMetadata}
            disabled={processing}
            className="w-full sm:w-auto"
          >
            {processing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Metadata...
              </>
            ) : (
              <>
                <Brain className="mr-2 h-4 w-4" />
                Generate AI Metadata
              </>
            )}
          </Button>
        </div>

        {processing && (
          <div className="space-y-2">
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-muted-foreground">{status}</p>
          </div>
        )}

        {stats.total > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-xs text-blue-600 font-medium">Total Items</p>
              <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-600 font-medium">Processed</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.processed}
              </p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-xs text-green-600 font-medium">Successful</p>
              <p className="text-2xl font-bold text-green-900">
                {stats.successful}
              </p>
            </div>
            <div className="bg-red-50 p-3 rounded-lg">
              <p className="text-xs text-red-600 font-medium">Failed</p>
              <p className="text-2xl font-bold text-red-900">{stats.failed}</p>
            </div>
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Processing Results:</h3>
            <div className="max-h-96 overflow-y-auto space-y-2">
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${
                    result.success
                      ? "bg-green-50 border-green-200"
                      : "bg-red-50 border-red-200"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {result.success ? (
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {result.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {result.type} - {result.id}
                      </p>
                      {result.message && (
                        <p
                          className={`text-xs mt-1 ${
                            result.success ? "text-green-700" : "text-red-700"
                          }`}
                        >
                          {result.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
