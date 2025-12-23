// File Upload API Route
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { compressFile } from "@/lib/pdf-compressor";
import { generateUniqueFilename } from "@/lib/sanitize-filename";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/upload - Upload file to Supabase Storage
export async function POST(request: NextRequest) {
  try {
    console.log("Upload API called");

    const session = await auth();

    if (!session?.user) {
      console.log("Unauthorized: No session");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("User authenticated:", session.user.email);

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const forceCompress = formData.get("forceCompress") === "true";

    if (!file) {
      console.log("No file provided");
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    console.log("File received:", {
      name: file.name,
      type: file.type,
      size: file.size,
    });

    // Accept PDF, Word documents, and images
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/jpg",
      "image/png",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            "Only PDF, Word (DOC/DOCX), and image files (JPG/PNG) are allowed.",
        },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    let buffer: Buffer = Buffer.from(bytes);
    const originalSize = buffer.length;
    const maxSize = 20 * 1024 * 1024; // 20MB

    let compressionInfo = {
      wasCompressed: false,
      originalSize: originalSize,
      finalSize: originalSize,
      compressionRatio: 0,
    };

    // Check if file exceeds limit or force compression is requested
    if (originalSize > maxSize || forceCompress) {
      console.log(
        `File size: ${(originalSize / 1024 / 1024).toFixed(2)}MB. ${
          forceCompress
            ? "Force compression requested."
            : "Attempting compression..."
        }`
      );

      try {
        const compressionResult = await compressFile(
          buffer,
          file.type,
          maxSize
        );

        if (compressionResult.success && compressionResult.compressedBuffer) {
          buffer = compressionResult.compressedBuffer;
          compressionInfo = {
            wasCompressed: true,
            originalSize: compressionResult.originalSize,
            finalSize: compressionResult.compressedSize,
            compressionRatio: compressionResult.compressionRatio,
          };

          console.log(
            `Compression successful: ${(
              compressionResult.originalSize /
              1024 /
              1024
            ).toFixed(2)}MB -> ${(
              compressionResult.compressedSize /
              1024 /
              1024
            ).toFixed(2)}MB (${compressionResult.compressionRatio.toFixed(
              1
            )}% reduction)`
          );

          // Check if compressed file still exceeds limit
          if (buffer.length > maxSize) {
            return NextResponse.json(
              {
                error: "File is too large even after compression",
                details: {
                  originalSize: compressionResult.originalSize,
                  compressedSize: compressionResult.compressedSize,
                  maxSize: maxSize,
                  message:
                    "The file could not be compressed enough to meet the 20MB limit. Please try reducing the file size manually or use a different file.",
                },
              },
              { status: 400 }
            );
          }
        } else if (originalSize > maxSize) {
          return NextResponse.json(
            {
              error: compressionResult.error || "File size exceeds 20MB limit",
              details: {
                originalSize: originalSize,
                maxSize: maxSize,
                compressionError: compressionResult.error,
              },
            },
            { status: 400 }
          );
        }
      } catch (compressionError: any) {
        console.error("Compression error:", compressionError);

        // If compression fails but file is under limit, continue without compression
        if (originalSize <= maxSize) {
          console.log(
            "Compression failed but file is under limit, continuing without compression"
          );
        } else {
          return NextResponse.json(
            {
              error: "File compression failed",
              details: {
                originalSize: originalSize,
                maxSize: maxSize,
                compressionError:
                  compressionError.message || "Unknown compression error",
              },
            },
            { status: 500 }
          );
        }
      }
    }

    // Generate unique filename and sanitize it
    const fileName = generateUniqueFilename(file.name);

    console.log("Uploading file to Supabase Storage:", {
      original: file.name,
      sanitized: fileName,
    });

    // Upload file to Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from("study-materials")
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error("Supabase upload error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from("study-materials").getPublicUrl(fileName);

    console.log("File uploaded successfully:", publicUrl);

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: file.name,
      fileSize: buffer.length,
      fileType: file.type,
      compressionInfo,
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    console.error("Error stack:", error?.stack);
    console.error("Error details:", {
      message: error?.message,
      name: error?.name,
      code: error?.code,
    });

    const errorMessage = error?.message || "Failed to upload file";
    return NextResponse.json(
      {
        error: errorMessage,
        details: {
          message: error?.message,
          name: error?.name,
          code: error?.code,
        },
      },
      { status: 500 }
    );
  }
}
