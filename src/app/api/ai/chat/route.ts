import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messages, context, contextDetails } = await request.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
      generationConfig: {
        temperature: 0.9,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 2048,
      },
    });

    let systemContext = `You are a helpful AI assistant for Campus Circle, a student platform. You help students with their studies, notes, and academic questions.`;

    if (contextDetails && contextDetails.title) {
      const noteContent = contextDetails.content || "";
      systemContext += `\n\nThe user is currently viewing their note titled "${contextDetails.title}".`;

      if (contextDetails.subject) {
        systemContext += `\nSubject: ${contextDetails.subject}`;
      }

      if (contextDetails.course) {
        systemContext += `\nCourse: ${contextDetails.course}`;
      }

      if (noteContent) {
        systemContext += `\n\nNote content:\n${noteContent}`;
      }

      systemContext += `\n\nYou can help the user with questions about this note, suggest improvements, add examples, or help organize the information.`;
    } else if (context && context !== "No context") {
      systemContext += `\n\nThe user is currently in the ${context} section of the platform.`;
    }

    const conversationHistory = messages.map((msg: any) => ({
      role: msg.type === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({
      history: conversationHistory.slice(0, -1),
    });

    const lastMessage = messages[messages.length - 1];

    const reasoningModel = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
    });

    let contextInfo = "";
    if (contextDetails && contextDetails.title) {
      contextInfo = `viewing their note titled "${contextDetails.title}"${
        contextDetails.subject ? ` in ${contextDetails.subject}` : ""
      }`;
    } else if (context && context !== "No context") {
      contextInfo = `in the ${context} section`;
    } else {
      contextInfo = "asking a general question";
    }

    const reasoningPrompt = `You are analyzing a user's question to provide context. The user is ${contextInfo}.

User's question: "${lastMessage.content}"

Provide a brief 1-2 sentence reasoning about what the user is asking and how you plan to help them. Be specific and contextual. Start with "The user" and explain your understanding.`;

    const reasoningResult = await reasoningModel.generateContent(
      reasoningPrompt
    );
    const reasoning = reasoningResult.response.text();

    const result = await chat.sendMessage(
      `${systemContext}\n\nUser: ${lastMessage.content}\n\nProvide a helpful response. Use markdown formatting for better readability:\n- Use **bold** for important terms\n- Use bullet points with - for lists\n- Use ## for section headers if needed\n- Use \`code\` for technical terms or code snippets`
    );

    const response = result.response;
    const aiResponse = response.text();

    return NextResponse.json({
      content: aiResponse,
      reasoning: reasoning,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("AI chat error:", error);

    if (error.message?.includes("API key")) {
      return NextResponse.json(
        { error: "AI service configuration error. Please contact support." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Failed to process chat message. Please try again." },
      { status: 500 }
    );
  }
}
