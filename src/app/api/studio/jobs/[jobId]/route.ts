import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { pollFalJob, pollReplicateJob, downloadAsset } from "@/lib/studio/provider";
import { getJob, markJobFailed, completeJob, getSignedUrl } from "@/lib/studio/jobs";
import type { StudioModelKey } from "@/lib/studio/models";

const STALE_JOB_MS = 10 * 60 * 1000; // 10 minutes

// ── GET /api/studio/jobs/[jobId] — poll status ──────────────────────────────
export async function GET(
  _request: Request,
  { params }: { params: { jobId: string } }
) {
  const supabase = createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const job = await getJob(params.jobId, authData.user.id);
  if (!job) {
    return NextResponse.json({ error: "Job not found." }, { status: 404 });
  }

  // Already in a terminal state — just re-sign the URL and return
  if (job.status === "completed" && job.storage_path) {
    let outputUrl = job.output_url;
    try {
      outputUrl = await getSignedUrl(job.storage_path);
    } catch { /* non-fatal */ }
    return NextResponse.json({ ...job, output_url: outputUrl });
  }

  if (job.status === "failed" || job.status === "cancelled" || job.status === "moderation_blocked") {
    return NextResponse.json(job);
  }

  // Still running — stale-job sweep: if unchanged for >10 min, refund and fail
  if (job.status === "running" || job.status === "pending") {
    const staleness = Date.now() - new Date(job.updated_at).getTime();
    if (staleness > STALE_JOB_MS && job.provider_job_id) {
      // Try one last status check before declaring stale
      const lastCheck = job.provider === "replicate"
        ? await pollReplicateJob(job.provider_job_id)
        : await pollFalJob(job.model_key as StudioModelKey, job.provider_job_id);

      if (lastCheck.status !== "completed") {
        await markJobFailed(
          job.id,
          job.user_id,
          job.energy_reserved,
          "Generation timed out — your energy has been returned",
          job.reservation_tx_id
        );
        return NextResponse.json({
          ...job,
          status: "failed",
          error_message: "Generation timed out — your energy has been returned",
        });
      }
      // Fall through to process the completed result below
      return await processCompletion(job, lastCheck.imageUrl, lastCheck.hasNsfw ?? false);
    }
  }

  // Not stale — poll the provider
  if (!job.provider_job_id) {
    return NextResponse.json(job); // still pending submission
  }

  const pollResult = job.provider === "replicate"
    ? await pollReplicateJob(job.provider_job_id)
    : await pollFalJob(job.model_key as StudioModelKey, job.provider_job_id);

  if (pollResult.status === "completed") {
    return await processCompletion(job, pollResult.imageUrl, pollResult.hasNsfw ?? false);
  }

  if (pollResult.status === "failed") {
    await markJobFailed(
      job.id,
      job.user_id,
      job.energy_reserved,
      "Generation failed — your energy has been returned",
      job.reservation_tx_id
    );
    return NextResponse.json({
      ...job,
      status: "failed",
      error_message: "Generation failed — your energy has been returned",
    });
  }

  // Still running
  return NextResponse.json({ ...job, status: "running" });
}

// ── Process a completed generation result ──────────────────────────────────

async function processCompletion(
  job: Awaited<ReturnType<typeof getJob>> & object,
  imageUrl: string | undefined,
  hasNsfw: boolean
) {
  if (!job) return NextResponse.json({ error: "Job not found." }, { status: 404 });

  // Moderation: fal's safety checker sets hasNsfw; block and refund if flagged
  if (hasNsfw) {
    await markJobFailed(
      job.id,
      job.user_id,
      job.energy_reserved,
      "Image blocked by content moderation — your energy has been returned",
      job.reservation_tx_id,
      "moderation_blocked"
    );
    return NextResponse.json({
      ...job,
      status: "moderation_blocked",
      error_message: "That image was blocked by our content filter. Your energy has been returned.",
    });
  }

  if (!imageUrl) {
    await markJobFailed(
      job.id,
      job.user_id,
      job.energy_reserved,
      "No image URL in provider response",
      job.reservation_tx_id
    );
    return NextResponse.json({
      ...job,
      status: "failed",
      error_message: "Generation completed but no image was returned. Your energy has been returned.",
    });
  }

  // Download → store in private Supabase bucket → finalize
  try {
    const buffer = await downloadAsset(imageUrl);
    const mimeType = imageUrl.includes(".png") ? "image/png"
      : imageUrl.includes(".webp") ? "image/webp"
      : "image/jpeg";

    const signedUrl = await completeJob({
      jobId:         job.id,
      userId:        job.user_id,
      buffer,
      mimeType,
      modelKey:      job.model_key as StudioModelKey,
      txId:          job.reservation_tx_id,
      energyReserved: job.energy_reserved,
    });

    return NextResponse.json({ ...job, status: "completed", output_url: signedUrl });
  } catch (err) {
    console.error("[studio/jobs/[jobId]] completeJob failed:", err);
    await markJobFailed(
      job.id,
      job.user_id,
      job.energy_reserved,
      "Failed to store generated image — your energy has been returned",
      job.reservation_tx_id
    );
    return NextResponse.json({
      ...job,
      status: "failed",
      error_message: "Failed to save your image. Energy has been returned.",
    });
  }
}
