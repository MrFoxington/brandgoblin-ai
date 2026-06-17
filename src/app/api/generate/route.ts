import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { BRAND_GOBLIN_SYSTEM_PROMPT, buildBrandKitPrompt } from "@/lib/prompts";
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
      JSON.stringify({ error: "Out of credits. Upgrade to Pro for unlimited brand kits." }),
      { status: 402 }
    );
  }

  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Send keepalives every 15s so the client connection stays alive
        const keepalive = setInterval(() => {
          send(controller, { status: "generating" });
        }, 15000);

        send(controller, { status: "generating" });

        const message = await anthropic.messages.create({
          model: "claude-sonnet-4-6",
          max_tokens: 8000,
          system: BRAND_GOBLIN_SYSTEM_PROMPT,
          messages: [{ role: "user", content: buildBrandKitPrompt(body) }],
        });

        clearInterval(keepalive);

        const textBlock = message.content.find((b) => b.type === "text");
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
