import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("Missing DATABASE_URL in environment variables");
  process.exit(1);
}

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase credentials in environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function generatePdfThumbnail(pdfBuffer: Buffer): Promise<Buffer | null> {
  try {
    const sharp = (await import("sharp")).default;
    const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");

    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(pdfBuffer),
    });

    const pdf = await loadingTask.promise;
    const page = await pdf.getPage(1);

    const viewport = page.getViewport({ scale: 2.0 });
    const canvas = {
      width: viewport.width,
      height: viewport.height,
    };

    const canvasContext: any = {
      canvas,
      fillStyle: "",
      strokeStyle: "",
      lineWidth: 0,
      lineCap: "",
      lineJoin: "",
      miterLimit: 0,
      globalAlpha: 1,
      globalCompositeOperation: "source-over",
      imageSmoothingEnabled: true,
      _transform: [1, 0, 0, 1, 0, 0],
      _imageData: new Uint8ClampedArray(
        Math.floor(viewport.width) * Math.floor(viewport.height) * 4
      ),

      getTransform() {
        return {
          a: this._transform[0],
          b: this._transform[1],
          c: this._transform[2],
          d: this._transform[3],
          e: this._transform[4],
          f: this._transform[5],
        };
      },
      setTransform(
        a: number,
        b: number,
        c: number,
        d: number,
        e: number,
        f: number
      ) {
        this._transform = [a, b, c, d, e, f];
      },
      save() {},
      restore() {},
      translate() {},
      scale() {},
      rotate() {},
      transform() {},
      beginPath() {},
      closePath() {},
      moveTo() {},
      lineTo() {},
      rect() {},
      arc() {},
      fill() {},
      stroke() {},
      clip() {},
      fillRect(x: number, y: number, w: number, h: number) {
        const startX = Math.floor(x);
        const startY = Math.floor(y);
        const width = Math.floor(w);
        const height = Math.floor(h);
        const canvasWidth = Math.floor(viewport.width);

        const r = parseInt(this.fillStyle.slice(1, 3), 16) || 255;
        const g = parseInt(this.fillStyle.slice(3, 5), 16) || 255;
        const b = parseInt(this.fillStyle.slice(5, 7), 16) || 255;

        for (let py = startY; py < startY + height; py++) {
          for (let px = startX; px < startX + width; px++) {
            const index = (py * canvasWidth + px) * 4;
            if (index >= 0 && index < this._imageData.length - 3) {
              this._imageData[index] = r;
              this._imageData[index + 1] = g;
              this._imageData[index + 2] = b;
              this._imageData[index + 3] = 255;
            }
          }
        }
      },
      strokeRect() {},
      clearRect() {},
      fillText() {},
      strokeText() {},
      measureText() {
        return { width: 0 };
      },
      drawImage(
        img: any,
        sx: number,
        sy: number,
        sw: number,
        sh: number,
        dx: number,
        dy: number,
        dw: number,
        dh: number
      ) {
        if (!img.data) return;

        const sourceData = img.data;
        const destStartX = Math.floor(dx);
        const destStartY = Math.floor(dy);
        const destWidth = Math.floor(dw);
        const destHeight = Math.floor(dh);
        const canvasWidth = Math.floor(viewport.width);

        for (let y = 0; y < destHeight; y++) {
          for (let x = 0; x < destWidth; x++) {
            const srcX = Math.floor((x / destWidth) * sw + sx);
            const srcY = Math.floor((y / destHeight) * sh + sy);
            const srcIndex = (srcY * img.width + srcX) * 4;
            const destIndex =
              ((destStartY + y) * canvasWidth + (destStartX + x)) * 4;

            if (
              srcIndex >= 0 &&
              srcIndex < sourceData.length - 3 &&
              destIndex >= 0 &&
              destIndex < this._imageData.length - 3
            ) {
              this._imageData[destIndex] = sourceData[srcIndex];
              this._imageData[destIndex + 1] = sourceData[srcIndex + 1];
              this._imageData[destIndex + 2] = sourceData[srcIndex + 2];
              this._imageData[destIndex + 3] = sourceData[srcIndex + 3];
            }
          }
        }
      },
      getImageData() {
        return {
          data: this._imageData,
          width: Math.floor(viewport.width),
          height: Math.floor(viewport.height),
        };
      },
      putImageData() {},
      createImageData() {
        return {
          data: new Uint8ClampedArray(
            Math.floor(viewport.width) * Math.floor(viewport.height) * 4
          ),
          width: Math.floor(viewport.width),
          height: Math.floor(viewport.height),
        };
      },
    };

    await page.render({
      canvasContext,
      viewport,
    }).promise;

    const imageData = canvasContext.getImageData();
    const thumbnailBuffer = await sharp(Buffer.from(imageData.data.buffer), {
      raw: {
        width: Math.floor(viewport.width),
        height: Math.floor(viewport.height),
        channels: 4,
      },
    })
      .resize(800, null, {
        fit: "inside",
        withoutEnlargement: false,
      })
      .jpeg({ quality: 85 })
      .toBuffer();

    return thumbnailBuffer;
  } catch (error) {
    console.error("Error generating PDF thumbnail:", error);
    return null;
  }
}

async function generateThumbnailsForExistingPDFs() {
  try {
    console.log("Starting PDF thumbnail generation for existing items...\n");

    const pdfItems = await prisma.marketplaceItem.findMany({
      where: {
        fileType: "application/pdf",
        thumbnailUrl: null,
        fileUrl: {
          not: null,
        },
      },
    });

    console.log(`Found ${pdfItems.length} PDF items without thumbnails\n`);

    if (pdfItems.length === 0) {
      console.log("No PDFs need thumbnail generation. Exiting.");
      return;
    }

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < pdfItems.length; i++) {
      const item = pdfItems[i];
      console.log(
        `[${i + 1}/${pdfItems.length}] Processing: ${item.title} (${item.id})`
      );

      try {
        const fileName = item.fileUrl!.split("/").pop();
        console.log(`  Downloading PDF from Supabase: ${fileName}`);

        const { data: fileData, error: downloadError } = await supabase.storage
          .from("study-materials")
          .download(fileName!);

        if (downloadError) {
          console.error(`  Error downloading PDF: ${downloadError.message}`);
          failCount++;
          continue;
        }

        const arrayBuffer = await fileData.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        console.log(`  Generating thumbnail...`);
        const thumbnailBuffer = await generatePdfThumbnail(buffer);

        if (!thumbnailBuffer) {
          console.error(`  Failed to generate thumbnail`);
          failCount++;
          continue;
        }

        const thumbnailFileName = `thumbnail-${Date.now()}-${item.fileName?.replace(
          ".pdf",
          ".jpg"
        )}`;

        console.log(`  Uploading thumbnail: ${thumbnailFileName}`);
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("study-materials")
          .upload(thumbnailFileName, thumbnailBuffer, {
            contentType: "image/jpeg",
            upsert: false,
          });

        if (uploadError) {
          console.error(`  Error uploading thumbnail: ${uploadError.message}`);
          failCount++;
          continue;
        }

        const {
          data: { publicUrl },
        } = supabase.storage
          .from("study-materials")
          .getPublicUrl(thumbnailFileName);

        console.log(`  Updating database with thumbnail URL...`);
        await prisma.marketplaceItem.update({
          where: { id: item.id },
          data: { thumbnailUrl: publicUrl },
        });

        console.log(`  ✓ Success! Thumbnail URL: ${publicUrl}\n`);
        successCount++;
      } catch (error: any) {
        console.error(`  Error processing item: ${error.message}\n`);
        failCount++;
      }
    }

    console.log("\n=== Summary ===");
    console.log(`Total PDFs processed: ${pdfItems.length}`);
    console.log(`Successful: ${successCount}`);
    console.log(`Failed: ${failCount}`);
  } catch (error: any) {
    console.error("Fatal error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

generateThumbnailsForExistingPDFs();
