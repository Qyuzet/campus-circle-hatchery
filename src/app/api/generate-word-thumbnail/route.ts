import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import mammoth from "mammoth";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const fileUrl = formData.get("fileUrl") as string;

    if (!fileUrl) {
      return NextResponse.json(
        { success: false, error: "Missing file URL" },
        { status: 400 }
      );
    }

    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error("Failed to fetch Word document");
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await mammoth.extractRawText({ buffer });
    const text = result.value;

    const lines = text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .slice(0, 15);

    return NextResponse.json({
      success: true,
      lines: lines,
      preview: text.substring(0, 500),
    });
  } catch (error: any) {
    console.error("Generate Word thumbnail error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
