import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

    const { brandGenerationId, rating, feedbackText } = await request.json();
    if (!brandGenerationId || !rating) {
      return NextResponse.json({ error: "Missing fields." }, { status: 400 });
    }

    const { error } = await supabase.from("brand_feedback").upsert(
      { brand_generation_id: brandGenerationId, user_id: authData.user.id, rating, feedback_text: feedbackText ?? null },
      { onConflict: "brand_generation_id,user_id" }
    );

    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[/api/brand/feedback]", err);
    return NextResponse.json({ error: "Failed to save feedback." }, { status: 500 });
  }
}
