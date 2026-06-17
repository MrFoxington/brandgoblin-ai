import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { BRAND_GOBLIN_SYSTEM_PROMPT } from "@/lib/prompts";
import type { BrandInput, FavoriteName, AlternativeName } from "@/types";

export const runtime = "nodejs";
export const maxDuration = 120;

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) {
    return new Response(JSON.stringify({ error: "Not authenticated." }), { status: 401 });
  }

  const { input, excludeNames }: { input: BrandInput; excludeNames: string[] } = await request.json();

  const exclude = excludeNames?.length
    ? `\n\nIMPORTANT: Do NOT suggest any of these names (already shown to the user): ${excludeNames.join(", ")}`
    : "";

  const prompt = `Generate 5 fresh brand name ideas for the following business. Return ONLY a JSON object.

BUSINESS IDEA: ${input.businessIdea}
INDUSTRY / CATEGORY: ${input.industry}
TARGET AUDIENCE: ${input.targetAudience}
DESIRED BRAND VIBE: ${input.vibe}
OPTIONAL KEYWORDS: ${input.keywords?.trim() || "none"}
THINGS TO AVOID: ${input.avoid?.trim() || "none"}${exclude}

Return exactly this JSON shape:
{
  "favoriteName": { "name": string, "tagline": string, "whyPicked": string, "bestFor": string },
  "alternativeNames": [
    { "name": string, "tagline": string, "whyItWorks": string },
    { "name": string, "tagline": string, "whyItWorks": string },
    { "name": string, "tagline": string, "whyItWorks": string },
    { "name": string, "tagline": string, "whyItWorks": string }
  ]
}`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2000,
      system: BRAND_GOBLIN_SYSTEM_PROMPT,
      messages: [{ role: "user", content: prompt }],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") throw new Error("No text response.");

    const raw = textBlock.text.replace(/```(?:json)?\s*/gi, "").replace(/```/g, "").trim();
    const data: { favoriteName: FavoriteName; alternativeNames: AlternativeName[] } = JSON.parse(raw);

    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[/api/generate/names]", err);
    return new Response(JSON.stringify({ error: "Failed to conjure names. Try again." }), { status: 500 });
  }
}
