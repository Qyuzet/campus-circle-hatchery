import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { GoogleGenerativeAI, Part } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  content?: string;
}

interface MentionItem {
  id: string;
  title: string;
  type: "note" | "library" | "listing" | "event" | "user";
  content?: string;
  description?: string;
  aiMetadata?: any;
}

// Helper to convert data URL to inline data format for Gemini
function dataUrlToInlineData(
  dataUrl: string
): { mimeType: string; data: string } | null {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return null;
  return {
    mimeType: match[1],
    data: match[2],
  };
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messages, context, contextDetails, attachments, mentions } =
      await request.json();

    // Debug logging
    console.log("[AI Chat] Request received:", {
      messageCount: messages?.length,
      attachmentCount: attachments?.length || 0,
      mentionCount: mentions?.length || 0,
      attachmentTypes: attachments?.map((a: any) => a.type) || [],
    });

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
6. Be helpful, concise, and accurate
7. When users mention items with @, focus your response on those specific items`;

    // Process mentioned items - these take priority
    const typedMentions = mentions as MentionItem[] | undefined;
    if (typedMentions && typedMentions.length > 0) {
      systemInstruction += `\n\n========== MENTIONED ITEMS START ==========`;
      for (const mention of typedMentions) {
        systemInstruction += `\n\n--- ${mention.type.toUpperCase()}: ${
          mention.title
        } ---`;
        if (mention.content) {
          systemInstruction += `\nContent: ${mention.content.substring(
            0,
            2000
          )}`;
        }
        if (mention.description) {
          systemInstruction += `\nDescription: ${mention.description}`;
        }
        if (mention.aiMetadata) {
          const meta = mention.aiMetadata;
          if (meta.contentSummary) {
            systemInstruction += `\nSummary: ${meta.contentSummary}`;
          }
          if (meta.keywords && meta.keywords.length > 0) {
            systemInstruction += `\nKeywords: ${meta.keywords.join(", ")}`;
          }
          if (meta.topics && meta.topics.length > 0) {
            systemInstruction += `\nTopics: ${meta.topics.join(", ")}`;
          }
        }
      }
      systemInstruction += `\n========== MENTIONED ITEMS END ==========`;
      systemInstruction += `\n\nThe user has specifically mentioned the items above using @. Focus your response on these items.`;
    }

    // Process attachments for system instruction context
    const typedAttachments = attachments as Attachment[] | undefined;
    const hasAttachments = typedAttachments && typedAttachments.length > 0;

    if (hasAttachments) {
      systemInstruction += `\n\n========== ATTACHED FILES ==========`;
      const fileDescriptions: string[] = [];

      for (const attachment of typedAttachments!) {
        if (
          attachment.type === "text/plain" ||
          attachment.type === "text/markdown"
        ) {
          // Include text content directly in system instruction
          systemInstruction += `\n\n--- File: ${attachment.name} ---`;
          systemInstruction += `\nContent:\n${
            attachment.content?.substring(0, 5000) || "[No content]"
          }`;
          fileDescriptions.push(`text file "${attachment.name}"`);
        } else if (attachment.type.startsWith("image/")) {
          fileDescriptions.push(`image "${attachment.name}"`);
        } else if (attachment.type === "application/pdf") {
          fileDescriptions.push(`PDF document "${attachment.name}"`);
        } else {
          fileDescriptions.push(`file "${attachment.name}"`);
        }
      }

      systemInstruction += `\n\nThe user has attached: ${fileDescriptions.join(
        ", "
      )}. `;
      systemInstruction += `Images and PDFs are provided inline for you to analyze directly. `;
      systemInstruction += `Carefully examine all attached files and answer the user's questions about them.`;
    }

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

    // Build message parts for multimodal input (text + images + PDFs)
    const messageParts: Part[] = [];

    // Add text content first
    if (lastMessage.content) {
      messageParts.push({ text: lastMessage.content });
    }

    // Add file attachments as inline data for Gemini multimodal
    if (hasAttachments) {
      for (const attachment of typedAttachments!) {
        if (attachment.content) {
          const inlineData = dataUrlToInlineData(attachment.content);
          if (inlineData) {
            // Gemini supports: images, PDFs, and other documents
            const supportedTypes = [
              "image/jpeg",
              "image/png",
              "image/gif",
              "image/webp",
              "application/pdf",
            ];

            if (supportedTypes.includes(inlineData.mimeType)) {
              console.log(
                `[AI Chat] Adding ${inlineData.mimeType} file to message: ${attachment.name}`
              );
              messageParts.push({
                inlineData: {
                  mimeType: inlineData.mimeType,
                  data: inlineData.data,
                },
              });
            }
          }
        }
      }
    }

    // If no parts, add a default text
    if (messageParts.length === 0) {
      messageParts.push({ text: "Hello" });
    }

    console.log(
      `[AI Chat] Sending message with ${messageParts.length} parts (text + files)`
    );

    // Send message with all parts (text + images + PDFs)
    const result = await chat.sendMessage(messageParts);

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
