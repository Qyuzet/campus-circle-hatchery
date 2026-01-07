import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { GoogleGenAI } from "@google/genai";

// Initialize the new Google GenAI client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

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

    const {
      messages,
      context,
      contextDetails,
      attachments,
      mentions,
      sourceSettings,
    } = await request.json();

    // Extract source settings with defaults
    const hasMentions = mentions && mentions.length > 0;
    const hasRichContext = !!contextDetails?.pageContextSummary;
    const hasAttachments = attachments && attachments.length > 0;
    const hasLocalContext = hasMentions || hasRichContext || hasAttachments;

    // Web search: Pass through the user's setting
    // The AI will dynamically decide whether to use web search based on the question context
    // This allows intelligent tool selection rather than deterministic keyword matching
    const webSearchEnabled = sourceSettings?.webSearch ?? false;
    const appsIntegrationsEnabled = sourceSettings?.appsIntegrations ?? true;

    // Debug logging
    console.log("[AI Chat] Request received:", {
      messageCount: messages?.length,
      attachmentCount: attachments?.length || 0,
      mentionCount: mentions?.length || 0,
      attachmentTypes: attachments?.map((a: any) => a.type) || [],
      webSearchEnabled,
      appsIntegrationsEnabled,
      hasLocalContext,
      hasMentions,
      hasRichContext,
    });

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      );
    }

    // Build system instruction with page context
    let systemInstruction = `You are Campus AI, a helpful assistant for Campus Circle - a student platform for study materials, food, events, and clubs.

CRITICAL INSTRUCTIONS - CHOOSING THE RIGHT SOURCE:

You have TWO sources of information available:
1. LOCAL PAGE DATA - Information about the user's current page (study materials, food, events, clubs)
2. WEB SEARCH - Real-time internet search for external information

DECISION RULES:
- If the user asks about items ON THE PAGE (prices, titles, descriptions, comparisons) -> USE LOCAL DATA
- If the user asks about EXTERNAL topics (news, world events, general knowledge, things not on the page) -> USE WEB SEARCH
- If the user explicitly mentions "internet", "online", "search", "news", "latest" -> USE WEB SEARCH
- For follow-up questions: determine if they're asking about page data or external info

WHEN USING LOCAL DATA:
- Find the EXACT item in the provided page data
- Cite specific titles, prices, descriptions from the data
- For comparisons (most expensive, cheapest, highest rated) - scan ALL items and compare

WHEN USING WEB SEARCH:
- Search for current, up-to-date information
- Provide helpful answers with sources when available

HANDLE REFERENCES:
- "this", "that", "it" - refer to the item just discussed
- "@mentions" - specifically about that mentioned item
- Follow-up questions use context from previous messages

RESPONSE GUIDELINES:
- Be accurate and helpful
- Be concise but complete
- If you're not sure which source to use, consider what the user actually needs`;

    // Process mentioned items - these take HIGHEST priority
    const typedMentions = mentions as MentionItem[] | undefined;
    if (typedMentions && typedMentions.length > 0) {
      systemInstruction += `\n\n========== USER MENTIONED ITEMS (HIGHEST PRIORITY) ==========`;
      systemInstruction += `\nThe user specifically referenced these items using @mentions. Your answer MUST be based on this data:`;
      for (const mention of typedMentions) {
        systemInstruction += `\n\n### ${mention.type.toUpperCase()}: "${
          mention.title
        }"`;
        if (mention.content) {
          systemInstruction += `\n**Full Content:**\n${mention.content.substring(
            0,
            3000
          )}`;
        }
        if (mention.description) {
          systemInstruction += `\n**Description:** ${mention.description}`;
        }
        if (mention.aiMetadata) {
          const meta = mention.aiMetadata;
          if (meta.contentSummary) {
            systemInstruction += `\n**Content Summary:** ${meta.contentSummary}`;
          }
          if (meta.keywords && meta.keywords.length > 0) {
            systemInstruction += `\n**Keywords:** ${meta.keywords.join(", ")}`;
          }
          if (meta.topics && meta.topics.length > 0) {
            systemInstruction += `\n**Topics Covered:** ${meta.topics.join(
              ", "
            )}`;
          }
        }
      }
      systemInstruction += `\n========== END MENTIONED ITEMS ==========`;
      systemInstruction += `\n\nIMPORTANT: The user is asking about the @mentioned items above. Answer ONLY using the data provided for these items. Do NOT search the web or make up information.`;
    }

    // Process attachments for system instruction context
    const typedAttachments = attachments as Attachment[] | undefined;
    const hasTypedAttachments = typedAttachments && typedAttachments.length > 0;

    if (hasTypedAttachments) {
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
      systemInstruction += `\n\n========== CURRENT PAGE DATA ==========\n${contextDetails.pageContextSummary}\n========== END PAGE DATA ==========`;
      systemInstruction += `\n\nPAGE DATA INSTRUCTIONS:
- For questions about items ON THIS PAGE (prices, titles, descriptions, comparisons) -> use the PAGE DATA above
- For questions about EXTERNAL topics (news, world events, general knowledge) -> use Web Search
- The page data contains ALL information about study materials, food, events, or clubs shown on the current page
- For comparisons (most expensive, cheapest, best rated) - scan ALL items in the PAGE DATA
- If user refers to "this page", "these items", "the listings" - they mean the PAGE DATA above`;
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

    // Build conversation history in new SDK format
    const conversationHistory = messages.slice(0, -1).map((msg: any) => ({
      role: msg.type === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    const lastMessage = messages[messages.length - 1];

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

Provide a brief 1-2 sentence reasoning about what the user is asking.
- If they use words like "this", "that", or "it", identify what they're referring to from the conversation
- If they ask about prices, ratings, or specific items - reference the Available Page Data above
- For follow-up questions, the answer is ALWAYS in the Page Data - identify which data point answers the question
Start with "The user" and explain your understanding.`;

    // Generate reasoning using the new SDK
    const reasoningResult = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: reasoningPrompt,
    });
    const reasoning = reasoningResult.text || "";

    // Build message parts for multimodal input (text + images + PDFs)
    interface MessagePart {
      text?: string;
      inlineData?: { mimeType: string; data: string };
    }
    const messageParts: MessagePart[] = [];

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

    // Build tools array - add Google Search if enabled
    const tools: any[] = [];
    if (webSearchEnabled) {
      tools.push({ googleSearch: {} });
      console.log("[AI Chat] Web search grounding enabled");
    }

    // Build the full conversation with system instruction and history
    const fullContents = [
      ...conversationHistory,
      {
        role: "user" as const,
        parts: messageParts,
      },
    ];

    // Generate content with the new SDK - using chat-like approach with history
    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: fullContents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 2048,
        tools: tools.length > 0 ? tools : undefined,
      },
    });

    const aiResponse = result.text || "";

    // Extract grounding metadata if web search was used
    let searchSources: any[] = [];
    const groundingMetadata = result.candidates?.[0]?.groundingMetadata;
    if (groundingMetadata) {
      console.log("[AI Chat] Web search grounding was used");
      if (groundingMetadata.groundingChunks) {
        searchSources = groundingMetadata.groundingChunks.map((chunk: any) => ({
          uri: chunk.web?.uri || "",
          title: chunk.web?.title || "",
        }));
      }
    }

    return NextResponse.json({
      content: aiResponse,
      reasoning: reasoning,
      timestamp: new Date().toISOString(),
      webSearchUsed: webSearchEnabled && groundingMetadata !== undefined,
      searchSources: searchSources.length > 0 ? searchSources : undefined,
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
