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

// Map JSON keys (in model output order) → progress events for the client.
// Each entry fires once when its key first appears in the accumulated text.
const SECTION_MILESTONES: { key: string; section: string; label: string; pose: string }[] = [
  { key: '"brandNames"',     section: "names",      label: "Discovering your brand names…",      pose: "thinking"    },
  { key: '"taglines"',       section: "taglines",   label: "Writing your taglines…",              pose: "working"     },
  { key: '"brandStory"',     section: "story",      label: "Crafting your brand story…",          pose: "working"     },
  { key: '"brandVoice"',     section: "voice",      label: "Finding your brand voice…",           pose: "conjuring"   },
  { key: '"colorPalette"',   section: "colors",     label: "Choosing your color palette…",        pose: "conjuring"   },
  { key: '"logoPrompt"',     section: "logo",       label: "Designing your logo direction…",      pose: "conjuring"   },
  { key: '"websiteCopy"',    section: "website",    label: "Writing your website copy…",          pose: "working"     },
  { key: '"socialKit"',      section: "social",     label: "Building your social kit…",           pose: "working"     },
  { key: '"marketingIdeas"', section: "marketing",  label: "Dreaming up marketing ideas…",        pose: "celebrating" },
  { key: '"launchPlan"',     section: "launch",     label: "Mapping your 7-day launch plan…",     pose: "celebrating" },
];

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
        const fired = new Set<string>();

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

            // Fire milestone events as keys appear in the buffer
            for (const milestone of SECTION_MILESTONES) {
              if (!fired.has(milestone.key) && accumulated.includes(milestone.key)) {
                fired.add(milestone.key);
                send(controller, {
                  status: "generating",
                  section: milestone.section,
                  label: milestone.label,
                  pose: milestone.pose,
                  progress: fired.size / SECTION_MILESTONES.length,
                });
              }
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
