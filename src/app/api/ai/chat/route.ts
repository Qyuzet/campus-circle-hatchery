import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";
import pdfParse from "pdf-parse";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  content?: string;
  extractedText?: string; // For PDFs after parsing
}

interface MentionItem {
  id: string;
  title: string;
  type: "note" | "library" | "listing" | "event" | "user";
  content?: string;
  description?: string;
  aiMetadata?: any;
}

// Helper function to extract text from PDF base64
async function extractPdfText(base64Content: string): Promise<string> {
  try {
    // Remove data URL prefix if present
    const base64Data = base64Content.replace(/^data:[^;]+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");
    const data = await pdfParse(buffer);
    return data.text || "";
  } catch (error) {
    console.error("PDF parsing error:", error);
    return "[Error extracting PDF content]";
  }
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

    // Process attachments - extract PDF text content
    const typedAttachments = attachments as Attachment[] | undefined;
    if (typedAttachments && typedAttachments.length > 0) {
      // First, extract text from PDFs
      for (const attachment of typedAttachments) {
        if (attachment.type === "application/pdf" && attachment.content) {
          console.log(`[AI Chat] Extracting text from PDF: ${attachment.name}`);
          attachment.extractedText = await extractPdfText(attachment.content);
          console.log(
            `[AI Chat] Extracted ${attachment.extractedText.length} chars from PDF`
          );
        }
      }

      systemInstruction += `\n\n========== ATTACHED FILES START ==========`;
      const imageCount = typedAttachments.filter((a) =>
        a.type.startsWith("image/")
      ).length;
      const textCount = typedAttachments.filter(
        (a) => a.type === "text/plain" || a.type === "text/markdown"
      ).length;
      const pdfCount = typedAttachments.filter(
        (a) => a.type === "application/pdf"
      ).length;

      for (const attachment of typedAttachments) {
        systemInstruction += `\n\n--- File: ${attachment.name} (${attachment.type}) ---`;
        if (
          attachment.content &&
          (attachment.type === "text/plain" ||
            attachment.type === "text/markdown")
        ) {
          // Include text content directly
          systemInstruction += `\nContent:\n${attachment.content.substring(
            0,
            5000
          )}`;
        } else if (attachment.type.startsWith("image/")) {
          systemInstruction += `\n[Image will be provided inline - analyze it carefully]`;
        } else if (
          attachment.type === "application/pdf" &&
          attachment.extractedText
        ) {
          // Include extracted PDF text
          systemInstruction += `\nExtracted PDF Content:\n${attachment.extractedText.substring(
            0,
            8000
          )}`;
        } else if (
          attachment.type === "application/msword" ||
          attachment.type ===
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ) {
          systemInstruction += `\n[Word document - ${Math.round(
            attachment.size / 1024
          )}KB - Word parsing not yet supported]`;
        } else {
          systemInstruction += `\n[File attached - ${Math.round(
            attachment.size / 1024
          )}KB]`;
        }
      }
      systemInstruction += `\n========== ATTACHED FILES END ==========`;

      if (imageCount > 0) {
        systemInstruction += `\n\nThe user has attached ${imageCount} image(s) that will be provided inline. Analyze the image(s) carefully and respond to their questions about them.`;
      }
      if (textCount > 0) {
        systemInstruction += `\n\nThe user has attached ${textCount} text file(s). The content is provided above.`;
      }
      if (pdfCount > 0) {
        systemInstruction += `\n\nThe user has attached ${pdfCount} PDF file(s). The extracted text content is provided above. Answer questions based on this content.`;
      }
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

    // Build message parts - include images if attached
    const messageParts: any[] = [];

    // Add text content
    if (lastMessage.content) {
      messageParts.push({ text: lastMessage.content });
    }

    // Add image attachments as inline data for Gemini vision
    if (typedAttachments && typedAttachments.length > 0) {
      for (const attachment of typedAttachments) {
        if (attachment.content && attachment.type.startsWith("image/")) {
          // Extract base64 data from data URL
          const base64Match = attachment.content.match(
            /^data:([^;]+);base64,(.+)$/
          );
          if (base64Match) {
            const mimeType = base64Match[1];
            const base64Data = base64Match[2];
            messageParts.push({
              inlineData: {
                mimeType: mimeType,
                data: base64Data,
              },
            });
          }
        }
      }
    }

    // If no parts, add empty text
    if (messageParts.length === 0) {
      messageParts.push({ text: "Hello" });
    }

    // Send message with all parts (text + images)
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
