// Download API Route
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabase";

// GET /api/download - Verify purchase and return signed download URL
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get("itemId");

    if (!itemId) {
      return NextResponse.json({ error: "Item ID required" }, { status: 400 });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user has purchased this item
    const transaction = await prisma.transaction.findFirst({
      where: {
        itemId: itemId,
        buyerId: user.id,
        status: "COMPLETED",
      },
      include: {
        item: true,
      },
    });

    if (!transaction) {
      return NextResponse.json(
        { error: "You must purchase this item to download it" },
        { status: 403 }
      );
    }

    if (!transaction.item?.fileUrl) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Extract filename from Supabase Storage URL
    const fileUrl = transaction.item.fileUrl;
    const fileName = fileUrl.split("/").pop();

    if (!fileName) {
      console.error("Invalid file URL format:", fileUrl);
      return NextResponse.json({ error: "Invalid file URL" }, { status: 500 });
    }

    // Generate a signed URL (valid for 1 hour)
    const { data, error } = await supabaseAdmin.storage
      .from("study-materials")
      .createSignedUrl(fileName, 3600);

    if (error) {
      console.error("Failed to generate signed URL:", error);
      return NextResponse.json(
        { error: "Failed to generate download link" },
        { status: 500 }
      );
    }

    // Increment download count
    await prisma.marketplaceItem.update({
      where: { id: itemId },
      data: {
        downloadCount: {
          increment: 1,
        },
      },
    });

    // Return the signed download URL and filename
    return NextResponse.json({
      success: true,
      downloadUrl: data.signedUrl,
      fileName: transaction.item.fileName || `${transaction.itemTitle}.pdf`,
    });
  } catch (error) {
    console.error("Download error:", error);
    return NextResponse.json(
      { error: "Failed to process download" },
      { status: 500 }
    );
  }
}
