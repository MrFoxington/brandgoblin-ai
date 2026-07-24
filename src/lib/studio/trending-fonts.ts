// 🔥 Hot Right Now fonts (July 2026) — an AI-curated, monthly-refreshed shelf
// for the font pickers.
//
// How it works:
//   • One list per calendar month, cached in the trending_fonts table.
//   • First request of a new month: Claude Haiku (with web search when the API
//     allows it) picks ~8 Google Fonts that are genuinely hot right now.
//   • Every pick is VALIDATED against the live Google Fonts API before it's
//     saved — a hallucinated family can never reach the picker.
//   • Failure ladder: this month's row → most recent previous row → the static
//     "Trending 2026" group from fonts.ts. The picker never breaks.
//
// Server-only (uses the admin Supabase client + the Anthropic key).

import Anthropic from "@anthropic-ai/sdk";
import { createAdminClient } from "@/lib/supabase/server";
import { FONT_GROUPS } from "./fonts";

export interface TrendingFont {
  family: string;                       // exact Google Font family name
  category: "display" | "serif" | "sans";
  reason: string;                       // one short line: why it's hot
}

export interface TrendingFontsPayload {
  monthKey: string;                     // "2026-07"
  label: string;                        // "Hot right now · July 2026"
  fonts: TrendingFont[];
}

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function currentMonthKey(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

function labelFor(monthKey: string): string {
  const [y, m] = monthKey.split("-").map(Number);
  return `Hot right now · ${MONTH_NAMES[(m ?? 1) - 1]} ${y}`;
}

// ── Validation: the family must really exist on Google Fonts ────────────────
async function isRealGoogleFont(family: string): Promise<boolean> {
  try {
    const famParam = family.trim().replace(/ /g, "+");
    const res = await fetch(
      `https://fonts.googleapis.com/css2?family=${famParam}&display=swap`,
      { method: "HEAD" }
    );
    return res.ok;
  } catch {
    return false;
  }
}

// ── Ask Claude for this month's picks ───────────────────────────────────────
const CURATOR_PROMPT = (monthLabel: string) => `Today is ${monthLabel}. You are a typography trend curator for a branding tool.

Pick exactly 8 Google Fonts that are genuinely trending RIGHT NOW for brand design, social graphics, and video thumbnails. If you can search the web, check current design-community chatter (new Google Fonts releases, font-of-the-month posts, branding trend roundups) before choosing.

Rules:
- ONLY fonts available on fonts.google.com (exact family names).
- Fresh, current faces. Do NOT include tired defaults: Roboto, Open Sans, Lato, Montserrat, Poppins, Inter, Oswald, Raleway.
- Mix it: mostly display/headline faces, 1-2 fresh serifs, at most 1 sans.
- "reason" = max 8 words on why it's hot.

Respond with ONLY this JSON, no other text:
{"fonts":[{"family":"...","category":"display|serif|sans","reason":"..."}]}`;

function extractJson(text: string): { fonts?: TrendingFont[] } | null {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try { return JSON.parse(match[0]); } catch { return null; }
}

async function askClaudeForFonts(monthLabel: string): Promise<TrendingFont[]> {
  const params = {
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1000,
    messages: [{ role: "user" as const, content: CURATOR_PROMPT(monthLabel) }],
  };

  let text = "";
  try {
    // Try with web search so the picks reflect the actual current month.
    // The installed SDK's types predate the server-side web_search tool, but
    // the live API accepts it — and the catch below covers keys/plans where
    // it doesn't.
    const webSearchTool = [
      { type: "web_search_20250305", name: "web_search", max_uses: 3 },
    ] as unknown as Anthropic.Tool[];
    const withSearch = await anthropic.messages.create({
      ...params,
      tools: webSearchTool,
    });
    text = withSearch.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n");
  } catch {
    // Web search unavailable on this key/plan — plain call still gives a
    // solid taste-based list.
    const plain = await anthropic.messages.create(params);
    text = plain.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n");
  }

  const parsed = extractJson(text);
  if (!parsed?.fonts?.length) return [];

  const seen = new Set<string>();
  const out: TrendingFont[] = [];
  for (const f of parsed.fonts) {
    const family = (f?.family ?? "").replace(/[^\p{L}\p{N} \-]/gu, "").trim().slice(0, 40);
    if (!family || seen.has(family)) continue;
    seen.add(family);
    const category = f.category === "serif" || f.category === "sans" ? f.category : "display";
    const reason = (f?.reason ?? "").trim().slice(0, 80);
    out.push({ family, category, reason });
  }
  return out;
}

// ── Static fallback: the curated "Trending 2026" group from fonts.ts ────────
function staticFallback(): TrendingFont[] {
  const group = FONT_GROUPS.find((g) => g.label === "Trending 2026");
  return (group?.fonts ?? []).map((f) => ({
    family: f.family,
    category: f.category,
    reason: "Fresh editorial & display pick",
  }));
}

// ── Main entry: this month's list, generating + caching if needed ───────────
export async function getTrendingFonts(): Promise<TrendingFontsPayload> {
  const monthKey = currentMonthKey();
  const label = labelFor(monthKey);
  const supabase = createAdminClient();

  // 1. This month already curated?
  const { data: row } = await supabase
    .from("trending_fonts")
    .select("fonts")
    .eq("month_key", monthKey)
    .maybeSingle();
  if (row?.fonts && Array.isArray(row.fonts) && row.fonts.length > 0) {
    return { monthKey, label, fonts: row.fonts as TrendingFont[] };
  }

  // 2. Generate a fresh list, then keep only fonts that really exist.
  try {
    const picks = await askClaudeForFonts(label);
    const validated: TrendingFont[] = [];
    for (const f of picks) {
      if (await isRealGoogleFont(f.family)) validated.push(f);
    }

    if (validated.length >= 4) {
      await supabase
        .from("trending_fonts")
        .upsert({ month_key: monthKey, fonts: validated }, { onConflict: "month_key" });
      return { monthKey, label, fonts: validated };
    }
  } catch (err) {
    console.error("[trending-fonts] generation failed:", err);
  }

  // 3. Fall back to the most recent previous month…
  const { data: prev } = await supabase
    .from("trending_fonts")
    .select("month_key, fonts")
    .order("month_key", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (prev?.fonts && Array.isArray(prev.fonts) && prev.fonts.length > 0) {
    return { monthKey: prev.month_key, label: labelFor(prev.month_key), fonts: prev.fonts as TrendingFont[] };
  }

  // 4. …or the static shelf. Never break the picker.
  return { monthKey, label, fonts: staticFallback() };
}
