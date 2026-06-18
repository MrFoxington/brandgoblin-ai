import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { BRAND_GOBLIN_SYSTEM_PROMPT } from "@/lib/prompts";
import type { BrandInput, BrandKit } from "@/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const VALID_SECTIONS = [
  "taglines",
  "brandStory",
  "brandVoice",
  "mascot",
  "logoPrompt",
  "colorPalette",
  "websiteCopy",
  "socialKit",
  "marketingIdeas",
  "launchPlan",
] as const;

type SectionKey = (typeof VALID_SECTIONS)[number];

function buildSectionPrompt(
  section: SectionKey,
  brandName: string,
  input: BrandInput,
  kit: Partial<BrandKit>
): string {
  const ctx = `BRAND NAME: ${brandName}
BUSINESS IDEA: ${input.businessIdea}
INDUSTRY: ${input.industry}
TARGET AUDIENCE: ${input.targetAudience}
BRAND VIBE: ${input.vibe}
KEYWORDS: ${input.keywords?.trim() || "none"}
AVOID: ${input.avoid?.trim() || "none"}`;

  const schemas: Record<SectionKey, string> = {
    taglines: `Generate 10 fresh, varied taglines for this brand. Return ONLY:
{ "taglines": [ string ] }`,

    brandStory: `Write a fresh brand story for this brand. Return ONLY:
{ "brandStory": { "originStory": string, "mission": string } }
originStory: 3-5 sentences, written as if told by the founder.
mission: customer-focused mission statement, 1-2 sentences.`,

    brandVoice: `Define a fresh brand voice for this brand. Return ONLY:
{ "brandVoice": { "personalityTraits": [string], "toneExamples": [string], "wordsToUse": [string], "wordsToAvoid": [string] } }
personalityTraits: 5 traits. toneExamples: 3 short lines written in the brand voice. wordsToUse: 8-10 words. wordsToAvoid: 8-10 words.`,

    mascot: `Create a fresh mascot concept for this brand. Return ONLY:
{ "mascot": { "name": string, "appearance": string, "personality": string, "visualDescription": string, "imagePrompt": string } }
appearance/personality: 2-3 sentences each. imagePrompt: a full detailed AI image generation prompt.`,

    logoPrompt: `Write a fresh AI image-generation prompt for this brand's logo. Return ONLY:
{ "logoPrompt": string }
Include style, colors, mood, composition, what to avoid.`,

    colorPalette: `Design a fresh 5-color brand palette. Return ONLY:
{ "colorPalette": [ { "name": string, "hex": string, "usage": string } ] }
Exactly 5 colors with hex codes and usage notes.`,

    websiteCopy: `Write fresh website copy for this brand. Return ONLY:
{ "websiteCopy": { "heroHeadline": string, "subheadline": string, "ctaText": string, "aboutSection": string, "featureBullets": [string] } }
ctaText: short button label. aboutSection: 2-4 sentences. featureBullets: 4-6 bullets.`,

    socialKit: `Write fresh social media bios and launch posts for this brand. Return ONLY:
{ "socialKit": { "instagramBio": string, "twitterBio": string, "tiktokBio": string, "launchPosts": [string] } }
instagramBio ≤150 chars, twitterBio ≤160 chars, tiktokBio ≤80 chars. Exactly 5 launchPosts.`,

    marketingIdeas: `Generate fresh marketing and meme ideas for this brand. Return ONLY:
{ "marketingIdeas": { "viralContentIdeas": [string], "memeIdeas": [string], "adAngles": [string] } }
viralContentIdeas: 10 specific ideas. memeIdeas: 5 funny format-specific ideas. adAngles: 5 distinct paid-ad hooks.`,

    launchPlan: `Create a fresh 7-day launch plan for this brand. Return ONLY:
{ "launchPlan": [string] }
Exactly 7 items formatted "Day 1: ...", "Day 2: ...", etc.`,
  };

  return `Regenerate only the ${section} section for this brand. Do NOT generate names or change the brand name.

${ctx}

Current brand context for reference:
- Taglines style: ${kit.taglines?.[0] ?? "n/a"}
- Brand story mission: ${kit.brandStory?.mission ?? "n/a"}

${schemas[section]}

Return ONLY the JSON object for this section. No markdown, no extra text.`;
}

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const body = await request.json() as {
    section: string;
    brandName: string;
    input: BrandInput;
    kit: Partial<BrandKit>;
    brandGenerationId?: string;
  };

  const { section, brandName, input, kit, brandGenerationId } = body;

  if (!VALID_SECTIONS.includes(section as SectionKey)) {
    return NextResponse.json({ error: "Invalid section." }, { status: 400 });
  }
  if (!brandName || !input) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4000,
      system: BRAND_GOBLIN_SYSTEM_PROMPT,
      messages: [{ role: "user", content: buildSectionPrompt(section as SectionKey, brandName, input, kit) }],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") throw new Error("No response from AI.");

    const raw = textBlock.text.replace(/```(?:json)?\s*/gi, "").replace(/```/g, "").trim();
    const data = JSON.parse(raw);

    // Persist updated section + mark reroll used in Supabase
    if (brandGenerationId) {
      const { data: existing } = await supabase
        .from("brand_generations")
        .select("output_data, rerolls_used")
        .eq("id", brandGenerationId)
        .eq("user_id", authData.user.id)
        .single();

      if (existing) {
        const updatedOutput = { ...(existing.output_data as object), ...data };
        const updatedRerolls = [...(existing.rerolls_used ?? []), section];
        await supabase
          .from("brand_generations")
          .update({ output_data: updatedOutput, rerolls_used: updatedRerolls })
          .eq("id", brandGenerationId)
          .eq("user_id", authData.user.id);
      }
    }

    return NextResponse.json({ section, data });
  } catch (err) {
    console.error("[/api/generate/section]", err);
    return NextResponse.json(
      { error: "The goblin tripped over a scroll. Try again." },
      { status: 500 }
    );
  }
}
