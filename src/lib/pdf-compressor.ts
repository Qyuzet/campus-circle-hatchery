import { PDFDocument } from "pdf-lib";
import sharp from "sharp";
import JSZip from "jszip";

export interface CompressionResult {
  success: boolean;
  compressedBuffer?: Buffer;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  error?: string;
  wasCompressed: boolean;
}

async function compressPDF(
  buffer: Buffer,
  quality: "low" | "medium" | "high" = "medium"
): Promise<CompressionResult> {
  try {
    const originalSize = buffer.length;

    const pdfDoc = await PDFDocument.load(buffer);

    const pages = pdfDoc.getPages();
    for (const page of pages) {
      const { width, height } = page.getSize();

      let scale = 1;
      if (quality === "low") {
        scale = 0.5;
      } else if (quality === "medium") {
        scale = 0.7;
      } else {
        scale = 0.85;
      }

      if (scale < 1) {
        page.scale(scale, scale);
      }
    }

    const compressedBytes = await pdfDoc.save({
      useObjectStreams: true,
      addDefaultPage: false,
      objectsPerTick: 50,
    });

    const compressedBuffer = Buffer.from(compressedBytes);
    const compressedSize = compressedBuffer.length;
    const compressionRatio =
      ((originalSize - compressedSize) / originalSize) * 100;

    return {
      success: true,
      compressedBuffer,
      originalSize,
      compressedSize,
      compressionRatio,
      wasCompressed: true,
    };
  } catch (error: any) {
    return {
      success: false,
      originalSize: buffer.length,
      compressedSize: buffer.length,
      compressionRatio: 0,
      error: error.message || "PDF compression failed",
      wasCompressed: false,
    };
  }
}

async function compressImage(
  buffer: Buffer,
  mimeType: string,
  quality: number = 0.7
): Promise<CompressionResult> {
  try {
    const originalSize = buffer.length;

    let compressedBuffer: Buffer;

    if (mimeType === "image/png") {
      compressedBuffer = await sharp(buffer)
        .png({ quality: Math.round(quality * 100), compressionLevel: 9 })
        .toBuffer();
    } else {
      compressedBuffer = await sharp(buffer)
        .jpeg({ quality: Math.round(quality * 100) })
        .toBuffer();
    }

    const compressedSize = compressedBuffer.length;
    const compressionRatio =
      ((originalSize - compressedSize) / originalSize) * 100;

    return {
      success: true,
      compressedBuffer,
      originalSize,
      compressedSize,
      compressionRatio,
      wasCompressed: true,
    };
  } catch (error: any) {
    return {
      success: false,
      originalSize: buffer.length,
      compressedSize: buffer.length,
      compressionRatio: 0,
      error: error.message || "Image compression failed",
      wasCompressed: false,
    };
  }
}

async function compressWordDocument(
  buffer: Buffer,
  mimeType: string
): Promise<CompressionResult> {
  try {
    const originalSize = buffer.length;

    if (
      mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const zip = await JSZip.loadAsync(buffer);

      const imageFiles = Object.keys(zip.files).filter(
        (filename) =>
          filename.startsWith("word/media/") &&
          (filename.endsWith(".jpg") ||
            filename.endsWith(".jpeg") ||
            filename.endsWith(".png"))
      );

      for (const imageFile of imageFiles) {
        const imageData = await zip.files[imageFile].async("nodebuffer");
        const ext = imageFile.split(".").pop()?.toLowerCase();
        const imageMimeType = ext === "png" ? "image/png" : "image/jpeg";

        try {
          const compressedImage = await sharp(imageData)
            .jpeg({ quality: 70 })
            .toBuffer();

          zip.file(imageFile, compressedImage);
        } catch (err) {
          console.error(`Failed to compress image ${imageFile}:`, err);
        }
      }

      const compressedBytes = await zip.generateAsync({
        type: "nodebuffer",
        compression: "DEFLATE",
        compressionOptions: { level: 9 },
      });

      const compressedBuffer = Buffer.from(compressedBytes);
      const compressedSize = compressedBuffer.length;
      const compressionRatio =
        ((originalSize - compressedSize) / originalSize) * 100;

      return {
        success: true,
        compressedBuffer,
        originalSize,
        compressedSize,
        compressionRatio,
        wasCompressed: true,
      };
    } else {
      return {
        success: false,
        originalSize: buffer.length,
        compressedSize: buffer.length,
        compressionRatio: 0,
        error:
          "Old DOC format compression not supported. Please convert to DOCX.",
        wasCompressed: false,
      };
    }
  } catch (error: any) {
    return {
      success: false,
      originalSize: buffer.length,
      compressedSize: buffer.length,
      compressionRatio: 0,
      error: error.message || "Word document compression failed",
      wasCompressed: false,
    };
  }
}

export async function compressFile(
  buffer: Buffer,
  mimeType: string,
  maxSize: number = 10 * 1024 * 1024
): Promise<CompressionResult> {
  if (buffer.length <= maxSize) {
    return {
      success: true,
      compressedBuffer: buffer,
      originalSize: buffer.length,
      compressedSize: buffer.length,
      compressionRatio: 0,
      wasCompressed: false,
    };
  }

  if (mimeType === "application/pdf") {
    let result = await compressPDF(buffer, "medium");

    if (
      result.success &&
      result.compressedBuffer &&
      result.compressedBuffer.length > maxSize
    ) {
      result = await compressPDF(buffer, "low");
    }

    return result;
  } else if (mimeType.startsWith("image/")) {
    let result = await compressImage(buffer, mimeType, 0.7);

    if (
      result.success &&
      result.compressedBuffer &&
      result.compressedBuffer.length > maxSize
    ) {
      result = await compressImage(buffer, mimeType, 0.5);
    }

    if (
      result.success &&
      result.compressedBuffer &&
      result.compressedBuffer.length > maxSize
    ) {
      result = await compressImage(buffer, mimeType, 0.3);
    }

    return result;
  } else if (
    mimeType === "application/msword" ||
    mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const result = await compressWordDocument(buffer, mimeType);
    return result;
  }

  return {
    success: false,
    originalSize: buffer.length,
    compressedSize: buffer.length,
    compressionRatio: 0,
    error: "Unsupported file type for compression",
    wasCompressed: false,
  };
}
