import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

function getGroqClient() {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not configured");
  }
  return new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });
}

export async function POST(request: NextRequest) {
  try {
    const { text, targetLanguage } = await request.json();

    if (!text || !targetLanguage) {
      return NextResponse.json(
        { error: "Text and target language are required" },
        { status: 400 }
      );
    }

    const groq = getGroqClient();

    const languageNames: Record<string, string> = {
      id: "Indonesian",
      en: "English",
      es: "Spanish",
      fr: "French",
      de: "German",
      ja: "Japanese",
      ko: "Korean",
      zh: "Chinese",
      ar: "Arabic",
      ru: "Russian",
    };

    const targetLanguageName = languageNames[targetLanguage] || targetLanguage;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a professional translator. Translate the given text to ${targetLanguageName}. Only return the translated text, nothing else. Maintain the original tone and meaning.`,
        },
        {
          role: "user",
          content: text,
        },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
      max_tokens: 2000,
    });

    const translatedText = completion.choices[0]?.message?.content || "";

    return NextResponse.json({ translatedText });
  } catch (error) {
    console.error("Translation error:", error);
    return NextResponse.json(
      { error: "Failed to translate text" },
      { status: 500 }
    );
  }
}
