// Receives fal.ai job completion webhooks.
// fal POSTs to this URL when a queued job finishes (same payload as queue.result()).
// This is the PRIMARY completion driver — drives finalization server-side so a
// closed browser tab doesn't leave energy reserved forever.

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { parseFalWebhook, downloadAsset } from "@/lib/studio/provider";
import { getSignedUrl, markJobFailed, completeJob } from "@/lib/studio/jobs";
import type { StudioModelKey } from "@/lib/studio/models";

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get("jobId");

  if (!jobId) {
    return NextResponse.json({ error: "Missing jobId." }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  // Look up the job — no user auth here (server-to-server)
  const supabase = createAdminClient();
  const { data: job } = await supabase
    .from("studio_jobs")
    .select("*")
    .eq("id", jobId)
    .single();

  if (!job) {
    console.warn("[studio/webhook/fal] unknown jobId:", jobId);
    return NextResponse.json({ ok: true }); // 200 so fal doesn't retry
  }

  // Idempotent: if already terminal, nothing to do
  if (["completed", "failed", "cancelled", "moderation_blocked"].includes(job.status)) {
    return NextResponse.json({ ok: true });
  }

  const result = parseFalWebhook(body);

  if (result.status === "failed" || (!result.imageUrl && result.status !== "pending")) {
    await markJobFailed(
      job.id,
      job.user_id,
      job.energy_reserved,
      "Provider reported failure — your energy has been returned",
      job.reservation_tx_id
    );
    console.log(`[studio/webhook/fal] job ${jobId} failed`);
    return NextResponse.json({ ok: true });
  }

  if (result.status === "completed" && result.imageUrl) {
    // Moderation check via fal's built-in safety output
    if (result.hasNsfw) {
      await markJobFailed(
        job.id,
        job.user_id,
        job.energy_reserved,
        "Image blocked by content moderation — your energy has been returned",
        job.reservation_tx_id,
        "moderation_blocked"
      );
      console.log(`[studio/webhook/fal] job ${jobId} blocked by moderation`);
      return NextResponse.json({ ok: true });
    }

    try {
      const buffer = await downloadAsset(result.imageUrl);
      const mimeType = result.imageUrl.includes(".png") ? "image/png"
        : result.imageUrl.includes(".webp") ? "image/webp"
        : "image/jpeg";

      await completeJob({
        jobId:          job.id,
        userId:         job.user_id,
        buffer,
        mimeType,
        modelKey:       job.model_key as StudioModelKey,
        txId:           job.reservation_tx_id,
        energyReserved: job.energy_reserved,
      });

      console.log(`[studio/webhook/fal] job ${jobId} completed + stored`);
    } catch (err) {
      console.error("[studio/webhook/fal] completeJob failed:", err);
      await markJobFailed(
        job.id,
        job.user_id,
        job.energy_reserved,
        "Failed to store generated image — your energy has been returned",
        job.reservation_tx_id
      );
    }
  }

  return NextResponse.json({ ok: true });
}
