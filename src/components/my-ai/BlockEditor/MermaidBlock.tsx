"use client";

import { useState, useEffect, useRef } from "react";
import { Code, Eye, Copy, Check, Maximize2 } from "lucide-react";
import mermaid from "mermaid";

interface MermaidBlockProps {
  code: string;
  onUpdate: (code: string) => void;
}

const DEFAULT_MERMAID = `graph TD
    A[Start] --> B[Process]
    B --> C{Decision}
    C -->|Yes| D[Action 1]
    C -->|No| E[Action 2]
    D --> F[End]
    E --> F`;

let mermaidInitialized = false;

export function MermaidBlock({ code, onUpdate }: MermaidBlockProps) {
  const [isEditing, setIsEditing] = useState(!code);
  const [editedCode, setEditedCode] = useState(code || DEFAULT_MERMAID);
  const [copied, setCopied] = useState(false);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 300 });
  const [isResizing, setIsResizing] = useState(false);
  const [diagramKey, setDiagramKey] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const renderCountRef = useRef(0);
  const resizeStartRef = useRef({ x: 0, y: 0, width: 0, height: 0 });

  useEffect(() => {
    if (!cardRef.current) return;

    let hasSetWidth = false;

    const updateWidth = () => {
      if (cardRef.current && !hasSetWidth) {
        const parentWidth = cardRef.current.offsetWidth;
        const parentElement = cardRef.current.parentElement;
        const computedWidth = parentElement ? parentElement.offsetWidth : 0;

        const finalWidth = Math.max(parentWidth, computedWidth);

        if (finalWidth > 100) {
          hasSetWidth = true;
          setDimensions((prev) => ({ ...prev, width: finalWidth }));
          setDiagramKey((prev) => prev + 1);
        }
      }
    };

    updateWidth();

    const timeout1 = setTimeout(updateWidth, 50);
    const timeout2 = setTimeout(updateWidth, 150);
    const timeout3 = setTimeout(updateWidth, 300);
    const timeout4 = setTimeout(updateWidth, 500);

    return () => {
      clearTimeout(timeout1);
      clearTimeout(timeout2);
      clearTimeout(timeout3);
      clearTimeout(timeout4);
    };
  }, []);

  useEffect(() => {
    if (!mermaidInitialized) {
      mermaid.initialize({
        startOnLoad: false,
        theme: "neutral",
        securityLevel: "loose",
        fontFamily: "system-ui, -apple-system, sans-serif",
        fontSize: 12,
        flowchart: {
          htmlLabels: true,
          curve: "basis",
          padding: 8,
          nodeSpacing: 30,
          rankSpacing: 30,
          diagramPadding: 8,
          useMaxWidth: true,
        },
      });
      mermaidInitialized = true;
    }
  }, []);

  const handleMouseDown = (e: React.MouseEvent, direction: string) => {
    e.preventDefault();
    setIsResizing(true);
    resizeStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      width: dimensions.width,
      height: dimensions.height,
    };

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - resizeStartRef.current.x;
      const deltaY = e.clientY - resizeStartRef.current.y;

      let newWidth = dimensions.width;
      let newHeight = dimensions.height;

      if (direction.includes("right")) {
        newWidth = Math.max(250, resizeStartRef.current.width + deltaX);
      }
      if (direction.includes("left")) {
        newWidth = Math.max(250, resizeStartRef.current.width - deltaX);
      }
      if (direction.includes("bottom")) {
        newHeight = Math.max(150, resizeStartRef.current.height + deltaY);
      }

      setDimensions({ width: newWidth, height: newHeight });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);

      setDiagramKey((prev) => prev + 1);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const resetSize = () => {
    if (cardRef.current) {
      const width = cardRef.current.offsetWidth;
      setDimensions({ width, height: 300 });
    }
  };

  useEffect(() => {
    if (code && code !== editedCode) {
      setEditedCode(code);
    }
  }, [code]);

  useEffect(() => {
    const codeToRender = code || editedCode;
    if (!isEditing && containerRef.current && codeToRender) {
      renderDiagram(codeToRender);
    }
  }, [code, editedCode, isEditing, diagramKey]);

  const renderDiagram = async (diagramCode: string) => {
    if (!containerRef.current) return;

    try {
      setRenderError(null);

      const cleanCode = diagramCode
        .replace(/```mermaid\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();

      if (!cleanCode) {
        throw new Error("Empty diagram code");
      }

      const id = `mermaid-${Date.now()}-${renderCountRef.current++}`;

      const { svg } = await mermaid.render(id, cleanCode);

      if (containerRef.current) {
        containerRef.current.innerHTML = svg;

        const svgElement = containerRef.current.querySelector("svg");
        if (svgElement) {
          svgElement.removeAttribute("style");

          const viewBox = svgElement.getAttribute("viewBox");
          if (viewBox) {
            const [, , width, height] = viewBox.split(" ").map(Number);
            svgElement.setAttribute("width", String(width * 0.7));
            svgElement.setAttribute("height", String(height * 0.7));
          }

          svgElement.style.maxWidth = "100%";
          svgElement.style.maxHeight = "100%";
          svgElement.style.display = "block";
          svgElement.style.margin = "0 auto";
        }
      }
    } catch (error: any) {
      console.error("Mermaid render error:", error);
      console.error("Failed code:", diagramCode);
      setRenderError(error.message || "Failed to render diagram");

      const errorMessage = error.message || "Invalid Mermaid syntax";
      const escapedCode = diagramCode
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

      if (containerRef.current) {
        containerRef.current.innerHTML = `
          <div class="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <p class="font-semibold text-sm">Failed to render diagram</p>
            <p class="text-xs mt-2 text-red-600">${errorMessage}</p>
            <button
              onclick="this.nextElementSibling.classList.toggle('hidden')"
              class="mt-3 text-xs px-2 py-1 bg-red-100 hover:bg-red-200 rounded font-medium"
            >
              Show Code
            </button>
            <pre class="hidden mt-2 p-3 bg-white rounded text-xs overflow-auto max-h-60 border border-red-300 font-mono">${escapedCode}</pre>
            <p class="mt-3 text-xs text-red-600">
              Tip: Click "Edit code" button above to fix the syntax manually.
            </p>
          </div>
        `;
      }
    }
  };

  const handleSave = () => {
    onUpdate(editedCode);
    setIsEditing(false);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code || editedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      ref={cardRef}
      className="relative border border-gray-200 rounded-lg overflow-hidden bg-white group"
      style={{
        width: dimensions.width > 0 ? `${dimensions.width}px` : "100%",
        maxWidth: "100%",
      }}
    >
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Code className="h-4 w-4 text-gray-600" />
          <span className="font-medium text-sm text-gray-700">
            Mermaid Diagram
          </span>
          <span className="text-xs text-gray-500">
            {dimensions.width}x{dimensions.height}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={resetSize}
            className="p-1.5 hover:bg-gray-200 rounded transition-colors text-gray-600"
            title="Reset size"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
          <button
            onClick={handleCopy}
            className="p-1.5 hover:bg-gray-200 rounded transition-colors text-gray-600"
            title="Copy code"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </button>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`p-1.5 hover:bg-gray-200 rounded transition-colors ${
              isEditing ? "bg-blue-100 text-blue-600" : "text-gray-600"
            }`}
            title={isEditing ? "View diagram" : "Edit code"}
          >
            {isEditing ? (
              <Eye className="h-4 w-4" />
            ) : (
              <Code className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {isEditing ? (
        <div className="p-4">
          <textarea
            value={editedCode}
            onChange={(e) => setEditedCode(e.target.value)}
            className="w-full h-64 p-3 font-mono text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Enter Mermaid diagram code..."
          />
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Save
            </button>
            <button
              onClick={() => {
                setEditedCode(code || DEFAULT_MERMAID);
                setIsEditing(false);
              }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div
          className="relative bg-white overflow-hidden"
          style={{
            height: `${dimensions.height}px`,
          }}
        >
          <div
            ref={containerRef}
            className="w-full h-full flex items-center justify-center overflow-auto p-4"
          />
        </div>
      )}

      <div
        className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-blue-500 hover:bg-opacity-20 transition-colors opacity-0 group-hover:opacity-100 pointer-events-auto"
        onMouseDown={(e) => handleMouseDown(e, "right")}
        title="Drag to resize width"
      />

      <div
        className="absolute left-0 right-0 bottom-0 h-2 cursor-ns-resize hover:bg-blue-500 hover:bg-opacity-20 transition-colors opacity-0 group-hover:opacity-100 pointer-events-auto"
        onMouseDown={(e) => handleMouseDown(e, "bottom")}
        title="Drag to resize height"
      />

      <div
        className="absolute right-0 bottom-0 w-4 h-4 cursor-nwse-resize hover:bg-blue-500 hover:bg-opacity-30 transition-colors opacity-0 group-hover:opacity-100 pointer-events-auto"
        onMouseDown={(e) => handleMouseDown(e, "right-bottom")}
        title="Drag to resize"
      >
        <div className="absolute right-1 bottom-1 w-2 h-2 border-r-2 border-b-2 border-gray-400 opacity-50" />
      </div>

      {isResizing && (
        <div className="absolute inset-0 bg-blue-500 bg-opacity-5 pointer-events-none" />
      )}
    </div>
  );
}
