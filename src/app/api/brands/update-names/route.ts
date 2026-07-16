import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { FavoriteName, AlternativeName } from "@/types";

export const runtime = "nodejs";

/**
 * Persists name changes on a brand kit (July 16 2026 — Fox's find:
 * conjured names lived only in React state, so a refresh silently
 * reverted the brand to the original name).
 * Accepts any of: favoriteName, alternativeNames, recommendedName.
 */
export async function POST(request: Request) {
  const supabase = createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const body = (await request.json()) as {
    brandGenerationId?: string;
    favoriteName?: FavoriteName;
    alternativeNames?: AlternativeName[];
    recommendedName?: string;
  };
  const { brandGenerationId, favoriteName, alternativeNames, recommendedName } = body;

  if (!brandGenerationId) {
    return NextResponse.json({ error: "Missing brand id." }, { status: 400 });
  }
  if (
    recommendedName !== undefined &&
    (typeof recommendedName !== "string" || !recommendedName.trim() || recommendedName.length > 80)
  ) {
    return NextResponse.json({ error: "Invalid brand name." }, { status: 400 });
  }
  if (favoriteName !== undefined && (typeof favoriteName?.name !== "string" || !favoriteName.name.trim())) {
    return NextResponse.json({ error: "Invalid favorite name." }, { status: 400 });
  }
  if (alternativeNames !== undefined && !Array.isArray(alternativeNames)) {
    return NextResponse.json({ error: "Invalid alternative names." }, { status: 400 });
  }

  // Ownership check + current kit
  const { data: existing } = await supabase
    .from("brand_generations")
    .select("output_data")
    .eq("id", brandGenerationId)
    .eq("user_id", authData.user.id)
    .single();

  if (!existing) {
    return NextResponse.json({ error: "Brand not found." }, { status: 404 });
  }

  const patch: Record<string, unknown> = {};
  if (favoriteName !== undefined) patch.favoriteName = favoriteName;
  if (alternativeNames !== undefined) patch.alternativeNames = alternativeNames;
  if (recommendedName !== undefined) patch.recommendedName = recommendedName.trim();
  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  }

  const updatedOutput = { ...(existing.output_data as object), ...patch };
  const { error } = await supabase
    .from("brand_generations")
    .update({ output_data: updatedOutput })
    .eq("id", brandGenerationId)
    .eq("user_id", authData.user.id);

  if (error) {
    console.error("[/api/brands/update-names]", error);
    return NextResponse.json({ error: "Failed to save." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
