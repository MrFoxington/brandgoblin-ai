import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const { data: authData } = await supabase.auth.getUser();

    const { brandGenerationId, eventType, properties } = await request.json();
    if (!eventType) return NextResponse.json({ error: "Missing eventType." }, { status: 400 });

    await supabase.from("brand_analytics").insert({
      brand_generation_id: brandGenerationId ?? null,
      user_id: authData.user?.id ?? null,
      event_type: eventType,
      properties: properties ?? {},
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[/api/brand/analytics]", err);
    return NextResponse.json({ error: "Failed to track event." }, { status: 500 });
  }
}
