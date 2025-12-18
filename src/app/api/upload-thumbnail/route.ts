import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";
import { generateRandomFilename } from "@/lib/sanitize-filename";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "Missing file" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const fileExtension = file.name.split(".").pop() || "jpg";
    const uniqueFileName = generateRandomFilename(fileExtension);

    const contentType = file.type || "image/jpeg";

    const { data, error } = await supabaseAdmin.storage
      .from("study-materials")
      .upload(uniqueFileName, buffer, {
        contentType: contentType,
        upsert: true,
      });

    if (error) {
      console.error("Supabase upload error:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    const {
      data: { publicUrl },
    } = supabaseAdmin.storage
      .from("study-materials")
      .getPublicUrl(uniqueFileName);

    return NextResponse.json({
      success: true,
      thumbnailUrl: publicUrl,
    });
  } catch (error: any) {
    console.error("Upload thumbnail error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
