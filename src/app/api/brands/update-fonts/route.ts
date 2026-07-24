import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { normalizeTypography } from "@/lib/studio/fonts";
import type { BrandKit, BrandTypography } from "@/types";

export const runtime = "nodejs";

/**
 * Persists a brand's saved fonts (Saved Brand Fonts feature, July 2026).
 * Mirrors /api/brands/update-names: merges a typography patch into the brand's
 * output_data JSON. Fully additive — never touches other kit fields.
 */
export async function POST(request: Request) {
  const supabase = createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  let body: { brandGenerationId?: string; typography?: Partial<BrandTypography> };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { brandGenerationId, typography } = body;
  if (!brandGenerationId) {
    return NextResponse.json({ error: "Missing brand id." }, { status: 400 });
  }

  // Sanitize + validate. Custom font names go straight into image prompts, so
  // normalizeTypography strips anything that is not a plain font family name.
  const clean = normalizeTypography(typography);

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

  const currentKit = (existing.output_data ?? {}) as BrandKit;
  // Merge onto any existing typography so a partial save (e.g. just the body
  // font) keeps the other fields.
  const mergedTypography: BrandTypography = { ...(currentKit.typography ?? {}), ...clean };

  const updatedOutput = { ...(currentKit as object), typography: mergedTypography };
  const { error } = await supabase
    .from("brand_generations")
    .update({ output_data: updatedOutput })
    .eq("id", brandGenerationId)
    .eq("user_id", authData.user.id);

  if (error) {
    console.error("[/api/brands/update-fonts]", error);
    return NextResponse.json({ error: "Failed to save fonts." }, { status: 500 });
  }
  return NextResponse.json({ ok: true, typography: mergedTypography });
}
