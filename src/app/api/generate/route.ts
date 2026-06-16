import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { BRAND_GOBLIN_SYSTEM_PROMPT, buildBrandKitPrompt } from "@/lib/prompts";
import type { BrandInput, BrandKit } from "@/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

function extractJson(text: string): string {
  // Strip markdown fences if the model adds them despite instructions.
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch) return fenceMatch[1].trim();
  return text.trim();
}

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData.user) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }

    const userId = authData.user.id;

    const body = (await request.json()) as BrandInput;
    if (!body.businessIdea || !body.industry || !body.targetAudience || !body.vibe) {
      return NextResponse.json(
        { error: "Missing required fields: businessIdea, industry, targetAudience, vibe." },
        { status: 400 }
      );
    }

    // --- Credit check ---
    const { data: userRow, error: userRowError } = await supabase
      .from("users")
      .select("credits, plan")
      .eq("id", userId)
      .single();

    if (userRowError || !userRow) {
      return NextResponse.json({ error: "Could not load account." }, { status: 500 });
    }

    if (userRow.plan === "free" && userRow.credits <= 0) {
      return NextResponse.json(
        { error: "Out of credits. Upgrade to Pro for unlimited brand kits." },
        { status: 402 }
      );
    }

    // --- AI generation ---
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 8000,
      system: BRAND_GOBLIN_SYSTEM_PROMPT,
      messages: [{ role: "user", content: buildBrandKitPrompt(body) }],
    });

    const textBlock = message.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("AI returned no text content.");
    }

    let brandKit: BrandKit;
    try {
      brandKit = JSON.parse(extractJson(textBlock.text));
    } catch {
      throw new Error("AI returned malformed JSON. Please try again.");
    }

    // --- Persist generation ---
    const { data: inserted, error: insertError } = await supabase
      .from("brand_generations")
      .insert({
        user_id: userId,
        input_data: body,
        output_data: brandKit,
        favorite: false,
      })
      .select("id")
      .single();

    if (insertError || !inserted) {
      throw new Error("Failed to save brand generation.");
    }

    // --- Decrement credits for free plan ---
    if (userRow.plan === "free") {
      await supabase
        .from("users")
        .update({ credits: userRow.credits - 1 })
        .eq("id", userId);
    }

    return NextResponse.json({ id: inserted.id, brandKit });
  } catch (err) {
    console.error("[/api/generate] error:", err);
    const message = err instanceof Error ? err.message : "Something went wrong.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
