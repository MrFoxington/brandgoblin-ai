// Goblin Studio — job lifecycle utilities
// Storage, concurrency guard, stale-job sweep, signed URL helpers.

import { createAdminClient } from "@/lib/supabase/server";
import { refundEnergy, finalizeReservation } from "@/lib/energy";
import type { StudioModelKey, ImageType } from "./models";

export interface StudioJobRow {
  id: string;
  user_id: string;
  brand_id: string | null;
  job_type: string;
  model_key: string;
  image_type: string | null;
  image_size: string;
  energy_reserved: number;
  status: string;
  provider: string;
  provider_job_id: string | null;
  prompt: string | null;
  output_url: string | null;
  storage_path: string | null;
  error_message: string | null;
  reservation_tx_id: string | null;
  created_at: string;
  updated_at: string;
}

// ── Concurrency guard ───────────────────────────────────────────────────────

export async function getUserActiveJobCount(userId: string): Promise<number> {
  const supabase = createAdminClient();
  const { count } = await supabase
    .from("studio_jobs")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .in("status", ["pending", "running"]);
  return count ?? 0;
}

// ── Create a job row ────────────────────────────────────────────────────────

export async function createJobRow(params: {
  userId: string;
  brandId?: string;
  modelKey: StudioModelKey;
  imageType: ImageType;
  imageSize: string;
  energyReserved: number;
  prompt: string;
  reservationTxId: string;
}): Promise<string> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("studio_jobs")
    .insert({
      user_id:           params.userId,
      brand_id:          params.brandId ?? null,
      model_key:         params.modelKey,
      image_type:        params.imageType,
      image_size:        params.imageSize,
      energy_reserved:   params.energyReserved,
      status:            "pending",
      provider:          "fal",
      prompt:            params.prompt,
      reservation_tx_id: params.reservationTxId,
    })
    .select("id")
    .single();

  if (error || !data) throw new Error(`Failed to create studio job: ${error?.message}`);
  return data.id;
}

// ── Update job after provider submission ────────────────────────────────────

export async function markJobRunning(
  jobId: string,
  providerJobId: string,
  provider: "fal" | "replicate"
): Promise<void> {
  const supabase = createAdminClient();
  await supabase
    .from("studio_jobs")
    .update({ status: "running", provider_job_id: providerJobId, provider })
    .eq("id", jobId);
}

// ── Mark job failed + refund energy ────────────────────────────────────────

export async function markJobFailed(
  jobId: string,
  userId: string,
  energyReserved: number,
  reason: string,
  txId?: string | null,
  statusOverride: "failed" | "moderation_blocked" = "failed"
): Promise<void> {
  const supabase = createAdminClient();
  await supabase
    .from("studio_jobs")
    .update({ status: statusOverride, error_message: reason })
    .eq("id", jobId);

  // Refund the reserved energy
  await refundEnergy(userId, energyReserved, `Studio refund: ${reason}`);

  // Remove the reservation tx (or leave it — refundEnergy adds a 'refund' tx)
  if (txId) {
    await supabase
      .from("energy_transactions")
      .update({ description: `[refunded] Studio reservation — ${reason}` })
      .eq("id", txId);
  }
}

// ── Upload to studio-assets bucket ─────────────────────────────────────────

export async function uploadAsset(
  userId: string,
  jobId: string,
  buffer: Buffer,
  mimeType: string
): Promise<string> {
  const supabase = createAdminClient();
  const ext = mimeType.includes("png") ? "png" : mimeType.includes("webp") ? "webp" : "jpg";
  const storagePath = `${userId}/${jobId}.${ext}`;

  const { error } = await supabase.storage
    .from("studio-assets")
    .upload(storagePath, buffer, { contentType: mimeType, upsert: true });

  if (error) throw new Error(`Upload failed: ${error.message}`);
  return storagePath;
}

// ── Generate a signed URL (1 hour TTL) ─────────────────────────────────────
// Always re-sign from storage_path; never treat the stored output_url as
// canonical (it dies after an hour).

export async function getSignedUrl(storagePath: string): Promise<string> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.storage
    .from("studio-assets")
    .createSignedUrl(storagePath, 60 * 60); // 1 hour

  if (error || !data?.signedUrl) throw new Error(`Signing failed: ${error?.message}`);
  return data.signedUrl;
}

// ── Complete a job: store asset, finalize energy ────────────────────────────

export async function completeJob(params: {
  jobId: string;
  userId: string;
  buffer: Buffer;
  mimeType: string;
  modelKey: StudioModelKey;
  txId: string | null;
  energyReserved: number;
}): Promise<string> {
  const storagePath = await uploadAsset(params.userId, params.jobId, params.buffer, params.mimeType);
  const signedUrl   = await getSignedUrl(storagePath);

  const supabase = createAdminClient();
  await supabase
    .from("studio_jobs")
    .update({ status: "completed", storage_path: storagePath, output_url: signedUrl })
    .eq("id", params.jobId);

  if (params.txId) {
    await finalizeReservation(
      params.txId,
      params.jobId,
      `Studio image — ${params.modelKey}`
    );
  }

  return signedUrl;
}

// ── Stale-job sweep ─────────────────────────────────────────────────────────
// Refunds energy for jobs stuck in 'running' beyond the timeout threshold.
// Called on page load (server component) and by the /api/studio/sweep route.

const STALE_JOB_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes

export async function sweepStaleJobs(userId?: string): Promise<number> {
  const supabase = createAdminClient();
  const cutoff = new Date(Date.now() - STALE_JOB_TIMEOUT_MS).toISOString();

  const query = supabase
    .from("studio_jobs")
    .select("id, user_id, energy_reserved, reservation_tx_id")
    .in("status", ["pending", "running"])
    .lt("updated_at", cutoff);

  if (userId) query.eq("user_id", userId);

  const { data: stale } = await query;
  if (!stale?.length) return 0;

  await Promise.all(
    stale.map((job: StudioJobRow) =>
      markJobFailed(
        job.id,
        job.user_id,
        job.energy_reserved,
        "Generation timed out",
        job.reservation_tx_id
      )
    )
  );

  console.log(`[studio/sweep] swept ${stale.length} stale job(s)${userId ? ` for user ${userId}` : ""}`);
  return stale.length;
}

// ── Fetch a job (ownership-checked) ────────────────────────────────────────

export async function getJob(jobId: string, userId: string): Promise<StudioJobRow | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("studio_jobs")
    .select("*")
    .eq("id", jobId)
    .eq("user_id", userId)
    .single();
  return data ?? null;
}

// ── List recent jobs (re-sign output URLs on the way out) ───────────────────

export async function listUserJobs(userId: string, limit = 20): Promise<StudioJobRow[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("studio_jobs")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (!data?.length) return [];

  // Re-sign URLs for completed jobs — stored signed URLs expire after 1 hour
  return Promise.all(
    data.map(async (job: StudioJobRow) => {
      if (job.status === "completed" && job.storage_path) {
        try {
          job.output_url = await getSignedUrl(job.storage_path);
        } catch {
          // non-fatal — client will just show a broken image
        }
      }
      return job;
    })
  );
}
