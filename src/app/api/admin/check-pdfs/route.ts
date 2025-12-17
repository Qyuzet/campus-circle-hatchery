import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true },
    });

    if (user?.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden - Admin only" },
        { status: 403 }
      );
    }

    const allDocs = await prisma.marketplaceItem.findMany({
      where: {
        OR: [
          { fileType: "application/pdf" },
          { fileType: "application/msword" },
          {
            fileType:
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          },
        ],
      },
      select: {
        id: true,
        title: true,
        fileUrl: true,
        fileName: true,
        fileType: true,
        thumbnailUrl: true,
      },
    });

    const docsWithoutThumbnails = allDocs.filter((doc) => !doc.thumbnailUrl);

    return NextResponse.json({
      success: true,
      totalDocs: allDocs.length,
      docsWithoutThumbnails: docsWithoutThumbnails.length,
      allPdfs: allDocs,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
