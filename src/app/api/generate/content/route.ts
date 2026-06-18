import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { BRAND_GOBLIN_SYSTEM_PROMPT } from "@/lib/prompts";
import type { MarketingContentType } from "@/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

interface ContentRequest {
  brandId: string;
  brandName: string;
  businessIdea: string;
  brandStory: string;
  tagline: string;
  tone: string;
  targetAudience: string;
  contentType: MarketingContentType;
}

const VALID_TYPES: MarketingContentType[] = [
  "social_posts", "captions", "blog_ideas", "ad_copy",
  "email_campaigns", "video_ideas", "hashtags", "seasonal_campaigns",
  "meme_ideas", "headline_ideas", "website_copy", "cta_ideas",
];

function buildContentPrompt(req: ContentRequest): string {
  const ctx = `BRAND NAME: ${req.brandName}
BUSINESS IDEA: ${req.businessIdea}
TAGLINE: ${req.tagline}
BRAND TONE/VIBE: ${req.tone}
TARGET AUDIENCE: ${req.targetAudience}
BRAND STORY MISSION: ${req.brandStory}`;

  const schemas: Record<MarketingContentType, string> = {
    social_posts: `Generate 10 Instagram post ideas for this brand. Return ONLY:
{ "items": [ { "hook": string, "caption": string, "visualIdea": string, "hashtags": [string] } ] }`,

    captions: `Generate 10 fresh social media captions for this brand. Return ONLY:
{ "items": [ string ] }`,

    blog_ideas: `Generate 10 blog topic ideas for this brand. Return ONLY:
{ "items": [ { "title": string, "summary": string, "seoKeywords": [string] } ] }`,

    ad_copy: `Generate 10 paid ad ideas for this brand. Return ONLY:
{ "items": [ { "headline": string, "body": string, "cta": string } ] }`,

    email_campaigns: `Generate 5 email campaign ideas for this brand. Return ONLY:
{ "items": [ { "subjectLine": string, "emailBody": string, "offer": string } ] }`,

    video_ideas: `Generate 10 Reel/TikTok video ideas for this brand. Return ONLY:
{ "items": [ { "hook": string, "videoConcept": string, "cta": string } ] }`,

    hashtags: `Generate 10 hashtag sets for this brand. Return ONLY:
{ "items": [ [string] ] }
Each inner array should contain 6-10 relevant hashtags.`,

    seasonal_campaigns: `Generate 5 seasonal campaign ideas for this brand. Return ONLY:
{ "items": [ { "campaignTheme": string, "offer": string, "socialPostIdea": string, "emailIdea": string } ] }`,

    meme_ideas: `Generate 10 meme concepts for this brand. Return ONLY:
{ "items": [ string ] }`,

    headline_ideas: `Generate 10 promotional headline ideas for this brand. Return ONLY:
{ "items": [ string ] }`,

    website_copy: `Generate 10 additional website copy variations for this brand (hero headlines, taglines, section headers). Return ONLY:
{ "items": [ string ] }`,

    cta_ideas: `Generate 10 call-to-action button/phrase variations for this brand. Return ONLY:
{ "items": [ string ] }`,
  };

  return `Generate fresh marketing content for this brand. Make every piece specific to the brand — never generic.

${ctx}

${schemas[req.contentType]}

Return ONLY the JSON object. No markdown, no extra text.`;
}

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  // Check plan — only pro/agency can use content engine
  const { data: userRow } = await supabase
    .from("users")
    .select("plan")
    .eq("id", authData.user.id)
    .single();

  if (!userRow || userRow.plan === "free") {
    return NextResponse.json(
      { error: "Creator Pro required.", upgrade: true },
      { status: 403 }
    );
  }

  const body = await request.json() as ContentRequest;

  if (!VALID_TYPES.includes(body.contentType)) {
    return NextResponse.json({ error: "Invalid content type." }, { status: 400 });
  }
  if (!body.brandId || !body.brandName || !body.contentType) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4000,
      system: BRAND_GOBLIN_SYSTEM_PROMPT,
      messages: [{ role: "user", content: buildContentPrompt(body) }],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") throw new Error("No AI response.");

    const raw = textBlock.text.replace(/```(?:json)?\s*/gi, "").replace(/```/g, "").trim();
    const data = JSON.parse(raw);

    // Save to Supabase
    await supabase.from("brand_marketing_content").insert({
      user_id: authData.user.id,
      brand_id: body.brandId,
      content_type: body.contentType,
      content_json: data,
    });

    return NextResponse.json({ contentType: body.contentType, data });
  } catch (err) {
    console.error("[/api/generate/content]", err);
    return NextResponse.json(
      { error: "The goblin dropped the scroll. Try again." },
      { status: 500 }
    );
  }
}
