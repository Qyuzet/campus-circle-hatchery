import sharp from "sharp";

let pdfjsLib: any = null;

async function getPdfJs() {
  if (!pdfjsLib) {
    try {
      pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
    } catch (error) {
      console.error("Failed to load pdfjs-dist:", error);
      throw new Error("PDF.js library failed to load");
    }
  }
  return pdfjsLib;
}

export async function generatePdfThumbnail(
  pdfBuffer: Buffer
): Promise<Buffer | null> {
  try {
    const pdfjs = await getPdfJs();

    const loadingTask = pdfjs.getDocument({
      data: new Uint8Array(pdfBuffer),
    });

    const pdf = await loadingTask.promise;
    const page = await pdf.getPage(1);

    const viewport = page.getViewport({ scale: 2.0 });

    const canvas = {
      width: viewport.width,
      height: viewport.height,
      data: new Uint8ClampedArray(viewport.width * viewport.height * 4),
    };

    const canvasContext = {
      fillStyle: "",
      strokeStyle: "",
      lineWidth: 0,
      lineCap: "butt" as CanvasLineCap,
      lineJoin: "miter" as CanvasLineJoin,
      miterLimit: 10,
      globalAlpha: 1,
      globalCompositeOperation: "source-over" as GlobalCompositeOperation,

      fillRect(x: number, y: number, w: number, h: number) {
        const startX = Math.floor(x);
        const startY = Math.floor(y);
        const endX = Math.floor(x + w);
        const endY = Math.floor(y + h);

        const rgb = this.fillStyle.match(/\d+/g)?.map(Number) || [
          255, 255, 255,
        ];

        for (let py = startY; py < endY; py++) {
          for (let px = startX; px < endX; px++) {
            if (px >= 0 && px < canvas.width && py >= 0 && py < canvas.height) {
              const index = (py * canvas.width + px) * 4;
              canvas.data[index] = rgb[0];
              canvas.data[index + 1] = rgb[1];
              canvas.data[index + 2] = rgb[2];
              canvas.data[index + 3] = 255;
            }
          }
        }
      },

      strokeRect() {},
      clearRect() {},
      beginPath() {},
      moveTo() {},
      lineTo() {},
      closePath() {},
      stroke() {},
      fill() {},
      arc() {},
      arcTo() {},
      bezierCurveTo() {},
      quadraticCurveTo() {},
      rect() {},
      save() {},
      restore() {},
      scale() {},
      rotate() {},
      translate() {},
      transform() {},
      setTransform() {},
      resetTransform() {},
      clip() {},
      isPointInPath() {
        return false;
      },
      isPointInStroke() {
        return false;
      },
      getTransform() {
        return {
          a: 1,
          b: 0,
          c: 0,
          d: 1,
          e: 0,
          f: 0,
        };
      },
      setLineDash() {},
      getLineDash() {
        return [];
      },
      createLinearGradient() {
        return null as any;
      },
      createRadialGradient() {
        return null as any;
      },
      createPattern() {
        return null as any;
      },
      drawImage() {},
      putImageData() {},
      getImageData() {
        return {
          data: canvas.data,
          width: canvas.width,
          height: canvas.height,
        };
      },
      createImageData() {
        return {
          data: new Uint8ClampedArray(0),
          width: 0,
          height: 0,
        };
      },
      measureText() {
        return { width: 0 };
      },
      fillText() {},
      strokeText() {},
    };

    await page.render({
      canvasContext: canvasContext as any,
      viewport: viewport,
    }).promise;

    const imageBuffer = await sharp(Buffer.from(canvas.data), {
      raw: {
        width: canvas.width,
        height: canvas.height,
        channels: 4,
      },
    })
      .resize(800, null, { withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toBuffer();

    return imageBuffer;
  } catch (error) {
    console.error("Error generating PDF thumbnail:", error);
    return null;
  }
}
