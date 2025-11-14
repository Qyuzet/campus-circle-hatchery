// Cleanup API - Remove marketplace items without files
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/marketplace/cleanup - Delete items without files (admin/maintenance endpoint)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Delete all items where fileUrl is null or empty
    const result = await prisma.marketplaceItem.deleteMany({
      where: {
        OR: [
          { fileUrl: null },
          { fileUrl: "" },
        ],
      },
    });

    return NextResponse.json({
      message: `Successfully deleted ${result.count} untradable items without files`,
      deletedCount: result.count,
    });
  } catch (error) {
    console.error("Error cleaning up marketplace items:", error);
    return NextResponse.json(
      { error: "Failed to cleanup marketplace items" },
      { status: 500 }
    );
  }
}

// GET /api/marketplace/cleanup - Count items without files
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Count items where fileUrl is null or empty
    const count = await prisma.marketplaceItem.count({
      where: {
        OR: [
          { fileUrl: null },
          { fileUrl: "" },
        ],
      },
    });

    return NextResponse.json({
      message: `Found ${count} untradable items without files`,
      count,
    });
  } catch (error) {
    console.error("Error counting items without files:", error);
    return NextResponse.json(
      { error: "Failed to count items without files" },
      { status: 500 }
    );
  }
}

