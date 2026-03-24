import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { uploadSelfie } from "@/lib/imagekit";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { image, fileName } = await request.json();

    if (!image || !fileName) {
      return NextResponse.json(
        { error: "Image and fileName are required" },
        { status: 400 }
      );
    }

    const url = await uploadSelfie(image, fileName);

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    );
  }
}
