import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

function sanitizeMarkdownFormatting(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/_([^_]+)_/g, "$1")
    .replace(/~~([^~]+)~~/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^>\s+/gm, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
    .replace(/^[-*+]\s+(?=\S)/gm, "- ")
    .replace(/^\d+\.\s+/gm, (match) => match)
    .replace(/```[\s\S]*?```/g, (match) => {
      return match.replace(/```\w*\n?/g, "").replace(/```/g, "");
    })
    .trim();
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { text, action, language, tone, prompt } = await request.json();

    if (!action) {
      return NextResponse.json(
        { error: "Action is required" },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    let systemPrompt = "";

    switch (action) {
      case "improve":
        systemPrompt = `You are a professional writing assistant. Improve the following text by making it clearer, more concise, and more engaging. Maintain the original meaning and tone. Only return the improved text, nothing else.

IMPORTANT: Do NOT use any markdown formatting like **bold**, *italic*, bullet points, or headers. Write in plain text only.

Text to improve:
${text}`;
        break;

      case "proofread":
        systemPrompt = `You are a professional proofreader. Fix any grammar, spelling, punctuation, and syntax errors in the following text. Maintain the original meaning and style. Only return the corrected text, nothing else.

IMPORTANT: Do NOT use any markdown formatting like **bold**, *italic*, bullet points, or headers. Write in plain text only.

Text to proofread:
${text}`;
        break;

      case "translate":
        systemPrompt = `You are a professional translator. Translate the following text to ${language}. Maintain the original meaning, tone, and style. Only return the translated text, nothing else.

IMPORTANT: Do NOT use any markdown formatting like **bold**, *italic*, bullet points, or headers. Write in plain text only.

Text to translate:
${text}`;
        break;

      case "shorter":
        systemPrompt = `You are a professional editor. Make the following text shorter and more concise while preserving the key information and meaning. Only return the shortened text, nothing else.

IMPORTANT: Do NOT use any markdown formatting like **bold**, *italic*, bullet points, or headers. Write in plain text only.

Text to shorten:
${text}`;
        break;

      case "longer":
        systemPrompt = `You are a professional writer. Expand the following text by adding more details, examples, and explanations while maintaining the original meaning and tone. Only return the expanded text, nothing else.

IMPORTANT: Do NOT use any markdown formatting like **bold**, *italic*, bullet points, or headers. Write in plain text only.

Text to expand:
${text}`;
        break;

      case "tone":
        systemPrompt = `You are a professional writing assistant. Rewrite the following text in a ${tone} tone. Maintain the original meaning but adjust the style and word choice to match the ${tone} tone. Only return the rewritten text, nothing else.

IMPORTANT: Do NOT use any markdown formatting like **bold**, *italic*, bullet points, or headers. Write in plain text only.

Text to rewrite:
${text}`;
        break;

      case "simplify":
        systemPrompt = `You are a professional editor. Simplify the following text by using simpler words and shorter sentences. Make it easier to understand while preserving the original meaning. Only return the simplified text, nothing else.

IMPORTANT: Do NOT use any markdown formatting like **bold**, *italic*, bullet points, or headers. Write in plain text only.

Text to simplify:
${text}`;
        break;

      case "custom":
        if (text && text.trim()) {
          systemPrompt = `You are a helpful AI assistant. The user has selected the following text and wants you to help with it.

Selected text:
${text}

User request:
${prompt}

Please provide a helpful response. If the user is asking you to modify the text, return only the modified text. If the user is asking a question about the text, provide a clear and concise answer.

IMPORTANT: Do NOT use any markdown formatting like **bold**, *italic*, bullet points, or headers. Write in plain text only.`;
        } else {
          systemPrompt = `You are a helpful AI assistant. The user wants you to help with the following request:

${prompt}

Please provide a helpful, clear, and concise response. Generate the content they are asking for.

IMPORTANT: Do NOT use any markdown formatting like **bold**, *italic*, bullet points, or headers. Write in plain text only.`;
        }
        break;

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const result = await model.generateContent(systemPrompt);
    const response = result.response;
    const generatedText = response.text();
    const sanitizedText = sanitizeMarkdownFormatting(generatedText.trim());

    return NextResponse.json({
      result: sanitizedText,
      action,
    });
  } catch (error) {
    console.error("AI text assistant error:", error);
    return NextResponse.json(
      { error: "Failed to process text with AI" },
      { status: 500 }
    );
  }
}
