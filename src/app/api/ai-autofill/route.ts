import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string;

    console.log("AI Autofill - File received:", file?.name, file?.type);
    console.log("AI Autofill - Type:", type);

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    if (!type || !["food", "event", "study"].includes(type)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid type. Must be 'food', 'event', or 'study'",
        },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString("base64");

    console.log("AI Autofill - Image size:", buffer.length, "bytes");

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    let prompt = "";

    if (type === "food") {
      prompt = `Analyze this food image and extract the following information in JSON format:
{
  "title": "Name of the food item",
  "description": "Brief description of the food",
  "category": "One of: Snacks, Meals, Drinks, Desserts",
  "foodType": "One of: Homemade, Restaurant, Packaged",
  "ingredients": "List of visible or likely ingredients",
  "allergens": ["Array of potential allergens from: Nuts, Dairy, Gluten, Eggs, Soy, Shellfish, Fish"],
  "isVegan": true/false,
  "isVegetarian": true/false,
  "isHalal": true/false (best guess based on visible ingredients)
}

Only return valid JSON, no additional text.`;
    } else if (type === "event") {
      prompt = `Analyze this event poster/banner image and extract the following information in JSON format:
{
  "title": "Event name/title",
  "description": "Event description or details",
  "category": "One of: Academic, Social, Sports, Cultural, Workshop, Competition, Other",
  "eventType": "One of: Free, Paid",
  "location": "Event location if visible",
  "venue": "Specific venue name if visible",
  "startDate": "Event start date in YYYY-MM-DD format if visible, otherwise empty string",
  "endDate": "Event end date in YYYY-MM-DD format if visible, otherwise empty string",
  "organizer": "Organizing body/person if visible",
  "contactEmail": "Contact email if visible",
  "contactPhone": "Contact phone if visible",
  "tags": "Comma-separated relevant tags",
  "requirements": "Any requirements or prerequisites mentioned"
}

Only return valid JSON, no additional text.`;
    } else if (type === "study") {
      prompt = `Analyze this study material image (could be a book cover, notes, assignment, etc.) and extract the following information in JSON format:
{
  "title": "Title of the material",
  "description": "Brief description of the content",
  "category": "One of: Notes, Textbooks, Assignments, Past Papers, Projects, Other",
  "course": "Course name or subject if visible"
}

Only return valid JSON, no additional text.`;
    }

    console.log("AI Autofill - Sending request to Gemini...");

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: file.type,
          data: base64Image,
        },
      },
      { text: prompt },
    ]);

    console.log("AI Autofill - Received response from Gemini");

    const response = await result.response;
    let text = response.text();

    console.log("AI Autofill - Raw response:", text);

    text = text
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    console.log("AI Autofill - Cleaned response:", text);

    const extractedData = JSON.parse(text);

    console.log("AI Autofill - Parsed data:", extractedData);

    return NextResponse.json({
      success: true,
      data: extractedData,
    });
  } catch (error: any) {
    console.error("AI autofill error:", error);
    console.error("AI autofill error stack:", error.stack);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to process image",
      },
      { status: 500 }
    );
  }
}
