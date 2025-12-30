import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a writing assistant that improves text clarity, grammar, and style while maintaining the original meaning and tone. 
          
Rules:
- Fix grammar and spelling errors
- Improve sentence structure and flow
- Make the text more concise and clear
- Maintain the original tone and meaning
- Keep the same language as the input
- Return ONLY the improved text, no explanations`,
        },
        {
          role: "user",
          content: text,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const improvedText = completion.choices[0]?.message?.content || text;

    return NextResponse.json({
      improvedText: improvedText.trim(),
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
