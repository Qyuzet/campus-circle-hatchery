import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

function sanitizeMermaidCode(code: string): string {
  return code
    .replace(/```mermaid\n?/g, "")
    .replace(/```\n?/g, "")
    .replace(/[""]/g, '"')
    .replace(/['']/g, "'")
    .replace(/[—–]/g, "-")
    .replace(/[^\x00-\x7F]/g, "")
    .trim();
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { action, prompt, context } = await request.json();

    if (!action) {
      return NextResponse.json(
        { error: "Action is required" },
        { status: 400 }
      );
    }

    if (!prompt || prompt.trim() === "") {
      return NextResponse.json(
        { error: "Prompt is required for this action" },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    let systemPrompt = "";
    let blockType = "text";

    switch (action) {
      case "table":
        blockType = "table";
        systemPrompt = `You are an AI assistant that generates table data in JSON format.

User request: ${prompt}
${context ? `Context: ${context}` : ""}

Generate a table based on the user's request. Return ONLY a valid JSON object with this exact structure:
{
  "headers": ["Column 1", "Column 2", "Column 3"],
  "rows": [
    ["Data 1", "Data 2", "Data 3"],
    ["Data 4", "Data 5", "Data 6"],
    ["Data 7", "Data 8", "Data 9"]
  ]
}

Rules:
- Generate at least 2 columns and 3 rows
- Use descriptive column names based on the request in the headers array
- Fill rows with relevant, realistic data as string arrays
- Each row array must have the same length as the headers array
- Return ONLY the JSON object, no markdown, no explanations, no code blocks`;
        break;

      case "flowchart":
        blockType = "mermaid";
        systemPrompt = `You are an AI assistant that creates compact Mermaid flowchart diagrams.

User request: ${prompt}
${context ? `Context: ${context}` : ""}

Generate a valid Mermaid flowchart diagram. Return ONLY the Mermaid code with NO markdown blocks or explanations.

CRITICAL RULES:
1. Start with EXACTLY: graph TD
2. Use ONLY letters A-Z for node IDs
3. Keep labels VERY SHORT (max 12 characters, prefer 6-8)
4. Use abbreviations: "Login" not "User Login Process"
5. Maximum 8 nodes total
6. Use ONLY ASCII characters
7. Arrow types: --> or -->|text|
8. Node shapes: [Square], (Round), {Diamond}
9. NO quotes, apostrophes, or special punctuation

COMPACT EXAMPLE:
graph TD
    A[Start] --> B[Login]
    B --> C{Valid}
    C -->|Yes| D[Home]
    C -->|No| E[Error]
    D --> F[End]
    E --> B

LABEL GUIDELINES:
- "User Authentication" → "Login"
- "Process Payment" → "Pay"
- "Validate Input" → "Check"
- "Save to Database" → "Save"
- "Display Error Message" → "Error"
- "Send Confirmation Email" → "Email"

FORBIDDEN:
- Long labels over 12 chars
- More than 8 nodes
- Unicode: ❌ ✓ → ←
- Special quotes: " " ' '
- Emojis or symbols
- Subgraphs or styling

Generate a COMPACT flowchart for: ${prompt}`;
        break;

      case "continue":
        blockType = "text";
        systemPrompt = `You are a writing assistant that continues writing naturally.

Topic: ${prompt}
${context ? `Current text: ${context}` : ""}

Write 2-3 sentences about the topic. ${
          context
            ? "Continue naturally from the existing text and match the tone and style."
            : "Start with engaging content."
        }`;
        break;

      case "summary":
        blockType = "text";
        systemPrompt = `You are a summarization assistant.

Text to summarize: ${context || prompt}

Create a concise summary that captures the key points. Keep it brief and clear.`;
        break;

      case "action-items":
        blockType = "text";
        systemPrompt = `You are an AI that extracts action items.

Text: ${context || prompt}

Extract and list action items in this format:
- [ ] Action item 1
- [ ] Action item 2
- [ ] Action item 3

Be specific and actionable.`;
        break;

      case "write-custom":
        blockType = "text";
        systemPrompt = `You are a creative writing assistant.

User request: ${prompt}
${context ? `Context: ${context}` : ""}

Write clear, engaging content based on the user's request. Be creative and helpful.`;
        break;

      case "brainstorm":
        blockType = "text";
        systemPrompt = `You are a brainstorming assistant.

Topic: ${prompt}
${context ? `Context: ${context}` : ""}

Generate 5-7 creative ideas related to the topic. Format as a bulleted list with brief explanations.`;
        break;

      case "code-help":
        blockType = "text";
        systemPrompt = `You are a coding assistant.

Question: ${prompt}
${context ? `Context: ${context}` : ""}

Provide clear code examples and explanations. Use proper formatting and best practices.`;
        break;

      case "ask-question":
        blockType = "text";
        systemPrompt = `You are a knowledgeable AI assistant.

Question: ${prompt}
${context ? `Context: ${context}` : ""}

Provide a clear, accurate, and helpful answer to the question.`;
        break;

      case "ask-page":
        blockType = "text";
        systemPrompt = `You are an AI assistant analyzing page content.

Page content: ${context}
Question: ${prompt}

Answer the question based on the page content provided.`;
        break;

      case "draft-outline":
        blockType = "text";
        systemPrompt = `You are an outline creation assistant.

Topic: ${prompt}
${context ? `Context: ${context}` : ""}

Create a structured outline with main sections and subsections. Use hierarchical formatting.`;
        break;

      case "draft-email":
        blockType = "text";
        systemPrompt = `You are an email drafting assistant.

Email purpose: ${prompt}
${context ? `Context: ${context}` : ""}

Draft a professional email with appropriate greeting, body, and closing.`;
        break;

      case "draft-agenda":
        blockType = "text";
        systemPrompt = `You are a meeting agenda assistant.

Meeting topic: ${prompt}
${context ? `Context: ${context}` : ""}

Create a structured meeting agenda with time allocations, topics, and objectives.`;
        break;

      case "draft-custom":
        blockType = "text";
        systemPrompt = `You are a drafting assistant.

User request: ${prompt}
${context ? `Context: ${context}` : ""}

Create a well-structured draft based on the user's request.`;
        break;

      default:
        blockType = "text";
        systemPrompt = `You are a helpful AI assistant.

User request: ${prompt}
${context ? `Context: ${context}` : ""}

Provide a helpful, clear, and concise response.`;
    }

    const result = await model.generateContent(systemPrompt);
    const response = result.response;
    let generatedContent = response.text().trim();

    if (action === "table") {
      generatedContent = generatedContent
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "");

      try {
        const tableData = JSON.parse(generatedContent);
        return NextResponse.json({
          blockType: "table",
          content: tableData,
        });
      } catch (error) {
        console.error("Failed to parse table JSON:", error);
        return NextResponse.json(
          { error: "Failed to generate valid table data" },
          { status: 500 }
        );
      }
    }

    if (action === "flowchart") {
      generatedContent = sanitizeMermaidCode(generatedContent);
    }

    return NextResponse.json({
      blockType,
      content: generatedContent,
    });
  } catch (error) {
    console.error("AI block generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate content" },
      { status: 500 }
    );
  }
}
