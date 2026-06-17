import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

    const { brandGenerationId, wouldBuild } = await request.json();
    if (!brandGenerationId || !wouldBuild) {
      return NextResponse.json({ error: "Missing fields." }, { status: 400 });
    }

    const { error } = await supabase.from("brand_validation").upsert(
      { brand_generation_id: brandGenerationId, user_id: authData.user.id, would_build: wouldBuild },
      { onConflict: "brand_generation_id,user_id" }
    );

    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[/api/brand/validation]", err);
    return NextResponse.json({ error: "Failed to save validation." }, { status: 500 });
  }
}
