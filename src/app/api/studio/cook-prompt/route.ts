// POST /api/studio/cook-prompt
// Calls Claude Haiku to write a vivid image-generation prompt from the user's
// brand kit. FREE (text operation — no energy charge). Pro-gated.
// Rate limit: in-memory, best-effort (serverless instances don't share memory).

import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import type { ImageType } from "@/lib/energy-config";
import type { BrandKit } from "@/types";

export const runtime = "nodejs";
export const maxDuration = 20;

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Best-effort per-user rate limit (~20 calls/min). Not strict across instances.
const rateBucket = new Map<string, number[]>();
function isRateLimited(userId: string): boolean {
  const now = Date.now();
  const recent = (rateBucket.get(userId) ?? []).filter((t) => now - t < 60_000);
  if (recent.length >= 20) return true;
  rateBucket.set(userId, [...recent, now]);
  return false;
}

const ASSET_LABELS: Record<ImageType, string> = {
  logo_concept:   "logo concept / icon mark",
  social_graphic: "social media graphic (landscape, 4:3)",
  product_art:    "product hero image",
};

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const adminSb = createAdminClient();
  const { data: userRow } = await adminSb
    .from("users")
    .select("plan")
    .eq("id", authData.user.id)
    .single();

  if (!userRow || userRow.plan !== "pro") {
    return NextResponse.json({ error: "Creator Pro required." }, { status: 403 });
  }

  if (isRateLimited(authData.user.id)) {
    return NextResponse.json({ error: "Slow down a bit — too many prompt requests." }, { status: 429 });
  }

  let body: { brandId?: string; imageType?: string; userNote?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { brandId, imageType, userNote } = body;

  if (!imageType || !(imageType in ASSET_LABELS)) {
    return NextResponse.json({ error: "Invalid imageType." }, { status: 400 });
  }

  // Build brand context from saved kit
  let brandContext = "";
  if (brandId) {
    const { data: brand } = await adminSb
      .from("brand_generations")
      .select("output_data")
      .eq("id", brandId)
      .eq("user_id", authData.user.id)
      .single();

    if (brand?.output_data) {
      const kit = brand.output_data as BrandKit;
      const palette = kit.colorPalette?.map((c) => `${c.hex} (${c.name})`).join(", ") ?? "";
      const traits  = kit.brandVoice?.personalityTraits?.slice(0, 4).join(", ") ?? "";
      const tagline = kit.taglines?.[0] ?? "";
      const mission = kit.brandStory?.mission ?? "";

      brandContext = [
        `Brand name: ${kit.recommendedName}`,
        tagline  ? `Tagline: ${tagline}`               : "",
        mission  ? `Mission: ${mission}`                : "",
        traits   ? `Personality: ${traits}`             : "",
        palette  ? `Color palette: ${palette}`          : "",
        kit.logoPrompt ? `Logo direction: ${kit.logoPrompt}` : "",
      ].filter(Boolean).join("\n");
    }
  }

  const userMsg = [
    brandContext
      ? `BRAND IDENTITY:\n${brandContext}`
      : "No brand — write a versatile creative prompt.",
    `\nASSET TYPE: ${ASSET_LABELS[imageType as ImageType]}`,
    userNote ? `\nUSER DIRECTION: ${userNote}` : "",
    "\nWrite ONE image-generation prompt now.",
  ].join("");

  const message = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 400,
    system: `You are an expert image-prompt engineer for text-to-image AI models (FLUX, Seedream).
Given a brand's identity and the requested asset type, write ONE vivid, concrete image-generation prompt.
Rules:
- Describe subject, composition, lighting, style, mood, and colors with specific visual detail
- Reference the exact brand hex colors if provided
- Stay true to the brand's personality and logo direction
- VISUAL DESCRIPTION ONLY — no marketing copy, no slogans, no text-in-image instructions
- One short paragraph, 2-3 sentences max
- Produce output ready to paste directly into a text-to-image model`,
    messages: [{ role: "user", content: userMsg }],
  });

  const prompt =
    message.content[0].type === "text" ? message.content[0].text.trim() : "";

  if (!prompt) {
    return NextResponse.json({ error: "Failed to generate prompt." }, { status: 500 });
  }

  return NextResponse.json({ prompt });
}
