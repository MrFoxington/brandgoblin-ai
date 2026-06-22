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
  favorite: boolean;
  featured: boolean;
  featured_order: number | null;
  featured_at: string | null;
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
// Atomic: only transitions and refunds if the job is still non-terminal.
// Concurrent callers (webhook + poll) racing on the same job: exactly one wins.
// Callers that have no job row yet must call refundEnergy() directly.

export async function markJobFailed(
  jobId: string,
  userId: string,
  energyReserved: number,
  reason: string,
  txId?: string | null,
  statusOverride: "failed" | "moderation_blocked" = "failed"
): Promise<void> {
  if (!jobId) return; // No row exists; caller must refund directly.

  const supabase = createAdminClient();
  // Conditional UPDATE — only proceeds if status is still non-terminal.
  const { data: claimed } = await supabase
    .from("studio_jobs")
    .update({ status: statusOverride, error_message: reason })
    .eq("id", jobId)
    .in("status", ["pending", "running"])
    .select("id");

  if (!claimed || claimed.length === 0) return; // Already finalized by another caller.

  await refundEnergy(userId, energyReserved, `Studio refund: ${reason}`);

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

export async function getSignedUrl(storagePath: string, ttlSeconds = 60 * 60): Promise<string> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.storage
    .from("studio-assets")
    .createSignedUrl(storagePath, ttlSeconds); // default 1 hour

  if (error || !data?.signedUrl) throw new Error(`Signing failed: ${error?.message}`);
  return data.signedUrl;
}

// ── Complete a job: store asset, finalize energy ────────────────────────────
// Upload is idempotent (upsert: true) so both concurrent callers can upload
// safely. The status transition is atomic — only the first caller to claim the
// row proceeds with finalizeReservation. The second caller gets signedUrl back
// without double-finalizing.

export async function completeJob(params: {
  jobId: string;
  userId: string;
  buffer: Buffer;
  mimeType: string;
  modelKey: StudioModelKey;
  txId: string | null;
  energyReserved: number;
}): Promise<string> {
  // Upload first — idempotent via upsert, safe for concurrent callers.
  const storagePath = await uploadAsset(params.userId, params.jobId, params.buffer, params.mimeType);
  const signedUrl   = await getSignedUrl(storagePath);

  const supabase = createAdminClient();
  // Conditional UPDATE — only transitions if still non-terminal.
  const { data: claimed } = await supabase
    .from("studio_jobs")
    .update({ status: "completed", storage_path: storagePath, output_url: signedUrl })
    .eq("id", params.jobId)
    .in("status", ["pending", "running"])
    .select("id");

  if (!claimed || claimed.length === 0) {
    // Another caller already completed this job; return the URL without re-finalizing.
    return signedUrl;
  }

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

// ── List favorited completed jobs (for the dashboard Favorites section) ───────

export async function listUserFavoriteJobs(userId: string, limit = 6): Promise<StudioJobRow[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("studio_jobs")
    .select("*")
    .eq("user_id", userId)
    .eq("favorite", true)
    .eq("status", "completed")
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (!data?.length) return [];

  return Promise.all(
    data.map(async (job: StudioJobRow) => {
      if (job.storage_path) {
        try {
          job.output_url = await getSignedUrl(job.storage_path);
        } catch {
          // non-fatal
        }
      }
      return job;
    })
  );
}

// ── Toggle the favorite flag (ownership-checked) ─────────────────────────────

export async function setJobFavorite(
  jobId: string,
  userId: string,
  favorite: boolean
): Promise<boolean> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("studio_jobs")
    .update({ favorite })
    .eq("id", jobId)
    .eq("user_id", userId) // ownership guard
    .select("id");
  return !error && !!data && data.length > 0;
}
