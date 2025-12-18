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
  compressionLevel?: string;
}

type CompressionQuality = "highest" | "high" | "medium" | "low" | "lowest";

async function compressPDF(
  buffer: Buffer,
  quality: CompressionQuality = "medium"
): Promise<CompressionResult> {
  try {
    const originalSize = buffer.length;

    const pdfDoc = await PDFDocument.load(buffer, {
      ignoreEncryption: true,
      updateMetadata: false,
      throwOnInvalidObject: false,
    });

    const pages = pdfDoc.getPages();

    let scale = 1;
    switch (quality) {
      case "lowest":
        scale = 0.3;
        break;
      case "low":
        scale = 0.5;
        break;
      case "medium":
        scale = 0.7;
        break;
      case "high":
        scale = 0.85;
        break;
      case "highest":
        scale = 0.95;
        break;
    }

    if (scale < 1) {
      for (const page of pages) {
        try {
          page.scale(scale, scale);
        } catch (pageError) {
          console.error("Error scaling page:", pageError);
        }
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
      compressionLevel: quality,
    };
  } catch (error: any) {
    console.error("PDF compression error:", error);
    return {
      success: false,
      originalSize: buffer.length,
      compressedSize: buffer.length,
      compressionRatio: 0,
      error: `PDF compression failed: ${error.message || "Unknown error"}`,
      wasCompressed: false,
    };
  }
}

async function compressImage(
  buffer: Buffer,
  mimeType: string,
  quality: CompressionQuality = "medium"
): Promise<CompressionResult> {
  try {
    const originalSize = buffer.length;

    let qualityValue = 70;
    let resize = false;
    let resizePercentage = 100;

    switch (quality) {
      case "lowest":
        qualityValue = 20;
        resize = true;
        resizePercentage = 50;
        break;
      case "low":
        qualityValue = 40;
        resize = true;
        resizePercentage = 70;
        break;
      case "medium":
        qualityValue = 60;
        resize = true;
        resizePercentage = 85;
        break;
      case "high":
        qualityValue = 75;
        break;
      case "highest":
        qualityValue = 85;
        break;
    }

    let sharpInstance = sharp(buffer);

    if (resize) {
      const metadata = await sharpInstance.metadata();
      if (metadata.width && metadata.height) {
        const newWidth = Math.round((metadata.width * resizePercentage) / 100);
        const newHeight = Math.round(
          (metadata.height * resizePercentage) / 100
        );
        sharpInstance = sharpInstance.resize(newWidth, newHeight, {
          fit: "inside",
          withoutEnlargement: true,
        });
      }
    }

    let compressedBuffer: Buffer;

    if (mimeType === "image/png") {
      compressedBuffer = await sharpInstance
        .png({ quality: qualityValue, compressionLevel: 9, effort: 10 })
        .toBuffer();
    } else {
      compressedBuffer = await sharpInstance
        .jpeg({ quality: qualityValue, mozjpeg: true })
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
      compressionLevel: quality,
    };
  } catch (error: any) {
    console.error("Image compression error:", error);
    return {
      success: false,
      originalSize: buffer.length,
      compressedSize: buffer.length,
      compressionRatio: 0,
      error: `Image compression failed: ${error.message || "Unknown error"}`,
      wasCompressed: false,
    };
  }
}

async function compressWordDocument(
  buffer: Buffer,
  mimeType: string,
  quality: CompressionQuality = "medium"
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

      let imageQuality = 70;
      let resizePercentage = 100;

      switch (quality) {
        case "lowest":
          imageQuality = 20;
          resizePercentage = 50;
          break;
        case "low":
          imageQuality = 40;
          resizePercentage = 70;
          break;
        case "medium":
          imageQuality = 60;
          resizePercentage = 85;
          break;
        case "high":
          imageQuality = 75;
          resizePercentage = 95;
          break;
        case "highest":
          imageQuality = 85;
          resizePercentage = 100;
          break;
      }

      let compressedCount = 0;
      for (const imageFile of imageFiles) {
        try {
          const imageData = await zip.files[imageFile].async("nodebuffer");

          let sharpInstance = sharp(imageData);

          if (resizePercentage < 100) {
            const metadata = await sharpInstance.metadata();
            if (metadata.width && metadata.height) {
              const newWidth = Math.round(
                (metadata.width * resizePercentage) / 100
              );
              const newHeight = Math.round(
                (metadata.height * resizePercentage) / 100
              );
              sharpInstance = sharpInstance.resize(newWidth, newHeight, {
                fit: "inside",
                withoutEnlargement: true,
              });
            }
          }

          const compressedImage = await sharpInstance
            .jpeg({ quality: imageQuality, mozjpeg: true })
            .toBuffer();

          zip.file(imageFile, compressedImage);
          compressedCount++;
        } catch (err) {
          console.error(`Failed to compress image ${imageFile}:`, err);
        }
      }

      console.log(
        `Compressed ${compressedCount} of ${imageFiles.length} images in Word document`
      );

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
        compressionLevel: quality,
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
    console.error("Word document compression error:", error);
    return {
      success: false,
      originalSize: buffer.length,
      compressedSize: buffer.length,
      compressionRatio: 0,
      error: `Word document compression failed: ${
        error.message || "Unknown error"
      }`,
      wasCompressed: false,
    };
  }
}

export async function compressFile(
  buffer: Buffer,
  mimeType: string,
  maxSize: number = 15 * 1024 * 1024
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

  console.log(
    `Starting compression for ${mimeType}, size: ${(
      buffer.length /
      1024 /
      1024
    ).toFixed(2)}MB, max: ${(maxSize / 1024 / 1024).toFixed(2)}MB`
  );

  const compressionLevels: CompressionQuality[] = [
    "high",
    "medium",
    "low",
    "lowest",
  ];

  if (mimeType === "application/pdf") {
    let result: CompressionResult | null = null;

    for (const level of compressionLevels) {
      console.log(`Trying PDF compression with quality: ${level}`);
      result = await compressPDF(buffer, level);

      if (!result.success) {
        console.error(
          `PDF compression failed at level ${level}:`,
          result.error
        );
        continue;
      }

      console.log(
        `PDF compressed to ${(result.compressedSize / 1024 / 1024).toFixed(
          2
        )}MB with ${level} quality`
      );

      if (
        result.compressedBuffer &&
        result.compressedBuffer.length <= maxSize
      ) {
        console.log(`PDF compression successful at level ${level}`);
        return result;
      }
    }

    return (
      result || {
        success: false,
        originalSize: buffer.length,
        compressedSize: buffer.length,
        compressionRatio: 0,
        error: "PDF compression failed at all quality levels",
        wasCompressed: false,
      }
    );
  } else if (mimeType.startsWith("image/")) {
    let result: CompressionResult | null = null;

    for (const level of compressionLevels) {
      console.log(`Trying image compression with quality: ${level}`);
      result = await compressImage(buffer, mimeType, level);

      if (!result.success) {
        console.error(
          `Image compression failed at level ${level}:`,
          result.error
        );
        continue;
      }

      console.log(
        `Image compressed to ${(result.compressedSize / 1024 / 1024).toFixed(
          2
        )}MB with ${level} quality`
      );

      if (
        result.compressedBuffer &&
        result.compressedBuffer.length <= maxSize
      ) {
        console.log(`Image compression successful at level ${level}`);
        return result;
      }
    }

    return (
      result || {
        success: false,
        originalSize: buffer.length,
        compressedSize: buffer.length,
        compressionRatio: 0,
        error: "Image compression failed at all quality levels",
        wasCompressed: false,
      }
    );
  } else if (
    mimeType === "application/msword" ||
    mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    let result: CompressionResult | null = null;

    for (const level of compressionLevels) {
      console.log(`Trying Word document compression with quality: ${level}`);
      result = await compressWordDocument(buffer, mimeType, level);

      if (!result.success) {
        console.error(
          `Word compression failed at level ${level}:`,
          result.error
        );
        continue;
      }

      console.log(
        `Word document compressed to ${(
          result.compressedSize /
          1024 /
          1024
        ).toFixed(2)}MB with ${level} quality`
      );

      if (
        result.compressedBuffer &&
        result.compressedBuffer.length <= maxSize
      ) {
        console.log(`Word compression successful at level ${level}`);
        return result;
      }
    }

    return (
      result || {
        success: false,
        originalSize: buffer.length,
        compressedSize: buffer.length,
        compressionRatio: 0,
        error: "Word document compression failed at all quality levels",
        wasCompressed: false,
      }
    );
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
