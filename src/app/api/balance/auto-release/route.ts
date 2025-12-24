import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { autoReleaseBalances } from "@/lib/auto-release-balance";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await autoReleaseBalances();

    return NextResponse.json(result);
  } catch (error) {
    console.error("Auto-release balance API error:", error);
    return NextResponse.json(
      { error: "Failed to auto-release balances" },
      { status: 500 }
    );
  }
}

