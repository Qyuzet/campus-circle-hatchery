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

    // Build system instruction with page context
    let systemInstruction = `You are Campus AI, a helpful assistant for Campus Circle - a student platform for study materials, food, events, and clubs.

CRITICAL INSTRUCTIONS:
1. You have FULL ACCESS to the data visible on the user's current page (provided below)
2. When users ask about items, prices, or details - SEARCH through the provided data and give SPECIFIC answers
3. Always cite exact titles, prices, and details from the data
4. If an item is mentioned or referenced with "this", "that", or pronouns - use conversation context to identify it
5. For follow-up questions, refer to the previously discussed items
6. Be helpful, concise, and accurate`;

    // Check if we have full page context from PageContextProvider
    if (contextDetails && contextDetails.pageContextSummary) {
      systemInstruction += `\n\n========== PAGE DATA START ==========\n${contextDetails.pageContextSummary}\n========== PAGE DATA END ==========`;
      systemInstruction += `\n\nYou have access to ALL the data listed above. When the user asks about any item, event, food, or club - find it in the data and provide the exact information. For follow-up questions like "what does this talk about" or "tell me more", refer to the item just discussed in the conversation.`;
    }
    // Legacy note context support
    else if (
      contextDetails &&
      contextDetails.title &&
      contextDetails.content !== undefined
    ) {
      const noteContent = contextDetails.content || "";
      systemInstruction += `\n\nThe user is currently viewing their note titled "${contextDetails.title}".`;

      if (contextDetails.subject) {
        systemInstruction += `\nSubject: ${contextDetails.subject}`;
      }

      if (contextDetails.course) {
        systemInstruction += `\nCourse: ${contextDetails.course}`;
      }

      if (noteContent) {
        systemInstruction += `\n\nNote content:\n${noteContent}`;
      }

      systemInstruction += `\n\nYou can help the user with questions about this note, suggest improvements, add examples, or help organize the information.`;
    } else if (context && context !== "No context") {
      systemInstruction += `\n\nThe user is currently in the ${context} section of the platform.`;
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
      systemInstruction: systemInstruction,
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 2048,
      },
    });

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
    let detailedContext = "";

    if (contextDetails && contextDetails.pageContextSummary) {
      contextInfo = `on the ${contextDetails.pageName} page`;
      detailedContext = contextDetails.pageContextSummary;
    } else if (
      contextDetails &&
      contextDetails.title &&
      contextDetails.content !== undefined
    ) {
      contextInfo = `viewing their note titled "${contextDetails.title}"${
        contextDetails.subject ? ` in ${contextDetails.subject}` : ""
      }`;
    } else if (context && context !== "No context") {
      contextInfo = `in the ${context} section`;
    } else {
      contextInfo = "asking a general question";
    }

    // Build conversation context for reasoning - include recent messages to understand "this", "that" references
    let conversationContext = "";
    if (messages.length > 1) {
      const recentMessages = messages.slice(-5); // Last 5 messages for context
      conversationContext = "\n\nRecent conversation:\n";
      recentMessages.forEach((msg: any) => {
        const role = msg.type === "user" ? "User" : "AI";
        conversationContext += `${role}: ${msg.content.substring(0, 200)}${
          msg.content.length > 200 ? "..." : ""
        }\n`;
      });
    }

    let reasoningPrompt = `You are analyzing a user's question to provide context. The user is ${contextInfo}.`;

    if (detailedContext) {
      reasoningPrompt += `\n\nAvailable Page Data:\n${detailedContext}`;
    }

    if (conversationContext) {
      reasoningPrompt += conversationContext;
    }

    reasoningPrompt += `\n\nCurrent question: "${lastMessage.content}"

Provide a brief 1-2 sentence reasoning about what the user is asking. If they use words like "this", "that", or "it", identify what they're referring to from the conversation. Start with "The user" and explain your understanding.`;

    const reasoningResult = await reasoningModel.generateContent(
      reasoningPrompt
    );
    const reasoning = reasoningResult.response.text();

    // Send just the user message - system instruction already contains page data
    const result = await chat.sendMessage(lastMessage.content);

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
