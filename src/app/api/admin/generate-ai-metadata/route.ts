import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function analyzeFile(
  fileUrl: string,
  fileType: string,
  itemType: "study" | "food" | "event"
): Promise<any> {
  try {
    let base64Data: string;
    let mimeType = fileType;
    let originalFileName = fileUrl.split("/").pop() || "unknown";

    if (fileUrl.includes(process.env.NEXT_PUBLIC_SUPABASE_URL || "")) {
      const fileName = fileUrl.split("/").pop();
      if (!fileName) throw new Error("Invalid file URL");

      const { data: fileData, error: downloadError } = await supabase.storage
        .from("study-materials")
        .download(fileName);

      if (downloadError) throw downloadError;

      const arrayBuffer = await fileData.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      base64Data = buffer.toString("base64");
      originalFileName = fileName;
    } else {
      const response = await fetch(fileUrl);
      if (!response.ok) throw new Error("Failed to fetch image");

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      base64Data = buffer.toString("base64");
      mimeType = response.headers.get("content-type") || "image/jpeg";
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    let prompt = "";

    if (itemType === "study") {
      prompt = `Analyze this study material and extract the following information in JSON format:
{
  "title": "Title of the material",
  "description": "Brief description of the content",
  "category": "One of: Notes, Textbooks, Assignments, Past Papers, Projects, Other",
  "course": "Course name or subject",
  "metadata": {
    "analyzedAt": "${new Date().toISOString()}",
    "contentSummary": "Detailed summary for AI indexing",
    "keywords": ["array", "of", "keywords"],
    "topics": ["main", "topics"],
    "academicLevel": "Estimated level",
    "subject": "Main subject area",
    "documentType": "Type of document",
    "language": "Primary language",
    "hasImages": true/false,
    "hasDiagrams": true/false,
    "hasCode": true/false,
    "hasMath": true/false,
    "confidence": "high/medium/low"
  }
}

Only return valid JSON, no additional text.`;
    } else if (itemType === "food") {
      prompt = `Analyze this food image and extract the following information in JSON format:
{
  "title": "Name of the food item",
  "description": "Brief description",
  "category": "One of: Snacks, Meals, Drinks, Desserts",
  "foodType": "One of: Homemade, Restaurant, Packaged",
  "ingredients": "List of ingredients",
  "allergens": ["Array of allergens"],
  "isVegan": true/false,
  "isVegetarian": true/false,
  "isHalal": true/false,
  "metadata": {
    "analyzedAt": "${new Date().toISOString()}",
    "contentSummary": "Detailed summary",
    "keywords": ["keywords"],
    "cuisine": "Type of cuisine",
    "servingSize": "Estimated serving size",
    "nutritionalHighlights": "Brief highlights",
    "visualDescription": "Visual description",
    "confidence": "high/medium/low"
  }
}

Only return valid JSON, no additional text.`;
    } else {
      prompt = `Analyze this event poster and extract the following information in JSON format:
{
  "title": "Event name",
  "description": "Event description",
  "category": "One of: Academic, Social, Sports, Cultural, Workshop, Competition, Other",
  "eventType": "One of: Free, Paid",
  "location": "Event location",
  "venue": "Venue name",
  "organizer": "Organizing body",
  "metadata": {
    "analyzedAt": "${new Date().toISOString()}",
    "contentSummary": "Comprehensive summary",
    "keywords": ["keywords"],
    "targetAudience": "Intended audience",
    "eventFormat": "Format of event",
    "visualElements": "Visual elements description",
    "callToAction": "Call to action",
    "highlights": "Key highlights",
    "confidence": "high/medium/low"
  }
}

Only return valid JSON, no additional text.`;
    }

    const result = await model.generateContent([
      {
        inlineData: {
          data: base64Data,
          mimeType: mimeType,
        },
      },
      prompt,
    ]);

    const response = await result.response;
    const text = response.text();
    const cleanedText = text.replace(/```json\n?/g, "").replace(/```\n?/g, "");
    const extractedData = JSON.parse(cleanedText);

    return {
      analyzedAt: new Date().toISOString(),
      aiModel: "gemini-2.5-flash",
      fileInfo: {
        originalName: originalFileName,
        fileType: fileType,
      },
      extractedData: extractedData,
      ...(extractedData.metadata || {}),
    };
  } catch (error: any) {
    console.error("Error analyzing file:", error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const session = await auth();
        if (!session?.user?.email) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "error",
                message: "Unauthorized",
              })}\n\n`
            )
          );
          controller.close();
          return;
        }

        const user = await prisma.user.findUnique({
          where: { email: session.user.email },
          select: { role: true },
        });

        if (user?.role !== "admin") {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "error",
                message: "Admin access required",
              })}\n\n`
            )
          );
          controller.close();
          return;
        }

        const allMarketplaceItems = await prisma.marketplaceItem.findMany({
          where: {
            fileUrl: { not: null },
          },
          select: {
            id: true,
            title: true,
            fileUrl: true,
            fileType: true,
            aiMetadata: true,
          },
        });

        const marketplaceItems = allMarketplaceItems.filter(
          (item) => !item.aiMetadata
        );

        const allFoodItems = await prisma.foodItem.findMany({
          where: {
            imageUrl: { not: null },
          },
          select: {
            id: true,
            title: true,
            imageUrl: true,
            aiMetadata: true,
          },
        });

        const foodItems = allFoodItems.filter((item) => !item.aiMetadata);

        const allEvents = await prisma.event.findMany({
          where: {
            OR: [{ imageUrl: { not: null } }, { bannerUrl: { not: null } }],
          },
          select: {
            id: true,
            title: true,
            imageUrl: true,
            bannerUrl: true,
            aiMetadata: true,
          },
        });

        const events = allEvents.filter((item) => !item.aiMetadata);

        const totalItems =
          marketplaceItems.length + foodItems.length + events.length;

        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: "stats",
              stats: {
                total: totalItems,
                processed: 0,
                successful: 0,
                failed: 0,
              },
            })}\n\n`
          )
        );

        let currentIndex = 0;
        let successCount = 0;
        let failCount = 0;

        for (const item of marketplaceItems) {
          currentIndex++;
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "progress",
                message: `Processing study material: ${item.title}`,
                current: currentIndex,
                total: totalItems,
              })}\n\n`
            )
          );

          try {
            if (!item.fileUrl || !item.fileType) {
              throw new Error("Missing file URL or type");
            }

            const metadata = await analyzeFile(
              item.fileUrl,
              item.fileType,
              "study"
            );

            await prisma.marketplaceItem.update({
              where: { id: item.id },
              data: { aiMetadata: metadata },
            });

            successCount++;
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: "result",
                  result: {
                    index: currentIndex,
                    id: item.id,
                    title: item.title,
                    type: "Study Material",
                    success: true,
                    message: "Metadata generated successfully",
                  },
                })}\n\n`
              )
            );
          } catch (error: any) {
            failCount++;
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: "result",
                  result: {
                    index: currentIndex,
                    id: item.id,
                    title: item.title,
                    type: "Study Material",
                    success: false,
                    message: error.message || "Failed to generate metadata",
                  },
                })}\n\n`
              )
            );
          }

          await new Promise((resolve) => setTimeout(resolve, 1000));
        }

        for (const item of foodItems) {
          currentIndex++;
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "progress",
                message: `Processing food item: ${item.title}`,
                current: currentIndex,
                total: totalItems,
              })}\n\n`
            )
          );

          try {
            if (!item.imageUrl) {
              throw new Error("Missing image URL");
            }

            const metadata = await analyzeFile(
              item.imageUrl,
              "image/jpeg",
              "food"
            );

            await prisma.foodItem.update({
              where: { id: item.id },
              data: { aiMetadata: metadata },
            });

            successCount++;
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: "result",
                  result: {
                    index: currentIndex,
                    id: item.id,
                    title: item.title,
                    type: "Food Item",
                    success: true,
                    message: "Metadata generated successfully",
                  },
                })}\n\n`
              )
            );
          } catch (error: any) {
            failCount++;
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: "result",
                  result: {
                    index: currentIndex,
                    id: item.id,
                    title: item.title,
                    type: "Food Item",
                    success: false,
                    message: error.message || "Failed to generate metadata",
                  },
                })}\n\n`
              )
            );
          }

          await new Promise((resolve) => setTimeout(resolve, 1000));
        }

        for (const item of events) {
          currentIndex++;
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "progress",
                message: `Processing event: ${item.title}`,
                current: currentIndex,
                total: totalItems,
              })}\n\n`
            )
          );

          try {
            const imageUrl = item.bannerUrl || item.imageUrl;
            if (!imageUrl) {
              throw new Error("Missing image URL");
            }

            const metadata = await analyzeFile(imageUrl, "image/jpeg", "event");

            await prisma.event.update({
              where: { id: item.id },
              data: { aiMetadata: metadata },
            });

            successCount++;
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: "result",
                  result: {
                    index: currentIndex,
                    id: item.id,
                    title: item.title,
                    type: "Event",
                    success: true,
                    message: "Metadata generated successfully",
                  },
                })}\n\n`
              )
            );
          } catch (error: any) {
            failCount++;
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: "result",
                  result: {
                    index: currentIndex,
                    id: item.id,
                    title: item.title,
                    type: "Event",
                    success: false,
                    message: error.message || "Failed to generate metadata",
                  },
                })}\n\n`
              )
            );
          }

          await new Promise((resolve) => setTimeout(resolve, 1000));
        }

        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: "complete",
              stats: {
                total: totalItems,
                processed: currentIndex,
                successful: successCount,
                failed: failCount,
              },
            })}\n\n`
          )
        );

        controller.close();
      } catch (error: any) {
        console.error("Error in metadata generation:", error);
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: "error",
              message: error.message || "Unknown error occurred",
            })}\n\n`
          )
        );
        controller.close();
      }
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
