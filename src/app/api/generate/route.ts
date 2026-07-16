import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { BRAND_GOBLIN_SYSTEM_PROMPT, buildBrandKitPrompt, buildExistingNameBrandKitPrompt } from "@/lib/prompts";
import type { BrandInput, BrandKit } from "@/types";

export const runtime = "nodejs";
export const maxDuration = 300;

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function extractJson(text: string): string {
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch) return fenceMatch[1].trim();
  return text.trim();
}

function send(controller: ReadableStreamDefaultController, data: object) {
  const encoder = new TextEncoder();
  controller.enqueue(encoder.encode("data: " + JSON.stringify(data) + "\n\n"));
}

// ── Progressive reveal ──────────────────────────────────────────────────────
// The model writes the kit JSON in a fixed key order. As soon as a key's value
// is COMPLETE in the accumulated buffer, we parse just that value and stream it
// to the client so the reveal can happen live, section by section.

interface SectionSpec {
  key: string;        // JSON key in the model output
  section: string;    // card id the client renders
  label: string;      // status line shown while the NEXT section is cooking
  pose: string;
  emit: boolean;      // false = advance the pointer but don't send a card
}

// Generated-name mode key order (must match buildBrandKitPrompt's schema order):
// name → logo direction → mascot → the rest. Users can start creating their
// logo the moment the kit opens — the creative essentials land first.
const GENERATED_SECTIONS: SectionSpec[] = [
  { key: "favoriteName",     section: "name",      label: "Your name is born! Writing backup names…", pose: "celebrating", emit: true  },
  { key: "alternativeNames", section: "altNames",  label: "Designing your logo direction…",           pose: "conjuring",   emit: true  },
  { key: "recommendedName",  section: "recName",   label: "Designing your logo direction…",           pose: "conjuring",   emit: false },
  { key: "logoPrompt",       section: "logo",      label: "Dreaming up your mascot…",                 pose: "conjuring",   emit: true  },
  { key: "mascot",           section: "mascot",    label: "Writing your taglines…",                   pose: "working",     emit: true  },
  { key: "taglines",         section: "taglines",  label: "Crafting your brand story…",               pose: "working",     emit: true  },
  { key: "brandStory",       section: "story",     label: "Finding your brand voice…",                pose: "conjuring",   emit: true  },
  { key: "brandVoice",       section: "voice",     label: "Choosing your color palette…",             pose: "conjuring",   emit: true  },
  { key: "colorPalette",     section: "colors",    label: "Writing your website copy…",               pose: "working",     emit: true  },
  { key: "websiteCopy",      section: "website",   label: "Building your social kit…",                pose: "working",     emit: true  },
  { key: "socialKit",        section: "social",    label: "Dreaming up marketing ideas…",             pose: "working",     emit: true  },
  { key: "marketingIdeas",   section: "marketing", label: "Mapping your 7-day launch plan…",          pose: "celebrating", emit: true  },
  { key: "launchPlan",       section: "launch",    label: "Scoring your Brand DNA…",                  pose: "celebrating", emit: true  },
  { key: "brandDna",         section: "dna",       label: "Polishing everything…",                    pose: "celebrating", emit: true  },
];

// Existing-name mode key order (must match buildExistingNameBrandKitPrompt)
const EXISTING_SECTIONS: SectionSpec[] = [
  { key: "recommendedName",  section: "name",      label: "Checking your name's strength…",           pose: "thinking",    emit: true  },
  { key: "nameStrengthCheck",section: "nameCheck", label: "Designing your logo direction…",           pose: "conjuring",   emit: true  },
  { key: "logoPrompt",       section: "logo",      label: "Dreaming up your mascot…",                 pose: "conjuring",   emit: true  },
  { key: "mascot",           section: "mascot",    label: "Writing your taglines…",                   pose: "working",     emit: true  },
  { key: "taglines",         section: "taglines",  label: "Crafting your brand story…",               pose: "working",     emit: true  },
  { key: "brandStory",       section: "story",     label: "Finding your brand voice…",                pose: "conjuring",   emit: true  },
  { key: "brandVoice",       section: "voice",     label: "Choosing your color palette…",             pose: "conjuring",   emit: true  },
  { key: "colorPalette",     section: "colors",    label: "Writing your website copy…",               pose: "working",     emit: true  },
  { key: "websiteCopy",      section: "website",   label: "Building your social kit…",                pose: "working",     emit: true  },
  { key: "socialKit",        section: "social",    label: "Dreaming up marketing ideas…",             pose: "working",     emit: true  },
  { key: "marketingIdeas",   section: "marketing", label: "Mapping your 7-day launch plan…",          pose: "celebrating", emit: true  },
  { key: "launchPlan",       section: "launch",    label: "Scoring your Brand DNA…",                  pose: "celebrating", emit: true  },
  { key: "brandDna",         section: "dna",       label: "Polishing everything…",                    pose: "celebrating", emit: true  },
];

/**
 * Extracts the value of `key` from a PARTIAL JSON string, but only if that
 * value is already complete in the buffer. Returns undefined otherwise.
 * Handles strings (with escapes), objects/arrays (balanced, string-aware),
 * and primitives. Never throws.
 */
function extractCompleteValue(src: string, key: string): unknown {
  const kIdx = src.indexOf('"' + key + '"');
  if (kIdx === -1) return undefined;
  const colon = src.indexOf(":", kIdx + key.length + 2);
  if (colon === -1) return undefined;
  let i = colon + 1;
  while (i < src.length && /\s/.test(src[i])) i++;
  if (i >= src.length) return undefined;
  const start = i;
  const first = src[i];

  if (first === '"') {
    i++;
    while (i < src.length) {
      if (src[i] === "\\") { i += 2; continue; }
      if (src[i] === '"') {
        try { return JSON.parse(src.slice(start, i + 1)); } catch { return undefined; }
      }
      i++;
    }
    return undefined;
  }

  if (first === "{" || first === "[") {
    let depth = 0;
    let inStr = false;
    while (i < src.length) {
      const ch = src[i];
      if (inStr) {
        if (ch === "\\") { i += 2; continue; }
        if (ch === '"') inStr = false;
      } else {
        if (ch === '"') inStr = true;
        else if (ch === "{" || ch === "[") depth++;
        else if (ch === "}" || ch === "]") {
          depth--;
          if (depth === 0) {
            try { return JSON.parse(src.slice(start, i + 1)); } catch { return undefined; }
          }
        }
      }
      i++;
    }
    return undefined;
  }

  // Primitive (number/bool/null): complete only once a terminator follows it
  const m = src.slice(start).match(/^[^,}\]\s]+(?=[,}\]\s])/);
  if (!m) return undefined;
  try { return JSON.parse(m[0]); } catch { return undefined; }
}

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    return new Response(JSON.stringify({ error: "Not authenticated." }), { status: 401 });
  }

  const userId = authData.user.id;
  const body = (await request.json()) as BrandInput;

  if (!body.businessIdea || !body.industry || !body.targetAudience || !body.vibe) {
    return new Response(JSON.stringify({ error: "Missing required fields." }), { status: 400 });
  }

  const { data: userRow, error: userRowError } = await supabase
    .from("users")
    .select("credits, plan")
    .eq("id", userId)
    .single();

  if (userRowError || !userRow) {
    return new Response(JSON.stringify({ error: "Could not load account." }), { status: 500 });
  }

  if (userRow.plan === "free" && userRow.credits <= 0) {
    return new Response(
      JSON.stringify({ error: "Out of credits. Upgrade to Creator Pro for unlimited brand kits." }),
      { status: 402 }
    );
  }

  const stream = new ReadableStream({
    async start(controller) {
      try {
        send(controller, { status: "generating", section: "start", label: "Nix is thinking…", pose: "thinking" });

        let accumulated = "";
        const specs = body.nameMode === "existing" ? EXISTING_SECTIONS : GENERATED_SECTIONS;
        const firedKeys = new Set<string>();

        const anthropicStream = anthropic.messages.stream({
          model: "claude-sonnet-4-6",
          max_tokens: 16000,
          system: BRAND_GOBLIN_SYSTEM_PROMPT,
          messages: [
            {
              role: "user",
              content: body.nameMode === "existing"
                ? buildExistingNameBrandKitPrompt(body)
                : buildBrandKitPrompt(body),
            },
          ],
        });

        for await (const chunk of anthropicStream) {
          if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
            accumulated += chunk.delta.text;

            // Stream each section's REAL content the moment its value is
            // complete in the buffer. All unfired specs are checked every
            // chunk, so an out-of-order model can never stall the feed.
            for (const spec of specs) {
              if (firedKeys.has(spec.key)) continue;
              const value = extractCompleteValue(accumulated, spec.key);
              if (value === undefined) continue;
              firedKeys.add(spec.key);
              if (!spec.emit) continue;
              send(controller, {
                status: "generating",
                section: spec.section,
                label: spec.label,
                pose: spec.pose,
                progress: firedKeys.size / specs.length,
                content: value,
              });
            }
          }
        }

        const finalMessage = await anthropicStream.finalMessage();

        if (finalMessage.stop_reason === "max_tokens") {
          throw new Error("Brand kit was too large to generate. Please try again with a shorter business description.");
        }

        const textBlock = finalMessage.content.find((b) => b.type === "text");
        if (!textBlock || textBlock.type !== "text") throw new Error("AI returned no text.");

        let brandKit: BrandKit;
        try {
          brandKit = JSON.parse(extractJson(textBlock.text));
        } catch {
          throw new Error("AI returned malformed JSON. Please try again.");
        }

        const { data: inserted, error: insertError } = await supabase
          .from("brand_generations")
          .insert({ user_id: userId, input_data: body, output_data: brandKit, favorite: false })
          .select("id")
          .single();

        if (insertError || !inserted) throw new Error("Failed to save brand generation.");

        if (userRow.plan === "free") {
          await supabase
            .from("users")
            .update({ credits: userRow.credits - 1 })
            .eq("id", userId);
        }

        send(controller, { status: "done", id: inserted.id, brandKit });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Something went wrong.";
        send(controller, { status: "error", error: msg });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
