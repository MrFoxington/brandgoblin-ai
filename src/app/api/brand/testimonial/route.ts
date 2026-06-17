import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

    const { brandGenerationId, testimonialText } = await request.json();
    if (!brandGenerationId || !testimonialText?.trim()) {
      return NextResponse.json({ error: "Missing fields." }, { status: 400 });
    }

    const { error } = await supabase.from("brand_testimonials").insert({
      brand_generation_id: brandGenerationId,
      user_id: authData.user.id,
      testimonial_text: testimonialText.trim(),
    });

    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[/api/brand/testimonial]", err);
    return NextResponse.json({ error: "Failed to save testimonial." }, { status: 500 });
  }
}
