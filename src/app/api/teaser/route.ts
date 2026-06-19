// No-auth landing page teaser — returns ONE brand name + tagline for any idea.
// Rate-limited: 3 requests per IP per hour. Never returns the full kit.

import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createHash } from "crypto";
import { createAdminClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 15;

const IP_LIMIT = 3;
const WINDOW_HOURS = 1;

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function hashIp(ip: string) {
  return createHash("sha256").update(ip).digest("hex");
}

export async function POST(request: Request) {
  // Extract IP
  const forwarded = request.headers.get("x-forwarded-for");
  const rawIp = forwarded?.split(",")[0]?.trim() ?? "unknown";
  const ipHash = hashIp(rawIp);

  // Rate limit check
  try {
    const supabase = createAdminClient();
    const windowStart = new Date(Date.now() - WINDOW_HOURS * 60 * 60 * 1000).toISOString();
    const { count } = await supabase
      .from("teaser_requests")
      .select("id", { count: "exact", head: true })
      .eq("ip_hash", ipHash)
      .gte("created_at", windowStart);

    if ((count ?? 0) >= IP_LIMIT) {
      return NextResponse.json(
        { error: "Nix needs a breather — come back in a bit. ☕" },
        { status: 429 }
      );
    }

    // Log the request (non-blocking — don't let log failure block the user)
    supabase.from("teaser_requests").insert({ ip_hash: ipHash }).then(() => {});
  } catch {
    // Rate limit table might not exist yet in dev — fail open
  }

  const { idea } = await request.json().catch(() => ({}));
  if (!idea || typeof idea !== "string" || idea.trim().length < 3) {
    return NextResponse.json({ error: "Give Nix something to work with." }, { status: 400 });
  }

  const trimmed = idea.trim().slice(0, 300);

  try {
    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 120,
      messages: [
        {
          role: "user",
          content: `You are Nix, a world-class brand-naming genius. Given a business idea, return ONE perfect, creative, memorable brand name and ONE punchy, emotional tagline (max 8 words).

Business idea: "${trimmed}"

Return ONLY valid JSON — no markdown, no extra text:
{"name": "BrandName", "tagline": "Short punchy tagline here."}`,
        },
      ],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") throw new Error("No response");

    const raw = textBlock.text.replace(/```(?:json)?\s*/gi, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(raw) as { name: string; tagline: string };

    if (!parsed.name || !parsed.tagline) throw new Error("Invalid shape");

    return NextResponse.json({ name: parsed.name, tagline: parsed.tagline });
  } catch (err) {
    console.error("[/api/teaser]", err);
    return NextResponse.json(
      { error: "Nix dropped the scroll. Try again in a moment." },
      { status: 500 }
    );
  }
}
