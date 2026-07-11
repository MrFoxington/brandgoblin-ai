// POST /api/studio/cook-prompt
// Calls Claude Haiku to write a vivid image-generation prompt from the user's
// brand kit. FREE (text operation — no energy charge). Pro-gated.
// Rate limit: in-memory, best-effort (serverless instances don't share memory).

import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { paletteToWords } from "@/lib/studio/color-names";
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
  mascot:         "brand mascot character (full body, portrait)",
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

  let body: { brandId?: string; imageType?: string; userNote?: string; showBrandName?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { brandId, imageType, userNote } = body;
  // Brand name on the art is OPT-IN (July 11 2026 — forced names made every
  // product look like a mockup; clean art wins, the official logo stamp covers branding).
  const showBrandName = body.showBrandName === true;

  if (!imageType || !(imageType in ASSET_LABELS)) {
    return NextResponse.json({ error: "Invalid imageType." }, { status: 400 });
  }

  // Build brand context from saved kit
  let brandContext = "";
  let brandName = "";
  if (brandId) {
    const { data: brand } = await adminSb
      .from("brand_generations")
      .select("output_data")
      .eq("id", brandId)
      .eq("user_id", authData.user.id)
      .single();

    if (brand?.output_data) {
      const kit = brand.output_data as BrandKit;
      // Plain color WORDS only — never raw hex (image models print hex as text).
      const palette = paletteToWords(kit.colorPalette);
      const traits  = kit.brandVoice?.personalityTraits?.slice(0, 4).join(", ") ?? "";
      const tagline = kit.taglines?.[0] ?? "";
      const mission = kit.brandStory?.mission ?? "";
      brandName = kit.recommendedName ?? "";

      // The brand kit already contains a full mascot concept — feed it to the
      // prompt engineer when the user is generating their mascot (July 10 2026).
      const m = kit.mascot;
      const mascotContext =
        imageType === "mascot" && m
          ? [
              m.name              ? `Mascot name: ${m.name}`                    : "",
              m.appearance        ? `Mascot appearance: ${m.appearance}`        : "",
              m.personality       ? `Mascot personality: ${m.personality}`      : "",
              m.visualDescription ? `Mascot visual style: ${m.visualDescription}` : "",
              m.imagePrompt       ? `Mascot art direction: ${m.imagePrompt}`    : "",
            ].filter(Boolean).join("\n")
          : "";

      brandContext = [
        `Brand name: ${brandName}`,
        tagline  ? `Tagline: ${tagline}`               : "",
        mission  ? `Mission: ${mission}`                : "",
        traits   ? `Personality: ${traits}`             : "",
        palette  ? `Color palette (in words): ${palette}` : "",
        kit.logoPrompt ? `Logo direction: ${kit.logoPrompt}` : "",
        mascotContext,
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

  // Brand name as in-image typography is OPT-IN for products and social
  // graphics (user checkbox). Default is a completely text-free image —
  // models improvise garbled fake names otherwise, and the official logo
  // stamp is the proper branding path. Logo concepts stay icon-only.
  const isBrandedArt = imageType === "product_art" || imageType === "social_graphic";
  const wantsBrandName = isBrandedArt && showBrandName && brandName.trim().length > 0;

  const textRule = wantsBrandName
    ? `TEXT IN IMAGE: the design MUST display the brand name spelled EXACTLY as "${brandName}" in clean, legible, correctly-spelled typography that suits the brand style. That brand name is the ONLY text allowed — do NOT add taglines, body copy, color codes, hex values, "#" symbols, hashtags, numbers, measurements, random letters, gibberish, lorem ipsum, or watermarks.`
    : isBrandedArt
    ? `TEXT IN IMAGE: render NO text at all — no brand names, letters, words, numbers, color codes, hex values, "#" symbols, hashtags, or watermarks. The design must communicate purely through shape, color, material, lighting, and composition. Do NOT invent or paint any logo or wordmark onto the subject. CRITICAL: never write the brand name${brandName ? ` "${brandName}"` : ""} anywhere in your prompt — image models paint any name they read. Do not describe any lettering, engraving, embossing, printed labels, or logos. Use the brand identity ONLY for mood, colors, and style.`
    : imageType === "mascot"
    ? `CHARACTER: render exactly ONE full-body mascot character, head to toe, matching the described appearance and personality — expressive face, dynamic friendly pose, consistent character-design quality (think professional animation studio character sheet). TEXT IN IMAGE: render NO text at all — no letters, words, numbers, color codes, hex values, "#" symbols, or hashtags. BACKGROUND: clean, solid white background so the character can be cut out cleanly. The character itself may freely use any colors, including white.`
    : `TEXT IN IMAGE: this is an icon / symbol mark. Render NO text at all — no letters, words, numbers, color codes, hex values, "#" symbols, or hashtags. Shapes and symbol only. BACKGROUND: present the mark on a clean, solid white background, like a professional brand board. The design itself may freely use any colors, including white.`;

  const message = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 400,
    system: `You are an expert image-prompt engineer for text-to-image AI models (FLUX, Seedream).
Given a brand's identity and the requested asset type, write ONE vivid, concrete image-generation prompt.
Rules:
- Describe subject, composition, lighting, style, and mood with specific visual detail.
- COLORS: describe the palette using plain color WORDS only (e.g. "deep crimson, charcoal, warm gold"). NEVER write hex codes, "#" symbols, or numbers to specify color — image models print those characters as literal text on the artwork.
- Stay strictly true to the brand's personality, tone, and logo direction — no generic stock-art aesthetic.
- ${textRule}
- One short paragraph, 2-3 sentences max.
- Output must be ready to paste directly into a text-to-image model with no editing.`,
    messages: [{ role: "user", content: userMsg }],
  });

  let prompt =
    message.content[0].type === "text" ? message.content[0].text.trim() : "";

  if (!prompt) {
    return NextResponse.json({ error: "Failed to generate prompt." }, { status: 500 });
  }

  // HARD GUARANTEE (July 11 2026): when the brand name is OFF for branded art,
  // the name must not survive into the prompt regardless of what the prompt
  // engineer wrote — image models paint any name they read. Scrub every
  // occurrence (quoted or bare, case-insensitive), then pin an explicit
  // no-text clause to the end so the image model gets the rule directly.
  if (isBrandedArt && !showBrandName) {
    if (brandName.trim()) {
      const escaped = brandName.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      prompt = prompt
        .replace(new RegExp(`["'“‘]?${escaped}["'”’]?`, "gi"), "")
        .replace(/\s{2,}/g, " ")
        .replace(/\s+([,.;:])/g, "$1")
        .trim();
    }
    prompt = `${prompt} Absolutely no text anywhere in the image — no words, letters, numbers, brand names, logos, wordmarks, labels, or engravings. All surfaces are clean and unbranded.`;
  }

  return NextResponse.json({ prompt });
}
