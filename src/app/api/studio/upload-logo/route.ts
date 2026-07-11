// POST /api/studio/upload-logo — "Bring your own logo" (Creator Pro perk)
// Multipart upload of a user's existing logo. Validated (type, size, dimensions),
// AI-moderated (Claude vision), stored as a completed studio_jobs row
// (job_type "upload", image_type "logo_concept") and auto-set as the brand's
// OFFICIAL logo so the stamping pipeline picks it up with zero extra steps.
// No energy charge — this is a Pro convenience, not a generation.

import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { uploadAsset, getSignedUrl, setOfficialLogo } from "@/lib/studio/jobs";
import type { StudioJobRow } from "@/lib/studio/jobs";

export const runtime = "nodejs";
export const maxDuration = 30;

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const MAX_BYTES = 5 * 1024 * 1024; // 5MB
const MIN_DIM = 128;
const MAX_DIM = 6000;

const ALLOWED_TYPES: Record<string, "image/png" | "image/jpeg" | "image/webp"> = {
  "image/png":  "image/png",
  "image/jpeg": "image/jpeg",
  "image/webp": "image/webp",
};

// Claude vision safety check. Fail-closed: anything but a clear SAFE rejects.
async function moderateImage(
  buffer: Buffer,
  mediaType: "image/png" | "image/jpeg" | "image/webp"
): Promise<boolean> {
  const message = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 10,
    system:
      "You are a strict content moderator for a brand-design app where users upload their business logo. " +
      "Reply with exactly one word: SAFE or UNSAFE. " +
      "UNSAFE if the image contains: nudity or sexual content, minors in any inappropriate context, " +
      "graphic violence or gore, hate symbols or extremist imagery, or illegal activity. " +
      "Ordinary logos, product photos, mascots, artwork, and text are SAFE.",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: { type: "base64", media_type: mediaType, data: buffer.toString("base64") },
          },
          { type: "text", text: "Moderate this uploaded logo image." },
        ],
      },
    ],
  });
  const verdict = message.content[0]?.type === "text" ? message.content[0].text.trim().toUpperCase() : "";
  return verdict.startsWith("SAFE");
}

export async function POST(request: Request) {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const supabase = createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  // ── Pro gate (same as official-logo route) ─────────────────────────────────
  const adminSb = createAdminClient();
  const { data: userRow } = await adminSb
    .from("users")
    .select("plan")
    .eq("id", authData.user.id)
    .single();

  if (!userRow || (userRow.plan !== "pro" && userRow.plan !== "agency")) {
    return NextResponse.json({ error: "Creator Pro required." }, { status: 403 });
  }

  // ── Parse multipart form ───────────────────────────────────────────────────
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid upload request." }, { status: 400 });
  }

  const file    = form.get("file");
  const brandId = form.get("brandId");
  const rights  = form.get("rights");

  if (!(file instanceof File) || typeof brandId !== "string" || !brandId) {
    return NextResponse.json({ error: "file and brandId are required." }, { status: 400 });
  }
  if (rights !== "true") {
    return NextResponse.json(
      { error: "Please confirm you own the rights to this image." },
      { status: 400 }
    );
  }

  const mediaType = ALLOWED_TYPES[file.type];
  if (!mediaType) {
    return NextResponse.json({ error: "Only PNG, JPG, or WebP images are allowed." }, { status: 415 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Logo must be 5MB or smaller." }, { status: 413 });
  }

  // ── Brand ownership ────────────────────────────────────────────────────────
  const { data: brand } = await adminSb
    .from("brand_generations")
    .select("id")
    .eq("id", brandId)
    .eq("user_id", authData.user.id)
    .single();
  if (!brand) {
    return NextResponse.json({ error: "Brand not found." }, { status: 404 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  // ── Dimension sanity check (also proves the file really is an image) ──────
  try {
    const sharp = (await import("sharp")).default;
    const meta = await sharp(buffer, { failOn: "none" }).metadata();
    const w = meta.width ?? 0;
    const h = meta.height ?? 0;
    if (w < MIN_DIM || h < MIN_DIM) {
      return NextResponse.json(
        { error: `Logo is too small — at least ${MIN_DIM}px on each side, please.` },
        { status: 422 }
      );
    }
    if (w > MAX_DIM || h > MAX_DIM) {
      return NextResponse.json(
        { error: `Logo is too large — at most ${MAX_DIM}px on each side, please.` },
        { status: 422 }
      );
    }
  } catch {
    return NextResponse.json({ error: "That file doesn't look like a valid image." }, { status: 422 });
  }

  // ── AI moderation (fail-closed) ────────────────────────────────────────────
  try {
    const safe = await moderateImage(buffer, mediaType);
    if (!safe) {
      return NextResponse.json(
        { error: "This image can't be used. Please upload a different logo." },
        { status: 422 }
      );
    }
  } catch (err) {
    console.error("[studio/upload-logo] moderation failed:", err);
    return NextResponse.json(
      { error: "Couldn't verify the image right now. Please try again." },
      { status: 502 }
    );
  }

  // ── Create the job row, store the asset, complete ──────────────────────────
  const { data: newJobData, error: insertError } = await adminSb
    .from("studio_jobs")
    .insert({
      user_id:         authData.user.id,
      brand_id:        brandId,
      job_type:        "upload",
      model_key:       "upload",
      image_type:      "logo_concept",
      image_size:      "square_hd",
      energy_reserved: 0,
      status:          "running",
      provider:        "upload",
      prompt:          "Uploaded brand logo (rights confirmed by user)",
    })
    .select("id")
    .single();

  if (insertError || !newJobData) {
    return NextResponse.json({ error: "Failed to save your logo. Please try again." }, { status: 500 });
  }
  const jobId = newJobData.id as string;

  let storagePath: string;
  let signedUrl: string;
  try {
    storagePath = await uploadAsset(authData.user.id, jobId, buffer, mediaType);
    signedUrl   = await getSignedUrl(storagePath);

    await adminSb
      .from("studio_jobs")
      .update({ status: "completed", storage_path: storagePath, output_url: signedUrl })
      .eq("id", jobId);
  } catch (err) {
    console.error("[studio/upload-logo] storage failed:", err);
    await adminSb.from("studio_jobs").update({ status: "failed", error_message: "Upload storage failed" }).eq("id", jobId);
    return NextResponse.json({ error: "Failed to store your logo. Please try again." }, { status: 500 });
  }

  // ── Auto-set as the brand's official logo (the whole point) ───────────────
  const official = await setOfficialLogo(jobId, authData.user.id, true);

  const job: StudioJobRow = {
    id:                jobId,
    user_id:           authData.user.id,
    brand_id:          brandId,
    job_type:          "upload",
    model_key:         "upload",
    image_type:        "logo_concept",
    image_size:        "square_hd",
    energy_reserved:   0,
    status:            "completed",
    provider:          "upload",
    provider_job_id:   null,
    prompt:            "Uploaded brand logo (rights confirmed by user)",
    output_url:        signedUrl,
    storage_path:      storagePath,
    error_message:     null,
    reservation_tx_id: null,
    favorite:          false,
    featured:          false,
    featured_order:    null,
    featured_at:       null,
    official_logo:     official,
    stamp_logo:        true,
    archived:          false,
    created_at:        new Date().toISOString(),
    updated_at:        new Date().toISOString(),
  };

  return NextResponse.json({ job, official });
}
