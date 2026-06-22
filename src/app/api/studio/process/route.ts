// POST /api/studio/process
// Runs a post-processing op (bg_removal | clarity_upscaler) on a completed Studio job.
// Crash-safe: job row + energy reservation created BEFORE the fal call.
// If the function is killed mid-op, the row stays 'running' and the stale sweeper refunds it.

import { NextResponse } from "next/server";
import { fal } from "@fal-ai/client";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { reserveEnergy, refundEnergy } from "@/lib/energy";
import { computeStudioEnergyCost, IMAGE_TYPE_SIZES, STUDIO_MODELS } from "@/lib/energy-config";
import {
  markJobFailed,
  completeJob,
  getSignedUrl,
} from "@/lib/studio/jobs";
import { downloadAsset } from "@/lib/studio/provider";
import type { StudioModelKey, ImageType } from "@/lib/energy-config";
import type { StudioJobRow } from "@/lib/studio/jobs";

export const runtime  = "nodejs";
export const maxDuration = 60; // clarity-upscaler can take ~10-15s

if (process.env.FAL_KEY) {
  fal.config({ credentials: process.env.FAL_KEY });
}

type Operation = "bg_removal" | "clarity_upscaler";

const OPERATION_MODEL: Record<Operation, StudioModelKey> = {
  bg_removal:        "bg_removal",
  clarity_upscaler:  "clarity_upscaler",
};

const OPERATION_LABEL: Record<Operation, string> = {
  bg_removal:       "Background removed",
  clarity_upscaler: "Upscaled",
};

interface FalProcessOutput {
  image?: { url: string; width?: number; height?: number };
}

export async function POST(request: Request) {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const supabase = createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const adminSb = createAdminClient();
  const { data: userRow } = await adminSb
    .from("users")
    .select("plan")
    .eq("id", authData.user.id)
    .single();

  if (!userRow || userRow.plan !== "pro") {
    return NextResponse.json({ error: "Creator Pro required." }, { status: 403 });
  }

  // ── Parse body ────────────────────────────────────────────────────────────
  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { jobId, operation } = body as { jobId?: string; operation?: string };

  if (!jobId || !operation || !(operation in OPERATION_MODEL)) {
    return NextResponse.json({ error: "jobId and operation (bg_removal | clarity_upscaler) are required." }, { status: 400 });
  }
  const op = operation as Operation;
  const modelKey = OPERATION_MODEL[op];

  // ── Load + validate source job ────────────────────────────────────────────
  const { data: sourceJob } = await adminSb
    .from("studio_jobs")
    .select("*")
    .eq("id", jobId)
    .eq("user_id", authData.user.id)
    .single();

  if (!sourceJob) {
    return NextResponse.json({ error: "Job not found." }, { status: 404 });
  }
  if (sourceJob.status !== "completed" || !sourceJob.storage_path) {
    return NextResponse.json({ error: "Source job must be completed before processing." }, { status: 409 });
  }

  // ── Energy cost ───────────────────────────────────────────────────────────
  const imageType = (sourceJob.image_type ?? "logo_concept") as ImageType;
  const pinnedSize = IMAGE_TYPE_SIZES[imageType] ?? IMAGE_TYPE_SIZES.logo_concept;
  const energyCost = computeStudioEnergyCost(modelKey, {
    width:  pinnedSize.width,
    height: pinnedSize.height,
  });

  // ── Reserve energy (atomic — same path as generation) ────────────────────
  const reservation = await reserveEnergy(authData.user.id, energyCost);
  if (!reservation.success) {
    return NextResponse.json(
      {
        error: "Not enough Creative Energy. Refill to keep creating.",
        totalRemaining: reservation.totalRemaining,
        energyRequired: energyCost,
        requiresRefill: true,
      },
      { status: 402 }
    );
  }

  // ── Create job row BEFORE fal call (crash safety) ─────────────────────────
  const { data: newJobData, error: insertError } = await adminSb
    .from("studio_jobs")
    .insert({
      user_id:           authData.user.id,
      brand_id:          sourceJob.brand_id,   // inherit brand so gallery filter works
      job_type:          op,
      model_key:         modelKey,
      image_type:        sourceJob.image_type,
      image_size:        sourceJob.image_size,
      energy_reserved:   energyCost,
      status:            "running",
      provider:          "fal",
      prompt:            sourceJob.prompt,     // inherit for reference
      reservation_tx_id: reservation.txId!,
    })
    .select("id")
    .single();

  if (insertError || !newJobData) {
    await refundEnergy(authData.user.id, energyCost, "Process refund: job creation failed");
    return NextResponse.json({ error: "Failed to create processing job. Energy returned." }, { status: 500 });
  }

  const newJobId = newJobData.id as string;
  const falEndpoint = STUDIO_MODELS[modelKey].falEndpoint;

  // ── Get a fresh signed URL for the source asset ───────────────────────────
  let sourceUrl: string;
  try {
    sourceUrl = await getSignedUrl(sourceJob.storage_path);
  } catch {
    await markJobFailed(newJobId, authData.user.id, energyCost, "Failed to read source image — energy returned", reservation.txId);
    return NextResponse.json({ error: "Could not read source image. Energy returned." }, { status: 500 });
  }

  // ── Call fal synchronously ────────────────────────────────────────────────
  let resultUrl: string;
  try {
    const falInput: Record<string, unknown> = { image_url: sourceUrl };
    if (op === "clarity_upscaler") {
      falInput.scale       = 2;
      falInput.creativity  = 0.35;
      falInput.resemblance = 0.6;
    }

    const result = await fal.subscribe(falEndpoint, {
      input: falInput,
      logs: false,
    });

    const output = result.data as FalProcessOutput;
    const url = output?.image?.url;
    if (!url) throw new Error("No image URL in fal response");
    resultUrl = url;
  } catch (err) {
    console.error(`[studio/process] fal ${op} failed:`, err);
    await markJobFailed(
      newJobId,
      authData.user.id,
      energyCost,
      "Processing failed — energy returned",
      reservation.txId
    );
    return NextResponse.json({ error: "Processing failed. Your energy has been returned." }, { status: 502 });
  }

  // ── Store result + finalize ───────────────────────────────────────────────
  let signedUrl: string;
  try {
    const buffer = await downloadAsset(resultUrl);
    const mimeType = resultUrl.includes(".png") ? "image/png"
      : resultUrl.includes(".webp") ? "image/webp"
      : "image/jpeg";

    signedUrl = await completeJob({
      jobId:          newJobId,
      userId:         authData.user.id,
      buffer,
      mimeType,
      modelKey:       modelKey as StudioModelKey,
      txId:           reservation.txId!,
      energyReserved: energyCost,
    });
  } catch (err) {
    console.error(`[studio/process] completeJob failed:`, err);
    await markJobFailed(
      newJobId,
      authData.user.id,
      energyCost,
      "Failed to store result — energy returned",
      reservation.txId
    );
    return NextResponse.json({ error: "Failed to store result. Your energy has been returned." }, { status: 500 });
  }

  // ── Return completed job row for the client to display ────────────────────
  const completedJob: StudioJobRow = {
    id:               newJobId,
    user_id:          authData.user.id,
    brand_id:         sourceJob.brand_id,
    job_type:         op,
    model_key:        modelKey,
    image_type:       sourceJob.image_type,
    image_size:       sourceJob.image_size,
    energy_reserved:  energyCost,
    status:           "completed",
    provider:         "fal",
    provider_job_id:  null,
    prompt:           sourceJob.prompt,
    output_url:       signedUrl,
    storage_path:     null,
    error_message:    null,
    reservation_tx_id: reservation.txId!,
    favorite:         false,
    featured:         false,
    featured_order:   null,
    featured_at:      null,
    created_at:       new Date().toISOString(),
    updated_at:       new Date().toISOString(),
  };

  return NextResponse.json({ job: completedJob, label: OPERATION_LABEL[op] });
}
