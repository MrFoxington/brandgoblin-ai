import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";
import { BRAND_GOBLIN_SYSTEM_PROMPT } from "@/lib/prompts";
import { checkEnergyForGeneration, deductEnergy, refundEnergy } from "@/lib/energy";
import type { CreatorContentType, BrandVoiceMode } from "@/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const VOICE_DESC: Record<BrandVoiceMode, string> = {
  professional:   "formal, authoritative, and trustworthy — use precise, clear language",
  funny:          "witty, playful, and humorous — lean into wordplay and a light-hearted tone",
  luxury:         "aspirational, exclusive, and sophisticated — use elevated, evocative language",
  friendly:       "warm, approachable, and conversational — write like a trusted friend",
  inspirational:  "motivating, empowering, and uplifting — focus on transformation and possibility",
  minimalist:     "clean, concise, and direct — every word must earn its place",
  bold:           "confident, punchy, and direct — make strong statements, never hedge",
};

const CONTENT_LABELS: Record<CreatorContentType, string> = {
  instagram_post:         "Instagram Posts",
  twitter_post:           "X/Twitter Posts",
  facebook_post:          "Facebook Posts",
  linkedin_post:          "LinkedIn Posts",
  threads_post:           "Threads Posts",
  caption:                "Captions",
  hashtag_set:            "Hashtag Sets",
  blog_post:              "Blog Post",
  product_description:    "Product Descriptions",
  email_campaign:         "Email Campaigns",
  ad_copy:                "Ad Copy",
  headline:               "Headlines",
  promotion:              "Promotions",
  seasonal_campaign:      "Seasonal Campaigns",
  launch_announcement:    "Launch Announcements",
  marketing_ideas:        "Marketing Ideas",
  campaign_ideas:         "Campaign Ideas",
  content_calendar:       "Content Calendar",
  audience_suggestions:   "Audience Insights",
  brand_voice_suggestions:"Brand Voice Guide",
};

interface CreatorRequest {
  brandId?: string;
  brandName: string;
  businessIdea: string;
  tagline?: string;
  contentType: CreatorContentType;
  brandVoice: BrandVoiceMode;
  additionalContext?: string;
}

function buildPrompt(req: CreatorRequest): string {
  const voiceNote = `BRAND VOICE TONE: ${VOICE_DESC[req.brandVoice]}`;
  const ctx = `BRAND: ${req.brandName}
BUSINESS: ${req.businessIdea}
${req.tagline ? `TAGLINE: ${req.tagline}` : ""}
${req.additionalContext ? `ADDITIONAL CONTEXT: ${req.additionalContext}` : ""}
${voiceNote}`;

  const schemas: Record<CreatorContentType, string> = {
    instagram_post: `Write 5 Instagram posts. Return ONLY:
{ "items": [ { "hook": string, "copy": string, "hashtags": [string] } ] }`,

    twitter_post: `Write 10 X/Twitter posts (max 280 chars each). Return ONLY:
{ "items": [ { "copy": string, "hashtags": [string] } ] }`,

    facebook_post: `Write 5 Facebook posts (conversational, community-focused). Return ONLY:
{ "items": [ { "hook": string, "copy": string } ] }`,

    linkedin_post: `Write 5 LinkedIn posts (professional, value-driven, story-led). Return ONLY:
{ "items": [ { "hook": string, "copy": string, "cta": string } ] }`,

    threads_post: `Write 10 Threads posts (punchy, casual, conversational). Return ONLY:
{ "items": [ { "copy": string } ] }`,

    caption: `Write 15 social media captions in different tones. Return ONLY:
{ "items": [ string ] }`,

    hashtag_set: `Create 8 hashtag sets (8-10 hashtags each) for different post contexts. Return ONLY:
{ "items": [ [string] ] }`,

    blog_post: `Write one complete, SEO-ready blog post. Return ONLY:
{ "items": [ { "title": string, "intro": string, "sections": [ { "heading": string, "body": string } ], "conclusion": string, "seoKeywords": [string] } ] }`,

    product_description: `Write 5 product/service description variations (different lengths/angles). Return ONLY:
{ "items": [ { "headline": string, "shortDesc": string, "longDesc": string, "bullets": [string], "cta": string } ] }`,

    email_campaign: `Write 5 email campaigns for different stages (welcome, nurture, promo, re-engage, launch). Return ONLY:
{ "items": [ { "subjectLine": string, "preheader": string, "body": string, "cta": string } ] }`,

    ad_copy: `Write 10 paid ad variations (Facebook/Instagram/Google). Return ONLY:
{ "items": [ { "headline": string, "body": string, "cta": string } ] }`,

    headline: `Write 20 marketing headlines (varied angles: curiosity, urgency, benefit, social proof). Return ONLY:
{ "items": [ string ] }`,

    promotion: `Write 5 promotional offers with copy. Return ONLY:
{ "items": [ { "offer": string, "headline": string, "urgency": string, "body": string } ] }`,

    seasonal_campaign: `Write 5 seasonal/holiday campaign ideas with copy. Return ONLY:
{ "items": [ { "season": string, "theme": string, "headline": string, "copy": string, "cta": string } ] }`,

    launch_announcement: `Write launch announcements for 3 channels: email, social media, and press. Return ONLY:
{ "items": [ { "channel": string, "subject": string, "copy": string, "cta": string } ] }`,

    marketing_ideas: `Generate 10 specific, executable marketing ideas. Return ONLY:
{ "items": [ { "idea": string, "why": string, "channels": [string] } ] }`,

    campaign_ideas: `Generate 5 full campaign concepts. Return ONLY:
{ "items": [ { "name": string, "concept": string, "goal": string, "tactics": [string] } ] }`,

    content_calendar: `Create a 4-week content calendar. Return ONLY:
{ "items": [ { "week": string, "theme": string, "posts": [ { "day": string, "platform": string, "topic": string, "type": string } ] } ] }`,

    audience_suggestions: `Identify 5 distinct audience segments to target. Return ONLY:
{ "items": [ { "segment": string, "description": string, "channels": [string], "messaging": string } ] }`,

    brand_voice_suggestions: `Create 3 distinct brand voice profiles to choose from. Return ONLY:
{ "items": [ { "tone": string, "description": string, "examples": [string], "avoid": [string] } ] }`,
  };

  return `Generate marketing content for this brand. Make every piece specific — never generic.

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

  const { data: userRow } = await supabase
    .from("users").select("plan").eq("id", authData.user.id).single();

  if (!userRow || userRow.plan === "free") {
    return NextResponse.json({ error: "Creator Pro required.", upgrade: true }, { status: 403 });
  }

  const body = await request.json() as CreatorRequest;

  if (!body.brandName || !body.businessIdea || !body.contentType || !body.brandVoice) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  // ⚡ Check Creative Energy before generation
  const energyCheck = await checkEnergyForGeneration(authData.user.id, body.contentType);
  if (!energyCheck.allowed) {
    return NextResponse.json({
      error: "out_of_energy",
      message: "Nix needs a Creative Energy refill before creating more magic.",
      totalRemaining: energyCheck.totalRemaining,
      cost: energyCheck.cost,
      showRefillModal: true,
    }, { status: 402 });
  }

  try {
    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4000,
      system: BRAND_GOBLIN_SYSTEM_PROMPT,
      messages: [{ role: "user", content: buildPrompt(body) }],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") throw new Error("No AI response.");

    const raw = textBlock.text.replace(/```(?:json)?\s*/gi, "").replace(/```/g, "").trim();
    const content = JSON.parse(raw);

    const title = `${CONTENT_LABELS[body.contentType]} — ${body.brandName}`;

    const adminSupabase = createAdminClient();
    const { data: saved, error: saveError } = await adminSupabase
      .from("creator_content")
      .insert({
        user_id: authData.user.id,
        brand_id: body.brandId ?? null,
        content_type: body.contentType,
        title,
        content,
      })
      .select("id")
      .single();

    if (saveError) console.error("[creator/save]", saveError);

    // ⚡ Deduct Creative Energy after successful generation
    const { balanceAfter } = await deductEnergy(authData.user.id, body.contentType, {
      generationId: saved?.id,
      modelUsed: "claude-haiku-4-5-20251001",
      promptTokens: message.usage?.input_tokens,
      completionTokens: message.usage?.output_tokens,
    });

    return NextResponse.json({
      id: saved?.id,
      contentType: body.contentType,
      title,
      content,
      energyRemaining: balanceAfter,
      energyCost: energyCheck.cost,
    });
  } catch (err) {
    console.error("[/api/generate/creator]", err);
    // Refund energy if generation failed after we would have deducted
    // (we only deduct after success, so no refund needed here — but keeping for safety)
    return NextResponse.json({ error: "The goblin dropped the scroll. Try again." }, { status: 500 });
  }
}
