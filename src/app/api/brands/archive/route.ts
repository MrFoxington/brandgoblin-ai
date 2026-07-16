import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

/**
 * Soft-archive / restore a brand (July 16 2026).
 * Never deletes — archived brands move to the vault's Archived tab.
 * Not plan-gated: free users can tidy their vault too.
 */
export async function POST(request: Request) {
  const supabase = createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const body = (await request.json()) as { brandGenerationId?: string; archived?: boolean };
  const { brandGenerationId, archived } = body;

  if (!brandGenerationId || typeof archived !== "boolean") {
    return NextResponse.json({ error: "Missing brand id or archived flag." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("brand_generations")
    .update({ archived })
    .eq("id", brandGenerationId)
    .eq("user_id", authData.user.id) // ownership enforced in the update itself
    .select("id")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Brand not found or update failed." }, { status: 404 });
  }
  return NextResponse.json({ ok: true, archived });
}
