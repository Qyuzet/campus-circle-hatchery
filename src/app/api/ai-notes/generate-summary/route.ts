import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { content } = body;

    if (!content || content.length < 100) {
      return NextResponse.json(
        { error: "Content must be at least 100 characters" },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Analyze the following student notes and provide:
1. A concise summary (2-3 sentences)
2. Key points (3-5 bullet points)
3. Main concepts covered
4. Important definitions (if any)
5. Estimated difficulty level (Beginner/Intermediate/Advanced)
6. Main topics covered

Format your response as JSON with the following structure:
{
  "summary": "...",
  "keyPoints": {
    "points": ["...", "..."],
    "concepts": ["...", "..."],
    "definitions": {"term": "definition"}
  },
  "metadata": {
    "wordCount": number,
    "readingTime": number (in minutes),
    "difficulty": "...",
    "topics": ["...", "..."]
  }
}

Notes content:
${content}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    let aiData;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        aiData = JSON.parse(jsonMatch[0]);
      } else {
        aiData = JSON.parse(text);
      }
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError);
      const wordCount = content.split(/\s+/).length;
      const readingTime = Math.ceil(wordCount / 200);

      aiData = {
        summary: text.substring(0, 200),
        keyPoints: {
          points: [],
          concepts: [],
          definitions: {},
        },
        metadata: {
          wordCount,
          readingTime,
          difficulty: "Intermediate",
          topics: [],
        },
      };
    }

    if (!aiData.metadata) {
      const wordCount = content.split(/\s+/).length;
      const readingTime = Math.ceil(wordCount / 200);
      aiData.metadata = {
        wordCount,
        readingTime,
        difficulty: "Intermediate",
        topics: [],
      };
    }

    return NextResponse.json(aiData);
  } catch (error) {
    console.error("Error generating AI summary:", error);
    return NextResponse.json(
      { error: "Failed to generate AI summary" },
      { status: 500 }
    );
  }
}

