// File Upload API Route
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { v2 as cloudinary } from "cloudinary";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// POST /api/upload - Upload file to Cloudinary
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size exceeds 10MB limit" },
        { status: 400 }
      );
    }

    // ONLY ACCEPT PDF FILES
    if (file.type !== "application/pdf") {
      return NextResponse.json(
        {
          error:
            "Only PDF files are allowed. Please convert your file to PDF first.",
        },
        { status: 400 }
      );
    }

    // Convert file to base64 for Cloudinary upload
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");
    const dataURI = `data:${file.type};base64,${base64}`;

    console.log("📤 Uploading PDF to Cloudinary:", file.name);

    // Upload PDF to Cloudinary as "raw" type (PDFs cannot be uploaded as "image")
    const uploadResult = await cloudinary.uploader.upload(dataURI, {
      resource_type: "raw", // PDFs must be uploaded as "raw" type
      folder: "campus-circle",
      public_id: `${Date.now()}-${file.name.replace(/\.[^/.]+$/, "")}`,
      type: "upload",
      access_mode: "public",
    });

    console.log("✅ PDF uploaded successfully:", uploadResult.secure_url);

    return NextResponse.json({
      success: true,
      url: uploadResult.secure_url,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    });
  } catch (error: any) {
    console.error("❌ Upload error:", error);

    // Return detailed error message
    const errorMessage = error?.message || "Failed to upload file";
    return NextResponse.json(
      {
        error: errorMessage,
        details: error?.error?.message || "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
