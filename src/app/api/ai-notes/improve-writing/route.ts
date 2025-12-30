import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { text } = await req.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `You are a writing assistant that improves text clarity, grammar, and style while maintaining the original meaning and tone.

Rules:
- Fix grammar and spelling errors
- Improve sentence structure and flow
- Make the text more concise and clear
- Maintain the original tone and meaning
- Keep the same language as the input
- Return ONLY the improved text, no explanations

Text to improve:
${text}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const improvedText = response.text().trim();

    return NextResponse.json({
      improvedText: improvedText || text,
      original: text,
    });
  } catch (error) {
    console.error("Error improving writing:", error);
    return NextResponse.json(
      { error: "Failed to improve writing" },
      { status: 500 }
    );
  }
}
